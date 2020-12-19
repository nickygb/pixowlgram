import { Request, Response } from 'express';
import Pool from 'mysql2/typings/mysql/lib/Pool';

const makeAddLike = (connection: Pool) => async (req: Request, res: Response) => {
  res.send('TODO: Implementar addLike');
};

export const makeController = (connection: Pool) => ({
  addLike: makeAddLike(connection),
});
