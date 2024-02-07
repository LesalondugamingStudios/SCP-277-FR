/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { ActionRowBuilder, ButtonBuilder, Message, ChannelType, ButtonStyle } from "discord.js";
import { WanderersClient, ContextInteraction, WanderersEmbed } from "../../structures";
import { error, log } from "../../util/logging";

export default async (client: WanderersClient, message: Message) => {
	const PREFIX = client.config.prefix;
	if (message.author.bot) return
	if (message.channel.type === ChannelType.DM) return

	if (!message.guildId) return
	if (!message.guild) await client.guilds.fetch(message.guildId)
	if (!message.guild) return;

	// Check si la guild est dans la db
	if (!(await client.m.mongoose.getGuild(message.guild.id))) {
		let dlocale = message.guild.preferredLocale
		let lg = Object.values(client.m.lang).find(l => l.shortcut == dlocale || l.dlocale == dlocale)?.shortcut || "en"
		const createGuildUser = new client.m.mongoose.Guild({ guildID: message.guild.id, defaultBranch: lg })
		await createGuildUser.save().then(g => {
			log(`Registration : ${g.guildID}`, "data")
			if (message.guild != null) message.guild.db = g
		})
	}

	const args = message.content.slice(PREFIX.length).split(/ +/);
	const commandName = args.shift()?.toLowerCase();

	const command = client.commands.get(commandName ?? "")

	let matches = message.content.match(/(scp-(?:(?:[0-9]{3,}(?:-[a-zA-Z]{2})?)|(?:[a-zA-Z]{2}-[0-9]{3,}))(?:-[a-z]{1,3})?)/gi)
	if (message.guild.db && matches && message.guild.db.scpDetection && !command) {
		let filteredmatches = matches.filter((item, index) => matches?.indexOf(item) == index)

		let embed = new WanderersEmbed().setDefault({ translatable: message })
		let desc = `**__${message.translate("detection:reply")}__**\n\n`
		let rows = [new ActionRowBuilder<ButtonBuilder>()]
		let index = 0

		for (let i of filteredmatches) {
			let num = i.split('-').slice(1).join("-").toLowerCase()
			let name = await client.m.mongoose.getSCPName(num, message.guild.db.defaultBranch)

			desc += `**» SCP-${num.toUpperCase()}**${name ? ` **:** ${name.name}` : ""}\n`
			rows[index].addComponents(new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`detectionsee_${num}_${message.guild.db.defaultBranch}`).setEmoji("👀").setLabel(message.translate("detection:show", { scp: `SCP-${num.toUpperCase()}` })))
			if (rows[index].components.length == 5) {
				index++
				if (index < 5) rows[index] = new ActionRowBuilder<ButtonBuilder>()
				else break
			}
		}

		if (rows[rows.length - 1].components.length == 0) rows.pop()

		embed.setDescription(desc)
		message.reply({ content: `<:info:1002142862181400586> | ${message.translate('detection:can_be_disabled')}`, embeds: [embed], components: rows })
	}

	if (!message.guild.db?.messageCommand) return
	if (!message.content.toLowerCase().startsWith(PREFIX)) return;
	
	if (!command || command.__local || !command.category) return

	let interaction = new ContextInteraction(message, command)

	if (command.isDevOnly) {
		if (interaction.user.id !== "412166048666615808" && interaction.user.id !== "449907751225655299") return interaction.reply({ content: `**:x: | ${interaction.translate("misc:private")}**`, ephemeral: true })
	}

	if (command.defaultMemberPermissions) {
		if (!message.member?.permissions.has(command.defaultMemberPermissions)) return interaction.reply({ content: `**:x: | ${interaction.translate("misc:missing_permission", { permission: command.memberPermissionsString?.join(", ") })}**`, ephemeral: true });
	}

	try {
		await command.execute(client, interaction)
	} catch (e: any) {
		error(e)
		return await interaction.reply({ content: `**:x: | ${interaction.translate("misc:error")}**`, ephemeral: true })
	}
}