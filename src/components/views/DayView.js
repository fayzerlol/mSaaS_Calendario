import React from 'react';
import { db } from '../../services/firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';

const DayView = ({ events, collaborators, setEventToEdit, currentDate, handleDeleteRequest, conflictingEvents }) => {

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
                .map(event => {
                  const isConflicting = conflictingEvents.has(event.id);
                  return (
                    <div key={event.id} className={`p-4 rounded-lg shadow-md flex justify-between items-center border ${isConflicting ? 'bg-red-50 border-red-300' : 'bg-white'}`}>
                      <div>
                        <p className="text-lg font-semibold">{event.title}</p>
                        <p className="text-md text-gray-700">{event.time}</p>
                        {isConflicting && (
                          <p className="text-sm text-red-700 mt-1 font-bold">
                            Conflict detected!
                          </p>
                        )}
                        {event.assignedCollaborator && (
                          <p className="text-sm text-indigo-700 mt-1">
                            Assigned to: {collaborators.find(c => c.id === event.assignedCollaborator)?.name || 'Unknown'}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-4">
                        <button onClick={() => setEventToEdit(event)} className="text-sm text-blue-500 hover:underline">Edit</button>
                        <button onClick={() => handleDeleteRequest(event)} className="text-sm text-red-500 hover:underline">Delete</button>
                      </div>
                    </div>
                  );
                })
        ) : (
          <p className="text-center text-gray-500">No events scheduled for this day.</p>
        )}
      </div>
    </div>
  );
};

export default DayView;
