/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { Guild } from "discord.js"
import { WanderersClient } from "../../structures/Client"
import { announce } from "../../util/broadcastFunctions"

export default async (client: WanderersClient, guild: Guild) => {
	if (!guild.available) return

	if (client.config.state == "dev") return
	announce(client.shard!, "left_guild", { guildId: guild.id, guildName: guild.name })
}