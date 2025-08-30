import React, { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp, query, onSnapshot } from 'firebase/firestore';

const AddEvent = ({ user, eventToEdit, setEventToEdit }) => {
  // Form state
  const [title, setTitle] = useState('');
  const [day, setDay] = useState('Mon');
  const [time, setTime] = useState('');
  const [assignedCollaborator, setAssignedCollaborator] = useState('');

  // Component state
  const [collaborators, setCollaborators] = useState([]);
  const [organizationId, setOrganizationId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isEditMode = !!eventToEdit;

  // Effect to get org ID and listen for collaborators
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
        unsubscribe = onSnapshot(collabsQuery, (snapshot) => {
          setCollaborators(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
      }
    };
    getOrgAndCollaborators();
    return () => unsubscribe();
  }, [user]);

  // Effect to populate form when in edit mode
  useEffect(() => {
    if (isEditMode) {
      setTitle(eventToEdit.title);
      setDay(eventToEdit.day);
      setTime(eventToEdit.time);
      setAssignedCollaborator(eventToEdit.assignedCollaborator || '');
    } else {
      setTitle('');
      setDay('Mon');
      setTime('');
      setAssignedCollaborator('');
    }
  }, [eventToEdit, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !time) {
      setError('Title and time are required.');
      return;
    }
    if (!organizationId) {
      setError('Cannot proceed: Organization ID is missing.');
      return;
    }

    const eventData = { title, day, time, assignedCollaborator: assignedCollaborator || null };

    try {
      if (isEditMode) {
        const eventDocRef = doc(db, 'organizations', organizationId, 'events', eventToEdit.id);
        await updateDoc(eventDocRef, eventData);
        setSuccess('Event updated successfully!');
        setEventToEdit(null);
      } else {
        const eventsCollectionRef = collection(db, 'organizations', organizationId, 'events');
        await addDoc(eventsCollectionRef, {
          ...eventData,
          createdAt: serverTimestamp(),
          author: user.uid,
        });
        setSuccess('Event added successfully!');
        // Reset form
        setTitle('');
        setDay('Mon');
        setTime('');
        setAssignedCollaborator('');
      }
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'add'} event.`);
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setEventToEdit(null);
    setError('');
    setSuccess('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-bold mb-4">{isEditMode ? 'Edit Event' : 'Add New Event'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event Title" className="md:col-span-2 p-2 border rounded-md" />
          <select value={day} onChange={(e) => setDay(e.target.value)} className="p-2 border rounded-md">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (<option key={d} value={d}>{d}</option>))}
          </select>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="p-2 border rounded-md" />
          <select value={assignedCollaborator} onChange={(e) => setAssignedCollaborator(e.target.value)} className="p-2 border rounded-md">
            <option value="">Unassigned</option>
            {collaborators.map(collab => (<option key={collab.id} value={collab.id}>{collab.name}</option>))}
          </select>
        </div>
        <div className="flex items-center space-x-4 mt-4">
          <button type="submit" className="w-full bg-indigo-500 text-white p-2 rounded-md hover:bg-indigo-600">
            {isEditMode ? 'Update Event' : 'Add Event'}
          </button>
          {isEditMode && (
            <button type="button" onClick={handleCancelEdit} className="w-full bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600">
              Cancel
            </button>
          )}
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        {success && <p className="text-green-500 text-xs mt-2">{success}</p>}
      </form>
    </div>
  );
};

export default AddEvent;
