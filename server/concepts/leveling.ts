import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";

export interface LevelDoc extends BaseDoc {
  uid: ObjectId;
  exp: number;
}

/**
 * concept: Leveling
 */
export default class LevelingConcept {
  public readonly levels: DocCollection<LevelDoc>;

  /**
   * Make an instance of Leveling.
   */
  constructor(collectionName: string) {
    this.levels = new DocCollection<LevelDoc>(collectionName);
  }

  async calculateUserTotalExp(uid: ObjectId, source: Array<number>) {
    let user = await this.levels.readOne({ uid });
    let exp = 0;
    if (!user) {
      await this.levels.createOne({ uid, exp });
    }
    user = await this.levels.readOne({ uid });
    for (const num of source) {
      exp += num;
    }
    return exp;
  }

  async getExp(uid: ObjectId) {
    let user = await this.levels.readOne({ uid });
    let exp = 0;
    if (!user) {
      await this.levels.createOne({ uid, exp });
    }
    user = await this.levels.readOne({ uid });
    return user?.exp;
  }

  async getLvl(uid: ObjectId) {
    const exp = await this.getExp(uid);
    return Math.floor(exp! / 30); // 30 exp per level
  }

  async addExp(uid: ObjectId, num: number) {
    let exp = await this.getExp(uid);
    exp! += num;
  }

  async updateExp(uid: ObjectId, source: Array<number>) {
    const exp = await this.calculateUserTotalExp(uid, source);
    const total = await this.addExp(uid, exp);
    return { msg: "Exp successfully updated!", exp: total };
  }
}
