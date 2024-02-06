/*
 * Copyright (C) 2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { ChannelType, Client, ShardClientUtil, ShardingManager } from "discord.js"
import { WanderersEmbed } from "../structures"
import { GuildInfos } from "../types/shard"

export async function getServerLength(manager: ShardingManager | ShardClientUtil) {
  return (await manager.fetchClientValues("guilds.cache.size") as number[]).reduce((current: number, acc: number) => current + acc, 0)
}

export async function announce(manager: ShardingManager | ShardClientUtil, type: "joined_guild" | "left_guild", data: GuildInfos) {
  let embed = new WanderersEmbed()
  let servers = await getServerLength(manager)

  if(type == "joined_guild") embed
    .setTitle("📥 — J'ai rejoint un nouveau serveur — 📥")
    .setDescription(`**Nom** : ${data.guildName}\n**ID** : ${data.guildId}\n**Nombre de serveur** : ${servers}`)
  else embed
    .setTitle("📤 — J'ai été retiré un serveur — 📤")
    .setDescription(`**Nom** : ${data.guildName}\n**ID** : ${data.guildId}\n**Nombre de serveur** : ${servers}`)
  
  manager.broadcastEval(async (client: Client, context: any) => {
    let channel = client.channels.cache.get("690289835063377971")
    if(channel && channel.type == ChannelType.GuildText) {
      channel.send({ embeds: [context] })
      return true
    }
    return false
  }, { context: embed.toJSON() })
}