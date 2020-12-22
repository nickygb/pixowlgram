import rp from 'request-promise';
import chai from 'chai';
import faker from 'faker';
const expect = chai.expect;
import fs from 'fs';

const APP_URL = process.env.APP_URL;
const BUCKET_PHOTOS = process.env.BUCKET_PHOTOS;

describe('Web server', () => {
  before(async function () {
    this.timeout(100000);
    // TODO: Correr la migracion y el seed dentro del test
    // Vero como lo hago para los tests unitarios (pero ahora tengo que usar la db mysql del docker-compose)
  });
  describe('--> GET /posts', () => {
    it('--> Should return list of posts created and the next_cursor', async () => {
      const { posts, nextCursor } = await rp.get({
        uri: `${APP_URL}/posts`,
        // qs: { limit: 1 },
        json: true,
      });
      expect(posts.length).to.be.equal(10);
      expect(nextCursor).to.be.an('string');
    });

    it('--> Should allow to change the number of posts received', async () => {
      const { posts, nextCursor } = await rp.get({
        uri: `${APP_URL}/posts`,
        qs: { limit: 20 },
        json: true,
      });
      expect(posts.length).to.be.equal(20);
      expect(nextCursor).to.be.an('string');
    });

    it('--> Should receive the next page using nextCursor', async () => {
      const { posts: postsPage1, nextCursor: nextCursor1 } = await rp.get({
        uri: `${APP_URL}/posts`,
        qs: { limit: 20 },
        json: true,
      });

      const { posts: postsPage2, nextCursor: nextCursor2 } = await rp.get({
        uri: `${APP_URL}/posts`,
        qs: { limit: 15, nextCursor: nextCursor1 },
        json: true,
      });
      expect(postsPage2.length).to.be.equal(15);
      expect(nextCursor1).not.to.be.equal(nextCursor2);
    });
  });

  describe('--> POST /posts', () => {
    it('--> Should add a new post', async () => {
      const formData = {
        description: faker.lorem.text(),
        photo: {
          value: fs.createReadStream('assets/480.jpeg'),
          options: {
            filename: '480.jpeg',
            contentType: 'image/jpg',
          },
        },
      };

      const post = await rp.post({
        uri: `${APP_URL}/posts`,
        formData: formData,
        json: true,
      });

      expect(post.id).to.be.an('number');
      expect(post.description).to.be.equal(formData.description);
      expect(post.likes).to.be.equal(0);
      expect(post.created_at).to.be.an('string');
      expect(post.photo.startsWith(`https://us-east-1.amazonaws.com/${BUCKET_PHOTOS}`));
    });
  });

  describe('--> POST /posts/likes', () => {
    it('--> Should add a new like to a post', async () => {
      const { posts, nextCursor } = await rp.get({
        uri: `${APP_URL}/posts`,
        qs: { limit: 1 },
        json: true,
      });
      const myLovelyPost = posts[0];

      const post = await rp.post({
        uri: `${APP_URL}/posts/like`,
        body: {
          post_id: myLovelyPost.id,
        },
        json: true,
      });
      expect(post.id).to.be.equal(myLovelyPost.id);
      expect(post.likes).to.be.equal(myLovelyPost.likes + 1);
    });
  });
});
