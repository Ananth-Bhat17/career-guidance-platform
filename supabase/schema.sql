-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  education text,
  field_of_study text,
  experience_level text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- RLS Policies

-- Policy 1: Allow users to select/read only their own profile
create policy "Users can view their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Policy 2: Allow users to insert only their own profile
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Policy 3: Allow users to update only their own profile
create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Function to handle updated_at timestamps automatically
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to execute update timestamp on row update
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Table Grants
grant usage on schema public to authenticated;

grant select, insert, update
on table public.profiles
to authenticated;

-- Create skills table
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  created_at timestamptz not null default now()
);

-- Create user_skills table
create table if not exists public.user_skills (
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  proficiency text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, skill_id)
);

-- Enable Row Level Security (RLS)
alter table public.skills enable row level security;
alter table public.user_skills enable row level security;

-- RLS Policies for skills
create policy "Authenticated users can view skills"
  on public.skills
  for select
  to authenticated
  using (true);

-- RLS Policies for user_skills
create policy "Users can view their own skills"
  on public.user_skills
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own skills"
  on public.user_skills
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own skills"
  on public.user_skills
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own skills"
  on public.user_skills
  for delete
  using (auth.uid() = user_id);

-- Grants for skills and user_skills
grant select on table public.skills to authenticated;

grant select, insert, update, delete
on table public.user_skills
to authenticated;

-- Seed initial skills dataset
insert into public.skills (name, category) values
  -- Programming
  ('Python', 'Programming'),
  ('Java', 'Programming'),
  ('C', 'Programming'),
  ('C++', 'Programming'),
  ('JavaScript', 'Programming'),
  ('TypeScript', 'Programming'),

  -- Web Development
  ('HTML', 'Web Development'),
  ('CSS', 'Web Development'),
  ('React', 'Web Development'),
  ('Next.js', 'Web Development'),
  ('Node.js', 'Web Development'),

  -- Database
  ('SQL', 'Database'),
  ('PostgreSQL', 'Database'),
  ('MySQL', 'Database'),
  ('MongoDB', 'Database'),

  -- Data & AI
  ('Data Analysis', 'Data & AI'),
  ('Machine Learning', 'Data & AI'),
  ('Deep Learning', 'Data & AI'),
  ('Pandas', 'Data & AI'),
  ('NumPy', 'Data & AI'),
  ('TensorFlow', 'Data & AI'),

  -- Cybersecurity
  ('Linux', 'Cybersecurity'),
  ('Networking', 'Cybersecurity'),
  ('Ethical Hacking', 'Cybersecurity'),
  ('Penetration Testing', 'Cybersecurity'),
  ('Cryptography', 'Cybersecurity'),
  ('Web Security', 'Cybersecurity'),
  ('Digital Forensics', 'Cybersecurity'),

  -- Cloud & DevOps
  ('Git', 'Cloud & DevOps'),
  ('GitHub', 'Cloud & DevOps'),
  ('Docker', 'Cloud & DevOps'),
  ('AWS', 'Cloud & DevOps'),
  ('Azure', 'Cloud & DevOps'),
  ('CI/CD', 'Cloud & DevOps'),

  -- Design
  ('UI/UX Design', 'Design'),
  ('Figma', 'Design'),
  ('Graphic Design', 'Design'),

  -- Business & Management
  ('Project Management', 'Business & Management'),
  ('Product Management', 'Business & Management'),
  ('Digital Marketing', 'Business & Management'),
  ('Communication', 'Business & Management'),
  ('Leadership', 'Business & Management')
on conflict (name) do nothing;


