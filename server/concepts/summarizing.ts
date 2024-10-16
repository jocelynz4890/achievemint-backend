import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface SummaryDoc extends BaseDoc {
  user: ObjectId;
  categories: Array<number>;
}

/**
 * concept: Summarizing
 */
export default class SummarizingConcept {
  public readonly summaries: DocCollection<SummaryDoc>;

  /**
   * Make an instance of Summarizing.
   */
  constructor(collectionName: string) {
    this.summaries = new DocCollection<SummaryDoc>(collectionName);
  }

  async getSummary(user: ObjectId) {
    let summary = await this.summaries.readOne({ user });
    if (summary) {
      return summary.categories;
    } else {
      throw new NotFoundError("User was not found.");
    }
  }

  async updateSummary(user: ObjectId, categories: Array<number>) {
    let summary = await this.summaries.readOne({ user });
    if (!summary) {
      categories = new Array(categories.length).fill(0);
      await this.summaries.createOne({ user, categories });
    } else {
      await this.summaries.partialUpdateOne({ user }, { categories });
    }
  }

  async findLowActivityCategory(user: ObjectId) {
    let summary = await this.summaries.readOne({ user });
    if (!summary) {
      throw new NotFoundError("Activity summary was not found for user.");
    } else {
      let lowest = Infinity;
      let idx = -1;
      for (let i = 0; i < summary.categories.length; i += 1) {
        if (summary.categories[i] < lowest) {
          lowest = summary.categories[i];
          idx = i;
        }
      }
      return idx;
    }
  }
}
