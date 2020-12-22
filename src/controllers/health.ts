import Knex from 'knex';

const makeSeedStatusCheck = (connection: Knex) => {
  return async (req, res) => {
    // Verify that the seed is finished done (used by tests)
    const posts = await connection('post').select('*').limit(50);
    if (posts.length !== 50) throw new Error('Seed is not ready!');
    res.send(posts);
  };
};

export const makeController = (connection: Knex) => ({
  checkSeed: makeSeedStatusCheck(connection),
});
