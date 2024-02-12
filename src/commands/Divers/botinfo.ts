/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { version } from "discord.js";
import { Command, ContextInteraction, WanderersClient, WanderersEmbed} from "../../structures";
import { getServerLength } from "../../util/broadcastFunctions";

export default new Command({
	name: "botinfo",
	description: "Returns information about the bot.",
	category: "Divers",
	async execute(client: WanderersClient, ctx: ContextInteraction) {
		const embed = new WanderersEmbed()
			.setDefault({ user: ctx.user, translatable: ctx })
			.setTitle(ctx.translate("divers:botinfo.title"))
			.addFields(
				{ name: ctx.translate("misc:guilds"), value: `${await getServerLength(client.shard)}`, inline: true },
				{ name: ctx.translate("misc:shards"), value: `${client.shard.count}`, inline: true },
				{ name: ctx.translate("divers:botinfo.uptime"), value: `<t:${Math.round((Date.now() - client.uptime) / 1000)}:R>` }
			)
			.addFields(
				{ name: ctx.translate("divers:botinfo.software"), value: `- Discord.js v${version}\n- Nodejs ${process.version}`, inline: false },
				{ name: ctx.translate("divers:botinfo.made_by"), value: ctx.translate("divers:botinfo.made_by_content", { creepergames: "<@412166048666615808> (@creepergamsla)", azerptiop: "<@449907751225655299> (@azerptiop)" }), inline: false }
			)

		ctx.reply({ embeds: [embed] });
	}
})