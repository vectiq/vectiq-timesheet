import { collection, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from './config';

// Collection references
export const membersCollection = collection(db, 'members');
export const clientsCollection = collection(db, 'clients');
export const projectsCollection = collection(db, 'projects');
export const timeEntriesCollection = collection(db, 'timeEntries');

// Helper function to get project roles subcollection
export const getProjectRolesCollection = (projectId: string) => {
  return collection(db, 'projects', projectId, 'roles');
};

// Common queries
export const getTimeEntriesByUser = (userId: string) => {
  return query(
    timeEntriesCollection,
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
};

export const getActiveProjects = () => {
  return query(
    projectsCollection,
    where('status', '==', 'active'),
    orderBy('startDate', 'desc')
  );
};