import React, { useEffect, useState } from 'react';
import { fetchLeads, fetchInteractions } from '../services/dataService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { User } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

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
      <div className="flex items-center justify-center min-h-screen bg-background/50 p-4">
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-primary">CollegeSera Admin</CardTitle>
            <CardDescription className="text-center">
              Secure Access Only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="admin@collegesera.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {authError && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                  {authError}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {!isSupabaseConfigured() && (
              <div className="mt-4 bg-yellow-100 text-yellow-800 text-xs p-2 rounded border border-yellow-200">
                System: Supabase keys are missing.
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-center">
            <Button variant="ghost" size="sm" onClick={onLogout}>
              &larr; Return to App
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // --- Dashboard View ---
  return (
    <div className="flex flex-col h-screen w-full bg-muted/30 p-2 md:p-6 gap-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Admin Dashboard</h1>
          <Badge variant="outline" className="hidden md:inline-flex px-3 py-1">
            {session.user.email}
          </Badge>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              type="text"
              className="pl-9"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={loadData} disabled={loading}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleSignOut}>
            Logout
          </Button>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col shadow-md border-border/50">
        <div className="p-2 border-b bg-muted/20">
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'leads' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('leads')}
              className="gap-2"
            >
              Leads <Badge variant={activeTab === 'leads' ? 'secondary' : 'default'} className="ml-1">{filteredLeads.length}</Badge>
            </Button>
            <Button
              variant={activeTab === 'chats' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('chats')}
              className="gap-2"
            >
              Chats <Badge variant={activeTab === 'chats' ? 'secondary' : 'default'} className="ml-1">{filteredInteractions.length}</Badge>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-8 space-y-4">
              <div className="h-8 bg-muted rounded w-full animate-pulse"></div>
              <div className="h-32 bg-muted rounded w-full animate-pulse"></div>
              <div className="h-32 bg-muted rounded w-full animate-pulse"></div>
            </div>
          ) : (
            <>
              {activeTab === 'leads' && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name / Phone</TableHead>
                      <TableHead>Contact / Location</TableHead>
                      <TableHead>Education Interest</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                          {searchTerm ? 'No leads found matching your search.' : 'No leads recorded yet.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLeads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>
                            <div className="font-semibold">{lead.name}</div>
                            <div className="text-xs text-muted-foreground">{lead.phone}</div>
                          </TableCell>
                          <TableCell>
                            <div>{lead.email || '-'}</div>
                            {lead.location && <Badge variant="outline" className="mt-1 font-normal">{lead.location}</Badge>}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 text-xs">
                              {lead.program && <span><span className="font-semibold">Prog:</span> {lead.program}</span>}
                              {lead.preferred_college && <span><span className="font-semibold">Target:</span> {lead.preferred_college}</span>}
                              {lead.preferred_course && <span><span className="font-semibold">Course:</span> {lead.preferred_course}</span>}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}

              {activeTab === 'chats' && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">User</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Bot Response</TableHead>
                      <TableHead className="w-[150px]">Tags</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInteractions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                          {searchTerm ? 'No chat logs found matching your search.' : 'No chat logs recorded yet.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInteractions.map((log) => (
                        <TableRow key={log.id} className="align-top">
                          <TableCell>
                            <div className="font-semibold truncate max-w-[180px]">{log.leads?.name || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</div>
                          </TableCell>
                          <TableCell><div className="text-sm max-h-24 overflow-y-auto pr-2">{log.message}</div></TableCell>
                          <TableCell><div className="text-sm text-muted-foreground max-h-24 overflow-y-auto pr-2">{log.bot_response}</div></TableCell>
                          <TableCell>
                            {log.detected_colleges && log.detected_colleges.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {log.detected_colleges.map((tag: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-[10px] px-1 py-0">{tag}</Badge>
                                ))}
                              </div>
                            ) : <span className="text-muted-foreground">-</span>}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
