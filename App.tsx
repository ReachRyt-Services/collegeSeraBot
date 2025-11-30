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
      <header className="navbar bg-base-100/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-base-200">
        <div className="navbar-start">
          <div className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30">
              C
            </div>
            <a className="text-xl font-bold tracking-tight text-base-content">CollegeSera<span className="text-primary">Bot</span></a>
          </div>
        </div>
        <div className="navbar-end">
          {user && (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder ring-2 ring-base-200 ring-offset-2">
                <div className="bg-neutral text-neutral-content rounded-full w-10">
                  <span className="text-lg font-bold">{user.name.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-xl bg-base-100 rounded-box w-52 border border-base-200">
                <li className="menu-title px-4 py-2 text-xs opacity-50 uppercase tracking-wider">Account</li>
                <li className="disabled"><a className="font-medium">{user.name}</a></li>
                <div className="divider my-1"></div>
                <li>
                  <button
                    onClick={() => {
                      localStorage.removeItem('vidyalaya_user');
                      setUser(null);
                      setView('auth');
                    }}
                    className="text-error hover:bg-error/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
                    </svg>
                    Logout
                  </button>
                </li>
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
