import { db } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

// Helper to get date in YYYY-MM-DD format
const getISODate = (date) => date.toISOString().split('T')[0];

export const generateEvents = async (baseEvents, viewStartDate, viewEndDate) => {
  const virtualEvents = [];

  for (const event of baseEvents) {
    // Fetch exceptions for this event
    const exceptionsCollectionRef = collection(db, 'events', event.id, 'exceptions');
    const exceptionsSnapshot = await getDocs(exceptionsCollectionRef);
    const exceptions = {};
    exceptionsSnapshot.forEach(doc => {
      const data = doc.data();
      exceptions[data.originalDate] = { id: doc.id, ...data };
    });

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
        case 'daily': currentDate.setDate(currentDate.getDate() + 1); break;
        case 'weekly': currentDate.setDate(currentDate.getDate() + 7); break;
        case 'monthly': currentDate.setMonth(currentDate.getMonth() + 1); break;
        default: return; // Should not happen
      }
    }
  }

  return virtualEvents;
};
