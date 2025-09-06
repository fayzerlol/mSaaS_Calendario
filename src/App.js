import React, { useEffect, useState } from 'react';
import SignOut from './components/SignOut';
import NotificationBell from './components/NotificationBell';
import NotificationPanel from './components/NotificationPanel';
import AddEvent from './components/AddEvent';
import ScheduleContainer from './components/ScheduleContainer';
import CollaboratorManager from './components/CollaboratorManager';
import TaskBoard from './components/TaskBoard';

function App({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [showTaskBoard, setShowTaskBoard] = useState(false);

  // Estados já usados no app original
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);
  const [collaboratorFilter, setCollaboratorFilter] = useState([]);
  const [refresh, setRefresh] = useState(false);

  // Usado por calendar e pelo TaskBoard
  const organizationId = user ? (user.uid || user.id || null) : null;

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">mSaaS Calendário</h1>
          <div className="flex items-center gap-3">
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded"
              onClick={() => setShowTaskBoard((v) => !v)}
            >
              {showTaskBoard ? 'Calendário' : 'Task Board'}
            </button>

            <div className="relative">
              <NotificationBell
                count={notifications.length}
                onClick={() => setShowPanel((p) => !p)}
              />
              {showPanel && (
                <NotificationPanel
                  notifications={notifications}
                  onDismiss={dismissNotification}
                  onClose={() => setShowPanel(false)}
                />
              )}
            </div>

            <SignOut />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {showTaskBoard ? (
          <TaskBoard
            organizationId={organizationId}
            onNotificationsUpdate={(n) =>
              setNotifications((prev) => {
                const ids = new Set(n.map((x) => x.id));
                return [...n, ...prev.filter((p) => !ids.has(p.id))];
              })
            }
          />
        ) : (
          <>
            <AddEvent
              user={user}
              organizationId={organizationId}
              onAdded={() => setRefresh((r) => !r)}
            />

            <ScheduleContainer
              user={user}
              organizationId={organizationId}
              notifications={notifications}
              setNotifications={setNotifications}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              selectedCollaborator={selectedCollaborator}
              collaboratorFilter={collaboratorFilter}
              setCollaboratorFilter={setCollaboratorFilter}
            />

            <CollaboratorManager
              user={user}
              organizationId={organizationId}
              selectedCollaborator={selectedCollaborator}
              setSelectedCollaborator={setSelectedCollaborator}
              collaboratorFilter={collaboratorFilter}
              setCollaboratorFilter={setCollaboratorFilter}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
