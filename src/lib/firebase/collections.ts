import { collection } from 'firebase/firestore';
import { db } from './config';
import type { CollectionReference } from 'firebase/firestore';
import type { Member, Project, TimeEntry, Client } from '@/types';

// Collection references with type safety
export const membersCollection = collection(db, 'members') as CollectionReference<Member>;
export const projectsCollection = collection(db, 'projects') as CollectionReference<Project>;
export const timeEntriesCollection = collection(db, 'timeEntries') as CollectionReference<TimeEntry>;
export const clientsCollection = collection(db, 'clients') as CollectionReference<Client>;