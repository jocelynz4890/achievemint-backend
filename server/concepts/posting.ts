import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

import { Category } from "../app";

export interface PostOptions {
  backgroundColor?: string;
}

export interface PostDoc extends BaseDoc {
  author: ObjectId;
  content: string;
  quality_rating: number;
  category: Category;
  options?: PostOptions;
}

/**
 * concept: Posting [Content, Categories]
 */
export default class PostingConcept {
  public readonly posts: DocCollection<PostDoc>;

  /**
   * Make an instance of Posting.
   */
  constructor(collectionName: string) {
    this.posts = new DocCollection<PostDoc>(collectionName);
  }

  async create(author: ObjectId, content: string, category: Category, options?: PostOptions) {
    const quality_rating = 0;
    const _id = await this.posts.createOne({ author, content, quality_rating, category, options });
    return { msg: "Post successfully created!", post: await this.posts.readOne({ _id }) };
  }

  async incrementQualityRating(_id: ObjectId) {
    const post = await this.posts.readOne({ _id });
    if (!post) {
      throw new NotFoundError(`Post ${_id} does not exist!`);
    }
    const quality_rating = post.quality_rating + 1;
    await this.posts.partialUpdateOne({ _id }, { quality_rating });
    return { msg: "Quality rating of post increased!" };
  }

  async decrementQualityRating(_id: ObjectId) {
    const post = await this.posts.readOne({ _id });
    if (!post) {
      throw new NotFoundError(`Post ${_id} does not exist!`);
    }
    const quality_rating = post.quality_rating - 1;
    await this.posts.partialUpdateOne({ _id }, { quality_rating });
    return { msg: "Quality rating of post decreased!" };
  }

  async getPosts() {
    // Returns all posts! You might want to page for better client performance
    return await this.posts.readMany({}, { sort: { _id: -1 } });
  }

  async getByAuthor(author: ObjectId) {
    return await this.posts.readMany({ author });
  }

  async getByCategory(category: Category) {
    return await this.posts.readMany({ category });
  }

  async update(_id: ObjectId, content?: string, options?: PostOptions) {
    // Note that if content or options is undefined, those fields will *not* be updated
    // since undefined values for partialUpdateOne are ignored.
    await this.posts.partialUpdateOne({ _id }, { content, options });
    return { msg: "Post successfully updated!" };
  }

  async delete(_id: ObjectId) {
    await this.posts.deleteOne({ _id });
    return { msg: "Post deleted successfully!" };
  }

  async assertAuthorIsUser(_id: ObjectId, user: ObjectId) {
    const post = await this.posts.readOne({ _id });
    if (!post) {
      throw new NotFoundError(`Post ${_id} does not exist!`);
    }
    if (post.author.toString() !== user.toString()) {
      throw new PostAuthorNotMatchError(user, _id);
    }
  }
}

export class PostAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of post {1}!", author, _id);
  }
}
