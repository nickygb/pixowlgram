import express, { Router } from 'express';
import Pool from 'mysql2/typings/mysql/lib/Pool';
const router = express.Router();
import { makePostsController } from '../controllers';

export const makeRoutes = (connection: Pool): Router => {
  const postsController = makePostsController(connection);
  router.get('/', postsController.getPosts);
  router.post('/', postsController.addPost);
  return router;
};
