import { ObjectId } from "mongodb";

import { Category } from "../app";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface CollectionDoc extends BaseDoc {
  owner: ObjectId;
  parent: Category;
  shared: Array<ObjectId>;
  title: String;
  contents: Array<ObjectId>;
  deadline: String;
  num: number;
}

/**
 * concept: Collectioning [Content]
 */
export default class CollectioningConcept {
  public readonly collections: DocCollection<CollectionDoc>;

  /**
   * Make an instance of Collection.
   */
  constructor(collectionName: string) {
    this.collections = new DocCollection<CollectionDoc>(collectionName);
  }

  async getSubCollections(owner: ObjectId, parent: Category) {
    return this.collections.readMany({ owner, parent });
  }

  async getUserCollections(owner: ObjectId) {
    const collections = await this.collections.readMany({ owner });
    if (!collections) {
      return new NotFoundError("User doesn't exist or have any collections.");
    }
    return collections;
  }

  async getContent(_id: ObjectId) {
    const collection = await this.collections.readOne({ _id });
    if (collection) {
      return collection.contents;
    }
    throw new NotFoundError("Collection could not be found!");
  }

  async getCollectionById(_id: ObjectId) {
    const collection = await this.collections.readOne({ _id });
    if (collection) {
      return collection;
    }
    throw new NotFoundError("Collection could not be found!");
  }

  async getCollectionByTitle(owner: ObjectId, title: String) {
    const collection = await this.collections.readOne({ owner, title });
    if (collection) {
      return collection;
    }
    throw new NotFoundError("Collection could not be found!");
  }

  async getCollectionLength(owner: ObjectId, title: String) {
    const collection = await this.collections.readOne({ owner, title });
    if (collection) {
      return collection.contents.length;
    }
    throw new NotFoundError("Collection could not be found!");
  }

  async createCollection(owner: ObjectId, parent: Category, title: String, deadline: String = "") {
    const sameTitle = await this.collections.readMany({ owner, title });
    if (sameTitle.length > 0) {
      throw new NotAllowedError("You already have a collection with the same title!");
    }
    const shared = new Array<ObjectId>();
    const days = new Array<Boolean>(360);
    const contents = new Array<ObjectId>();
    const _id = await this.collections.createOne({ owner, parent, shared, title, contents, deadline });
    return { msg: "Collection successfully created!", collection: await this.collections.readOne({ _id }) };
  }

  async addToCollection(owner: ObjectId, title: String, content: ObjectId) {
    const collection = await this.collections.readOne({ owner, title });
    if (collection) {
      if (collection.contents.filter((contentId) => contentId === content).length > 0) {
        throw new NotAllowedError("Content is already in this collection.");
      }
      if (collection.owner !== owner) {
        throw new NotAllowedError("Only owners of a collection may add to it.");
      }
      const id = collection._id;
      const contents = [...collection.contents, content];
      await this.collections.partialUpdateOne({ id }, { contents });
      return { msg: "Successfully added to collection!" };
    }
    throw new NotFoundError("Collection could not be found!");
  }

  async removeFromCollection(owner: ObjectId, title: String, content: ObjectId) {
    const collection = await this.collections.readOne({ owner, title });
    if (collection) {
      if (collection.contents.filter((contentId) => contentId === content).length === 0) {
        throw new NotAllowedError("Content could not be found in this collection.");
      }
      if (collection.owner !== owner) {
        throw new NotAllowedError("Only owners of a collection may remove from it.");
      }
      const id = collection._id;
      const contents = collection.contents.filter((item) => item !== content);
      await this.collections.partialUpdateOne({ id }, { contents });
      return { msg: "Successfully removed from collection." };
    }
    throw new NotFoundError("Collection could not be found!");
  }

  async getCollectionDeadline(owner: ObjectId, title: String) {
    const collection = await this.collections.readOne({ owner, title });
    if (collection) {
      return collection.deadline;
    }
    throw new NotFoundError("Collection could not be found!");
  }

  async shareCollection(owner: ObjectId, title: String, to: ObjectId) {
    const collection = await this.collections.readOne({ owner, title });
    if (collection) {
      if (collection.owner !== owner) {
        throw new NotAllowedError("Only owners of a collection may share it.");
      }
      const id = collection._id;
      const shared = [...collection.shared, to];
      await this.collections.partialUpdateOne({ id }, { shared });
      return { msg: "Successfully shared collection!" };
    }
    throw new NotFoundError("Collection could not be found!");
  }

  async unshareCollection(owner: ObjectId, title: String, from: ObjectId) {
    const collection = await this.collections.readOne({ owner, title });
    if (collection) {
      if (collection.owner !== owner) {
        throw new NotAllowedError("Only owners of a collection may unshare it.");
      }
      const shared = collection.shared.filter((person) => person !== from);
      const id = collection._id;
      await this.collections.partialUpdateOne({ id }, { shared });
      return { msg: "Successfully unshared collection!" };
    }
    throw new NotFoundError("Collection could not be found!");
  }

  async updateCollectionDeadline(owner: ObjectId, title: String, deadline: String) {
    const collection = await this.collections.readOne({ owner, title });
    if (collection) {
      const id = collection._id;
      await this.collections.partialUpdateOne({ id }, { deadline });
      return { msg: `Successfully changed collection deadline to ${deadline}!` };
    }
    throw new NotFoundError("Collection could not be found!");
  }

  async getCollectionNumContent(id: ObjectId) {
    const collection = await this.collections.readOne({ id });
    if (collection) return collection.contents.length;
    throw new NotFoundError("Collection could not be found!");
  }

  async deleteCollection(owner: ObjectId, title: String) {
    const collection = await this.collections.readOne({ owner, title });
    if (collection) {
      if (collection.owner !== owner) {
        throw new NotAllowedError("Only owners of a collection may delete it.");
      }
      const id = collection._id;
      await this.collections.deleteOne({ id });
      return { msg: `Collection "${title}" deleted!` };
    }
    throw new NotFoundError("Collection could not be found!");
  }

  async getSharedCollections(user: ObjectId) {
    const collections = await this.collections.readMany({ shared: { $in: [user] } });
    return collections.map((collection) => collection._id);
  }
}
