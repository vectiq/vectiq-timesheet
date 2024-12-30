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
const ROLES_COLLECTION = 'projectRoles';

export async function getProjects(): Promise<Project[]> {
  const projectsSnapshot = await getDocs(collection(db, COLLECTION));
  const projects = await Promise.all(
    projectsSnapshot.docs.map(async (projectDoc) => {
      // Get project roles for this project
      const rolesSnapshot = await getDocs(
        query(collection(db, ROLES_COLLECTION), 
        where('projectId', '==', projectDoc.id))
      );
      
      const roles = rolesSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as ProjectRole[];

      return {
        id: projectDoc.id,
        ...projectDoc.data(),
        roles,
      } as Project;
    })
  );

  return projects;
}

export async function createProject(projectData: Omit<Project, 'id'>): Promise<Project> {
  const batch = writeBatch(db);
  
  // Create project document
  const projectRef = doc(collection(db, COLLECTION));
  const { roles, ...projectFields } = projectData;
  const project = {
    id: projectRef.id,
    ...projectFields,
    approverEmail: projectData.approverEmail || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  batch.set(projectRef, project);

  // Create project roles
  const projectRoles = (roles || []).map(role => ({
    projectId: projectRef.id,
    roleId: role.roleId,
    costRate: role.costRate,
    sellRate: role.sellRate,
  }));

  for (const role of projectRoles) {
    const roleRef = doc(collection(db, ROLES_COLLECTION));
    batch.set(roleRef, role);
  }

  await batch.commit();

  return {
    ...project,
    roles: projectRoles,
  } as Project;
}

export async function updateProject(id: string, projectData: Partial<Project>): Promise<void> {
  const batch = writeBatch(db);
  
  // Update project document
  const projectRef = doc(db, COLLECTION, id);
  const { roles = [], ...projectFields } = projectData;
  const projectUpdate = {
    ...projectFields,
    updatedAt: serverTimestamp(),
  };
  
  batch.update(projectRef, projectUpdate);

  // Delete existing project roles
  const existingRolesSnapshot = await getDocs(
    query(collection(db, ROLES_COLLECTION), where('projectId', '==', id))
  );
  existingRolesSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Create new project roles
  for (const role of roles) {
    const roleRef = doc(collection(db, ROLES_COLLECTION));
    batch.set(roleRef, {
      projectId: id,
      roleId: role.roleId,
      costRate: role.costRate || 0,
      sellRate: role.sellRate || 0,
    });
  }

  await batch.commit();
}

export async function deleteProject(id: string): Promise<void> {
  const batch = writeBatch(db);
  
  // Delete project document
  const projectRef = doc(db, COLLECTION, id);
  batch.delete(projectRef);

  // Delete associated project roles
  const rolesSnapshot = await getDocs(
    query(collection(db, ROLES_COLLECTION), where('projectId', '==', id))
  );
  rolesSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}