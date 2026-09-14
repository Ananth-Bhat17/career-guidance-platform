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

-- Create careers table
create table if not exists public.careers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  created_at timestamptz not null default now()
);

-- Create career_skills table
create table if not exists public.career_skills (
  career_id uuid not null references public.careers(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  importance integer not null check (importance in (1, 2, 3)),
  created_at timestamptz not null default now(),
  primary key (career_id, skill_id)
);

-- Enable Row Level Security (RLS)
alter table public.careers enable row level security;
alter table public.career_skills enable row level security;

-- RLS Policies for careers
create policy "Authenticated users can view careers"
  on public.careers
  for select
  to authenticated
  using (true);

-- RLS Policies for career_skills
create policy "Authenticated users can view career_skills"
  on public.career_skills
  for select
  to authenticated
  using (true);

-- Grants for careers and career_skills
grant select on table public.careers to authenticated;
grant select on table public.career_skills to authenticated;

-- Seed careers dataset
insert into public.careers (name, description) values
  ('Software Developer', 'Design, build, and maintain software applications, databases, and systems.'),
  ('Data Analyst', 'Interpret complex data sets to provide actionable insights and support business decision-making.'),
  ('UI/UX Designer', 'Create intuitive, user-centered digital interfaces and visual experiences for web and mobile products.'),
  ('Digital Marketer', 'Develop, execute, and optimize online marketing campaigns to drive brand engagement and growth.'),
  ('Cybersecurity Analyst', 'Protect systems, networks, and data from cyber threats, vulnerabilities, and unauthorized access.'),
  ('Product Manager', 'Guide product vision, strategy, roadmap, and cross-functional team execution from concept to delivery.')
on conflict (name) do nothing;

-- Seed career_skills mapping dataset
with mappings (career_name, skill_name, importance) as (
  values
    -- Software Developer
    ('Software Developer', 'JavaScript', 3),
    ('Software Developer', 'TypeScript', 2),
    ('Software Developer', 'Python', 3),
    ('Software Developer', 'Java', 3),
    ('Software Developer', 'C++', 2),
    ('Software Developer', 'C', 1),
    ('Software Developer', 'HTML', 2),
    ('Software Developer', 'CSS', 2),
    ('Software Developer', 'React', 3),
    ('Software Developer', 'Next.js', 2),
    ('Software Developer', 'Node.js', 3),
    ('Software Developer', 'SQL', 3),
    ('Software Developer', 'Git', 3),
    ('Software Developer', 'GitHub', 2),
    ('Software Developer', 'Docker', 2),

    -- Data Analyst
    ('Data Analyst', 'Data Analysis', 3),
    ('Data Analyst', 'SQL', 3),
    ('Data Analyst', 'Python', 3),
    ('Data Analyst', 'Pandas', 3),
    ('Data Analyst', 'NumPy', 2),
    ('Data Analyst', 'PostgreSQL', 2),
    ('Data Analyst', 'MySQL', 2),
    ('Data Analyst', 'Machine Learning', 2),
    ('Data Analyst', 'Git', 1),
    ('Data Analyst', 'GitHub', 1),

    -- UI/UX Designer
    ('UI/UX Designer', 'UI/UX Design', 3),
    ('UI/UX Designer', 'Figma', 3),
    ('UI/UX Designer', 'Graphic Design', 2),
    ('UI/UX Designer', 'Communication', 2),
    ('UI/UX Designer', 'HTML', 1),
    ('UI/UX Designer', 'CSS', 1),

    -- Digital Marketer
    ('Digital Marketer', 'Digital Marketing', 3),
    ('Digital Marketer', 'Communication', 3),
    ('Digital Marketer', 'Graphic Design', 2),
    ('Digital Marketer', 'Project Management', 2),
    ('Digital Marketer', 'Leadership', 1),

    -- Cybersecurity Analyst
    ('Cybersecurity Analyst', 'Linux', 3),
    ('Cybersecurity Analyst', 'Networking', 3),
    ('Cybersecurity Analyst', 'Web Security', 3),
    ('Cybersecurity Analyst', 'Ethical Hacking', 3),
    ('Cybersecurity Analyst', 'Penetration Testing', 2),
    ('Cybersecurity Analyst', 'Cryptography', 2),
    ('Cybersecurity Analyst', 'Digital Forensics', 2),
    ('Cybersecurity Analyst', 'Git', 1),
    ('Cybersecurity Analyst', 'GitHub', 1),

    -- Product Manager
    ('Product Manager', 'Product Management', 3),
    ('Product Manager', 'Project Management', 3),
    ('Product Manager', 'Communication', 3),
    ('Product Manager', 'Leadership', 2),
    ('Product Manager', 'Data Analysis', 2),
    ('Product Manager', 'SQL', 2),
    ('Product Manager', 'Digital Marketing', 1)
)
insert into public.career_skills (career_id, skill_id, importance)
select c.id, s.id, m.importance
from mappings m
join public.careers c on c.name = m.career_name
join public.skills s on s.name = m.skill_name
on conflict (career_id, skill_id) do update set importance = excluded.importance;


