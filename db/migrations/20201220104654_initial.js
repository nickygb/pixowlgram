exports.up = async function (knex) {
  await knex.schema.createTable('post', (table) => {
    table.increments('id').unsigned().primary();
    table.text('description').notNullable();
    table.integer('likes').unsigned().notNullable().defaultTo(0);
    table.integer('user_id').unsigned(); // This one cames from external database. I assume that is an integer unsinged
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.index('created_at'); // Add index to improve queries by date
  });

  await knex.schema.createTable('photo', (table) => {
    table.increments('id').unsigned().primary();
    table.string('url').notNullable();
    table.integer('post_id').unsigned();
    table.foreign('post_id').references('post.id');
  });

  await knex.schema.createTable('like', (table) => {
    table.increments('id').unsigned().primary();
    table.integer('user_id').unsigned(); // This one cames from an external database. I assume that is an integer unsigned
    table.integer('post_id').unsigned();
    table.foreign('post_id').references('post.id');
    table.unique(['user_id', 'post_id']); // Avoid duplication of likes per user
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable('like');
  await knex.schema.dropTable('photo');
  await knex.schema.dropTable('post');
};
