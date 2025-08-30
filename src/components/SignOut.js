import React from 'react';
import { auth } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';

const SignOut = () => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <button onClick={handleSignOut}>
      Sign Out
    </button>
  );
};

export default SignOut;
