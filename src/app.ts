import mysql from 'mysql2';
import express from 'express';
import routes from './routes';

const PORT = process.env.PORT || 8001;
const app = express();

// SQL Pool connections
const connection = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'test',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
});

// Creo las rutas
const postRoutes = routes.makePostsRoutes(connection);
const likeRoutes = routes.makeLikeRoutes(connection);
app.use('/posts', postRoutes);
app.use('/likes', likeRoutes);

// Inicio el server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
