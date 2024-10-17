import AuthenticatingConcept from "./concepts/authenticating";
import CollectioningConcept from "./concepts/collectioning";
import FriendingConcept from "./concepts/friending";
import LevelingConcept from "./concepts/leveling";
import PostingConcept from "./concepts/posting";
import SessioningConcept from "./concepts/sessioning";
import SummarizingConcept from "./concepts/summarizing";
import TrackeringConcept from "./concepts/trackering";

// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
export const Posting = new PostingConcept("posts");
export const Friending = new FriendingConcept("friends");

export enum Category {
  Root = "Root",
  Lifestyle = "Lifestyle",
  HealthAndFitness = "HealthAndFitness",
  Entertainment = "Entertainment",
  FoodAndCooking = "FoodAndCooking",
  FashionAndBeauty = "FashionAndBeauty",
  EducationAndDIY = "EducationAndDIY",
}
export const IndexToCategory: { [key: number]: string } = {
  0: "Lifestyle",
  1: "HealthAndFitness",
  2: "Entertainment",
  3: "FoodAndCooking",
  4: "FashionAndBeauty",
  5: "EducationAndDIY",
};
export const Lifestyle = new CollectioningConcept("lifestyle"); // default collection
export const HealthAndFitness = new CollectioningConcept("health"); // default collection
export const Entertainment = new CollectioningConcept("entertainment"); // default collection
export const FoodAndCooking = new CollectioningConcept("food"); // default collection
export const FashionAndBeauty = new CollectioningConcept("fashion"); // default collection
export const EducationAndDIY = new CollectioningConcept("education"); // default collection

export const Collectioning = new CollectioningConcept("collections");
export const Trackering = new TrackeringConcept("trackers");
export const Summarizing = new SummarizingConcept("summaries");
export const Leveling = new LevelingConcept("levels");
