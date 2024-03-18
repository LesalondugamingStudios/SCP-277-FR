/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { Guild } from "discord.js"
import { WanderersClient } from "../../structures/Client"
import { log } from "../../util/logging"
import { announce } from "../../util/broadcastFunctions"

export default async (client: WanderersClient, guild: Guild) => {
	if (!guild.available) return

	// Check si la guild est dans la db
	if (!(await client.m.mongoose.getGuild(guild.id))) {
		let dlocale = guild.preferredLocale
		let lg = Object.values(client.m.lang).find(l => l.shortcut == dlocale || l.dlocale == dlocale)?.shortcut || "en"
		const createGuildUser = new client.m.mongoose.Guild({ guildID: guild.id, defaultBranch: lg })
		await createGuildUser.save().then(g => {
			log(`Registration : ${g.guildID}`, "data")
			guild.db = g
		})
	}

	if (client.config.state == "dev") return
	announce(client.shard!, "joined_guild", { guildId: guild.id, guildName: guild.name })
}