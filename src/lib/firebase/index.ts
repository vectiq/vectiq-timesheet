import { app, auth, db } from './config';
import * as authService from './services/auth';
import * as userService from './services/user';
import * as collections from './collections';

export {
  app,
  auth,
  db,
  authService,
  userService,
  collections
};