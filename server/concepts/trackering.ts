import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";

export interface TrackerDoc extends BaseDoc {
  owner: ObjectId;
  shared: Array<ObjectId>;
  title: String;
  days: Array<Boolean>;
}

/**
 * concept: Trackering [String]
 */
export default class TrackeringConcept {
  public readonly trackers: DocCollection<TrackerDoc>;

  /**
   * Make an instance of Trackering.
   */
  constructor(collectionName: string) {
    this.trackers = new DocCollection<TrackerDoc>(collectionName);
  }

  async makeTracker(owner: ObjectId) {
    const shared = new Array<ObjectId>();
    const days = new Array<Boolean>(360);
    const title = "";
    const _id = await this.trackers.createOne({ owner, shared, title, days });
    return { msg: "Tracker successfully created!", tracker: await this.trackers.readOne({ _id }) };
  }

  async getTrackers(owner: ObjectId) {
    return await this.trackers.readMany({ owner });
  }

  async getTrackersNames(owner: ObjectId) {
    return (await this.trackers.readMany({ owner })).map((tracker) => tracker.title);
  }

  async getCheckedDays(owner: ObjectId, title: String) {
    const tracker = await this.trackers.readOne({ owner, title });
    if (tracker) {
      return tracker.days;
    }
    throw new Error("Tracker could not be found!");
  }

  async shareTracker(owner: ObjectId, title: String, to: ObjectId) {
    const tracker = await this.trackers.readOne({ owner, title });
    if (tracker) {
      tracker.shared.push(to);
      return { msg: "Successfully shared tracker!" };
    }
    throw new Error("Tracker could not be found!");
  }

  async unshareTracker(owner: ObjectId, title: String, from: ObjectId) {
    let tracker = await this.trackers.readOne({ owner, title });
    if (tracker) {
      tracker.shared = tracker.shared.filter((id) => id !== from);
      return { msg: "Successfully unshared tracker." };
    }
    throw new Error("Tracker could not be found!");
  }

  async checkDay(owner: ObjectId, title: String, idx: number) {
    const tracker = await this.trackers.readOne({ owner, title });
    if (tracker) {
      tracker.days[idx] = true;
      return { msg: "Successfully checked in today!" };
    }
    throw new Error("Tracker could not be found!");
  }

  async uncheckDay(owner: ObjectId, title: String, idx: number) {
    const tracker = await this.trackers.readOne({ owner, title });
    if (tracker) {
      tracker.days[idx] = true;
      return { msg: "Successfully unchecked today's progress." };
    }
    throw new Error("Tracker could not be found!");
  }

  async getTotalCheckedDays(owner: ObjectId, title: String) {
    const tracker = await this.trackers.readOne({ owner, title });
    if (tracker) {
      return tracker.days.filter((day) => day === true).length;
    }
    throw new Error("Tracker could not be found!");
  }

  async getTrackerByName(owner: ObjectId, title: String) {
    return await this.trackers.readOne({ owner, title });
  }
}
