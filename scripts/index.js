import ActorHitdice from "./actor-hitdice.js";

Hooks.on("init", () => {
  game["actor-hitdice"] = new ActorHitdice();
});
