import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// API Routes
app.get('/api/members', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('members').get();
    const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add other API routes here...

export const api = functions.https.onRequest(app);