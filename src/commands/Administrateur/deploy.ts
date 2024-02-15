/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { ApplicationCommandOptionType } from "discord.js"
import { Command, ContextInteraction, WanderersClient } from "../../structures"

export default new Command({
	name: "deploy",
	description: "-",
	category: "Administation",
	options: [{
		type: ApplicationCommandOptionType.Subcommand,
		name: "commands",
		description: "Redéploie toutes les commandes",
	}, {
		type: ApplicationCommandOptionType.Subcommand,
		name: "names",
		description: "Met à jour manuellement les noms des SCP et des Entrées",
	}],
	isDevOnly: true,
	async execute(client: WanderersClient, ctx: ContextInteraction) {
		let cmd = ctx.options.getSubcommand(true)
		if(cmd == "commands") {
			client.deploy()
			ctx.reply({ content: "**:white_check_mark: | Déployé avec succès !**" })
		} else {
			await ctx.deferReply()
			await client.m.updateNames()
			await ctx.editReply({ content: "**:white_check_mark: | Les noms ont été mis à jour !**" })
		}
	}
})