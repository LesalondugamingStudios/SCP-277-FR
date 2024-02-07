/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { WanderersClient } from "../../structures/Client"
import { error, log } from "../../util/logging"

/**
 * @param {WanderersClient} client 
 */
export default async (client: WanderersClient) => {
	log(`Logged in as ${client.user?.tag ?? "je sais pas"}!`, "loaded", client.shardId)

	client.guilds.cache.each(async (guild) => {
		let db = await client.m.mongoose.Guild.findOne({ guildID: guild.id })
		if(db) guild.db = db
	})

	client.setStatus()

	client.on("error", e => error(e, client.shardId))
	client.on("warn", warn => log(warn, "warn", client.shardId))
	process.on('uncaughtException', e => error(e, client.shardId))
}
