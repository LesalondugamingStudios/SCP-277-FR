/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { Guild } from "discord.js"
import { WanderersClient } from "../../structures/Client"
import { log } from "../../util/logging"

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

	client.setStatus()

	if (client.config.state == "dev") return
	client.shard?.send({ type: "joined_guild", data: { guildId: guild.id, guildName: guild.name } })
}