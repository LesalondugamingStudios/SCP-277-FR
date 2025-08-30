/*
 * Copyright (C) 2023-2025  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { ContextMenuCommandBuilder, ApplicationCommandType, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction, ApplicationIntegrationType, InteractionContextType } from "discord.js"
import { ContextCommand, WanderersClient } from "../../structures"

export default new ContextCommand({
	command: new ContextMenuCommandBuilder()
		.setName("Delete message")
		.setType(ApplicationCommandType.Message)
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
		.setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
		.toJSON(),
	async ctxMenuExec(client: WanderersClient, interaction: UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction) {
		interaction as MessageContextMenuCommandInteraction
		
		const message = await interaction.channel?.messages.fetch(interaction.targetId)
		if(!message) return interaction.reply({ content: `**:x: | ${interaction.translate("divers:clean.not_a_report")}**`, ephemeral: true })
		if(message.author.id != client.user?.id) return interaction.reply({ content: `**:x: | ${interaction.translate("divers:clean.not_a_report")}**`, ephemeral: true })

		if(message.interactionMetadata) {
			if(message.interactionMetadata.user.id != interaction.user.id) return interaction.reply({ content: `**:x: | ${interaction.translate("divers:clean.user_error")}**`, ephemeral: true })
		} else {
			let reply = await message.fetchReference()
			if(reply.author.id != interaction.user.id) return interaction.reply({ content: `**:x: | ${interaction.translate("divers:clean.user_error")}**`, ephemeral: true })
		}
		
		await message.delete()
		await interaction.reply({ content: `**:white_check_mark: | ${interaction.translate("divers:clean.done")}**`, ephemeral: true })
	}
})