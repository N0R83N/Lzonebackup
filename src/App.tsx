import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SoftwareDetail from './pages/SoftwareDetail';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import Profile from './pages/Profile';

import { useVisitorTracking } from './hooks/useVisitorTracking';

function AppTracker({ user, userProfile }: { user: any; userProfile: any }) {
  useVisitorTracking({ user, userProfile });
  return null;
}

export default function App() {
  const [user, setUser] = useState(auth.currentUser);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isStaff, setIsStaff] = useState(false); // admin veya moderatör
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const data = userDoc.exists() ? userDoc.data() : null;
        setUserProfile(data);
        const role = data ? data.role : null;
        if (
          role === 'admin' ||
          role === 'moderator' ||
          firebaseUser.email === 'nijatemiraslanov@gmail.com'
        ) {
          setIsStaff(true);
        } else {
          setIsStaff(false);
        }
      } else {
        setUserProfile(null);
        setIsStaff(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <AppTracker user={user} userProfile={userProfile} />
      <div className="min-h-screen bg-black selection:bg-blue-500/30 selection:text-blue-200">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/software/:id" element={<SoftwareDetail />} />
          <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
          <Route
            path="/admin"
            element={isStaff ? <AdminPanel /> : <Navigate to="/" />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/auth" />}
          />
        </Routes>
      </div>
    </Router>
  );
}
