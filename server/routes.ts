import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Category, Collectioning, Friending, Leveling, Posting, Sessioning, Summarizing, Trackering } from "./app";
import { Role } from "./concepts/authenticating";
import { PostOptions } from "./concepts/posting";
import { SessionDoc } from "./concepts/sessioning";
import Responses from "./responses";

import { z } from "zod";
import { NotFoundError } from "./concepts/errors";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Synchronize the concepts from `app.ts`.

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.get("/users/:username")
  @Router.validate(z.object({ username: z.string().min(1) }))
  async getUser(username: string) {
    return await Authing.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string, role: Role) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password, role);
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updatePassword(user, currentPassword, newPassword);
  }

  @Router.delete("/users")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    return await Authing.delete(user);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/contentcreators")
  async getContentCreators() {
    return await Authing.getUsersByRole(Role.ContentCreator);
  }

  @Router.get("/regularusers")
  async getRegularUsers() {
    return await Authing.getUsersByRole(Role.RegularUser);
  }

  @Router.get("/posts")
  @Router.validate(z.object({ author: z.string().optional() }))
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await Authing.getUserByUsername(author))._id;
      posts = await Posting.getByAuthor(id);
    } else {
      posts = await Posting.getPosts();
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: SessionDoc, content: string, category: Category, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const created = await Posting.create(user, content, category, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:id")
  async updatePost(session: SessionDoc, id: string, content?: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return await Posting.update(oid, content, options);
  }

  @Router.delete("/posts/:id")
  async deletePost(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return Posting.delete(oid);
  }

  @Router.get("/friends")
  async getFriends(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.idsToUsernames(await Friending.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: SessionDoc, friend: string) {
    const user = Sessioning.getUser(session);
    const friendOid = (await Authing.getUserByUsername(friend))._id;
    return await Friending.removeFriend(user, friendOid);
  }

  @Router.post("/follow")
  async followContentCreator(user1: ObjectId, user2: ObjectId) {
    if ((await Authing.getUserRole(user1)) === Role.RegularUser) Friending.addFriend(user1, user2);
  }

  @Router.post("/unfollow")
  async unfollowContentCreator(user: ObjectId, friend: ObjectId) {
    if ((await Authing.getUserRole(user)) === Role.RegularUser) Friending.removeFriend(user, friend);
  }

  @Router.get("/friend/requests")
  async getRequests(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Responses.friendRequests(await Friending.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.sendRequest(user, toOid);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.removeRequest(user, toOid);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.acceptRequest(fromOid, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.rejectRequest(fromOid, user);
  }

  @Router.post("/collections")
  async makeDefaultCollections(owner: ObjectId) {
    // the parent of a default collection is not a collection, rather, it is the owner of the collection
    const lifestyle = await Collectioning.createCollection(owner, owner, "Lifestyle");
    const health = await Collectioning.createCollection(owner, owner, "HealthAndFitness");
    const entertainment = await Collectioning.createCollection(owner, owner, "Entertainment");
    const food = await Collectioning.createCollection(owner, owner, "FoodAndCooking");
    const fashion = await Collectioning.createCollection(owner, owner, "FashionAndBeauty");
    const education = await Collectioning.createCollection(owner, owner, "EducationAndDIY");
    return [lifestyle, health, entertainment, food, fashion, education];
  }

  @Router.patch("/posts/:id/increment-rating")
  async incrementPostQuality(id: ObjectId) {
    await Posting.incrementQualityRating(id);
  }

  @Router.patch("/posts/:id/decrement-rating")
  async decrementPostQuality(id: ObjectId) {
    await Posting.decrementQualityRating(id);
  }

  @Router.get("/posts/:author")
  async getAuthorPosts(author: ObjectId) {
    return await Posting.getByAuthor(author);
  }

  @Router.patch("/posts/:category")
  async getPostsInCategory(category: Category) {
    return await Posting.getByCategory(category);
  }

  @Router.get("/followers")
  async getFollowers(user: ObjectId) {
    return (await Friending.getFriends(user)).filter(async (friend) => (await Authing.getUserRole(friend)) === Role.RegularUser);
  }

  @Router.get("/followings")
  async getFollowings(user: ObjectId) {
    return (await Friending.getFriends(user)).filter(async (friend) => (await Authing.getUserRole(friend)) === Role.ContentCreator);
  }

  @Router.post("/trackers/create")
  async createTracker(owner: ObjectId, title: String) {
    await Trackering.makeTracker(owner, title);
  }

  @Router.post("/collections/create")
  async createCollection(owner: ObjectId, parent: ObjectId, title: String, deadline: String) {
    await Collectioning.createCollection(owner, parent, title, deadline);
  }

  @Router.get("/trackers")
  async getAllTrackers(owner: ObjectId) {
    return await Trackering.getTrackers(owner);
  }

  @Router.get("/collections")
  async getAllCollections(owner: ObjectId) {
    return await Collectioning.getUserCollections(owner);
  }

  @Router.get("/trackers/:title")
  /**
   * Given an owner and title of a tracker, returns trackers of the same title that are shared with the owner.
   */
  async getSharedTrackers(owner: ObjectId, title: String) {
    return await Promise.all(
      (await Trackering.getSharedTrackers(owner)).filter(async (tracker) => {
        const trackerObj = await Trackering.getTrackerById(tracker);
        if (trackerObj) {
          return trackerObj.title === title;
        }
        return false;
      }),
    );
  }

  @Router.get("/collections/:title")
  /**
   * Given an owner and title of a collection, returns collections of the same title that are shared with the owner.
   */
  async getSharedCollections(owner: ObjectId, title: String) {
    return await Promise.all(
      (await Collectioning.getSharedCollections(owner)).filter(async (collection) => {
        const collectionObj = await Collectioning.getCollectionById(collection);
        if (collectionObj) {
          return collectionObj.title === title;
        }
        return false;
      }),
    );
  }

  @Router.post("/trackers/share")
  async shareTracker(user: ObjectId, to: ObjectId, title: String) {
    if ((await Authing.getUserRole(user)) === Role.RegularUser) {
      await Trackering.shareTracker(user, title, to);
    }
  }

  @Router.post("/collections/share")
  async shareCollection(user: ObjectId, to: ObjectId, title: String) {
    if ((await Authing.getUserRole(user)) === Role.RegularUser) {
      await Collectioning.shareCollection(user, title, to);
    }
  }

  @Router.post("/trackers/unshare")
  async unshareTracker(user: ObjectId, from: ObjectId, title: String) {
    if ((await Authing.getUserRole(user)) === Role.RegularUser) {
      await Trackering.unshareTracker(user, title, from);
    }
  }

  @Router.post("/collections/unshare")
  async unshareCollection(user: ObjectId, from: ObjectId, title: String) {
    if ((await Authing.getUserRole(user)) === Role.RegularUser) {
      await Collectioning.unshareCollection(user, title, from);
    }
  }

  @Router.delete("/trackers")
  async deleteTracker(user: ObjectId, title: String) {
    if ((await Authing.getUserRole(user)) === Role.RegularUser) {
      await Trackering.deleteTracker(user, title);
    }
  }

  @Router.delete("/collections")
  async deleteCollection(user: ObjectId, title: String) {
    if ((await Authing.getUserRole(user)) === Role.RegularUser) {
      await Collectioning.deleteCollection(user, title);
    }
  }

  @Router.patch("/trackers/:title/check")
  @Router.validate(z.object({ day: z.number().min(0).max(364) }))
  async checkTracker(user: ObjectId, title: String, day: number) {
    if ((await Authing.getUserRole(user)) === Role.RegularUser) {
      await Trackering.checkDay(user, title, day);
      const source = await Promise.all((await Trackering.getTrackers(user)).map(async (tracker) => await Trackering.getTotalCheckedDays(user, tracker.title)));
      await Leveling.updateExp(user, source);
    }
  }

  @Router.patch("/trackers/:title/uncheck")
  @Router.validate(z.object({ day: z.number().min(0).max(364) }))
  async uncheckTracker(user: ObjectId, title: String, day: number) {
    if ((await Authing.getUserRole(user)) === Role.RegularUser) {
      await Trackering.uncheckDay(user, title, day);
      const source = await Promise.all((await Trackering.getTrackers(user)).map(async (tracker) => await Trackering.getTotalCheckedDays(user, tracker.title)));
      await Leveling.updateExp(user, source);
    }
  }

  @Router.get("/collections/:id")
  async getPostsInCollection(id: ObjectId) {
    await Collectioning.getContent(id);
  }

  @Router.patch("/collections/add")
  async addToCollection(user: ObjectId, collectionTitle: String, post: ObjectId) {
    if ((await Authing.getUserRole(user)) === Role.RegularUser) {
      await Collectioning.addToCollection(user, collectionTitle, post);
      const defaultCategories = ["Lifestyle", "HealthAndFitness", "Entertainment", "FoodAndCooking", "FashionAndBeauty", "EducationAndDIY"];
      let categories = new Array<number>();
      for (let category of defaultCategories) {
        const collections = await Collectioning.getUserCollections(user);
        let sum = 0;
        if (!(collections instanceof NotFoundError)) {
          for (let collection of collections) {
            sum += await Collectioning.getCollectionLength(user, collection.title);
          }
        }
        categories.push((await Collectioning.getCollectionLength(user, category)) + sum);
      }
      await Summarizing.updateSummary(user, categories);
    }
  }

  @Router.patch("/collections/remove")
  async removeFromCollection(user: ObjectId, collectionTitle: String, post: ObjectId) {
    if ((await Authing.getUserRole(user)) === Role.RegularUser) {
      await Collectioning.removeFromCollection(user, collectionTitle, post);
      const defaultCategories = ["Lifestyle", "HealthAndFitness", "Entertainment", "FoodAndCooking", "FashionAndBeauty", "EducationAndDIY"];
      let categories = new Array<number>();
      for (let category of defaultCategories) {
        const collections = await Collectioning.getUserCollections(user);
        let sum = 0;
        if (!(collections instanceof NotFoundError)) {
          for (let collection of collections) {
            sum += await Collectioning.getCollectionLength(user, collection.title);
          }
        }
        categories.push((await Collectioning.getCollectionLength(user, category)) + sum);
      }
      await Summarizing.updateSummary(user, categories);
    }
  }

  @Router.patch("/collections")
  async updateCollectionDeadline(user: ObjectId, collectionTitle: String, deadline: String) {
    if ((await Authing.getUserRole(user)) === Role.RegularUser) {
      await Collectioning.updateCollectionDeadline(user, collectionTitle, deadline);
    }
  }

  @Router.post("/exp")
  /**
   * @param user
   * @returns the total number of checked days across all of the user's trackers
   */
  async calculateExp(user: ObjectId) {
    const source = new Array<number>();
    const trackers = await Trackering.getTrackers(user);
    if (trackers) {
      for (let tracker of trackers) {
        source.push(await Trackering.getTotalCheckedDays(user, tracker.title));
        return await Leveling.calculateUserTotalExp(user, source);
      }
    }
  }

  @Router.get("/level")
  async getLevel(user: ObjectId) {
    return await Leveling.getLvl(user);
  }

  @Router.get("/exp")
  async getExp(user: ObjectId) {
    return await Leveling.getExp(user);
  }

  @Router.post("/explore")
  /**
   * Given a user, recommends a category of content for the user by returning a category in which the user has
   * the least amount of saved posts.
   */
  async recommendContent(user: ObjectId) {
    if ((await Authing.getUserRole(user)) === Role.RegularUser) {
      const category = Summarizing.findLowActivityCategory(user);
      return await category;
    }
  }

  @Router.get("/summary")
  async getSummary(user: ObjectId) {
    if ((await Authing.getUserRole(user)) === Role.RegularUser) {
      return await Summarizing.getSummary(user);
    }
  }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
