-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create leads table
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  phone text not null,
  email text,
  location text,
  preferred_college text,
  preferred_course text,
  program text
);

-- Create interactions table
create table if not exists interactions (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references leads(id),
  message text,
  bot_response text,
  detected_colleges text[]
);

-- Enable Row Level Security (RLS)
alter table leads enable row level security;
alter table interactions enable row level security;

-- Policies for leads
-- Allow anyone (anon) to insert a new lead (Registration)
create policy "Allow public insert for leads"
on leads for insert
to anon
with check (true);

-- Allow only authenticated users (Admins) to view leads
create policy "Allow authenticated view for leads"
on leads for select
to authenticated
using (true);

-- Policies for interactions
-- Allow anyone (anon) to insert a new interaction (Chat)
create policy "Allow public insert for interactions"
on interactions for insert
to anon
with check (true);

-- Allow only authenticated users (Admins) to view interactions
create policy "Allow authenticated view for interactions"
on interactions for select
to authenticated
using (true);
