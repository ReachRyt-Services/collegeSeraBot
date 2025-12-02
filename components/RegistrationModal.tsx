import React, { useState } from 'react';
import { User } from '../types';
import { createLead } from '../services/dataService';
import { COLLEGE_DATA } from '../constants';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from './ui/card';
import { cn } from '../lib/utils';

interface RegistrationModalProps {
  onRegister: (user: User) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ onRegister }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    phone: '',
    email: '',
    location: '',
    program: 'B.Tech',
    preferred_college: '',
    preferred_course: ''
  });

  // Form States
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validators
  const isValidPhone = (phone: string) => /^[6-9]\d{9}$/.test(phone); // Indian mobile format
  const isValidEmail = (email: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!formData.phone || !isValidPhone(formData.phone)) {
      setError('Valid 10-digit Phone Number (starting with 6-9) is required.');
      return;
    }
    if (!formData.email || !isValidEmail(formData.email)) {
      setError('Valid Email Address is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Cast to User since validation passed
      const savedUser = await createLead(formData as User);
      onRegister(savedUser);
    } catch (err) {
      console.error(err);
      setError('Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4 md:p-6">
      <Card className="w-full max-w-xl shadow-2xl border-primary/10 backdrop-blur-sm bg-card/95">
        <CardHeader className="space-y-3 pb-6">
          <div className="mx-auto w-20 h-20 flex items-center justify-center mb-4">
            <img src="/logo.png" alt="CollegeSeraBot Logo" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <CardTitle className="text-3xl text-center font-bold tracking-tight text-foreground">
            Welcome to <span className="text-primary">CollegeSeraBot</span>
          </CardTitle>
          <CardDescription className="text-center text-base">
            Your AI companion for finding the perfect college. <br />
            <span className="text-xs text-muted-foreground">Please register to continue.</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <Input
                  name="name"
                  placeholder="Rahul Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <Input
                  name="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <Input
                  name="email"
                  type="email"
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  City / Location
                </label>
                <Input
                  name="location"
                  placeholder="Chennai"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="bg-background"
                />
              </div>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-semibold tracking-wider">Academic Interests</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Program
                </label>
                <div className="relative">
                  <select
                    name="program"
                    className="flex h-10 w-full appearance-none items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.program}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    <option value="B.Tech">B.Tech / B.E.</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="MBA">MBA</option>
                    <option value="BBA">BBA</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Preferred College
                </label>
                <div className="relative">
                  <select
                    name="preferred_college"
                    className="flex h-10 w-full appearance-none items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.preferred_college}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    <option value="">Any / Undecided</option>
                    {COLLEGE_DATA.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    <option value="Other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Preferred Course / Branch
              </label>
              <Input
                name="preferred_course"
                placeholder="e.g. Computer Science, Mechanical..."
                value={formData.preferred_course}
                onChange={handleChange}
                disabled={isSubmitting}
                className="bg-background"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                {error}
              </div>
            )}

            <Button type="submit" className="w-full text-lg h-11 shadow-md hover:shadow-lg transition-all" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Registering...
                </div>
              ) : (
                'Start Chatting'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
