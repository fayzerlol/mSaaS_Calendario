import React, { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, query, onSnapshot, doc, getDoc, deleteDoc } from 'firebase/firestore';

const Schedule = ({ user, setEventToEdit }) => {
  const [events, setEvents] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [organizationId, setOrganizationId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    let eventsUnsubscribe = () => {};
    let collabsUnsubscribe = () => {};

    const setupListeners = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          setError('User profile not found.');
          return;
        }

        const orgId = userDoc.data().organizationId;
        if (!orgId) {
          setError('Organization not found for this user.');
          return;
        }
        setOrganizationId(orgId);

        // Listener for events
        const eventsQuery = query(collection(db, 'organizations', orgId, 'events'));
        eventsUnsubscribe = onSnapshot(eventsQuery, (snapshot) => {
          setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Listener for collaborators
        const collabsQuery = query(collection(db, 'organizations', orgId, 'collaborators'));
        collabsUnsubscribe = onSnapshot(collabsQuery, (snapshot) => {
          setCollaborators(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

      } catch (err) {
        setError('An error occurred while setting up listeners.');
        console.error(err);
      }
    };

    setupListeners();

    return () => {
      eventsUnsubscribe();
      collabsUnsubscribe();
    };
  }, [user]);

  const handleDelete = async (eventId) => {
    if (!organizationId) {
      setError('Cannot delete event: Organization ID is missing.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    try {
      const eventDocRef = doc(db, 'organizations', organizationId, 'events', eventId);
      await deleteDoc(eventDocRef);
    } catch (err) {
      setError('Failed to delete event.');
      console.error(err);
    }
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-center mb-6">Weekly Schedule</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {daysOfWeek.map(day => (
          <div key={day} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-bold text-lg border-b pb-2 mb-2">{day}</h3>
            <div className="space-y-2">
              {events.filter(event => event.day === day)
                     .sort((a, b) => a.time.localeCompare(b.time)) // Sort events by time
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
                    <button
                      onClick={() => setEventToEdit(event)}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
