/*
 * Copyright (C) 2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import "dotenv/config";
import { Shard, ShardingManager } from "discord.js";
import { log } from "./util/logging";
import { config } from "./config";
import site from "./site";
import { WanderersBotListManager, WanderersMain } from "./structures";
import { join } from "path";

const manager = new ShardingManager(join(__dirname, "bot.js"), { token: config.getToken() });

manager.on('shardCreate', (shard: Shard) => {
  shard.on("ready", () => log("Shard", "loaded", shard.id))
});

manager.spawn().then(() => {
  const main = new WanderersMain()
  main.init().then(async () => {
    await import("./util/prototypes.js")
    const app = site(main)
    const botlist = new WanderersBotListManager(main, manager)
    app.listen(5000, () => log("Express App", "loaded"))

    setTimeout(() => botlist.postStats(), 60000)
    setInterval(() => botlist.postStats(), 3600000)
  })
})