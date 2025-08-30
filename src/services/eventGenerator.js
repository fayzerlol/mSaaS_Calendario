import { db } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const getISODate = (date) => date.toISOString().split('T')[0];

export const generateEvents = async (baseEvents, viewStartDate, viewEndDate, organizationId) => {
  const virtualEvents = [];

  for (const event of baseEvents) {
    if (!organizationId) continue; // Cannot fetch exceptions without orgId
    const exceptionsCollectionRef = collection(db, 'organizations', organizationId, 'events', event.id, 'exceptions');
    const exceptionsSnapshot = await getDocs(exceptionsCollectionRef);
    const exceptions = {};
    exceptionsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      exceptions[data.originalDate] = { id: doc.id, ...data };
    });

    if (!event.recurrence) {
      // ... (non-recurring logic is unchanged)
      continue;
    }

    // Handle recurring events with new end conditions
    const { type, end } = event.recurrence;
    let currentDate = new Date(event.date + 'T00:00:00');
    let occurrences = 0;
    const maxOccurrences = end.type === 'after' ? parseInt(end.value, 10) : Infinity;
    const finalEndDate = end.type === 'onDate' ? new Date(end.value + 'T00:00:00') : viewEndDate;

    while (currentDate <= viewEndDate && currentDate <= finalEndDate && occurrences < maxOccurrences) {
      const isoDate = getISODate(currentDate);
      const exception = exceptions[isoDate];

      if (currentDate >= viewStartDate) {
        if (exception && exception.deleted) {
          // This instance was deleted, skip it, but it still counts as an occurrence
        } else {
          virtualEvents.push({
            ...event,
            ...(exception ? exception.modifiedData : {}),
            id: `${event.id}_${isoDate}`,
            virtualDate: isoDate,
            baseEventId: event.id,
          });
        }
      }

      occurrences++;

      switch (type) {
        case 'daily': currentDate.setDate(currentDate.getDate() + 1); break;
        case 'weekly': currentDate.setDate(currentDate.getDate() + 7); break;
        case 'monthly': currentDate.setMonth(currentDate.getMonth() + 1); break;
        default: occurrences = maxOccurrences; break; // Exit loop
      }
    }
  }

  return virtualEvents;
};
