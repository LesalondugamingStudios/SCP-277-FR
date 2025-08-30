/*
 * Copyright (C) 2023-2025  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import { ChatCommand, ContextInteraction, WanderersClient, WanderersEmbed } from "../../structures"
import { Branches, Lang, SavedGuild } from "../../types"
import langs from "../../util/language.json" with {type: "json"}
import { error } from "../../util/logging"

let lang: Lang[] = []
for (let i in langs) {
	lang.push(langs[i as Branches] as any)
}

export default new ChatCommand({
	command: new SlashCommandBuilder()
		.setName("settings")
		.setDescription("Manage the server settings.")
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.Guild])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.addSubcommand(s => s
			.setName("view")
			.setDescription("The overview of the selected settings.")
		)
		.addSubcommand(s => s
			.setName("branch")
			.setDescription("Sets the default language used for reports.")
			.addStringOption(o => o
				.setName("language")
				.setDescription("Sets the language used for reports.")
				.setRequired(true)
				.setChoices(lang.slice(0, lang.length - 2).map(l => {
					return { name: l.name, value: l.shortcut }
				}))
			)
		)
		.addSubcommand(s => s
			.setName("deletereport")
			.setDescription("Sets if the bot automatically delete reports after they are closed.")
			.addBooleanOption(o => o
				.setName("value")
				.setDescription("The selected value")
				.setRequired(true)
			)
		)
		.addSubcommand(s => s
			.setName("scpdetection")
			.setDescription("Sets if the bot detects the SCP mentioned in the messages sent in the server.")
			.addBooleanOption(o => o
				.setName("value")
				.setDescription("The selected value")
				.setRequired(true)
			)
		)
		.addSubcommand(s => s
			.setName("messagecommand")
			.setDescription("Sets if the bot reply to prefix commands (example: scp/help).")
			.addBooleanOption(o => o
				.setName("value")
				.setDescription("The selected value")
				.setRequired(true)
			)
		)
		.toJSON(),
	category: "Divers",
	memberPermissions: [PermissionFlagsBits.ManageGuild],
	memberPermissionsString: ["Manage Guild"],
	__type: "sub",
	async execute(client: WanderersClient, ctx: ContextInteraction) {
		if(!ctx.guild) return

		const command = ctx.options.getSubcommand(true)
		if (command == "branch") {
			const lg = ctx.options.getString("language", true) as unknown as Branches
			try {
				await client.m.mongoose.Guild.updateOne({ guildID: ctx.guild.id }, { defaultBranch: lg })
			} catch (e: any) {
				error(e)
				return ctx.reply({ content: ctx.translate("misc:error") })
			}
			ctx.guild.db = await client.m.mongoose.getGuild(ctx.guild.id) as SavedGuild
			return ctx.reply({ content: `**:white_check_mark: | ${ctx.translate("divers:settings.branch.selected", { branch: client.m.lang[lg].name })}**\n\n**ℹ️ | ${client.m.lang[lg].i18n ? `${ctx.translate("divers:settings.branch.includes_translations")} ${ctx.translate("divers:settings.branch.translation_error", { link: "https://crowdin.com/project/scp-277-fr" })}` : ctx.translate("divers:settings.branch.no_translations", { link: "https://crowdin.com/project/scp-277-fr" })}**` })
		} else if (command == "deletereport") {
			const value = ctx.options.getBoolean("value", true)
			if (value == ctx.guild.db?.deleteReport) return ctx.reply({ content: ctx.translate("divers:settings.global_select.same_value"), ephemeral: true })
			try {
				await client.m.mongoose.Guild.updateOne({ guildID: ctx.guild.id }, { deleteReport: value })
			} catch (e: any) {
				error(e)
				return ctx.reply({ content: ctx.translate("misc:error") })
			}
			ctx.guild.db = await client.m.mongoose.getGuild(ctx.guild.id) as SavedGuild
			return ctx.reply({ content: `**:white_check_mark: | ${ctx.translate("divers:settings.global_select.set", { value })}**` })
		} else if (command == "scpdetection") {
			const value = ctx.options.getBoolean("value", true)
			if (value == ctx.guild.db?.scpDetection) return ctx.reply({ content: ctx.translate("divers:settings.global_select.same_value"), ephemeral: true })
			try {
				await client.m.mongoose.Guild.updateOne({ guildID: ctx.guild.id }, { scpDetection: value })
			} catch (e: any) {
				error(e)
				return ctx.reply({ content: ctx.translate("misc:error") })
			}
			ctx.guild.db = await client.m.mongoose.getGuild(ctx.guild.id) as SavedGuild
			return ctx.reply({ content: `**:white_check_mark: | ${ctx.translate("divers:settings.global_select.set", { value })}**` })
		} else if(command == "messagecommand"){
			const value = ctx.options.getBoolean("value", true)
			if (value == ctx.guild.db?.messageCommand) return ctx.reply({ content: ctx.translate("divers:settings.global_select.same_value"), ephemeral: true })
			try {
				await client.m.mongoose.Guild.updateOne({ guildID: ctx.guild.id }, { messageCommand: value })
			} catch (e: any) {
				error(e)
				return ctx.reply({ content: ctx.translate("misc:error") })
			}
			ctx.guild.db = await client.m.mongoose.getGuild(ctx.guild.id) as SavedGuild
			return ctx.reply({ content: `**:white_check_mark: | ${ctx.translate("divers:settings.global_select.set", { value })}**` })
		} else if (command == "view") {
			const embed = new WanderersEmbed().setDefault({ user: ctx.user, translatable: ctx })

			return ctx.reply({
				embeds: [embed
					.setTitle(ctx.translate("divers:settings.view.title"))
					.addFields(
						{ name: ctx.translate("divers:settings.view.branch"), value: client.m.lang[ctx.guild.db?.defaultBranch ?? "en"].name },
						{ name: ctx.translate("divers:settings.view.deletereport"), value: `${ctx.guild.db?.deleteReport ? ctx.translate("misc:states.enabled").capitalize() : ctx.translate("misc:states.disabled").capitalize()}` },
						{ name: ctx.translate("divers:settings.view.scpdetection"), value: `${ctx.guild.db?.scpDetection ? ctx.translate("misc:states.enabled").capitalize() : ctx.translate("misc:states.disabled").capitalize()}` },
						{ name: ctx.translate("divers:settings.view.messagecommand"), value: `${ctx.guild.db?.messageCommand ? ctx.translate("misc:states.enabled").capitalize() : ctx.translate("misc:states.disabled").capitalize()}` }
					)
				], ephemeral: true
			})
		}
	}
})