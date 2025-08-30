import React, { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp, query, onSnapshot } from 'firebase/firestore';

const getISODate = (date) => date.toISOString().split('T')[0];

const AddEvent = ({ user, eventToEdit, setEventToEdit }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getISODate(new Date()));
  const [time, setTime] = useState('');
  const [assignedCollaborator, setAssignedCollaborator] = useState('');
  const [notification, setNotification] = useState('none');

  // Updated Recurrence State
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState({
    type: 'weekly',
    end: { type: 'onDate', value: '' } // end types: 'onDate', 'after', 'never'
  });

  const [collaborators, setCollaborators] = useState([]);
  const [organizationId, setOrganizationId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isEditMode = !!eventToEdit;

  // Fetching logic remains the same...
  useEffect(() => {
    if (!user) return;
    let unsubscribe = () => {};
    const getOrgAndCollaborators = async () => {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const orgId = userDoc.exists() ? userDoc.data().organizationId : null;
      if (orgId) {
        setOrganizationId(orgId);
        const collabsQuery = query(collection(db, 'organizations', orgId, 'collaborators'));
        unsubscribe = onSnapshot(collabsQuery, (snapshot) => setCollaborators(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
      }
    };
    getOrgAndCollaborators();
    return () => unsubscribe();
  }, [user]);

  // Populating form in edit mode remains the same...
  useEffect(() => {
    if (isEditMode) {
      setTitle(eventToEdit.title);
      setDate(eventToEdit.virtualDate || eventToEdit.date);
      setTime(eventToEdit.time);
      setAssignedCollaborator(eventToEdit.assignedCollaborator || '');
      setNotification(eventToEdit.notification || 'none');
      const rec = eventToEdit.recurrence;
      setIsRecurring(!!rec);
      if (rec) setRecurrence(rec);
    } else {
      // Reset form to default state
      setTitle(''); setDate(getISODate(new Date())); setTime(''); setAssignedCollaborator(''); setNotification('none'); setIsRecurring(false); setRecurrence({ type: 'weekly', end: { type: 'onDate', value: '' } });
    }
  }, [eventToEdit, isEditMode]);

  // HandleSubmit logic remains the same for now, as it just saves the `recurrence` object
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!title || !time || !date) { setError('Title, date, and time are required.'); return; }
    if (!organizationId) { setError('Cannot proceed: Organization ID is missing.'); return; }

    const eventDataForWrite = {
      title, date, time,
      assignedCollaborator: assignedCollaborator || null,
      notification,
      recurrence: isRecurring ? recurrence : null,
    };
    // ... (rest of the submit logic is unchanged)
    try {
      if (isEditMode) {
        if (eventToEdit.recurrence && eventToEdit.virtualDate !== eventToEdit.date) {
          const userChoice = window.confirm("Update this event only? (OK for 'This event only', Cancel for 'The entire series')");
          if (userChoice) {
            const exceptionsRef = collection(db, 'organizations', organizationId, 'events', eventToEdit.baseEventId, 'exceptions');
            const modifiedData = { title, time, assignedCollaborator };
            await addDoc(exceptionsRef, { originalDate: eventToEdit.virtualDate, modifiedData });
          } else {
            const baseEventRef = doc(db, 'organizations', organizationId, 'events', eventToEdit.baseEventId);
            await updateDoc(baseEventRef, eventDataForWrite);
          }
        } else {
          const eventDocRef = doc(db, 'organizations', organizationId, 'events', eventToEdit.id);
          await updateDoc(eventDocRef, eventDataForWrite);
        }
        setSuccess('Event updated successfully!');
        setEventToEdit(null);
      } else {
        const eventsCollectionRef = collection(db, 'organizations', organizationId, 'events');
        await addDoc(eventsCollectionRef, { ...eventDataForWrite, createdAt: serverTimestamp(), author: user.uid });
        setSuccess('Event added successfully!');
      }
      setTitle(''); setDate(getISODate(new Date())); setTime(''); setAssignedCollaborator(''); setNotification('none'); setIsRecurring(false); setRecurrence({ type: 'weekly', end: { type: 'onDate', value: '' } });
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'add'} event.`);
      console.error(err);
    }
  };

  const handleCancelEdit = () => { setEventToEdit(null); setError(''); setSuccess(''); };

  const handleRecurrenceEndTypeChange = (e) => {
    const newEndType = e.target.value;
    setRecurrence(prev => ({ ...prev, end: { type: newEndType, value: '' } }));
  };

  const handleRecurrenceEndValueChange = (e) => {
    const newEndValue = e.target.value;
    setRecurrence(prev => ({ ...prev, end: { ...prev.end, value: newEndValue } }));
  };

  // JSX for the form...
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-bold mb-4">{isEditMode ? 'Edit Event' : 'Add New Event'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main event details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event Title" className="md:col-span-4 p-2 border rounded-md" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 border rounded-md" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="p-2 border rounded-md" />
          <select value={assignedCollaborator} onChange={(e) => setAssignedCollaborator(e.target.value)} className="p-2 border rounded-md md:col-span-2">
            <option value="">Unassigned</option>
            {collaborators.map(collab => (<option key={collab.id} value={collab.id}>{collab.name}</option>))}
          </select>
        </div>
        {/* Notification settings */}
        <div className="pt-4 border-t">
          <select value={notification} onChange={(e) => setNotification(e.target.value)} className="p-2 border rounded-md w-full">
            <option value="none">No notification</option><option value="15m">15 minutes before</option><option value="1h">1 hour before</option><option value="1d">1 day before</option>
          </select>
        </div>
        {/* Recurrence Section */}
        <div className="pt-4 border-t">
          <label className="flex items-center space-x-2"><input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} /><span>Repeat</span></label>
          {isRecurring && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 pl-6">
              <select value={recurrence.type} onChange={(e) => setRecurrence({...recurrence, type: e.target.value})} className="p-2 border rounded-md">
                <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
              </select>
              <select value={recurrence.end.type} onChange={handleRecurrenceEndTypeChange} className="p-2 border rounded-md">
                <option value="onDate">On date</option><option value="after">After</option><option value="never">Never</option>
              </select>
              {recurrence.end.type === 'onDate' && <input type="date" value={recurrence.end.value} onChange={handleRecurrenceEndValueChange} className="p-2 border rounded-md" />}
              {recurrence.end.type === 'after' && <input type="number" value={recurrence.end.value} onChange={handleRecurrenceEndValueChange} placeholder="occurrences" className="p-2 border rounded-md" />}
            </div>
          )}
        </div>
        {/* Action Buttons */}
        <div className="flex items-center space-x-4 pt-4 border-t">
          <button type="submit" className="w-full bg-indigo-500 text-white p-2 rounded-md hover:bg-indigo-600">{isEditMode ? 'Update Event' : 'Add Event'}</button>
          {isEditMode && (<button type="button" onClick={handleCancelEdit} className="w-full bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600">Cancel</button>)}
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        {success && <p className="text-green-500 text-xs mt-2">{success}</p>}
      </form>
    </div>
  );
};

export default AddEvent;
