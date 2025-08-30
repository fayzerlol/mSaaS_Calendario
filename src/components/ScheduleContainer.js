import React, { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, query, onSnapshot, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { generateEvents } from '../services/eventGenerator';
import { checkUpcomingEvents } from '../services/notificationService';
import WeekView from './views/WeekView';
import MonthView from './views/MonthView';
import DayView from './views/DayView';
import RecurringEditConfirmationModal from './RecurringEditConfirmationModal';

const getISODate = (date) => date.toISOString().split('T')[0];

const ScheduleContainer = ({ user, setEventToEdit, onNotificationsUpdate }) => {
  const [baseEvents, setBaseEvents] = useState([]);
  const [virtualEvents, setVirtualEvents] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [organizationId, setOrganizationId] = useState(null);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeView, setActiveView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [recurringAction, setRecurringAction] = useState(null);

  // Fetch base data
  useEffect(() => {
    if (!user) return;
    let eventsUnsubscribe = () => {}, collabsUnsubscribe = () => {};
    const setupListeners = async () => {
      // ... (fetching logic remains the same)
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const orgId = userDoc.exists() ? userDoc.data().organizationId : null;
      if (orgId) {
        setOrganizationId(orgId);
        const eventsQuery = query(collection(db, 'organizations', orgId, 'events'));
        eventsUnsubscribe = onSnapshot(eventsQuery, (snapshot) => setBaseEvents(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
        const collabsQuery = query(collection(db, 'organizations', orgId, 'collaborators'));
        collabsUnsubscribe = onSnapshot(collabsQuery, (snapshot) => setCollaborators(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
      }
    };
    setupListeners();
    return () => { eventsUnsubscribe(); collabsUnsubscribe(); };
  }, [user]);

  const collaboratorFilteredEvents = baseEvents.filter(e => activeFilter === 'all' || e.assignedCollaborator === activeFilter);

  // Generate virtual events
  useEffect(() => {
    const generate = async () => {
      const start = new Date(new Date(currentDate).setDate(currentDate.getDate() - 35));
      const end = new Date(new Date(currentDate).setDate(currentDate.getDate() + 35));
      const newEvents = await generateEvents(collaboratorFilteredEvents, start, end);
      setVirtualEvents(newEvents);
    };
    generate();
  }, [collaboratorFilteredEvents, currentDate]);

  // Notification checker
  useEffect(() => {
    const interval = setInterval(() => {
      const upcoming = checkUpcomingEvents(virtualEvents);
      if (upcoming.length > 0) {
        onNotificationsUpdate(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const newNotifications = upcoming.filter(n => !existingIds.has(n.id));
          return [...prev, ...newNotifications];
        });
      }
    }, 30000); // Check every 30 seconds for demo purposes
    return () => clearInterval(interval);
  }, [virtualEvents, onNotificationsUpdate]);


  const handleDeleteRequest = (event) => {
    if (event.recurrence && event.baseEventId !== event.id) {
      setRecurringAction({ action: 'delete', event });
    } else {
      deleteDoc(doc(db, 'organizations', organizationId, 'events', event.baseEventId || event.id));
    }
  };

  const handleRecurringDelete = async (scope) => {
    // ... (logic remains the same)
    const { event } = recurringAction;
    if (scope === 'one') {
      const exceptionsRef = collection(db, 'organizations', organizationId, 'events', event.baseEventId, 'exceptions');
      await addDoc(exceptionsRef, { originalDate: event.virtualDate, deleted: true });
    } else if (scope === 'future') {
      const newEndDate = new Date(event.virtualDate);
      newEndDate.setDate(newEndDate.getDate() - 1);
      const baseEventRef = doc(db, 'organizations', organizationId, 'events', event.baseEventId);
      await updateDoc(baseEventRef, { 'recurrence.endDate': getISODate(newEndDate) });
    }
    setRecurringAction(null);
  };

  const renderActiveView = () => {
    // ... (logic remains the same)
    const commonProps = { collaborators, organizationId, setEventToEdit, currentDate, handleDeleteRequest, error };
    switch(activeView) {
      case 'month': return <MonthView {...commonProps} events={virtualEvents} setCurrentDate={setCurrentDate} setActiveView={setActiveView} />;
      case 'day': const eventsForDay = virtualEvents.filter(e => e.virtualDate === getISODate(currentDate)); return <DayView {...commonProps} events={eventsForDay} />;
      default: return <WeekView {...commonProps} events={virtualEvents} />;
    }
  };

  return (
    <div>
      {recurringAction && <RecurringEditConfirmationModal action={recurringAction.action} onConfirm={handleRecurringDelete} onCancel={() => setRecurringAction(null)} />}
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
            {collaborators.map(collab => (<option key={collab.id} value={collab.id}>{collab.name}</option>))}
          </select>
        </div>
      </div>
      {renderActiveView()}
    </div>
  );
};

export default ScheduleContainer;
