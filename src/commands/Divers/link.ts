/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { Command, ContextInteraction, WanderersClient, WanderersEmbed } from "../../structures"

export default new Command({
	name: "link",
	description: "Returns the bot's links list.",
	category: "Divers",
	async execute(client: WanderersClient, ctx: ContextInteraction) {
		const embed = new WanderersEmbed().setDefault({ user: ctx.user, translatable: ctx }).setDescription(`
**[${ctx.translate("divers:link.invite")}](https://top.gg/bot/568437925453234176/invite/)
[${ctx.translate("divers:link.support")}](https://discord.gg/NyUukwA)
[${ctx.translate("divers:link.vote")}](https://top.gg/bot/568437925453234176/vote)
[${ctx.translate("divers:link.translations")}](https://crowdin.com/project/scp-277-fr)
[${ctx.translate("divers:link.terms")}](https://zkillou.github.io/scp/)**`)

		return ctx.reply({ embeds: [embed] })
	}
})