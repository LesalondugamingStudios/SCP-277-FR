/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js"
import { Command, ContextInteraction, WanderersClient, WanderersEmbed } from "../../structures"
import { Branches, Lang, SavedGuild } from "../../types"
import langs from "../../util/language.json"

let lang: Lang[] = []
for (let i in langs) {
	lang.push(langs[i as Branches] as any)
}

export default new Command({
	name: "settings",
	description: "Sets the server settings.",
	category: "Divers",
	memberPermissions: [PermissionFlagsBits.Administrator],
	memberPermissionsString: ["Administrator"],
	__type: "sub",
	options: [{
		type: ApplicationCommandOptionType.Subcommand,
		name: "view",
		description: "The overview of the selected settings."
	}, {
		type: ApplicationCommandOptionType.Subcommand,
		name: "branch",
		description: "Sets the language used for reports.",
		options: [{
			type: ApplicationCommandOptionType.String,
			name: "language",
			description: "The language",
			required: true,
			choices: lang.slice(0, lang.length - 2).map(l => {
				return { name: l.name, value: l.shortcut }
			})
		}]
	}, {
		type: ApplicationCommandOptionType.Subcommand,
		name: "deletereport",
		description: "Sets if the bot automatically delete reports after they are closed.",
		options: [{
			type: ApplicationCommandOptionType.Boolean,
			name: "value",
			description: "The selected value",
			required: true
		}]
	}, {
		type: ApplicationCommandOptionType.Subcommand,
		name: "scpdetection",
		description: "Sets if the bot detects the SCP mentioned in the messages sent in the server.",
		options: [{
			type: ApplicationCommandOptionType.Boolean,
			name: "value",
			description: "The selected value",
			required: true
		}]
	}, {
		type: ApplicationCommandOptionType.Subcommand,
		name: "messagecommand",
		description: "Sets if the bot reply to prefix commands (example: scp/help).",
		options: [{
			type: ApplicationCommandOptionType.Boolean,
			name: "value",
			description: "The selected value",
			required: true
		}]
	}],
	async execute(client: WanderersClient, ctx: ContextInteraction) {
		if(!ctx.guild) return

		const command = ctx.options.getSubcommand(true)
		if (command == "branch") {
			const lg = ctx.options.getString("language", true) as unknown as Branches
			try {
				await client.mongoose.Guild.updateOne({ guildID: ctx.guild.id }, { defaultBranch: lg })
			} catch (e: any) {
				client.error(e)
				return ctx.reply({ content: ctx.translate("misc:error") })
			}
			ctx.guild.db = await client.mongoose.getGuild(ctx.guild.id) as SavedGuild
			return ctx.reply({ content: `**:white_check_mark: | ${ctx.translate("divers:settings.branch.selected", { branch: client.lang[lg].name })}**\n\n**ℹ️ | ${client.lang[lg].i18n ? `${ctx.translate("divers:settings.branch.includes_translations")} ${ctx.translate("divers:settings.branch.translation_error", { link: "https://crowdin.com/project/scp-277-fr" })}` : ctx.translate("divers:settings.branch.no_translations", { link: "https://crowdin.com/project/scp-277-fr" })}**` })
		} else if (command == "deletereport") {
			const value = ctx.options.getBoolean("value", true)
			if (value == ctx.guild.db?.deleteReport) return ctx.reply({ content: ctx.translate("divers:settings.global_select.same_value"), ephemeral: true })
			try {
				await client.mongoose.Guild.updateOne({ guildID: ctx.guild.id }, { deleteReport: value })
			} catch (e: any) {
				client.error(e)
				return ctx.reply({ content: ctx.translate("misc:error") })
			}
			ctx.guild.db = await client.mongoose.getGuild(ctx.guild.id) as SavedGuild
			return ctx.reply({ content: `**:white_check_mark: | ${ctx.translate("divers:settings.global_select.set", { value })}**` })
		} else if (command == "scpdetection") {
			const value = ctx.options.getBoolean("value", true)
			if (value == ctx.guild.db?.scpDetection) return ctx.reply({ content: ctx.translate("divers:settings.global_select.same_value"), ephemeral: true })
			try {
				await client.mongoose.Guild.updateOne({ guildID: ctx.guild.id }, { scpDetection: value })
			} catch (e: any) {
				client.error(e)
				return ctx.reply({ content: ctx.translate("misc:error") })
			}
			ctx.guild.db = await client.mongoose.getGuild(ctx.guild.id) as SavedGuild
			return ctx.reply({ content: `**:white_check_mark: | ${ctx.translate("divers:settings.global_select.set", { value })}**` })
		} else if(command == "messagecommand"){
			const value = ctx.options.getBoolean("value", true)
			if (value == ctx.guild.db?.messageCommand) return ctx.reply({ content: ctx.translate("divers:settings.global_select.same_value"), ephemeral: true })
			try {
				await client.mongoose.Guild.updateOne({ guildID: ctx.guild.id }, { messageCommand: value })
			} catch (e: any) {
				client.error(e)
				return ctx.reply({ content: ctx.translate("misc:error") })
			}
			ctx.guild.db = await client.mongoose.getGuild(ctx.guild.id) as SavedGuild
			return ctx.reply({ content: `**:white_check_mark: | ${ctx.translate("divers:settings.global_select.set", { value })}**` })
		} else if (command == "view") {
			const embed = new WanderersEmbed().setDefault({ user: ctx.user, translatable: ctx })

			return ctx.reply({
				embeds: [embed
					.setTitle(ctx.translate("divers:settings.view.title"))
					.setDescription(`**${ctx.translate("divers:settings.view.branch")} :** ${client.lang[ctx.guild.db?.defaultBranch ?? "en"].name}
**${ctx.translate("divers:settings.view.deletereport")} :** ${ctx.guild.db?.deleteReport ? ctx.translate("misc:states.enabled").capitalize() : ctx.translate("misc:states.disabled").capitalize()}
**${ctx.translate("divers:settings.view.scpdetection")} :** ${ctx.guild.db?.scpDetection ? ctx.translate("misc:states.enabled").capitalize() : ctx.translate("misc:states.disabled").capitalize()}
**${ctx.translate("divers:settings.view.messagecommand")} :** ${ctx.guild.db?.messageCommand ? ctx.translate("misc:states.enabled").capitalize() : ctx.translate("misc:states.disabled").capitalize()}`)
				], ephemeral: true
			})
		}
	}
})