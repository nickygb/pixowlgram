import { makeRoutes as makePostsRoutes } from './posts';
import { makeRoutes as makeLikeRoutes } from './likes';

const routes = { makePostsRoutes, makeLikeRoutes };

export default routes;
