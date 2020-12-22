import { S3 } from 'aws-sdk';
import { Request, Response } from 'express';
import Knex from 'knex';
import { Post } from '../models/post';
import { makeUploadService } from '../services/storage';
import { WebAppConfig } from '../config';

const makeAddPost = (connection: Knex, s3Client: S3, config: WebAppConfig) => {
  const postModel = new Post(connection);
  const bucket = config.resources.bucketPhotos;
  const folder = config.resources.folderPhotos;
  const uploadPhotoService = makeUploadService(s3Client, bucket, folder);

  return async (req, res) => {
    // 1) Upload photo to S3 bucket
    const photoUrl = await uploadPhotoService(req.files[0].buffer);

    // 2) Add post to db
    const post = await postModel.add({
      // Get an eye in this issue with router + multer to use body instead pf req.workaroundMulterBody
      description: req.workaroundMulterBody.description,
      photoUrl,
      userId: req.currentUser.id,
    });
    res.send(post);
  };
};

const makeGetPosts = (connection: Knex) => {
  const postModel = new Post(connection);
  return async (req: Request, res: Response) => {
    const nextCursor = req.query.nextCursor as string;
    const limit = parseInt(req.query.limit as string);
    const postsObj = await postModel.getAll(nextCursor, limit);
    res.send(postsObj);
  };
};

const makeLikePost = (connection: Knex) => {
  const postModel = new Post(connection);
  return async (req: Request, res: Response) => {
    const userId = req.currentUser.id;
    const postId = req.body.post_id;
    const post = await postModel.like(userId, postId);
    res.send(post);
  };
};

export const makeController = (connection: Knex, s3Client: S3, config: WebAppConfig) => ({
  addPost: makeAddPost(connection, s3Client, config),
  getPosts: makeGetPosts(connection),
  like: makeLikePost(connection),
});
