import express, { Router } from 'express';
const router = express.Router();
import { makeHealthController } from '../controllers';
import Knex from 'knex';

export const makeRoutes = (connection: Knex): Router => {
  const controller = makeHealthController(connection);
  router.get('/seed', controller.checkSeed);
  return router;
};
