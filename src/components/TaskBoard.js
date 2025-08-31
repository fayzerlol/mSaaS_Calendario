import React, { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import {
  subscribeToTasks,
  addTask,
  updateTask,
  deleteTask,
} from '../services/taskService';

/**
 * TaskBoard component displays tasks in a Kanban-style board with columns
 * for different statuses and provides functionality to add, update, and
 * delete tasks. It also fetches collaborators and updates notifications
 * for tasks due within the next 24 hours.
 *
 * @param {{ user: any, onBackToCalendar: () => void, onNotificationsUpdate: function }} props
 */
const initialTask = {
  title: '',
  description: '',
  assignedTo: '',
  dueDate: '',
  status: 'todo',
};

function TaskBoard({ user, onBackToCalendar, onNotificationsUpdate }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState(initialTask);
  const [collaborators, setCollaborators] = useState([]);

  const organizationId = user?.organizationId;

  useEffect(() => {
    if (!organizationId) return;
    // Subscribe to tasks and update notifications
    const unsubscribe = subscribeToTasks(organizationId, (fetchedTasks) => {
      setTasks(fetchedTasks);
      if (onNotificationsUpdate) {
        const now = new Date();
        const notifications = fetchedTasks
          .filter((task) => task.dueDate)
          .flatMap((task) => {
            const due = new Date(task.dueDate);
            const diff = due - now;
            const minutes = Math.floor(diff / 60000);
            // Notify tasks due within 24 hours
            if (minutes <= 60 * 24 && minutes > 0) {
              return [
                {
                  id: task.id,
                  title: 'Task due soon',
                  message: `${task.title} due on ${due.toLocaleDateString()}`,
                  taskId: task.id,
                },
              ];
            }
            return [];
          });
        onNotificationsUpdate(notifications);
      }
    });
    return () => unsubscribe();
  }, [organizationId, onNotificationsUpdate]);

  useEffect(() => {
    if (!user) return;
    // Fetch collaborators to assign tasks
    const fetchCollaborators = async () => {
      try {
        const collRef = collection(
          db,
          'organizations',
          user.organizationId,
          'collaborators'
        );
        const snapshot = await getDocs(collRef);
        const coll = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCollaborators(coll);
      } catch (error) {
        console.error('Error fetching collaborators', error);
      }
    };
    fetchCollaborators();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!organizationId) return;
    try {
      await addTask(organizationId, newTask);
      setNewTask(initialTask);
    } catch (error) {
      console.error('Error adding task', error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    if (!organizationId) return;
    try {
      await updateTask(organizationId, taskId, { status: newStatus });
    } catch (error) {
      console.error('Error updating task', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!organizationId) return;
    try {
      await deleteTask(organizationId, taskId);
    } catch (error) {
      console.error('Error deleting task', error);
    }
  };

  const statuses = ['todo', 'in-progress', 'done'];
  const tasksByStatus = statuses.reduce((acc, status) => {
    acc[status] = tasks.filter((task) => task.status === status);
    return acc;
  }, {});

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Task Board</h2>
      {/* Back button to calendar */}
      <button
        className="mb-4 bg-gray-200 px-2 py-1 rounded"
        onClick={onBackToCalendar}
      >
        Back to Calendar
      </button>
      <div className="flex mb-4">
        {statuses.map((status) => (
          <div key={status} className="flex-1 px-2">
            <h3 className="font-semibold capitalize">
              {status.replace('-', ' ')}
            </h3>
            {tasksByStatus[status].map((task) => (
              <div key={task.id} className="bg-white p-2 mb-2 rounded shadow">
                <div className="font-semibold">{task.title}</div>
                {task.description && (
                  <div className="text-sm">{task.description}</div>
                )}
                {task.dueDate && (
                  <div className="text-xs text-gray-600">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}
                <div className="mt-1">
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(task.id, e.target.value)
                    }
                    className="text-sm border rounded px-1 py-0.5"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s.replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                  <button
                    className="ml-2 text-red-500 text-sm"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <form onSubmit={handleAddTask} className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Add New Task</h3>
        <div className="mb-2">
          <input
            type="text"
            name="title"
            value={newTask.title}
            onChange={handleInputChange}
            placeholder="Title"
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>
        <div className="mb-2">
          <textarea
            name="description"
            value={newTask.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="border rounded px-2 py-1 w-full"
            rows={3}
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm mb-1">Assign To:</label>
          <select
            name="assignedTo"
            value={newTask.assignedTo}
            onChange={handleInputChange}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Unassigned</option>
            {collaborators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.email}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block text-sm mb-1">Due Date:</label>
          <input
            type="date"
            name="dueDate"
            value={newTask.dueDate}
            onChange={handleInputChange}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm mb-1">Status:</label>
          <select
            name="status"
            value={newTask.status}
            onChange={handleInputChange}
            className="border rounded px-2 py-1 w-full"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Add Task
        </button>
      </form>
    </div>
  );
}

export default TaskBoard;
