/*
 * Copyright (C) 2023-2025  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ChatCommand, ContextInteraction, WanderersClient } from "../../structures";
import { inspect } from "util";

export default new ChatCommand({
	command: new SlashCommandBuilder()
		.setName("eval")
		.setDescription("Test un code javascript")
		.addStringOption(o => o
			.setName("code")
			.setDescription("Le code à tester")
			.setRequired(true)
		)
		.toJSON(),
	category: "Administration",
	isDevOnly: true,
	async execute(client: WanderersClient, ctx: ContextInteraction) {
		await ctx.deferReply();

		const code = ctx.options.getString("code", true) as string;
		const clean = async (text: any) => {
			if (text && text.constructor.name == "Promise") text = await text;
			if (typeof text !== "string") text = inspect(text, { depth: 1 });
			text = text
				.replace(/`/g, "`" + String.fromCharCode(8203))
				.replace(/@/g, "@" + String.fromCharCode(8203))
				.replaceAll(client.config.getToken(), "[REDACTED]");

			return text;
		}
		let embed = new EmbedBuilder()
		try {
			let evaled = eval(code);
			let cleaned = await clean(evaled);

			embed
				.setColor("Green")
				.setDescription(`\`\`\`js\n${cleaned}\`\`\``)
			ctx.editReply({ embeds: [embed] });
		} catch (err) {
			let cleaned = await clean(err);
			embed
				.setColor("Red")
				.setDescription(`\`\`\`xl\n${cleaned}\n\`\`\``)
			ctx.editReply({ embeds: [embed] });
		}
	}
});