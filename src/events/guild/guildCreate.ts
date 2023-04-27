/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { Guild, TextChannel } from "discord.js"
import { WanderersClient } from "../../structures/Client"
import { WanderersEmbed } from "../../structures/Embeds"

export default async (client: WanderersClient, guild: Guild) => {
	if (!guild.available) return

	// Check si la guild est dans la db
	if (!(await client.mongoose.getGuild(guild.id))) {
		let dlocale = guild.preferredLocale
		let lg = Object.values(client.lang).find(l => l.shortcut == dlocale || l.dlocale == dlocale)?.shortcut || "en"
		const createGuildUser = new client.mongoose.Guild({ guildID: guild.id, defaultBranch: lg })
		await createGuildUser.save().then(g => {
			client.log(`Registration : ${g.guildID}`, "data")
			guild.db = g
		})
	}

	if (client.config.state == "dev") return

	await client.botlists.postStats()

	let channel: TextChannel | undefined = client.channels.cache.get("690289835063377971") as any
	let user = null
	try {
		user = await client.users.fetch(guild.ownerId)
	} catch (e: any) {
		user = { username: "Not Found", discriminator: "1337", id: guild.ownerId }
		client.error(e)
	}
	let embed = new WanderersEmbed().setTitle("📥 — J'ai rejoint un nouveau serveur — 📥").setDescription(`**Nom** : ${guild.name}\n**ID** : ${guild.id}\n**Propriétaire** : ${user.username}#${user.discriminator} (${user.id})\n**Nombre de serveur** : ${client.guilds.cache.size}`)
	await channel?.send({ embeds: [embed] })
	client.setStatus()
}