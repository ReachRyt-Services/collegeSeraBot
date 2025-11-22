import React, { useState, useEffect } from 'react';
import { RegistrationModal } from './components/RegistrationModal';
import { ChatInterface } from './components/ChatInterface';
import { AdminDashboard } from './components/AdminDashboard';
import { User } from './types';

type ViewState = 'auth' | 'chat' | 'admin';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('auth');

  // Check if user is already registered in this session
  useEffect(() => {
    const savedUser = localStorage.getItem('vidyalaya_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setView('chat');
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const handleRegister = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('vidyalaya_user', JSON.stringify(newUser));
    setView('chat');
  };

  const handleAdminLogout = () => {
    if (user) {
      setView('chat');
    } else {
      setView('auth');
    }
  };

  return (
    // full viewport container
    <div className="flex flex-col min-h-screen bg-base-200">
      <header className="navbar bg-base-100 shadow-md">
        <div className="navbar-start">
          <a className="btn btn-ghost text-xl">CollegeSeraBot</a>
        </div>
        <div className="navbar-end">
          {user && (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full bg-primary text-primary-content">
                  <span className="text-xl">{user.name.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li><a>Logged in as {user.name}</a></li>
              </ul>
            </div>
          )}
        </div>
      </header>

      {/* main now stretches and does not vertically center */}
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-4">
          {view === 'auth' && (
            <RegistrationModal 
              onRegister={handleRegister} 
              onAdminClick={() => setView('admin')} 
            />
          )}

          {view === 'chat' && user && (
            // ChatInterface must be full-height inside this flex column
            <div className="h-full">
              <ChatInterface user={user} />
            </div>
          )}

          {view === 'admin' && (
            <AdminDashboard onLogout={handleAdminLogout} />
          )}
        </div>
      </main>

      <footer className="footer footer-center p-4 bg-base-300 text-base-content">
        <aside>
          <p>Copyright © 2024 - All right reserved by <a href="https://collegesera.com" className="link link-primary">CollegeSera</a></p>
        </aside>
      </footer>
    </div>
  );
};

export default App;
