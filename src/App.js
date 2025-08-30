import React, { useState, useEffect } from 'react';
import { auth } from './services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import SignOut from './components/SignOut';
import ScheduleContainer from './components/ScheduleContainer';
import AddEvent from './components/AddEvent';
import CollaboratorManager from './components/CollaboratorManager';

function App() {
  const [user, setUser] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        setEventToEdit(null); // Clear editing state on logout
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-6xl mt-8">
        {user ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Welcome, {user.email}</h1>
              <SignOut />
            </div>
            <AddEvent user={user} eventToEdit={eventToEdit} setEventToEdit={setEventToEdit} />
            <ScheduleContainer user={user} setEventToEdit={setEventToEdit} />
            <CollaboratorManager user={user} />
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
