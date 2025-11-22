import React, { useState } from 'react';
import { User } from '../types';
import { createLead } from '../services/dataService';
import { COLLEGE_DATA } from '../constants';

interface RegistrationModalProps {
  onRegister: (user: User) => void;
  onAdminClick: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ onRegister, onAdminClick }) => {
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
    <div className="card w-full max-w-lg bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl justify-center text-primary">Welcome to CollegeSeraBot</h2>
        <p className="text-center text-sm text-base-content/70 mb-4">
          Please enter your details to start chatting.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-medium">Full Name*</span>
              </div>
              <input name="name" type="text" placeholder="Rahul Kumar" className="input input-bordered w-full" value={formData.name} onChange={handleChange} disabled={isSubmitting} />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-medium">Phone Number*</span>
              </div>
              <input name="phone" type="tel" placeholder="9876543210" className="input input-bordered w-full" value={formData.phone} onChange={handleChange} disabled={isSubmitting} />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-medium">Email*</span>
              </div>
              <input name="email" type="email" placeholder="rahul@example.com" className="input input-bordered w-full" value={formData.email} onChange={handleChange} disabled={isSubmitting} />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-medium">City/Location</span>
              </div>
              <input name="location" type="text" placeholder="Chennai" className="input input-bordered w-full" value={formData.location} onChange={handleChange} disabled={isSubmitting} />
            </label>
          </div>

          <div className="divider text-sm">Interests</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-medium">Program</span>
              </div>
              <select name="program" className="select select-bordered w-full" value={formData.program} onChange={handleChange} disabled={isSubmitting}>
                <option value="B.Tech">B.Tech / B.E.</option>
                <option value="M.Tech">M.Tech</option>
                <option value="MBA">MBA</option>
                <option value="BBA">BBA</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-medium">Preferred College</span>
              </div>
              <select name="preferred_college" className="select select-bordered w-full" value={formData.preferred_college} onChange={handleChange} disabled={isSubmitting}>
                <option value="">Any / Undecided</option>
                {COLLEGE_DATA.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                <option value="Other">Other</option>
              </select>
            </label>
          </div>

          <label className="form-control w-full">
             <div className="label">
               <span className="label-text font-medium">Preferred Course/Branch</span>
             </div>
             <input name="preferred_course" type="text" placeholder="e.g. Computer Science" className="input input-bordered w-full" value={formData.preferred_course} onChange={handleChange} disabled={isSubmitting} />
          </label>

          {error && (
            <div role="alert" className="alert alert-warning text-sm p-2">
              <span>{error}</span>
            </div>
          )}

          <div className="card-actions flex-col items-center gap-2 w-full mt-4">
            <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? <span className="loading loading-spinner"></span> : 'Start Chatting'}
            </button>
            
            <button type="button" onClick={onAdminClick} className="btn btn-link btn-xs text-base-content/60 hover:text-primary mt-2">
              Admin Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
