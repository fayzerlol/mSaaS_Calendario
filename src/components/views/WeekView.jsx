import React from 'react';
import { db } from '../../services/firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';

// Helper to get date in YYYY-MM-DD format
const getISODate = (date) => date.toISOString().split('T')[0];

// Helper to get the dates of the week for a given date
const getWeekDays = (date) => {
  const dayOfWeek = date.getDay(); // Sunday - 0, Monday - 1, etc.
  const startOfWeek = new Date(date);
  // Adjust to start of the week (Monday)
  startOfWeek.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const weekDay = new Date(startOfWeek);
    weekDay.setDate(startOfWeek.getDate() + i);
    weekDays.push(weekDay);
  }
  return weekDays;
};

const WeekView = ({ events, collaborators, organizationId, setEventToEdit, error, currentDate }) => {

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

  const weekDays = getWeekDays(currentDate);

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map(date => {
          const isoDate = getISODate(date);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

          return (
            <div key={isoDate} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-bold text-lg border-b pb-2 mb-2">{dayName} <span className="text-sm font-normal text-gray-500">{date.getDate()}</span></h3>
              <div className="space-y-2">
                {events && events.filter(event => event.date === isoDate)
                       .sort((a, b) => a.time.localeCompare(b.time))
                       .map(event => (
                  <div key={event.id} className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-gray-600">{event.time}</p>
                    {event.assignedCollaborator && (
                      <p className="text-xs text-indigo-700 mt-1">
                        Assigned to: {collaborators.find(c => c.id === event.assignedCollaborator)?.name || '...'}
                      </p>
                    )}
                    <div className="flex justify-end space-x-2 mt-2">
                      <button onClick={() => setEventToEdit(event)} className="text-xs text-blue-500 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(event.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default WeekView;
