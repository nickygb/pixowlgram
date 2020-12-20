import { Request, Response } from 'express';
import Knex from 'knex';

const makeAddLike = (connection: Knex) => async (req: Request, res: Response) => {
  res.send('TODO: Implementar addLike');
};

export const makeController = (connection: Knex) => ({
  addLike: makeAddLike(connection),
});
