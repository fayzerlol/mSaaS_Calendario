/**
 * Detects scheduling conflicts among a list of events.
 *
 * @param {Array<Object>} virtualEvents - A list of event objects to check.
 * @returns {Set<string>} A set of event IDs that are in conflict.
 */
export const detectConflicts = (virtualEvents) => {
  const conflictingEventIds = new Set();

  // 1. Group events by collaborator. Unassigned events are grouped separately.
  const eventsByCollaborator = virtualEvents.reduce((acc, event) => {
    const collaboratorId = event.assignedCollaborator || 'unassigned';
    if (!acc[collaboratorId]) {
      acc[collaboratorId] = [];
    }
    acc[collaboratorId].push(event);
    return acc;
  }, {});

  // 2. For each group, check for time overlaps.
  for (const collaboratorId in eventsByCollaborator) {
    const events = eventsByCollaborator[collaboratorId];
    if (events.length < 2) continue;

    // Sort events by start time for easier comparison
    events.sort((a, b) => new Date(`${a.virtualDate}T${a.time}`) - new Date(`${b.virtualDate}T${b.time}`));

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const eventA = events[i];
        const eventB = events[j];

        // Only check events on the same day
        if (eventA.virtualDate !== eventB.virtualDate) continue;

        const startA = new Date(`${eventA.virtualDate}T${eventA.time}`);
        const endA = new Date(startA.getTime() + 60 * 60 * 1000); // Assuming 1-hour duration

        const startB = new Date(`${eventB.virtualDate}T${eventB.time}`);
        const endB = new Date(startB.getTime() + 60 * 60 * 1000); // Assuming 1-hour duration

        // Check for overlap
        if (startA < endB && startB < endA) {
          conflictingEventIds.add(eventA.id);
          conflictingEventIds.add(eventB.id);
        }
      }
    }
  }

  return conflictingEventIds;
};
