import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";

import { NotAllowedError, NotFoundError } from "./errors";

export interface TrackerDoc extends BaseDoc {
  owner: ObjectId;
  shared: Array<ObjectId>;
  title: String;
  days: Array<Boolean>;
}

/**
 * concept: Trackering
 */
export default class TrackeringConcept {
  public readonly trackers: DocCollection<TrackerDoc>;

  /**
   * Make an instance of Trackering.
   */
  constructor(collectionName: string) {
    this.trackers = new DocCollection<TrackerDoc>(collectionName);
  }

  async makeTracker(owner: ObjectId, title: String) {
    const shared = new Array<ObjectId>();
    const days = new Array<Boolean>(360).fill(false); // only tracks the past year of data
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
      if (tracker.owner !== owner) {
        throw new NotAllowedError("Only owners of a tracker may share it.");
      }
      const id = tracker._id;
      const shared = [...tracker.shared, to];
      await this.trackers.partialUpdateOne({ id }, { shared });
      return { msg: "Successfully shared tracker!" };
    }
    throw new Error("Tracker could not be found!");
  }

  async unshareTracker(owner: ObjectId, title: String, from: ObjectId) {
    let tracker = await this.trackers.readOne({ owner, title });
    if (tracker) {
      if (tracker.owner !== owner) {
        throw new NotAllowedError("Only owners of a tracker may unshare it.");
      }
      const id = tracker._id;
      const shared = tracker.shared.filter((id) => id !== from);
      await this.trackers.partialUpdateOne({ id }, { shared });
      return { msg: "Successfully unshared tracker." };
    }
    throw new Error("Tracker could not be found!");
  }

  async checkDay(owner: ObjectId, title: String, idx: number) {
    const tracker = await this.trackers.readOne({ owner, title });
    if (tracker) {
      if (tracker.owner !== owner) {
        throw new NotAllowedError("Only owners of a tracker may check it.");
      }
      const days = tracker.days;
      days[idx] = true;
      const id = tracker._id;
      await this.trackers.partialUpdateOne({ id }, { days });
      return { msg: "Successfully checked in!" };
    }
    throw new Error("Tracker could not be found!");
  }

  async uncheckDay(owner: ObjectId, title: String, idx: number) {
    const tracker = await this.trackers.readOne({ owner, title });
    if (tracker) {
      if (tracker.owner !== owner) {
        throw new NotAllowedError("Only owners of a tracker may uncheck it.");
      }
      const days = tracker.days;
      days[idx] = false;
      const id = tracker._id;
      await this.trackers.partialUpdateOne({ id }, { days });
      return { msg: "Successfully unchecked progress." };
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

  async getTrackerById(id: ObjectId) {
    return await this.trackers.readOne({ id });
  }

  async deleteTracker(owner: ObjectId, title: String) {
    const tracker = await this.trackers.readOne({ owner, title });
    if (tracker) {
      if (tracker.owner !== owner) {
        throw new NotAllowedError("Only owners of a tracker may delete it.");
      }
      const id = tracker._id;
      await this.trackers.deleteOne({ id });
      return { msg: `Tracker "${title}" deleted!` };
    }
    throw new NotFoundError("Tracker could not be found!");
  }

  async getSharedTrackers(user: ObjectId) {
    const trackers = await this.trackers.readMany({ shared: { $in: [user] } });
    return trackers.map((tracker) => tracker._id);
  }
}
