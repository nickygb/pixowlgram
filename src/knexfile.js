// Update with your config settings.
module.exports = {
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'pixowlgramdb',
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'secret',
    port: parseInt(process.env.DB_PORT) || 3306,
    afterCreate: function (conn, cb) {
      conn.query('SET timezone="UTC";', function (err) {
        cb(err, conn);
      });
    },
  },
  pool: {
    min: 1,
    max: 20,
  },
  migrations: {
    directory: '../db/migrations',
  },
  seeds: {
    directory: '../db/seeds',
  },
};
