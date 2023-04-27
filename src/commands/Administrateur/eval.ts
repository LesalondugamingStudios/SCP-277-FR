/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Command, ContextInteraction, WanderersClient } from "../../structures";
import { inspect } from "util";

export default new Command({
	name: "eval",
	description: "Test un code javascript",
	category: "Administration",
	isDevOnly: true,
	options: [{
		type: ApplicationCommandOptionType.String,
		name: "code",
		description: "Le code à tester",
		required: true,
		_isLong: true
	}],
	async execute(client: WanderersClient, ctx: ContextInteraction) {
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
			ctx.reply({ embeds: [embed] });
		} catch (err) {
			let cleaned = await clean(err);
			embed
				.setColor("Red")
				.setDescription(`\`\`\`xl\n${cleaned}\n\`\`\``)
			ctx.reply({ embeds: [embed] });
		}
	}
});