import React, { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, doc, getDoc, addDoc, query, onSnapshot, deleteDoc, updateDoc } from 'firebase/firestore';

const CollaboratorManager = ({ user }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [registration, setRegistration] = useState('');
  const [permissions, setPermissions] = useState('user');

  const [collaborators, setCollaborators] = useState([]);
  const [organizationId, setOrganizationId] = useState(null);
  const [error, setError] = useState('');
  const [editingCollaborator, setEditingCollaborator] = useState(null);

  const isEditMode = !!editingCollaborator;

  useEffect(() => {
    if (!user) return;
    let unsubscribe = () => {};
    const setupListener = async () => {
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
    setupListener();
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (isEditMode) {
      setName(editingCollaborator.name);
      setRole(editingCollaborator.role);
      setRegistration(editingCollaborator.registration);
      setPermissions(editingCollaborator.permissions);
    } else {
      setName('');
      setRole('');
      setRegistration('');
      setPermissions('user');
    }
  }, [editingCollaborator, isEditMode]);

  const handleCancelEdit = () => {
    setEditingCollaborator(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !role || !registration) {
      setError('All fields are required.');
      return;
    }
    if (!organizationId) {
      setError('Cannot proceed: Organization ID is missing.');
      return;
    }

    const collaboratorData = { name, role, registration, permissions };

    try {
      if (isEditMode) {
        const collabDocRef = doc(db, 'organizations', organizationId, 'collaborators', editingCollaborator.id);
        await updateDoc(collabDocRef, collaboratorData);
        setEditingCollaborator(null);
      } else {
        const collabsCollectionRef = collection(db, 'organizations', organizationId, 'collaborators');
        await addDoc(collabsCollectionRef, collaboratorData);
      }
      setError('');
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'add'} collaborator.`);
      console.error(err);
    }
  };

  const handleDelete = async (collaboratorId) => {
    if (!organizationId) return;
    if (!window.confirm('Are you sure you want to remove this collaborator?')) return;
    const collabDocRef = doc(db, 'organizations', organizationId, 'collaborators', collaboratorId);
    await deleteDoc(collabDocRef);
  };

  return (
    <div className="mt-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Manage Collaborators</h2>

        <form onSubmit={handleSubmit} className="mb-6 pb-6 border-b">
          <h3 className="text-xl font-bold mb-4">{isEditMode ? 'Edit Collaborator' : 'Add New Collaborator'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="p-2 border rounded-md" required />
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" className="p-2 border rounded-md" required />
            <input type="text" value={registration} onChange={(e) => setRegistration(e.target.value)} placeholder="Registration ID" className="p-2 border rounded-md" required />
            <select value={permissions} onChange={(e) => setPermissions(e.target.value)} className="p-2 border rounded-md">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <button type="submit" className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600">{isEditMode ? 'Update Collaborator' : 'Add Collaborator'}</button>
            {isEditMode && (
              <button type="button" onClick={handleCancelEdit} className="w-full bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600">Cancel</button>
            )}
          </div>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </form>

        <div>
          <h3 className="text-xl font-bold mb-4">Collaborator List</h3>
          <div className="space-y-2">
            {collaborators.map(collab => (
              <div key={collab.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div>
                  <p className="font-semibold">{collab.name} <span className="text-xs font-light text-gray-500">({collab.permissions})</span></p>
                  <p className="text-sm text-gray-600">{collab.role} - #{collab.registration}</p>
                </div>
                <div className="flex space-x-4">
                  <button onClick={() => setEditingCollaborator(collab)} className="text-xs text-blue-500 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(collab.id)} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorManager;
// cleaned redundant re-export
