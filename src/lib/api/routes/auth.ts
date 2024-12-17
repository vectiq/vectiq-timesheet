import express from 'express';
import { query } from '@/lib/db/client';

const router = express.Router();

// Check if email exists in pending invitations
async function checkInvitation(email: string) {
  const rows = await query(`
    SELECT id, email, role, status
    FROM members
    WHERE email = ? AND status = 'pending'
  `, [email]);
  
  return rows.length > 0 ? rows[0] : null;
}

// Update member status after successful authentication
async function activateMember(id: string, profile: any) {
  await query(`
    UPDATE members
    SET status = 'active',
        name = ?,
        joined_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [profile.name, id]);
}

router.get('/session', (req, res) => {
  if (req.session?.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

router.post('/callback/:provider', async (req, res) => {
  const { email, name } = req.body;
  const invitation = await checkInvitation(email);

  if (!invitation) {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'You need an invitation to access this application',
    });
  }

  await activateMember(invitation.id, { name });
  
  req.session.user = {
    id: invitation.id,
    email,
    name,
    role: invitation.role,
  };

  res.json({ success: true });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

export default router;