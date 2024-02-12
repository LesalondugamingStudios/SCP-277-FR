/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { AutocompleteInteraction, ButtonInteraction, ChatInputCommandInteraction, InteractionType, MessageContextMenuCommandInteraction } from "discord.js"
import { WanderersClient, ContextInteraction } from "../../structures"
import { error, log } from "../../util/logging"

export default async (client: WanderersClient, interaction: AutocompleteInteraction | ButtonInteraction | ChatInputCommandInteraction | MessageContextMenuCommandInteraction) => {

	// Gère les AutoComplete en premier
	if(interaction.type == InteractionType.ApplicationCommandAutocomplete) {
		let command = client.commands.get(interaction.commandName)
		if(command) try {
			if(command.autocomplete) command.autocomplete(client, interaction)
		} catch (e: any) {
			error(e)
		}
		return
	}

	if (!interaction.guildId) return
	if (!interaction.guild) await client.guilds.fetch(interaction.guildId)
	if (!interaction.guild) return;

	// Check si le serveur où est fait la commande est dans la DB
	if (!(await client.m.mongoose.getGuild(interaction.guild.id))) {
		let dlocale = interaction.guild.preferredLocale
		let lg = Object.values(client.m.lang).find(l => l.shortcut == dlocale || l.dlocale == dlocale)?.shortcut || "en"
		const createGuildUser = new client.m.mongoose.Guild({ guildID: interaction.guild.id, defaultBranch: lg })
		await createGuildUser.save().then(g => {
			log(`Registration : ${g.guildID}`, "data")
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
			} catch (e: any) {
				error(e)
				let m = { content: `**:x: | ${interaction.translate("misc:error")}**`, ephemeral: true }
				if(interaction.replied) await interaction.editReply(m)
				else await interaction.reply(m)
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
		} catch (e: any) {
			error(e)
			let m = { content: `**:x: | ${interaction.translate("misc:error")}**`, ephemeral: true }
			if(interaction.replied) await interaction.editReply(m)
			else await interaction.reply(m)
		}
		return
	} 
	
	if (interaction.isMessageContextMenuCommand()) {
		try {
			await command.execute(client, interaction)
		} catch (e: any) {
			error(e)
			let m = { content: `**:x: | ${interaction.translate("misc:error")}**`, ephemeral: true }
			if(interaction.replied) await interaction.editReply(m)
			else await interaction.reply(m)
		}
		return
	}
}
