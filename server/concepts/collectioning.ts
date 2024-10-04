import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";

export interface CollectionDoc extends BaseDoc {
  owner: ObjectId;
  parent: ObjectId;
  shared: Array<ObjectId>;
  title: String;
  contents: Array<ObjectId>;
  deadline: String;
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

  async getUserCollections(owner: ObjectId) {
    return await this.collections.readMany({ owner });
  }

  async getCollectionByName(owner: ObjectId, title: String) {
    return await this.collections.readOne({ owner, title });
  }

  async createCollection(owner: ObjectId, parent: ObjectId, title: String, deadline: String = "") {
    const shared = new Array<ObjectId>();
    const days = new Array<Boolean>(360);
    const contents = new Array<ObjectId>();
    const _id = await this.collections.createOne({ owner, parent, shared, title, contents, deadline });
    return { msg: "Collection successfully created!", collection: await this.collections.readOne({ _id }) };
  }

  async addToCollection(owner: ObjectId, title: String, content: ObjectId) {
    const collection = await this.collections.readOne({ owner, title });
    if (collection) {
      collection.contents.push(content);
      return { msg: "Successfully added to collection!" };
    }
    throw new Error("Collection could not be found!");
  }

  async removeFromCollection(owner: ObjectId, title: String, content: ObjectId) {
    const collection = await this.collections.readOne({ owner, title });
    if (collection) {
      collection.contents = collection.contents.filter((item) => item !== content);
      return { msg: "Successfully removed from collection." };
    }
    throw new Error("Collection could not be found!");
  }

  async getCollectionDeadline(owner: ObjectId, title: String) {
    const collection = await this.collections.readOne({ owner, title });
    if (collection) {
      return collection.deadline;
    }
    throw new Error("Collection could not be found!");
  }

  async shareCollection(owner: ObjectId, title: String, to: ObjectId) {
    const collection = await this.collections.readOne({ owner, title });
    if (collection) {
      collection.shared.push(to);
      return { msg: "Successfully shared collection!" };
    }
    throw new Error("Collection could not be found!");
  }

  async unshareCollection(owner: ObjectId, title: String, from: ObjectId) {
    const collection = await this.collections.readOne({ owner, title });
    if (collection) {
      collection.shared = collection.shared.filter((person) => person !== from);
      return { msg: "Successfully unshared collection!" };
    }
    throw new Error("Collection could not be found!");
  }

  async updateCollectionDeadline(owner: ObjectId, title: String, newDeadline: String) {
    const collection = await this.collections.readOne({ owner, title });
    if (collection) {
      collection.deadline = newDeadline;
      return { msg: "Successfully changed collection deadline!" };
    } else throw new Error("Collection could not be found!");
  }

  async getUserNumCollections(owner: ObjectId) {
    return (await this.collections.readMany({ owner })).length;
  }
}
