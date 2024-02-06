/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { version as djsversion } from "discord.js";
import { Command, ContextInteraction, WanderersClient, WanderersEmbed} from "../../structures";
import { getServerLength } from "../../util/broadcastFunctions";

export default new Command({
	name: "botinfo",
	description: "Returns information about the bot.",
	category: "Divers",
	async execute(client: WanderersClient, ctx: ContextInteraction) {
		let latence = Date.now() - ctx.class.createdTimestamp;
		let api = client.ws.ping
		
		const embed = new WanderersEmbed()
			.setDefault({ user: ctx.user, translatable: ctx })
			.addFields(
				{ name: ctx.translate("divers:botinfo.infos.title"), value: ctx.translate("divers:botinfo.infos.field", { usertag: client.user?.tag }) },
				{ name: ctx.translate("divers:botinfo.containment.title"), value: ctx.translate("divers:botinfo.containment.field", { nodeversion: process.version, djsversion }) },
				{ name: ctx.translate("divers:botinfo.description.title"), value: ctx.translate("divers:botinfo.description.field", { guildamt: await getServerLength(client.shard!), useramt: client.users.cache.size, botping: latence, apiping: api }) }
			)

		ctx.reply({ embeds: [embed] });
	}
})