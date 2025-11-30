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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4 md:px-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm">
              C
            </div>
            <a className="text-xl font-bold tracking-tight">
              CollegeSera<span className="text-primary">Bot</span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="relative group">
                <button className="flex items-center gap-2 outline-none">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-medium leading-none">{user.name}</span>
                    <span className="text-xs text-muted-foreground">Student</span>
                  </div>
                  <div className="relative h-8 w-8 overflow-hidden rounded-full border bg-muted flex items-center justify-center">
                    <span className="font-medium text-sm">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-2 py-1.5 text-sm font-semibold">My Account</div>
                  <div className="h-px bg-muted my-1" />
                  <button
                    onClick={() => {
                      localStorage.removeItem('vidyalaya_user');
                      setUser(null);
                      setView('auth');
                    }}
                    className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-destructive hover:text-destructive"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" x2="9" y1="12" y2="12" />
                    </svg>
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
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
