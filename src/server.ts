import express, { Express } from 'express';
import bodyParser from 'body-parser';
import * as OpenApiValidator from 'express-openapi-validator';
import path from 'path';
import Knex from 'knex';
import { S3 } from 'aws-sdk';
import { WebAppConfig } from './config';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { authMiddleware } from './middlewares/authMiddleware';
require('express-async-errors');

export const makeServer = (knex: Knex, s3Client: S3, CONFIG: WebAppConfig): Express => {
  const app = express();

  const healthRoutes = routes.makeHealthRoutes(knex);
  app.use('/health', healthRoutes);

  // Middlewares
  app.use(bodyParser.json());
  app.use(
    OpenApiValidator.middleware({
      apiSpec: path.join(__dirname, 'api-spec.yaml'),
      validateRequests: true,
      validateResponses: false,
    })
  );
  app.use(authMiddleware);

  // Creo las rutas
  const postRoutes = routes.makePostsRoutes(knex, s3Client, CONFIG);
  app.use('/posts', postRoutes);
  app.use(errorHandler);

  return app;
};
