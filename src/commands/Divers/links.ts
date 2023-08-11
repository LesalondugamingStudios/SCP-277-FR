/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { Command, ContextInteraction, WanderersClient, WanderersEmbed } from "../../structures"

export default new Command({
	name: "links",
	description: "Returns the bot's links list.",
	category: "Divers",
	async execute(client: WanderersClient, ctx: ContextInteraction) {
		const embed = new WanderersEmbed().setDefault({ user: ctx.user, translatable: ctx }).setDescription(`
**[${ctx.translate("divers:link.invite")}](https://discord.com/api/oauth2/authorize?client_id=568437925453234176&permissions=388096&scope=bot%20applications.commands)
[${ctx.translate("divers:link.support")}](https://discord.gg/NyUukwA)
[${ctx.translate("divers:link.vote")}](https://scp.lsdg.xyz/vote)
[${ctx.translate("divers:link.translations")}](https://crowdin.com/project/scp-277-fr)
[${ctx.translate("divers:link.source_code")}](https://github.com/LesalondugamingStudios/SCP-277-FR)
[${ctx.translate("divers:link.terms")}](https://scp.lsdg.xyz/terms)
[${ctx.translate("divers:link.privacy_policy")}](https://scp.lsdg.xyz/privacy)**`)

		return ctx.reply({ embeds: [embed] })
	}
})