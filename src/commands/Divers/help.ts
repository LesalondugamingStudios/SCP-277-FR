/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { ApplicationCommandOptionType, AutocompleteInteraction } from "discord.js";
import { readdirSync } from "fs";
import { Command, ContextInteraction, WanderersClient, WanderersEmbed } from "../../structures";
import { join } from "path";

const categoryList = readdirSync(join(__dirname, ".."));
const catNumber = { "Divers": 0, "SCP": 1, "Backrooms": 2 }

export default new Command({
	name: "help",
	description: "Returns a list of commands or information about a specific one!",
	category: "Divers",
	options: [{
		type: ApplicationCommandOptionType.String,
		name: "commandname",
		description: "The name of the command",
		autocomplete: true
	}],
	async execute(client: WanderersClient, ctx: ContextInteraction) {
		const args = ctx.options.getString("commandname")

		const embed = new WanderersEmbed().setDefault({ user: ctx.user, translatable: ctx })

		if (!args) {
			embed.setDescription(ctx.translate("divers:help.current_lang", { lang: client.m.lang[ctx.guild.db?.defaultBranch || "en"].name }))
			for (const category of categoryList) {
				let comms = client.commands.filter(cat => cat.category === category).filter(cmd => !cmd.isDevOnly && !cmd.__local)
				if (comms.size > 0) {
					// @ts-ignore
					embed.addField(ctx.translate(`help:categories.${catNumber[category]}`), `\`/${client.commands.filter(cat => cat.category === category).filter(cmd => !cmd.isDevOnly).map(cmd => cmd.__type != "sub" ? `${cmd.name}\` : ${ctx.translate(`help:${cmd.name}.description`)}` : `${cmd.name}\` : ${ctx.translate(`help:${cmd.name}.description`)}\n   ${cmd.options.map(sub => `\`/${cmd.name} ${sub.name}\` : ${ctx.translate(`help:${cmd.name}.subcommands.${sub.name}.description`)}`).join("\n   ")}`).join("\n`/")}`)
				}
			}
			return ctx.reply({ embeds: [embed] });
		} else {
			const command = client.commands.get(args)
			if (!command) return ctx.reply({ content: `**:x: | ${ctx.translate("divers:help.cmd_doesnt_exist")}**`, ephemeral: true })

			let usage = `/${command.name}`
			if(command.options.length){
				if(command.__type == "sub"){
					// @ts-ignore
					usage = `${command.options.map(c => `/${command.name} ${c.name} ${c.options.map(co => `${co.required ? "<" : "["}${co.name}${co.required ? ">" : "]"}`).join(" ")}`).join("\n")}`
				} else {
					// @ts-ignore
					usage += ` ${command.options.map(o => `${o.required ? "<" : "["}${o.name}${o.required ? ">" : "]"}`).join(" ")}`
				}
			}

			embed
				.setTitle(ctx.translate("divers:help.title", { commandname: command.name }))
				.addField(ctx.translate("divers:help.description"), ctx.translate(`help:${command.name}.description`))
				.addField(ctx.translate("divers:help.usage"), usage);

			return ctx.reply({ embeds: [embed] });
		}
	},
	async autocomplete(client: WanderersClient, interaction: AutocompleteInteraction) {
			let selectedoption = interaction.options.getFocused(true)
			// @ts-ignore
			let commands = client.commands.filter(cmd => !cmd.isDevOnly && !cmd.__local && cmd.category).map(c => c.name).filter(c => c.includes(selectedoption.value)).map(c => {
				return { name: c, value: c }
			})
			interaction.respond(commands)
	}
})