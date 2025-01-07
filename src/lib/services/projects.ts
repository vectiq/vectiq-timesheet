import { 
  collection,
  doc,
  getDocs, 
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Project, ProjectRole } from '@/types';

const COLLECTION = 'projects';

export async function getProjects(): Promise<Project[]> {
  const projectsSnapshot = await getDocs(collection(db, COLLECTION));
  const projects = projectsSnapshot.docs.map((projectDoc) => {
      const projectData = projectDoc.data();
      return {
        ...projectData,
        id: projectDoc.id,
        roles: projectData.roles || [],
      } as Project;
    });

  return projects;
}

export async function createProject(projectData: Omit<Project, 'id'>): Promise<Project> {
  // Create project document
  const projectRef = doc(collection(db, COLLECTION));
  const { roles, ...projectFields } = projectData;
  const project = {
    ...projectFields,
    roles: (roles || []).map(role => ({
      ...role,
      id: crypto.randomUUID(),
      projectId: projectRef.id
    })),
    approverEmail: projectData.approverEmail || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  await setDoc(projectRef, project);

  return {
    ...projectFields,
    id: projectRef.id,
    roles: project.roles,
  } as Project;
}

export async function updateProject(projectData: Project): Promise<void> {
  const { id, roles, ...projectFields } = projectData;
  if (!id) throw new Error('Project ID is required for update');

  const projectRef = doc(db, COLLECTION, id);
  const projectUpdate = {
    ...projectFields, 
    roles: roles.map(role => ({
      ...role,
      projectId: id
    })),
    updatedAt: serverTimestamp(),
  };
  
  await updateDoc(projectRef, projectUpdate);
}

export async function deleteProject(id: string): Promise<void> {
  const projectRef = doc(db, COLLECTION, id);
  await deleteDoc(projectRef);
}