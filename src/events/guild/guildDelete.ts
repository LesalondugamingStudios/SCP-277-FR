/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { Guild, TextChannel } from "discord.js"
import { WanderersClient } from "../../structures/Client"
import { WanderersEmbed } from "../../structures/Embeds"

module.exports = async (client: WanderersClient, guild: Guild) => {
	if (!guild.available) return

	client.botlists.postStats()

	if (client.config.state == "dev") return

	let channel: TextChannel | undefined = client.channels.cache.get("690289835063377971") as any
	let user
	try {
		user = await client.users.fetch(guild.ownerId)
	} catch (e: any) {
		user = { username: "Not Found", discriminator: "1337", id: guild.ownerId }
		client.error(e)
	}
	let embed = new WanderersEmbed().setTitle("📤 — J'ai été retiré un serveur — 📤").setDescription(`**Nom** : ${guild.name}\n**ID** : ${guild.id}\n**Propriétaire** : ${user.username}#${user.discriminator} (${user.id})\n**Nombre de serveur** : ${client.guilds.cache.size}`)
	await channel?.send({ embeds: [embed] })
	client.setStatus()
}