import React, { useEffect, useState } from 'react';
import { fetchLeads, fetchInteractions } from '../services/dataService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { User } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'chats'>('leads');
  const [leads, setLeads] = useState<User[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<any>(null);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session) loadData();
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) {
          loadData();
        } else {
          setLeads([]);
          setInteractions([]);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured() || !supabase) {
      setAuthError("Supabase is not configured. Please check your environment variables.");
      return;
    }
    
    setLoading(true);
    setAuthError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      setAuthError(error.message);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    onLogout();
  };

  const loadData = async () => {
    if (!session && !supabase) return;
    
    setLoading(true);
    try {
      const [leadsData, interactionsData] = await Promise.all([
        fetchLeads(),
        fetchInteractions()
      ]);
      setLeads(leadsData);
      setInteractions(interactionsData);
    } catch (error) {
      console.error("Failed to load admin data", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredLeads = leads.filter(lead => {
    if (!searchTerm) return true;
    const lowerTerm = searchTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(lowerTerm) ||
      lead.phone.includes(lowerTerm) ||
      (lead.email && lead.email.toLowerCase().includes(lowerTerm)) ||
      (lead.location && lead.location.toLowerCase().includes(lowerTerm)) ||
      (lead.preferred_college && lead.preferred_college.toLowerCase().includes(lowerTerm))
    );
  });

  const filteredInteractions = interactions.filter(log => {
    if (!searchTerm) return true;
    const lowerTerm = searchTerm.toLowerCase();
    return (
      (log.leads?.name && log.leads.name.toLowerCase().includes(lowerTerm)) ||
      log.message.toLowerCase().includes(lowerTerm) ||
      log.bot_response.toLowerCase().includes(lowerTerm) ||
      (log.detected_colleges && log.detected_colleges.some((tag: string) => tag.toLowerCase().includes(lowerTerm)))
    );
  });

  // --- Authentication View ---
  if (!session) {
    return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary">Vidyalaya Admin</h1>
            <p className="py-2">Secure Access Only</p>
          </div>
          <div className="card w-full max-w-sm shrink-0 bg-base-100 shadow-2xl">
            <form className="card-body" onSubmit={handleLogin}>
              <label className="form-control">
                <div className="label"><span className="label-text font-medium">Email Address</span></div>
                <input 
                  type="email" 
                  placeholder="admin@vidyalaya.com"
                  className="input input-bordered"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className="form-control">
                <div className="label"><span className="label-text font-medium">Password</span></div>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="input input-bordered"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              
              {authError && (
                <div role="alert" className="alert alert-error text-sm p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{authError}</span>
                </div>
              )}

              <div className="form-control mt-4">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="loading loading-spinner"></span> : 'Sign In'}
                </button>
              </div>
              
              <div className="divider my-1"></div>
              
              <button type="button" className="btn btn-ghost btn-sm" onClick={onLogout}>
                &larr; Return to App
              </button>
            </form>
            
            {!isSupabaseConfigured() && (
               <div className="alert alert-warning m-4 text-xs">
                 <span>System: Supabase keys are missing.</span>
               </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Dashboard View ---
  return (
    <div className="flex flex-col h-screen w-full bg-base-200 p-2 md:p-4 gap-4">
      <div className="navbar bg-base-100 rounded-box shadow-lg border border-base-300 flex-col md:flex-row gap-2">
        <div className="navbar-start">
          <h1 className="text-xl font-bold px-2">Admin Dashboard</h1>
        </div>
        <div className="navbar-center">
           <div className="badge badge-ghost hidden md:inline-flex">
            {session.user.email}
          </div>
        </div>
        <div className="navbar-end w-full md:w-auto flex gap-2">
          <label className="input input-bordered input-sm flex items-center gap-2 flex-grow">
            <input 
              type="text" 
              className="grow"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" /></svg>
          </label>
          <button className="btn btn-sm btn-ghost btn-square" onClick={loadData} disabled={loading}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
          <button className="btn btn-sm btn-error" onClick={handleSignOut}>
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 bg-base-100 rounded-box shadow-lg border border-base-300 overflow-hidden flex flex-col">
        <div className="p-2 border-b border-base-300">
          <div role="tablist" className="tabs tabs-boxed w-fit">
            <a role="tab" className={`tab ${activeTab === 'leads' ? 'tab-active' : ''}`} onClick={() => setActiveTab('leads')}>
              Leads <div className="badge badge-sm ml-2">{filteredLeads.length}</div>
            </a>
            <a role="tab" className={`tab ${activeTab === 'chats' ? 'tab-active' : ''}`} onClick={() => setActiveTab('chats')}>
              Chats <div className="badge badge-sm ml-2">{filteredInteractions.length}</div>
            </a>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              <div className="skeleton h-8 w-full"></div>
              <div className="skeleton h-32 w-full"></div>
              <div className="skeleton h-32 w-full"></div>
            </div>
          ) : (
            <div>
              {activeTab === 'leads' && (
                <table className="table table-pin-rows table-xs md:table-sm">
                  <thead><tr>
                    <th>Date</th>
                    <th>Name / Phone</th>
                    <th>Contact / Location</th>
                    <th>Education Interest</th>
                  </tr></thead>
                  <tbody>
                    {filteredLeads.length === 0 ? (
                      <tr><td colSpan={4} className="text-center p-8">
                        {searchTerm ? 'No leads found.' : 'No leads recorded.'}
                      </td></tr>
                    ) : (
                      filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover">
                          <td>{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}</td>
                          <td>
                            <div className="font-bold">{lead.name}</div>
                            <div>{lead.phone}</div>
                          </td>
                          <td>
                            <div>{lead.email || '-'}</div>
                            {lead.location && <div className="badge badge-ghost badge-sm mt-1">{lead.location}</div>}
                          </td>
                          <td>
                            <div className="flex flex-col gap-1">
                              {lead.program && <span><b>Prog:</b> {lead.program}</span>}
                              {lead.preferred_college && <span><b>Target:</b> {lead.preferred_college}</span>}
                              {lead.preferred_course && <span><b>Course:</b> {lead.preferred_course}</span>}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === 'chats' && (
                <table className="table table-pin-rows table-xs">
                  <thead><tr>
                    <th>User</th>
                    <th>Message</th>
                    <th>Bot Response</th>
                    <th>Tags</th>
                  </tr></thead>
                  <tbody>
                     {filteredInteractions.length === 0 ? (
                      <tr><td colSpan={4} className="text-center p-8">
                        {searchTerm ? 'No chat logs found.' : 'No chat logs found.'}
                      </td></tr>
                    ) : (
                      filteredInteractions.map((log) => (
                        <tr key={log.id} className="hover align-top">
                          <td>
                            <div className="font-bold truncate">{log.leads?.name || 'Unknown'}</div>
                            <div className="text-xs">{new Date(log.created_at).toLocaleString()}</div>
                          </td>
                          <td><div className="prose text-xs max-h-24 overflow-y-auto">{log.message}</div></td>
                          <td><div className="prose text-xs max-h-24 overflow-y-auto">{log.bot_response}</div></td>
                          <td>
                            {log.detected_colleges && log.detected_colleges.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {log.detected_colleges.map((tag: string, i: number) => (
                                  <span key={i} className="badge badge-primary badge-outline badge-xs">{tag}</span>
                                ))}
                              </div>
                            ) : <span>-</span>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
