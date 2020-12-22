// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// Update with your config settings.
module.exports = {
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'pixowlgramdb',
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'secret',
    port: parseInt(process.env.DB_PORT) || 3306,
  },
  pool: {
    min: 1,
    max: 20,
  },
  migrations: {
    directory: path.join(__dirname, '..', 'db', 'migrations'),
  },
  seeds: {
    directory: path.join(__dirname, '..', 'db', 'seeds'),
  },
};
