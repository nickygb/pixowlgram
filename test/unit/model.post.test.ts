import chai from 'chai';
import chaiDateTime from 'chai-datetime';
const expect = chai.expect;
chai.use(chaiDateTime);
import Knex from 'knex';
import { Post, decodeCursor } from '../../src/models/post';
import knexfile from '../../src/knexfile';
import faker from 'faker';
import { range } from '../lib/utils';

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

const checkIfDuplicatePost = (posts) => new Set(posts.map((p) => p.id)).size !== posts.length;

const fakeNewPost = (createdAt) => ({
  description: faker.lorem.text(),
  photoUrl: faker.image.imageUrl(),
  createdAt,
  userId: faker.random.number(),
});

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
      const createdAtDate = parseUtcStringDate(post.created_at as string);

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
    it('--> Should return a list of posts ordered chronologically (from newest to oldest)', async () => {
      const now = new Date();
      const nowUtcAddHours = addHours(now);
      const inTwoHours = nowUtcAddHours(2);
      const inFiveHours = nowUtcAddHours(5);
      const newPostNow = fakeNewPost(now);
      const newPostInFiveHours = fakeNewPost(inFiveHours);
      const newPostInTwoHours = fakeNewPost(inTwoHours);

      const addedPosts = await Promise.all([
        model.add(newPostNow),
        model.add(newPostInTwoHours),
        model.add(newPostInFiveHours),
      ]);
      const { posts, nextCursor } = await model.getAll();
      expect(posts[0].id).to.be.equal(addedPosts[2].id);
      expect(posts[1].id).to.be.equal(addedPosts[1].id);
      expect(posts[2].id).to.be.equal(addedPosts[0].id);
      expect(nextCursor).to.be.an('undefined');
    });

    it('--> Pagination should works properly when there is posts created at same time', async () => {
      const now = new Date();
      const inTwoHours = addHours(now)(2);
      const somePostsNow = await Promise.all(
        range(4) // Add 4 posts now
          .map(() => fakeNewPost(now))
          .map(model.add, model)
      );
      const somePostsInTwoHours = await Promise.all(
        range(10) // Add 10 posts in two hours
          .map(() => fakeNewPost(inTwoHours))
          .map(model.add, model)
      );

      const { posts, nextCursor } = await model.getAll(undefined, 10);
      // posts here should be all in two hours and not repeated
      expect(checkIfDuplicatePost(posts)).to.be.equal(false);
      posts.forEach((post) => {
        expect(new Date(post.created_at)).to.be.closeToTime(inTwoHours, 1);
      });

      // If I get the next posts using the nextCursor should get all
      const { posts: posts2, nextCursor: nextCursor2 } = await model.getAll(nextCursor, 10);
      expect(posts2.length).to.be.equal(4);
      expect(nextCursor2).to.be.equal(undefined);
      expect(checkIfDuplicatePost(posts2)).to.be.equal(false);
    });

    it('--> Should return maximum of 10 posts if limit is not specified', async () => {
      const now = new Date();
      await Promise.all(
        range(15) // Add 15 posts now
          .map(() => fakeNewPost(now))
          .map(model.add, model)
      );
      const { posts } = await model.getAll();
      expect(posts.length).to.be.equal(10);
    });

    it('--> Should return at most a number of posts specified by limit', async () => {
      const now = new Date();
      const nowUtcAddHours = addHours(now);
      const inTenHours = nowUtcAddHours(10);
      const inFiveHours = nowUtcAddHours(5);
      const newPostNow = fakeNewPost(now);
      const newPostInFiveHours = fakeNewPost(inFiveHours);
      const newPostInTenHours = fakeNewPost(inTenHours);

      await Promise.all([model.add(newPostNow), model.add(newPostInFiveHours), model.add(newPostInTenHours)]);
      const limit = 2;
      const { posts } = await model.getAll(undefined, limit);
      expect(posts.length).to.be.equal(limit);
    });

    it('--> Should return the nextCursor base64 encoded', async () => {
      const now = new Date();
      const nowUtcAddHours = addHours(now);
      const inTwoHours = nowUtcAddHours(2);
      const inFiveHours = nowUtcAddHours(5);
      const newPostNow = fakeNewPost(now);
      const newPostInFiveHours = fakeNewPost(inFiveHours);
      const newPostInTwoHours = fakeNewPost(inTwoHours);

      const addedPosts = await Promise.all([
        model.add(newPostNow),
        model.add(newPostInFiveHours),
        model.add(newPostInTwoHours),
      ]);

      const limit = 2;
      const { nextCursor } = await model.getAll(undefined, limit);
      expect(nextCursor).to.be.an('string');
      const nextCursorDecoded = decodeCursor(nextCursor);
      expect(nextCursorDecoded.post_id).to.be.equal(addedPosts[0].id);
      expect(new Date(nextCursorDecoded.created_at)).to.be.closeToTime(addedPosts[0].created_at as Date, 0.1);
    });

    it('--> If nextCursor is invalid, return most recent posts', async () => {
      const now = new Date();
      const nowUtcAddHours = addHours(now);
      const inTwoHours = nowUtcAddHours(2);
      const inFiveHours = nowUtcAddHours(5);
      const newPostNow = fakeNewPost(now);
      const newPostInFiveHours = fakeNewPost(inTwoHours);
      const newPostInTenHours = fakeNewPost(inFiveHours);

      await Promise.all([model.add(newPostNow), model.add(newPostInFiveHours), model.add(newPostInTenHours)]);

      const nextCursor = 'InvalidNextCursor';
      const { posts } = await model.getAll(nextCursor);
      expect(posts.length).to.be.equal(3);
    });
  });
});
