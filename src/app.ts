import Knex from 'knex';
import knexfile from './knexfile';
import CONFIG from './config';
import { S3 } from 'aws-sdk';
import { makeServer } from './server';

// Clients
const knex = Knex(knexfile);
const s3Config = {
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT || undefined,
  s3ForcePathStyle: !!process.env.S3_FORCE_PATH_STYLE,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || undefined,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || undefined,
};
const s3Client = new S3(s3Config);

// Server
const server = makeServer(knex, s3Client, CONFIG);

// Inicio el server
server.listen(CONFIG.port, () => {
  console.log(`Server running on http://localhost:${CONFIG.port}`);
});
