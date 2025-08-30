import React from 'react';
import { db } from '../../services/firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';

const DayView = ({ events, collaborators, organizationId, setEventToEdit, currentDate }) => {

  const handleDelete = async (eventId) => {
    if (!organizationId) {
      console.error('Cannot delete event: Organization ID is missing.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    try {
      const eventDocRef = doc(db, 'organizations', organizationId, 'events', eventId);
      await deleteDoc(eventDocRef);
    } catch (err) {
      console.error('Failed to delete event.', err);
    }
  };

  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const dayDate = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">{dayName}</h2>
        <p className="text-lg text-gray-600">{dayDate}</p>
      </div>

      <div className="space-y-4">
        {events.length > 0 ? (
          events.sort((a, b) => a.time.localeCompare(b.time))
                .map(event => (
            <div key={event.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">{event.title}</p>
                <p className="text-md text-gray-700">{event.time}</p>
                {event.assignedCollaborator && (
                  <p className="text-sm text-indigo-700 mt-1">
                    Assigned to: {collaborators.find(c => c.id === event.assignedCollaborator)?.name || 'Unknown'}
                  </p>
                )}
              </div>
              <div className="flex space-x-4">
                <button onClick={() => setEventToEdit(event)} className="text-sm text-blue-500 hover:underline">Edit</button>
                <button onClick={() => handleDelete(event.id)} className="text-sm text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No events scheduled for this day.</p>
        )}
      </div>
    </div>
  );
};

export default DayView;
