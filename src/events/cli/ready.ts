/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { WanderersClient } from "../../structures/Client"
import { Command } from "../../structures/Command"

/**
 * @param {WanderersClient} client 
 */
export default async (client: WanderersClient) => {
	client.log(`Logged in as ${client.user?.tag ?? "je sais pas"}!`)

	let db = await client.mongoose.Guild.find({})

	for (let i = 0; i < db.length; i++) {
		let guild = client.guilds.cache.get(db[i].guildID)
		// @ts-ignore
		if (guild) guild.db = db[i]
	}

	client.botlists.postStats()
	client.setStatus()

	if (!client.application?.owner) await client.application?.fetch();
	let array: Command[] = []
	client.commands.filter(c => !c.isDevOnly && !c.__local).each(c => array.push(c))
	let commands = await client.application?.commands.fetch()
	

	if (commands?.size != array.length) return client.deploy()
	for (const commandLocal of array) {
		let commandOnline = commands.find(c => c.name === commandLocal.name)
		if (!commandOnline) {
			client.deploy()
			break
		} else if (commandOnline.name != commandLocal.name) {
			client.deploy()
			break
		} else if (commandOnline.description != commandLocal.description) {
			client.deploy()
			break
		} else if (Array.isArray(commandOnline.options) && Array.isArray(commandLocal.options) && (commandOnline.options.length != commandLocal.options.length)) {
			client.deploy()
			break
		}
	}

	client.on("error", e => client.error(e))
	client.on("warn", warn => client.log(warn, "warn"))
	process.on('uncaughtException', e => client.error(e))
}
