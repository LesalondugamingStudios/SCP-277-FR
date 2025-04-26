/*
 * Copyright (C) 2023-2025  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { SlashCommandBuilder } from "discord.js"
import { ChatCommand, ContextInteraction, WanderersEmbed } from "../../structures"

export default new ChatCommand({
	command: new SlashCommandBuilder()
		.setName("links")
		.setDescription("Returns the bot's links list.")
		.toJSON(),
	category: "Divers",
	async execute(_, ctx: ContextInteraction) {
		const embed = new WanderersEmbed().setDefault({ user: ctx.user, translatable: ctx }).setDescription(`
**[${ctx.translate("divers:link.invite")}](https://scp.lsdg.xyz/invite)
[${ctx.translate("divers:link.support")}](https://scp.lsdg.xyz/support)
[${ctx.translate("divers:link.vote")}](https://scp.lsdg.xyz/vote)
[${ctx.translate("divers:link.translations")}](https://scp.lsdg.xyz/translate)
[${ctx.translate("divers:link.source_code")}](https://scp.lsdg.xyz/github)
[${ctx.translate("divers:link.terms")}](https://scp.lsdg.xyz/terms)
[${ctx.translate("divers:link.privacy_policy")}](https://scp.lsdg.xyz/privacy)**`)

		return ctx.reply({ embeds: [embed] })
	}
})