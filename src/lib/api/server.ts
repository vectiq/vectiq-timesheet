import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware';
import membersRouter from './routes/members';
import projectsRouter from './routes/projects';
import timeEntriesRouter from './routes/timeEntries';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/members', membersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/time-entries', timeEntriesRouter);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});