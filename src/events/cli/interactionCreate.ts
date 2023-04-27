/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { AutocompleteInteraction, ButtonInteraction, ChatInputCommandInteraction, InteractionType, MessageContextMenuCommandInteraction } from "discord.js"
import { WanderersClient, ContextInteraction } from "../../structures"

export default async (client: WanderersClient, interaction: AutocompleteInteraction | ButtonInteraction | ChatInputCommandInteraction | MessageContextMenuCommandInteraction) => {

	// Gère les AutoComplete en premier
	if(interaction.type == InteractionType.ApplicationCommandAutocomplete) {
		let command = client.commands.get(interaction.commandName)
		if(command) try {
			if(command.autocomplete) command.autocomplete(client, interaction)
		} catch (error: any) {
			client.error(error)
		}
		return
	}

	if (!interaction.guildId) return
	if (!interaction.guild) await client.guilds.fetch(interaction.guildId)
	if (!interaction.guild) return;

	// Check si le serveur où est fait la commande est dans la DB
	if (!(await client.mongoose.getGuild(interaction.guild.id))) {
		let dlocale = interaction.guild.preferredLocale
		let lg = Object.values(client.lang).find(l => l.shortcut == dlocale || l.dlocale == dlocale)?.shortcut || "en"
		const createGuildUser = new client.mongoose.Guild({ guildID: interaction.guild.id, defaultBranch: lg })
		await createGuildUser.save().then(g => {
			client.log(`Registration : ${g.guildID}`, "data")
			// @ts-ignore
			if (interaction.guild != null) interaction.guild.db = g
		})
	}

	// Return si la commande est inconnue quand ce n'est pas un bouton
	if (interaction.isButton()) {
		let args = interaction.customId.split("_")
		let commandName = args.shift()
		if(!commandName) return
		
		let command = client.commands.get(commandName)
		if (command) {
			try {
				command.execute(client, interaction, args)
			} catch (error: any) {
				client.error(error)
				await interaction.reply({ content: `**:x: | ${interaction.translate("misc:error")}**`, ephemeral: true })
			}
		}

		return
	}

	// Get la commande dans la collection
	if (!client.commands.has(interaction.commandName)) return
	let command = client.commands.get(interaction.commandName)
	if(!command) return interaction.reply({ content: interaction.translate("misc:invalid.command") })

	if (interaction.isChatInputCommand()) {
		// Check si le bot n'est pas en maintenance
		if (command?.isDevOnly) {
			if (interaction.user.id !== "412166048666615808" && interaction.user.id !== "449907751225655299") return interaction.reply({ content: `**:x: | ${interaction.translate("misc:private")}**`, ephemeral: true })
		}

		// Execution de la commande
		let contextinteraction = new ContextInteraction(interaction, command)
		try {
			await command.execute(client, contextinteraction)
		} catch (error: any) {
			client.error(error)
			await interaction.reply({ content: `**:x: | ${interaction.translate("misc:error")}**`, ephemeral: true })
		}
		return
	} 
	
	if (interaction.isMessageContextMenuCommand()) {
		try {
			await command.execute(client, interaction)
		} catch (error: any) {
			client.error(error)
			await interaction.reply({ content: `**:x: | ${interaction.translate("misc:error")}**`, ephemeral: true })
		}
		return
	}
}
