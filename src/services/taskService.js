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
 * Subscribes to tasks collection within an organization.
 * @param {string} organizationId - Organization ID.
 * @param {function} callback - Called with array of task objects on update.
 * @returns {function} Unsubscribe function to stop listening.
 */
export const subscribeToTasks = (organizationId, callback) => {
  if (!organizationId) {
    return () => {};
  }
  const tasksQuery = query(
    collection(db, 'organizations', organizationId, 'tasks'),
    orderBy('createdAt')
  );
  const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
    const tasks = snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    }));
    callback(tasks);
  });
  return unsubscribe;
};

/**
 * Adds a new task to the organization's tasks collection.
 * @param {string} organizationId - Organization ID.
 * @param {object} taskData - Data for the new task.
 */
export const addTask = (organizationId, taskData) => {
  return addDoc(collection(db, 'organizations', organizationId, 'tasks'), {
    ...taskData,
    createdAt: new Date().toISOString()
  });
};

/**
 * Updates an existing task.
 * @param {string} organizationId - Organization ID.
 * @param {string} taskId - Task ID.
 * @param {object} updates - Fields to update.
 */
export const updateTask = (organizationId, taskId, updates) => {
  const taskRef = doc(db, 'organizations', organizationId, 'tasks', taskId);
  return updateDoc(taskRef, updates);
};

/**
 * Deletes a task from the organization's tasks collection.
 * @param {string} organizationId - Organization ID.
 * @param {string} taskId - Task ID.
 */
export const deleteTask = (organizationId, taskId) => {
  const taskRef = doc(db, 'organizations', organizationId, 'tasks', taskId);
  return deleteDoc(taskRef);
};
