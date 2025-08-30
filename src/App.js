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

function App() {
  // Core App State
  const [user, setUser] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

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
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-6xl mt-8">
        {user ? (
          <div>
            <header className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Welcome, {user.email}</h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <NotificationBell count={notifications.length} onClick={() => setShowPanel(prev => !prev)} />
                  {showPanel && <NotificationPanel notifications={notifications} onDismiss={dismissNotification} />}
                </div>
                <SignOut />
              </div>
            </header>

            <main>
              <AddEvent user={user} eventToEdit={eventToEdit} setEventToEdit={setEventToEdit} />
              <ScheduleContainer
                user={user}
                setEventToEdit={setEventToEdit}
                onNotificationsUpdate={setNotifications}
              />
              <CollaboratorManager user={user} />
            </main>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SignUp />
            <SignIn />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
