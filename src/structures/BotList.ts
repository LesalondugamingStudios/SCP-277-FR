/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import fetch from "node-fetch";
import { Webhook } from "@top-gg/sdk";
import { WanderersEmbed } from "./Embeds";
import { ChannelType, Client, ShardingManager, TextChannel, User } from "discord.js";
import { error, log } from "../util/logging";
import { Application } from "express";
import { WanderersMain } from ".";
import { getServerLength } from "../util/broadcastFunctions";

export class WanderersBotListManager {
  m: WanderersMain
  shards: ShardingManager

  constructor(m: WanderersMain, shards: ShardingManager) {
    this.m = m
    this.shards = shards
  }

  loadDBL(app: Application) {
    if (this.m.config.state == "release") {
      const webhook = new Webhook(process.env.TOPGG_SECRET)
  
      app.post('/scp', webhook.listener(async vote => {
        this.shards.broadcastEval(async (client: Client, context: any) => {
          let channel = client.channels.cache.get("690289835063377971")
          if(channel && channel.type == ChannelType.GuildText) {
            const user = await client.users.fetch(context.userId)
            if(!user) return false;
            
            let e = new WanderersEmbed().setTitle("🗳 — Nouveau vote — 🗳").setDescription(`**Utilisateur** : ${user.username}#${user.discriminator}\n**ID** : ${user.id}`).setURL("https://top.gg/bot/568437925453234176/vote")
            channel.send({ embeds: [e] })
            return true
          }
          return false
        }, { context: { userId: vote.user } })
      }))
    }
  }
  
  async postStats() {
    let shards = this.shards.shards.size
    let guilds = await getServerLength(this.shards)
    this.RESTPostStats(guilds, shards)
  }

  RESTPostStats(guilds: number, shards: number) {
    if (this.m.config.state == "dev") return // Cancel the function when the mode dev is enable
    fetch(`https://top.gg/api/bots/568437925453234176/stats`, {
      method: 'POST',
      headers: {
        'Authorization': `${process.env.TOPGG_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ server_count: guilds, shard_count: shards })
    }).then(() => log("Server Count posted @ top.gg")).catch((e: any) => error(e))
    fetch(`https://discord.bots.gg/api/v1/bots/568437925453234176/stats`, {
      method: 'POST',
      headers: {
        'Authorization': `${process.env.BOTGG_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ guildCount: guilds, shardCount: shards })
    }).then(() => log("Server Count posted @ discord.bots.gg")).catch((e: any) => error(e))
    fetch(`https://discordbotlist.com/api/v1/bots/568437925453234176/stats`, {
      method: 'POST',
      headers: {
        'Authorization': `${process.env.DISCORDBOTLIST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ guilds })
    }).then(() => log("Server Count posted @ discordbotlist.com")).catch((e: any) => error(e))
  }
}