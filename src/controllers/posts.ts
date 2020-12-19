import { Request, Response } from 'express';
import Pool from 'mysql2/typings/mysql/lib/Pool';

const makeAddPost = (connection: Pool) => async (req: Request, res: Response) => {
  res.send('TODO: Implementar addPost');
};

const makeGetPosts = (connection: Pool) => async (req: Request, res: Response) => {
  res.send('TODO: Implementar getPosts');
};

export const makeController = (connection: Pool) => ({
  addPost: makeAddPost(connection),
  getPosts: makeGetPosts(connection),
});
