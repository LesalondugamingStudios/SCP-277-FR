/*
 * Copyright (C) 2023-2025  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { ApplicationIntegrationType, InteractionContextType, SlashCommandBuilder } from "discord.js"
import { ChatCommand, ContextInteraction, WanderersClient } from "../../structures"

export default new ChatCommand({
	command: new SlashCommandBuilder()
		.setName("deploy")
		.setDescription("N/A")
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.Guild])
		.addSubcommand(s => s
			.setName("commands")
			.setDescription("Redéploie toutes les commandes")
		)
		.addSubcommand(s => s
			.setName("names")
			.setDescription("Met à jour manuellement les noms des SCP et des Entrées")
		)
		.toJSON(),
	category: "Administation",
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