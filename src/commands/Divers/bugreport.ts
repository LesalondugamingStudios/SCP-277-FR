/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { ApplicationCommandOptionType, TextChannel } from "discord.js"
import { Command, ContextInteraction, WanderersClient, WanderersEmbed } from "../../structures"

export default new Command({
	name: "bugreport",
	description: "Send a message to the staff of the bot when you find a bug.",
	category: "Divers",
	options: [{
		type: ApplicationCommandOptionType.String,
		name: "bug",
		description: "A description of the bug",
		required: true,
		_isLong: true
	}],
	async execute(client: WanderersClient, ctx: ContextInteraction) {
		const bug = ctx.options.getString("bug", true)
		const embed = new WanderersEmbed()
			.setDefault({ user: ctx.user, translatable: ctx })
			.setAuthor({ name: "Un bug a été trouvé !" })
			.setDescription(`Serveur: ${ctx.guild?.name} (${ctx.guild?.id})\nBug: ${bug}`)
		await ctx.reply({ content: ctx.translate("divers:bugreport"), embeds: [embed] })
		return (client.channels.cache.find(ch => ch.id === '584802475991629845') as unknown as TextChannel | undefined)?.send({ embeds: [embed] })
	}
})