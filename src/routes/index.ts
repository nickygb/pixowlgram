import { makeRoutes as makePostsRoutes } from './posts';
import { makeRoutes as makeHealthRoutes } from './health';

const routes = { makePostsRoutes, makeHealthRoutes };

export default routes;
