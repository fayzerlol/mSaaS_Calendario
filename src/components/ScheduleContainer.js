import React, { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, query, onSnapshot, doc, getDoc } from 'firebase/firestore';
import WeekView from './views/WeekView';
import MonthView from './views/MonthView';
import DayView from './views/DayView';

// Helper to get date in YYYY-MM-DD format
const getISODate = (date) => date.toISOString().split('T')[0];

const ScheduleContainer = ({ user, setEventToEdit }) => {
  // Raw data from Firestore
  const [events, setEvents] = useState([]);
  const [collaborators, setCollaborators] = useState([]);

  // State for UI controls
  const [organizationId, setOrganizationId] = useState(null);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeView, setActiveView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch all necessary data for the views
  useEffect(() => {
    if (!user) return;
    let eventsUnsubscribe = () => {};
    let collabsUnsubscribe = () => {};

    const setupListeners = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const orgId = userDoc.exists() ? userDoc.data().organizationId : null;

        if (orgId) {
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
        } else {
          setError('Organization ID not found.');
        }
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

  // Filter events based on the active collaborator filter
  const collaboratorFilteredEvents = events.filter(event => {
    if (activeFilter === 'all') return true;
    return event.assignedCollaborator === activeFilter;
  });

  // A function to determine which view to render
  const renderActiveView = () => {
    switch(activeView) {
      case 'month':
        return <MonthView events={collaboratorFilteredEvents} collaborators={collaborators} setEventToEdit={setEventToEdit} currentDate={currentDate} setCurrentDate={setCurrentDate} setActiveView={setActiveView} />;
      case 'day':
        const eventsForDay = collaboratorFilteredEvents.filter(event => event.date === getISODate(currentDate));
        return <DayView events={eventsForDay} collaborators={collaborators} organizationId={organizationId} setEventToEdit={setEventToEdit} currentDate={currentDate} />;
      case 'week':
      default:
        return <WeekView events={collaboratorFilteredEvents} collaborators={collaborators} organizationId={organizationId} setEventToEdit={setEventToEdit} error={error} currentDate={currentDate} />;
    }
  };

  return (
    <div>
      <div className="p-4 bg-white rounded-lg shadow-md mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button onClick={() => setActiveView('month')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeView === 'month' ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}>Month</button>
          <button onClick={() => setActiveView('week')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeView === 'week' ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}>Week</button>
          <button onClick={() => setActiveView('day')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeView === 'day' ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}>Day</button>
        </div>
        <div>
          <label htmlFor="collaboratorFilter" className="mr-2 text-sm font-medium">Filter by:</label>
          <select id="collaboratorFilter" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} className="p-2 border rounded-md">
            <option value="all">All Collaborators</option>
            {collaborators.map(collab => (
              <option key={collab.id} value={collab.id}>{collab.name}</option>
            ))}
          </select>
        </div>
      </div>
      {renderActiveView()}
    </div>
  );
};

export default ScheduleContainer;
