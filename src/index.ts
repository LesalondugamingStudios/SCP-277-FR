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
import { MessageType } from "./types/shard";
import { announce } from "./util/broadcastFunctions";
import { join } from "path";

const manager = new ShardingManager(join(__dirname, "bot.js"), { token: config.getToken() });

manager.on('shardCreate', (shard: Shard) => {
  shard.on("ready", () => {
    log(`Shard ${shard.id}`, "loaded")
    shard.send({ type: "shardId", data: shard.id })
  })

  shard.on("message", (message: MessageType) => {
    if(message.type == "joined_guild" || message.type == "left_guild") announce(manager, message.type, message.data)
  })
});

manager.spawn().then(() => {
  const main = new WanderersMain()
  main.init().then(async () => {
    await import("./util/prototypes.js")
    const app = site(main)
    const botlist = new WanderersBotListManager(main, manager)
    app.listen(5000, () => log("Express App", "loaded"))

    botlist.postStats()
    setInterval(botlist.postStats, 600000)
  })
})