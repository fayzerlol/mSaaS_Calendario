import { db } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

// Helper to get date in YYYY-MM-DD format
const getISODate = (date) => date.toISOString().split('T')[0];

/**
 * Generate a flattened list of event occurrences ("virtual events") for the given
 * date range. When handling recurring events this function also merges in any
 * per-instance edits or deletions stored under the parent event's `exceptions`
 * subcollection.  Because exception documents live under an organization's
 * events collection (i.e. organizations/{organizationId}/events/{eventId}/exceptions),
 * this helper requires the caller to pass the current `organizationId`.  Without
 * this information the function would incorrectly look for exceptions at the
 * top-level `events` collection.
 *
 * @param {Array} baseEvents      The list of base events queried from Firestore.
 * @param {Date} viewStartDate    The start of the range for which to generate events.
 * @param {Date} viewEndDate      The end of the range for which to generate events.
 * @param {string} organizationId The organization ID used to locate exception docs.
 * @returns {Promise<Array>}      A promise resolving to an array of virtual events.
 */
export const generateEvents = async (baseEvents, viewStartDate, viewEndDate, organizationId) => {
  const virtualEvents = [];

  for (const event of baseEvents) {
    // Fetch exceptions for this event.  Exceptions are stored under
    // organizations/{organizationId}/events/{eventId}/exceptions.
    let exceptions = {};
    if (organizationId) {
      const exceptionsCollectionRef = collection(db, 'organizations', organizationId, 'events', event.id, 'exceptions');
      const exceptionsSnapshot = await getDocs(exceptionsCollectionRef);
      exceptionsSnapshot.forEach(doc => {
        const data = doc.data();
        exceptions[data.originalDate] = { id: doc.id, ...data };
      });
    }

    // If it's a non-recurring event
    if (!event.recurrence) {
      const eventDate = new Date(event.date + 'T00:00:00');
      if (eventDate >= viewStartDate && eventDate <= viewEndDate) {
        // Check if this single occurrence was modified or deleted
        const exception = exceptions[event.date];
        if (exception && exception.deleted) {
          // It was deleted, so we skip it
        } else if (exception) {
          // It was modified
          virtualEvents.push({ ...event, ...exception.modifiedData, virtualDate: event.date, baseEventId: event.id });
        } else {
          // No exception, add as is
          virtualEvents.push({ ...event, virtualDate: event.date, baseEventId: event.id });
        }
      }
      continue;
    }

    // Handle recurring events
    const { type, endDate: recurrenceEndDate } = event.recurrence;
    let currentDate = new Date(event.date + 'T00:00:00');
    const finalEndDate = recurrenceEndDate ? new Date(recurrenceEndDate + 'T00:00:00') : viewEndDate;

    while (currentDate <= viewEndDate && currentDate <= finalEndDate) {
      const isoDate = getISODate(currentDate);
      const exception = exceptions[isoDate];

      if (currentDate >= viewStartDate) {
        if (exception && exception.deleted) {
          // This instance was deleted, skip it
        } else {
          virtualEvents.push({
            ...event,
            ...(exception ? exception.modifiedData : {}), // Apply modifications if they exist
            id: `${event.id}_${isoDate}`,
            virtualDate: isoDate,
            baseEventId: event.id,
          });
        }
      }

      // Increment to the next occurrence
      switch (type) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        default:
          return;
      }
    }
  }

  return virtualEvents;
};
