import chai from 'chai';
import chaiDateTime from 'chai-datetime';
const expect = chai.expect;
chai.use(chaiDateTime);
import Knex from 'knex';
import { Post } from '../../src/models/post';
import knexfile from '../../src/knexfile';
import faker from 'faker';

const knexConfig = { ...knexfile };
knexConfig.connection.filename = './mydb.sqlite';
knexConfig.migrations.directory = 'db/migrations';
delete knexConfig.seeds;
const knex = Knex(knexConfig);

const parseUtcStringDate = (stringDate: string) => {
  const date = new Date(stringDate);
  const offset = date.getTimezoneOffset() / 60;
  return new Date(date.setHours(date.getHours() - offset));
};

const addHours = (date: Date) => (hours) => {
  const d = new Date(date);
  return new Date(d.setTime(d.getTime() + hours * 60 * 60 * 1000));
};

const model = new Post(knex);
describe('Post model', function () {
  before(async function () {
    this.timeout(100000);
    await knex.migrate.latest();
  });
  beforeEach(async function () {
    await knex('like').del();
    await knex('photo').del();
    await knex('post').del();
  });

  describe('--> add', function () {
    it('--> Should add new post to database with 0 likes and created_at UTC now', async () => {
      const newPost = {
        description: faker.lorem.text(),
        photoUrl: faker.image.imageUrl(),
        userId: faker.random.number(),
      };
      const post = await model.add(newPost);
      const nowDate = new Date(new Date().toUTCString());
      const createdAtDate = parseUtcStringDate(post.created_at);

      expect(post.description).to.be.equal(newPost.description);
      expect(post.id).to.be.a('number');
      expect(post.likes).to.be.equal(0);
      expect(post.photo).to.be.equal(newPost.photoUrl);
      expect(createdAtDate).closeToTime(nowDate, 5);
    });
  });

  describe('--> like', function () {
    it('--> Should increment posts likes counter', async () => {
      const newPost = {
        description: faker.lorem.text(),
        photoUrl: faker.image.imageUrl(),
        userId: faker.random.number(),
      };
      const { id: postId } = await model.add(newPost);
      const userId = 1;
      const post = await model.like(userId, postId);
      expect(post.likes).to.be.equal(1);
    });

    it('--> Should increment post likes only once per user', async () => {
      const newPost = {
        description: faker.lorem.text(),
        photoUrl: faker.image.imageUrl(),
        userId: faker.random.number(),
      };
      const { id: postId } = await model.add(newPost);
      const userId = 1;
      await model.like(userId, postId);
      const post = await model.like(userId, postId);
      expect(post.likes).to.be.equal(1);
    });
  });

  describe('--> getAll', function () {
    it('--> Should return a list of posts ordered by created_at descendent', async () => {
      const nowUtcAddHours = addHours(new Date());
      const newPost1 = {
        description: faker.lorem.text(),
        photoUrl: faker.image.imageUrl(),
        createdAt: nowUtcAddHours(0),
        userId: faker.random.number(),
      };
      const newPost2 = {
        description: faker.lorem.text(),
        photoUrl: faker.image.imageUrl(),
        createdAt: nowUtcAddHours(5),
        userId: faker.random.number(),
      };
      const newPost3 = {
        description: faker.lorem.text(),
        photoUrl: faker.image.imageUrl(),
        createdAt: nowUtcAddHours(2),
        userId: faker.random.number(),
      };
      const addedPosts = await Promise.all([model.add(newPost1), model.add(newPost2), model.add(newPost3)]);
      const posts = await model.getAll();
      expect(posts[0].id).to.be.equal(addedPosts[1].id);
      expect(posts[1].id).to.be.equal(addedPosts[2].id);
      expect(posts[2].id).to.be.equal(addedPosts[0].id);
    });

    it('--> Should return paginated list of posts');

    it('--> Should return the next page using offset');
  });
});
