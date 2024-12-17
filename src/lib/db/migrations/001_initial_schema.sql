-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'consultant')),
  status TEXT NOT NULL CHECK (status IN ('active', 'pending')),
  joined_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  approver_email TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  client_id TEXT NOT NULL REFERENCES clients(id),
  budget DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Create project_roles table
CREATE TABLE IF NOT EXISTS project_roles (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  name TEXT NOT NULL,
  cost_rate DECIMAL(10, 2) NOT NULL,
  sell_rate DECIMAL(10, 2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES members(id),
  project_id TEXT NOT NULL REFERENCES projects(id),
  project_role_id TEXT NOT NULL REFERENCES project_roles(id),
  date DATE NOT NULL,
  hours DECIMAL(4, 2) NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  submitted_at DATETIME,
  approved_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (project_role_id) REFERENCES project_roles(id) ON DELETE CASCADE
);