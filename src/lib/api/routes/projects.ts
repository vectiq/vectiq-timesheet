import express from 'express';
import { getAllProjects, createProject } from '@/lib/db/models/project';
import { projectSchema } from '@/lib/schemas/project';

const router = express.Router();

router.get('/', async (req, res) => {
  const projects = await getAllProjects();
  res.json(projects);
});

router.post('/', async (req, res) => {
  const validation = projectSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({
      error: 'Validation Error',
      details: validation.error.errors,
    });
  }

  const project = await createProject(validation.data);
  res.status(201).json(project);
});

export default router;