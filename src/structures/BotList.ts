/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { WanderersClient } from "./Client";
import fetch from "node-fetch";
import { Webhook } from "@top-gg/sdk";
import express from "express";
import { WanderersEmbed } from "./Embeds";
import { TextChannel } from "discord.js";

export class WanderersBotListManager {
  client: WanderersClient

  constructor(client: WanderersClient) {
    this.client = client
    this.loadDBL()
  }

  loadDBL() {
    if (this.client.config.state == "release") {
      const webhook = new Webhook(process.env.TOPGG_SECRET)
  
      this.client.app.post('/scp', webhook.listener(async vote => {
        await this.vote(vote.user)
      }))
    }
  }
  
  postStats() {
    if (this.client.config.state == "dev") return // Cancel the function when the mode dev is enable
    fetch(`https://top.gg/api/bots/568437925453234176/stats`, {
      method: 'POST',
      headers: {
        'Authorization': `${process.env.TOPGG_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ server_count: this.client.guilds.cache.size })
    }).then(() => this.client.log("Server Count posted @ top.gg")).catch((e: any) => this.client.error(e))
    fetch(`https://discord.bots.gg/api/v1/bots/568437925453234176/stats`, {
      method: 'POST',
      headers: {
        'Authorization': `${process.env.BOTGG_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ guildCount: this.client.guilds.cache.size })
    }).then(() => this.client.log("Server Count posted @ discord.bots.gg")).catch((e: any) => this.client.error(e))
    fetch(`https://discordbotlist.com/api/v1/bots/568437925453234176/stats`, {
      method: 'POST',
      headers: {
        'Authorization': `${process.env.DISCORDBOTLIST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ guilds: this.client.guilds.cache.size, users: this.client.users.cache.size })
    }).then(() => this.client.log("Server Count posted @ discordbotlist.com")).catch((e: any) => this.client.error(e))
  }
  
  async vote(id: string) {
    const embed = new WanderersEmbed()
    let user = null
    try {
      user = await this.client.users.fetch(id)
    } catch (e: any) {
      user = { username: "Not Found", discriminator: "1337", id }
      this.client.error(e)
    }
    embed.setTitle("🗳 — Nouveau vote — 🗳").setDescription(`**Utilisateur** : ${user.username}#${user.discriminator}\n**ID** : ${id}`).setURL("https://top.gg/bot/568437925453234176/vote");
    (this.client.channels.cache.get("690289835063377971") as unknown as TextChannel | undefined)?.send({ embeds: [embed] })
  }
}