import express from 'express';
import { getAllMembers, createMember } from '@/lib/db/models/member';
import { inviteMemberSchema } from '@/lib/schemas/member';

const router = express.Router();

router.get('/', async (req, res) => {
  const members = await getAllMembers();
  res.json(members);
});

router.post('/invite', async (req, res) => {
  const validation = inviteMemberSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({
      error: 'Validation Error',
      details: validation.error.errors,
    });
  }

  const member = await createMember({
    ...validation.data,
    status: 'pending',
  });

  res.status(201).json(member);
});

export default router;