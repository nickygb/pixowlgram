import Knex from 'knex';
import knexfile from './knexfile';
import CONFIG from './config';
import { S3 } from 'aws-sdk';
import { makeServer } from './server';

// Clients
const knex = Knex(knexfile);
const s3Client = new S3({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.IS_OFFLINE ? 'http://localhost:4566' : undefined,
  s3ForcePathStyle: process.env.IS_OFFLINE ? true : undefined,
  accessKeyId: process.env.IS_OFFLINE ? 'S3RVER' : undefined,
  secretAccessKey: process.env.IS_OFFLINE ? 'S3RVER' : undefined,
});

// Server
const server = makeServer(knex, s3Client, CONFIG);

// Inicio el server
server.listen(CONFIG.port, () => {
  console.log(`Server running on http://localhost:${CONFIG.port}`);
});
