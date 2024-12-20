import { useState } from 'react';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const dummyData = {
  roles: [
    { id: 'role_1', name: 'Senior Developer', isActive: true },
    { id: 'role_2', name: 'Project Manager', isActive: true },
    { id: 'role_3', name: 'UI/UX Designer', isActive: true },
    { id: 'role_4', name: 'Business Analyst', isActive: true },
    { id: 'role_5', name: 'QA Engineer', isActive: false },
  ],
  clients: [
    {
      id: 'client_1',
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      approverEmail: 'approver@acme.com',
    },
    {
      id: 'client_2',
      name: 'Globex Industries',
      email: 'contact@globex.com',
      approverEmail: 'approver@globex.com',
    },
    {
      id: 'client_3',
      name: 'Initech Solutions',
      email: 'contact@initech.com',
      approverEmail: 'approver@initech.com',
    },
  ],
  projects: [
    {
      id: 'proj_1',
      name: 'Website Redesign',
      clientId: 'client_1',
      budget: 50000,
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      requiresApproval: true,
    },
    {
      id: 'proj_2',
      name: 'Mobile App Development',
      clientId: 'client_2',
      budget: 75000,
      startDate: '2024-02-01',
      endDate: '2024-08-31',
      requiresApproval: false,
    },
    {
      id: 'proj_3',
      name: 'Digital Transformation',
      clientId: 'client_3',
      budget: 120000,
      startDate: '2024-03-01',
      endDate: '2024-12-31',
      requiresApproval: true,
    },
  ],
  projectRoles: [
    { projectId: 'proj_1', roleId: 'role_1', costRate: 75, sellRate: 150 },
    { projectId: 'proj_1', roleId: 'role_2', costRate: 85, sellRate: 170 },
    { projectId: 'proj_2', roleId: 'role_1', costRate: 80, sellRate: 160 },
    { projectId: 'proj_2', roleId: 'role_3', costRate: 70, sellRate: 140 },
    { projectId: 'proj_3', roleId: 'role_2', costRate: 85, sellRate: 170 },
    { projectId: 'proj_3', roleId: 'role_4', costRate: 90, sellRate: 180 },
  ],
  users: [
    {
      id: 'user_1',
      email: 'john@example.com',
      name: 'John Doe',
      role: 'admin',
      isActive: true,
    },
    {
      id: 'user_2',
      email: 'jane@example.com',
      name: 'Jane Smith',
      role: 'user',
      isActive: true,
    },
    {
      id: 'user_3',
      email: 'bob@example.com',
      name: 'Bob Wilson',
      role: 'user',
      isActive: true,
    },
  ],
  projectAssignments: [
    { id: 'asgmt_1', userId: 'user_1', projectId: 'proj_1', roleId: 'role_1' },
    { id: 'asgmt_2', userId: 'user_2', projectId: 'proj_1', roleId: 'role_2' },
    { id: 'asgmt_3', userId: 'user_1', projectId: 'proj_2', roleId: 'role_1' },
    { id: 'asgmt_4', userId: 'user_3', projectId: 'proj_3', roleId: 'role_4' },
  ],
};

export default function TestData() {
  const [status, setStatus] = useState<string>('');
  const [isWorking, setIsWorking] = useState(false);

  const generateData = async () => {
    setIsWorking(true);
    setStatus('Generating data...');

    try {
      // Generate roles
      setStatus('Creating roles...');
      for (const role of dummyData.roles) {
        await setDoc(doc(db, 'roles', role.id), role);
      }

      // Generate clients
      setStatus('Creating clients...');
      for (const client of dummyData.clients) {
        await setDoc(doc(db, 'clients', client.id), client);
      }

      // Generate projects
      setStatus('Creating projects...');
      for (const project of dummyData.projects) {
        await setDoc(doc(db, 'projects', project.id), project);
      }

      // Generate project roles
      setStatus('Creating project roles...');
      for (const projectRole of dummyData.projectRoles) {
        const id = `${projectRole.projectId}_${projectRole.roleId}`;
        await setDoc(doc(db, 'projectRoles', id), projectRole);
      }

      // Generate users
    //   setStatus('Creating users...');
    //   for (const user of dummyData.users) {
    //     await setDoc(doc(db, 'users', user.id), user);
    //   }

      // Generate project assignments
      setStatus('Creating project assignments...');
      for (const assignment of dummyData.projectAssignments) {
        await setDoc(doc(db, 'projectAssignments', assignment.id), assignment);
      }

      setStatus('Data generation complete!');
    } catch (error) {
      console.error('Error generating data:', error);
      setStatus('Error generating data. Check console for details.');
    } finally {
      setIsWorking(false);
    }
  };

  const clearData = async () => {
    setIsWorking(true);
    setStatus('Clearing data...');

    try {
      const collections = [
        'roles',
        'clients',
        'projects',
        'projectRoles',
        'projectAssignments',
      ];

      for (const collectionName of collections) {
        setStatus(`Clearing ${collectionName}...`);
        const snapshot = await getDocs(collection(db, collectionName));
        for (const doc of snapshot.docs) {
          await deleteDoc(doc.ref);
        }
      }

      setStatus('All data cleared!');
    } catch (error) {
      console.error('Error clearing data:', error);
      setStatus('Error clearing data. Check console for details.');
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Test Data Generator</h1>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={generateData} disabled={isWorking}>
              Generate Test Data
            </Button>
            <Button onClick={clearData} disabled={isWorking} variant="secondary">
              Clear All Data
            </Button>
          </div>

          {status && (
            <div className="text-sm text-gray-600">
              Status: {status}
            </div>
          )}
        </div>

        <div className="prose prose-sm">
          <h3>This will generate:</h3>
          <ul>
            <li>{dummyData.roles.length} Roles</li>
            <li>{dummyData.clients.length} Clients</li>
            <li>{dummyData.projects.length} Projects</li>
            <li>{dummyData.projectRoles.length} Project Roles</li>
            {/* <li>{dummyData.users.length} Users</li> */}
            <li>{dummyData.projectAssignments.length} Project Assignments</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}