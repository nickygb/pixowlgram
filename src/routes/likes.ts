import express, { Router } from 'express';
import Pool from 'mysql2/typings/mysql/lib/Pool';
const router = express.Router();
import { makeLikesController } from '../controllers';

export const makeRoutes = (connection: Pool): Router => {
  const likeController = makeLikesController(connection);
  router.post('/', likeController.addLike);
  return router;
};
