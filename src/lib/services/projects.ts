import { 
  collection,
  doc,
  getDocs,
  getDoc,
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

export async function getProjects(): Promise<Project[]> {
  const projectsSnapshot = await getDocs(collection(db, 'projects'));
  const projects = await Promise.all(
    projectsSnapshot.docs.map(async (projectDoc) => {
      // Get project roles for this project
      const rolesSnapshot = await getDocs(
        query(collection(db, 'projectRoles'), 
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
  const projectRef = doc(collection(db, 'projects'));
  const project: Omit<Project, 'roles'> = {
    id: projectRef.id,
    name: projectData.name,
    clientId: projectData.clientId,
    budget: projectData.budget,
    startDate: projectData.startDate,
    endDate: projectData.endDate,
    requiresApproval: projectData.requiresApproval,
    createdAt: serverTimestamp(),
  };
  
  batch.set(projectRef, project);

  // Create project roles
  const roles = projectData.roles || [];
  const projectRoles = roles.map(role => ({
    projectId: projectRef.id,
    roleId: role.roleId,
    costRate: role.costRate,
    sellRate: role.sellRate,
  }));

  for (const role of projectRoles) {
    const roleRef = doc(collection(db, 'projectRoles'));
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
  const projectRef = doc(db, 'projects', id);
  const { roles, ...projectUpdate } = projectData;
  
  batch.update(projectRef, {
    ...projectUpdate,
    updatedAt: serverTimestamp(),
  });

  if (roles) {
    // Delete existing project roles
    const existingRolesSnapshot = await getDocs(
      query(collection(db, 'projectRoles'), where('projectId', '==', id))
    );
    existingRolesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Create new project roles
    for (const role of roles) {
      const roleRef = doc(collection(db, 'projectRoles'));
      batch.set(roleRef, {
        projectId: id,
        roleId: role.roleId,
        costRate: role.costRate,
        sellRate: role.sellRate,
      });
    }
  }

  await batch.commit();
}

export async function deleteProject(id: string): Promise<void> {
  const batch = writeBatch(db);
  
  // Delete project document
  const projectRef = doc(db, 'projects', id);
  batch.delete(projectRef);

  // Delete associated project roles
  const rolesSnapshot = await getDocs(
    query(collection(db, 'projectRoles'), where('projectId', '==', id))
  );
  rolesSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Delete associated project assignments
  const assignmentsSnapshot = await getDocs(
    query(collection(db, 'projectAssignments'), where('projectId', '==', id))
  );
  assignmentsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}