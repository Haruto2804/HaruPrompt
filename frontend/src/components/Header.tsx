import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Film, Upload, LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  // Check if user is admin
  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS ? import.meta.env.VITE_ADMIN_EMAILS.split(',').map((e: string) => e.trim()) : [];
  const isAdmin = user && user.email && adminEmails.includes(user.email);

  return (
    <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-40">
      <div className="container mx-auto px-2 sm:px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 text-white hover:opacity-80 transition-opacity shrink-0">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Film size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-tight truncate max-w-[120px] sm:max-w-none">HaruPrompt</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              location.pathname === '/' ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Gallery
          </Link>
          
          {isAdmin && (
            <Link
              to="/admin"
              className={`text-sm font-medium flex items-center justify-center shrink-0 w-8 h-8 sm:w-auto sm:px-4 sm:py-2 rounded-full transition-all ${
                location.pathname === '/admin'
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Upload size={16} />
              <span className="hidden sm:inline sm:ml-1.5">Upload</span>
            </Link>
          )}

          {user && (
            <div className="flex items-center gap-2 sm:gap-3 ml-1 sm:ml-2 sm:border-l sm:border-white/10 sm:pl-4 shrink-0">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-white/20 shrink-0" />
                ) : (
                  <div className="w-8 h-8 shrink-0 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50 text-blue-400 font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium hidden md:inline text-zinc-400 truncate max-w-[120px]">
                  Chào mừng, <span className="text-white">{user.displayName || user.email?.split('@')[0]}</span>
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm font-medium flex items-center justify-center shrink-0 w-8 h-8 sm:w-auto sm:px-4 sm:py-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                title="Sign Out"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline sm:ml-1.5">Thoát</span>
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
