import { db } from './firebaseConfig';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

/**
 * Subscribe to tasks in a given organization and receive real-time updates.
 * @param {string} organizationId - ID of the organization.
 * @param {function} callback - Function to call with the list of tasks.
 * @returns {function} unsubscribe - Function to unsubscribe from updates.
 */
export function subscribeToTasks(organizationId, callback) {
  if (!organizationId) return () => {};
  const tasksCollectionRef = collection(db, 'organizations', organizationId, 'tasks');
  const q = query(tasksCollectionRef, orderBy('createdAt'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const tasks = [];
    snapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    callback(tasks);
  });
  return unsubscribe;
}

/**
 * Add a new task to the organization.
 * @param {string} organizationId - ID of the organization.
 * @param {object} taskData - Task data including title, description, status, dueDate, collaboratorId.
 * @returns {Promise} - Promise resolved with the created task document.
 */
export async function addTask(organizationId, taskData) {
  const tasksCollectionRef = collection(db, 'organizations', organizationId, 'tasks');
  return addDoc(tasksCollectionRef, {
    ...taskData,
    createdAt: new Date().toISOString()
  });
}

/**
 * Update an existing task.
 * @param {string} organizationId - ID of the organization.
 * @param {string} taskId - ID of the task to update.
 * @param {object} updates - Partial task data to update.
 * @returns {Promise} - Promise resolved when the task is updated.
 */
export async function updateTask(organizationId, taskId, updates) {
  const taskDocRef = doc(db, 'organizations', organizationId, 'tasks', taskId);
  return updateDoc(taskDocRef, updates);
}

/**
 * Delete a task.
 * @param {string} organizationId - ID of the organization.
 * @param {string} taskId - ID of the task to delete.
 * @returns {Promise} - Promise resolved when the task is deleted.
 */
export async function deleteTask(organizationId, taskId) {
  const taskDocRef = doc(db, 'organizations', organizationId, 'tasks', taskId);
  return deleteDoc(taskDocRef);
}
