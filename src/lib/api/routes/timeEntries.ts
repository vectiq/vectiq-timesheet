import express from 'express';
import { getTimeEntriesByUserId, createTimeEntry } from '@/lib/db/models/timeEntry';
import { timeEntrySchema } from '@/lib/schemas/timeEntry';

const router = express.Router();

router.get('/', async (req, res) => {
  // TODO: Get user ID from auth context
  const userId = req.query.userId as string;
  
  if (!userId) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'userId is required',
    });
  }

  const entries = await getTimeEntriesByUserId(userId);
  res.json(entries);
});

router.post('/', async (req, res) => {
  const validation = timeEntrySchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({
      error: 'Validation Error',
      details: validation.error.errors,
    });
  }

  // TODO: Get user ID from auth context
  const userId = req.body.userId;
  
  const entry = await createTimeEntry({
    ...validation.data,
    userId,
    status: 'draft',
  });

  res.status(201).json(entry);
});

export default router;