import React, { useState, useEffect } from 'react';
import { auth } from './services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import SignOut from './components/SignOut';
import ScheduleContainer from './components/ScheduleContainer';
import AddEvent from './components/AddEvent';
import CollaboratorManager from './components/CollaboratorManager';
import NotificationBell from './components/NotificationBell';
import NotificationPanel from './components/NotificationPanel';
import TaskBoard from './components/TaskBoard';

function App() {
  // Core App State
  const [user, setUser] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [showTaskBoard, setShowTaskBoard] = useState(false);

  const organizationId = user ? user.uid : null;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        setEventToEdit(null);
        setNotifications([]); // Clear notifications on logout
      }
    });
    return () => unsubscribe();
  }, []);

  const dismissNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-6xl mt-8">
        {user ? (
          <div>
            <header className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Welcome, {user.email}</h1>
              <div className="flex items-center space-x-4">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => setShowTaskBoard((prev) => !prev)}
                >
                  {showTaskBoard ? 'Calendário' : 'Task Board'}
                </button>
                <div className="relative">
                  <NotificationBell
                    count={notifications.length}
                    onClick={() => setShowPanel((prev) => !prev)}
                  />
                  {showPanel && (
                    <NotificationPanel
                      notifications={notifications}
                      onDismiss={dismissNotification}
                    />
                  )}
                </div>
                <SignOut />
              </div>
            </header>

            <main>
              {showTaskBoard ? (
                <TaskBoard
                  organizationId={organizationId}
                  onNotificationsUpdate={(taskNotifications) =>
                    setNotifications((prev) => {
                      const ids = new Set(taskNotifications.map((t) => t.id));
                      return [
                        ...taskNotifications,
                        ...prev.filter((p) => !ids.has(p.id)),
                      ];
                    })
                  }
                />
              ) : (
                <>
                  <AddEvent
                    user={user}
                    eventToEdit={eventToEdit}
                    setEventToEdit={setEventToEdit}
                  />
