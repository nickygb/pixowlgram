import sqlFixtures from 'sql-fixtures';
import faker from 'faker';
import knexfile from '../../src/knexfile';
import Knex from 'knex';

const NUM_POSTS = 50;

const knex = Knex(knexfile);
const getFakePost = () => ({
  description: faker.lorem.text(),
  likes: faker.random.number({ min: 1, max: 10 }),
});
const getFakePhoto = (postId) => ({
  url: faker.image.imageUrl().split(':').join('::'), // https://github.com/city41/node-sql-fixtures/issues/39
  post_id: postId,
});
const getFakeLike = (postId) => ({
  user_id: faker.random.number({ min: 1, max: 1000000 }),
  post_id: postId,
});
const range = (n) => (n === 1 ? [0] : Array(...Array(n).keys()));

const cleanUp = async (knex: Knex) => {
  await knex('like').del();
  await knex('photo').del();
  await knex('post').del();
};

const runSeed = async (numPosts) => {
  await cleanUp(knex);

  const posts = range(numPosts).map(getFakePost);
  const photos = posts.map((post, idx) => {
    return getFakePhoto(`post:${idx}`);
  });
  const likes = posts
    .map((post, idx) => {
      const numLikes = post.likes;
      return range(numLikes).map(() => getFakeLike(`post:${idx}`));
    })
    .flatMap((like) => like);

  const dataSpec = {
    post: posts,
    photo: photos,
    like: likes,
  };
  await sqlFixtures.create(knexfile, dataSpec);
  console.log('seed finish successfuly :)');
  process.exit(0);
};
runSeed(NUM_POSTS);
