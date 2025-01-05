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
      const projectId = projectDoc.id;
      const rolesSnapshot = await getDocs(
        query(collection(db, ROLES_COLLECTION), 
        where('projectId', '==', projectId))
      );
      
      const roles = rolesSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as ProjectRole[];

      const projectData = projectDoc.data();
      delete projectData.id; // Remove any stored id field

      return {
        ...projectData,
        id: projectId,
        roles,
      } as Project;
    })
  );

  return projects;
}

export async function createProject(projectData: Omit<Project, 'id'>): Promise<Project> {
  // Create project document
  const projectRef = doc(collection(db, COLLECTION));
  const { roles, ...projectFields } = projectData;
  const project = {
    ...projectFields,
    approverEmail: projectData.approverEmail || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  await setDoc(projectRef, project);

  // Create project roles
  const projectRoles = (roles || []).map(role => ({
    projectId: projectRef.id,
    roleId: role.roleId,
    costRate: role.costRate,
    sellRate: role.sellRate,
  }));

  for (const role of projectRoles) {
    const roleRef = doc(collection(db, ROLES_COLLECTION));
    await setDoc(roleRef, role);
  }

  return {
    ...projectFields,
    id: projectRef.id,
    roles: projectRoles,
  } as Project;
}

export async function updateProject(projectData: Project): Promise<void> {
  const batch = writeBatch(db);
  
  const { id, roles, ...projectFields } = projectData;
  if (!id) throw new Error('Project ID is required for update');

  // Remove any stored id field from the document data
  delete projectFields.id;

  const projectRef = doc(db, COLLECTION, id);
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
  for (const role of (roles || [])) {
    const roleRef = doc(collection(db, ROLES_COLLECTION));
    batch.set(roleRef, {
      projectId: id,
      roleId: role.roleId,
      costRate: role.costRate,
      sellRate: role.sellRate,
    });
  }

  // Commit all changes in one transaction
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