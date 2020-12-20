import Knex from 'knex';

interface NewPost {
  description: string;
  photoUrl: string;
  createdAt?: Date;
}

interface IPost {
  id: number;
  description: string;
  photo: string;
  likes: number;
  created_at: string;
}

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

  async getAll(): Promise<IPost[]> {
    const res: IPost[] = await this._connection
      .select('p.id', 'p.description', 'p.likes', 'p.created_at', 'ph.url as photo')
      .from('post as p')
      .join('photo as ph', 'ph.post_id', 'p.id')
      .orderBy('p.created_at', 'desc');
    return res;
  }

  async add(newPost: NewPost): Promise<IPost> {
    let postId;
    await this._connection.transaction(async (trx) => {
      const postItem = { description: newPost.description, created_at: newPost.createdAt };
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
