import express, { Router } from 'express';
import Knex from 'knex';
import { makeLikesController } from '../controllers';
const router = express.Router();

export const makeRoutes = (connection: Knex): Router => {
  const likeController = makeLikesController(connection);
  router.post('/', likeController.addLike);
  return router;
};
