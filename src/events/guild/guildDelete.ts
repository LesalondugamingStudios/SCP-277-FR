/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { Guild } from "discord.js"
import { WanderersClient } from "../../structures/Client"

export default async (client: WanderersClient, guild: Guild) => {
	if (!guild.available) return

	if (client.config.state == "dev") return
	client.shard?.send({ type: "joined_guild", data: { guildId: guild.id, guildName: guild.name } })
}