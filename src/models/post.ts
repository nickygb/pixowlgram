import Knex from 'knex';

interface NewPost {
  description: string;
  photoUrl: string;
  userId: number;
  createdAt?: Date;
}

interface IPost {
  id: number;
  description: string;
  photo: string;
  likes: number;
  user_id: number;
  created_at: string | Date;
}

interface Cursor {
  post_id: number;
  created_at: string;
}

interface PaginatedPosts {
  posts: IPost[];
  nextCursor: string;
}

const postsBetweenDatesQuery = (connection: Knex, startDate: Date, endDate: Date): any => {
  const query = connection
    .from('post')
    .select('*')
    .where('created_at', '>=', startDate)
    .andWhere('created_at', '<', endDate);
  return query;
};

export const decodeCursor = (encodedCursor: string): Cursor => {
  const decodedCursor = JSON.parse(Buffer.from(encodedCursor, 'base64').toString('ascii'));
  return decodedCursor;
};
const encodeCursor = (postId: number, createdAt: string): string => {
  const cursor: Cursor = { post_id: postId, created_at: createdAt };
  const encoded = Buffer.from(JSON.stringify(cursor)).toString('base64');
  return encoded;
};

export class Post {
  private _connection: Knex;
  constructor(connection: Knex) {
    this._connection = connection;
  }

  async getById(id: number): Promise<IPost> {
    const posts = await this._connection
      .select('p.id', 'p.description', 'p.likes', 'p.created_at', 'ph.url as photo')
      .from('post as p')
      .join('photo as ph', 'ph.post_id', 'p.id')
      .where('p.id', '=', id);
    return posts[0];
  }

  async getAll(encodedCursor?: string, limit = 10): Promise<PaginatedPosts> {
    const query = this._connection
      .select('p.id', 'p.description', 'p.likes', 'p.created_at', 'ph.url as photo', 'p.user_id')
      .from('post as p')
      .join('photo as ph', 'ph.post_id', 'p.id')
      .limit(limit + 1) // +1 to get the next cursor
      .orderBy('p.created_at', 'desc')
      .orderBy('p.id', 'desc');

    if (encodedCursor && encodedCursor !== '') {
      try {
        const cursor = decodeCursor(encodedCursor);
        query.where('p.id', '<=', cursor.post_id).where('p.created_at', '<=', cursor.created_at);
      } catch (err) {
        // Invalid cursor ... return most recent posts
      }
    }
    const posts: IPost[] = await query;

    // We create the next cursor with the last post
    let nextCursorEncoded = undefined;
    if (posts.length > limit) {
      const nextPost = posts.pop();
      nextCursorEncoded = encodeCursor(nextPost.id, nextPost.created_at as string);
    }
    return {
      posts,
      nextCursor: nextCursorEncoded,
    };
  }

  async getAllOld(startDate: Date, endDate: Date, limit: number): Promise<IPost[]> {
    const query = this._connection
      .select('p.id', 'p.description', 'p.likes', 'p.created_at', 'ph.url as photo')
      .from({
        // This query allows as to take advantage of mysql query caching
        // because we are first selecting all the posts in the range of dates
        // and after this we perform the limit in the outer query.
        p: postsBetweenDatesQuery(this._connection, startDate, endDate),
      })
      .join('photo as ph', 'ph.post_id', 'p.id')
      .limit(limit)
      .orderBy('p.created_at', 'desc');

    const posts: IPost[] = await query;
    return posts;
  }

  async add(newPost: NewPost): Promise<IPost> {
    let postId;
    await this._connection.transaction(async (trx) => {
      const postItem = { description: newPost.description, created_at: newPost.createdAt, user_id: newPost.userId };
      [postId] = await trx.table('post').insert(postItem);

      const photoItem = { url: newPost.photoUrl, post_id: postId };
      await trx.table('photo').insert(photoItem);
    });
    const post = await this.getById(postId);
    return post;
  }

  async like(userId: number, postId: number): Promise<IPost> {
    try {
      await this._connection.transaction(async (trx) => {
        const likeItem = { user_id: userId, post_id: postId };
        await trx.table('like').insert(likeItem);
        await trx.table('post').increment('likes', 1);
      });
    } catch (err) {
      // Just ignore duplicate entry errors and return the post
      if (err.code !== 'ER_DUP_ENTRY') {
        throw err;
      }
    }

    const post = await this.getById(postId);
    return post;
  }
}
