-- Seed Members
INSERT INTO members (id, name, email, role, status, joined_at) VALUES
('usr_1', 'John Doe', 'john@example.com', 'admin', 'active', '2024-01-15T00:00:00Z'),
('usr_2', 'Jane Smith', 'jane@example.com', 'consultant', 'active', '2024-02-01T00:00:00Z'),
('usr_3', 'pending@example.com', 'pending@example.com', 'consultant', 'pending', NULL);

-- Seed Clients
INSERT INTO clients (id, name, email, approver_email) VALUES
('client_1', 'Acme Corp', 'contact@acme.com', 'approver@acme.com'),
('client_2', 'Globex Corporation', 'contact@globex.com', 'approver@globex.com');

-- Seed Projects
INSERT INTO projects (id, name, client_id, budget, start_date, end_date, requires_approval) VALUES
('proj_1', 'Website Redesign', 'client_1', 50000.00, '2024-01-01', '2024-06-30', true),
('proj_2', 'Mobile App Development', 'client_2', 75000.00, '2024-02-01', '2024-08-31', false);

-- Seed Project Roles
INSERT INTO project_roles (id, project_id, name, cost_rate, sell_rate) VALUES
('role_1', 'proj_1', 'Senior Developer', 75.00, 150.00),
('role_2', 'proj_1', 'Project Manager', 85.00, 170.00),
('role_3', 'proj_2', 'Lead Developer', 80.00, 160.00),
('role_4', 'proj_2', 'UI/UX Designer', 70.00, 140.00);

-- Seed Time Entries
INSERT INTO time_entries (id, user_id, project_id, project_role_id, date, hours, description, status, submitted_at) VALUES
('entry_1', 'usr_1', 'proj_1', 'role_1', '2024-03-18', 8.00, 'Frontend development', 'pending', '2024-03-18T17:00:00Z'),
('entry_2', 'usr_1', 'proj_2', 'role_3', '2024-03-19', 6.50, 'API integration', 'approved', '2024-03-19T15:30:00Z');