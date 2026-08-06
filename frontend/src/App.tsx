import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Admin from './pages/Admin';
import VideoDetail from './pages/VideoDetail';
import Guide from './pages/Guide';
import { ModalProvider } from './context/ModalContext';
import LoginOverlay from './components/LoginOverlay';
import DonateWidget from './components/DonateWidget';
import Footer from './components/Footer';
import { auth } from './firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-white w-8 h-8" />
      </div>
    );
  }

  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS ? import.meta.env.VITE_ADMIN_EMAILS.split(',').map((e: string) => e.trim()) : [];
  const isAdmin = user && user.email && adminEmails.includes(user.email);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-white w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    return <LoginOverlay />;
  }

  return (
    <Router>
      <ModalProvider>
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white/30">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/admin" 
              element={
                <PrivateRoute>
                  <Admin />
                </PrivateRoute>
              } 
            />
            <Route path="/video/:id" element={<VideoDetail />} />
            <Route path="/guide" element={<Guide />} />
          </Routes>
          <Footer />
          <DonateWidget />
        </div>
      </ModalProvider>
    </Router>
  );
}

export default App;
