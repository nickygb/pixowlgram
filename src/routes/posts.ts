import express, { Router } from 'express';
const router = express.Router();
import { makePostsController } from '../controllers';
import Knex from 'knex';

export const makeRoutes = (connection: Knex): Router => {
  const postsController = makePostsController(connection);
  router.get('/', postsController.getPosts);
  router.post('/', postsController.addPost);
  return router;
};
