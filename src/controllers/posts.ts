import { Request, Response } from 'express';
import Knex from 'knex';

const makeAddPost = (connection: Knex) => async (req: Request, res: Response) => {
  const newPost = req.body;
  res.send({
    ...newPost,
    id: 1,
  });
};

const makeGetPosts = (connection: Knex) => async (req: Request, res: Response) => {
  res.send('TODO: Implementar getPosts');
};

export const makeController = (connection: Knex) => ({
  addPost: makeAddPost(connection),
  getPosts: makeGetPosts(connection),
});
