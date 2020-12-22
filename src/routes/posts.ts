import express, { Router } from 'express';
const router = express.Router();
import { makePostsController } from '../controllers';
import Knex from 'knex';
import { S3 } from 'aws-sdk';
import { WebAppConfig } from '../config';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

// This allows me to get the body before using multer ...ohterwise
// I get an [Object: null prototype]
// see: https://github.com/expressjs/multer/issues/952
const workaroundMulterBody = (req, res, next) => {
  req.workaroundMulterBody = {
    description: req.body.description,
  };
  next();
};

export const makeRoutes = (connection: Knex, s3Client: S3, config: WebAppConfig): Router => {
  const postsController = makePostsController(connection, s3Client, config);
  router.get('/', postsController.getPosts);
  router.post('/', workaroundMulterBody, upload.single('photo'), postsController.addPost);
  router.post('/like', postsController.like);
  return router;
};
