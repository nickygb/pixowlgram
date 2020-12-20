import express from 'express';
import bodyParser from 'body-parser';
import * as OpenApiValidator from 'express-openapi-validator';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import Knex from 'knex';
import knexfile from './knexfile';
import path from 'path';

const PORT = process.env.PORT || 5000;
const app = express();

// SQL Pool connections
const knex = Knex(knexfile);

// Middlewares
app.use(bodyParser.json());
app.use(
  OpenApiValidator.middleware({
    apiSpec: path.join(__dirname, 'api-spec.yaml'),
    validateRequests: true,
    validateResponses: false,
  })
);

// Creo las rutas
const postRoutes = routes.makePostsRoutes(knex);
const likeRoutes = routes.makeLikeRoutes(knex);
app.use('/posts', postRoutes);
app.use('/likes', likeRoutes);
app.use(errorHandler);

// Inicio el server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
