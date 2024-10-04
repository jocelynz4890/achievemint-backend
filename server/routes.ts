import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, EducationAndDIY, Entertainment, FashionAndBeauty, FoodAndCooking, Friending, HealthAndFitness, Lifestyle, Posting, Sessioning } from "./app";
import { PostOptions } from "./concepts/posting";
import { SessionDoc } from "./concepts/sessioning";
import Responses from "./responses";

import { z } from "zod";

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
  async createUser(session: SessionDoc, username: string, password: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password);
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Authing.updatePassword(user, currentPassword, newPassword);
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
  async createPost(session: SessionDoc, content: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const created = await Posting.create(user, content, options);
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

  @Router.get("/collections")
  async getDefaultCollections() {
    // to be modified after implementing concepts that use these
    return await [Lifestyle, HealthAndFitness, Entertainment, FoodAndCooking, FashionAndBeauty, EducationAndDIY];
  }

  // TODO
  @Router.patch("/posts/:id")
  // upvote a post
  async qualityRatePost(session: SessionDoc, id: string) {
    // if Authenticating.getUserRole((Posting.getPostOwner(p)).username) === ContentCreator
    //     Posting.incrementQualityRating(p)
  }

  @Router.post("/follow")
  async follow(to: String) {
    // if Authenticating.getUserRole(user.username) === RegularUser
    //     if Authenticating.getUserRole(otheruser.username) === ContentCreator
    //         Following.addFollower(user, otheruser)
    //     else
    //         Following.addRequest(user, otheruser)
  }

  @Router.get("/follow")
  async getFollowers(session: SessionDoc) {
    // if Authenticating.getUserRole(user.username) === ContentCreator
    // Following.getFollowers(user)
  }

  @Router.get("/follow")
  async getFollowings(session: SessionDoc) {
    // if Authenticating.getUserRole(user.username) === RegularUser
    //       Following.getFollowings(user)
  }

  @Router.post("/trackers")
  async createTracker(name: String) {
    // if Authenticating.getUserRole(user.username) === RegularUser
    //     return Tracker-ing.makeTracker(user, name, shared)
  }

  @Router.post("/collections")
  async createCollection(name: String) {
    // if d
    //     Collection-ing.newCollectionWithDeadline(user, parent, d, name)
    // if not d
    //     Collection-ing.newCollectionWithoutDeadline(user, parent, name)
  }

  @Router.post("/trackers/share")
  async shareTracker(to: string, name: String) {
    // if Authenticating.getUserRole(user.username) === RegularUser
    //     Tracker-ing.shareTracker(user, name, otheruser)
  }

  @Router.post("/collections/share")
  async shareCollection(to: string, name: String) {
    // if Authenticating.getUserRole(user.username) === RegularUser
    //     Collection-ing.shareCollection(user, name, otheruser)
  }

  @Router.post("/trackers/share")
  async unshareTracker(from: string, name: String) {
    // if Authenticating.getUserRole(user.username) === RegularUser
    //     Tracker-ing.unshareTracker(user, name, otheruser)
  }

  @Router.post("/collections/share")
  async unshareCollection(from: string, name: String) {
    // if Authenticating.getUserRole(user.username) === RegularUser
    //     Collection-ing.unshareCollection(user, name, otheruser)
  }

  @Router.delete("/trackers")
  async deleteTracker(name: String) {
    // if Authenticating.getUserRole(user.username) === RegularUser
    //     Tracker-ing.deleteTracker(user, name)
    //     Leveling.updateLevel(user)
  }

  @Router.delete("/collections")
  async deleteCollection(name: String) {
    // if Authenticating.getUserRole(user.username) === RegularUser
    //     Collection-ing.deleteCollection(user, name)
  }

  @Router.patch("/trackers")
  async checkTracker(name: String) {
    // if Authenticating.getUserRole(user.username) === RegularUser
    //     Tracker-ing.checkDay(user, name)
    //     Leveling.updateLevel(user)
  }

  @Router.patch("/trackers")
  async uncheckTracker(name: String) {
    // if Authenticating.getUserRole(user.username) === RegularUser
    //     Tracker-ing.uncheckDay(user, name)
    //     Leveling.updateLevel(user)
  }

  @Router.patch("/collections")
  async addToCollection(name: String, p: string) {
    // if Authenticating.getUserRole(user.username) === RegularUser
    //     Collection-ing.addToCollection(User, name, p)
    //     Summarizing.updateSummaries(Collection-ing.getUserDefaultCollectionSizes(user))
    //     Leveling.updateLevel(user)
  }

  @Router.patch("/collections")
  async updateCollectionDeadline(name: String, d: Date) {
    // if Authenticating.getUserRole(user.username) === RegularUser
    //     Collection-ing.updateCollectionDeadline(user, name, d)
  }

  @Router.get("/creators")
  async getAllContentCreators() {
    // return Authenticating.getAllUsersWithRole(ContentCreator)
  }

  @Router.post("/explore")
  async recommendContent() {
    // if Authenticating.getUserRole(user.username) === RegularUser
    //     Summarizing.updateIfDataChanged(Collection-ing.getUserDefaultCollectionSizes(user))
    //     return findLowActivityCategory(Collection-ing.getUserDefaultCollectionSizes(user))
  }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
