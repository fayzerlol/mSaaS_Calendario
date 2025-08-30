import React, { useState, useEffect } from 'react';
import { auth } from './services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import SignOut from './components/SignOut';
import Schedule from './components/Schedule';
import AddEvent from './components/AddEvent';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {user ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold">Welcome, {user.email}</h1>
              <SignOut />
            </div>
            <AddEvent />
            <Schedule />
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
