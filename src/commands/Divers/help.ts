/*
 * Copyright (C) 2023-2025  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { APIApplicationCommandSubcommandOption, AutocompleteInteraction, SlashCommandBuilder } from "discord.js";
import { readdirSync } from "fs";
import { ChatCommand, ContextInteraction, WanderersClient, WanderersEmbed } from "../../structures";
import { join } from "path";

const categoryList = readdirSync(join(import.meta.dirname, ".."));
const catNumber: Record<string, number> = { "Divers": 0, "SCP": 1, "Backrooms": 2 }

export default new ChatCommand({
	command: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Returns a list of commands or information about a specific one.")
		.addStringOption(o => o
			.setName("command")
			.setDescription("The name of the command")
			.setAutocomplete(true)
		)
		.toJSON(),
	category: "Divers",
	async execute(client: WanderersClient, ctx: ContextInteraction) {
		const args = ctx.options.getString("command")

		const embed = new WanderersEmbed().setDefault({ user: ctx.user, translatable: ctx })

		if (!args) {
			embed.setDescription(ctx.translate("divers:help.current_lang", { lang: client.m.lang[ctx.guild?.db?.defaultBranch || "en"].name }))
			for (const category of categoryList) {
				let comms = client.commands.filter(cat => cat.category === category).filter(cmd => !cmd.isDevOnly && !cmd.__local)
				if (comms.size > 0) {
					embed.addField(ctx.translate(`help:categories.${catNumber[category]}`), `\`/${client.commands.filter(cat => cat.category === category).filter(cmd => !cmd.isDevOnly).map(cmd => cmd.__type != "sub" ? `${cmd.command.name}\` : ${ctx.translate(`help:${cmd.command.name}.description`)}` : `${cmd.command.name}\` : ${ctx.translate(`help:${cmd.command.name}.description`)}\n- ${cmd.command.options?.map(sub => `\`/${cmd.command.name} ${sub.name}\` : ${ctx.translate(`help:${cmd.command.name}.subcommands.${sub.name}.description`)}`).join("\n- ")}`).join("\n`/")}`)
				}
			}
			return ctx.reply({ embeds: [embed] });
		} else {
			const command = client.commands.get(args)
			if (!command) return ctx.reply({ content: `**:x: | ${ctx.translate("divers:help.cmd_doesnt_exist")}**`, ephemeral: true })

			let usage = `/${command.command.name}`
			if(command.command.options?.length){
				if(command.__type == "sub"){
					usage = `${(command.command.options as APIApplicationCommandSubcommandOption[]).map((c: APIApplicationCommandSubcommandOption) => `/${command.command.name} ${c.name} ${c.options?.map(co => `${co.required ? "<" : "["}${co.name}${co.required ? ">" : "]"}`).join(" ")}`).join("\n")}`
				} else {
					usage += ` ${command.command.options.map(o => `${o.required ? "<" : "["}${o.name}${o.required ? ">" : "]"}`).join(" ")}`
				}
			}

			embed
				.setTitle(ctx.translate("divers:help.title", { commandname: command.command.name }))
				.addField(ctx.translate("divers:help.description"), ctx.translate(`help:${command.command.name}.description`))
				.addField(ctx.translate("divers:help.usage"), usage);

			return ctx.reply({ embeds: [embed] });
		}
	},
	async autocomplete(client: WanderersClient, interaction: AutocompleteInteraction) {
			let selectedoption = interaction.options.getFocused(true)
			let commands = client.commands.filter(cmd => !cmd.isDevOnly && !cmd.__local && cmd.category).map(c => c.command.name).filter(c => c.includes(selectedoption.value)).map(c => {
				return { name: c, value: c }
			})
			interaction.respond(commands)
	}
})