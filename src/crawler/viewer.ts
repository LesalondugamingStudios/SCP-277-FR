/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, StringSelectMenuInteraction, StringSelectMenuBuilder, TextChannel, CollectorFilter, MessageComponentType, ComponentType } from "discord.js";
import { ContextInteraction, WanderersClient, WanderersEmbed } from "../structures";
import { OldViewerOptions, WikiCategory } from "../types";
import { StringSelectMenuOptionBuilder } from "discord.js";

export async function viewer(client: WanderersClient, interaction: ContextInteraction | ButtonInteraction | StringSelectMenuInteraction, data: WikiCategory[], options: OldViewerOptions) {
  let currentCategory = 0
  let currentEmbed = 0
  let renderingVote = false

  function generateMessage() {
    let category = data[currentCategory]
    let embed = category.embeds[currentEmbed]

    const menuOptions: StringSelectMenuOptionBuilder[] = []
    for(let i = 0; i < data.length; i++) {
      let category = data[i]
      const opt = new StringSelectMenuOptionBuilder()
        .setDefault(i == currentCategory)
        .setLabel(category.name)
        .setValue(category.value)
      
      if(category.description) opt.setDescription(category.description)
      if(category.emoji) opt.setEmoji(category.emoji)

      menuOptions.push(opt)
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId("select-category")
      .setOptions(...menuOptions)
    
    let leftDisabled = currentEmbed == 0
    let rightDisabled = currentEmbed + 1 == category.embeds.length
    const pagination = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder().setCustomId("backfull").setEmoji("<:backfull:880049394022494260>").setStyle(ButtonStyle.Secondary).setDisabled(leftDisabled),
        new ButtonBuilder().setCustomId("back").setEmoji("<:back:880049346136121354>").setStyle(ButtonStyle.Primary).setDisabled(leftDisabled),
        new ButtonBuilder().setCustomId("fw").setEmoji("<:fw:880049300573417482>").setStyle(ButtonStyle.Primary).setDisabled(rightDisabled),
        new ButtonBuilder().setCustomId("fwfull").setEmoji("<:fwfull:880049275575353414>").setStyle(ButtonStyle.Secondary).setDisabled(rightDisabled)
      )
    
    const controls = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder().setEmoji("<:link:880062279285084200>").setStyle(ButtonStyle.Link).setURL(options.url),
        new ButtonBuilder().setCustomId("see").setEmoji("👀").setStyle(ButtonStyle.Secondary).setDisabled(options.ephemeral),
        new ButtonBuilder().setCustomId("images").setEmoji("🖼️").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("viewerhelp").setEmoji("💬").setLabel(interaction.translate("viewer:controls.help")).setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("stop").setEmoji("<:stop:880049324262850602>").setStyle(ButtonStyle.Danger)
      )
    
    const bugreport = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder().setCustomId("renderupvote").setEmoji("✅").setLabel(interaction.translate("viewer:controls.render_upvote")).setDisabled(renderingVote).setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("renderdownvote").setEmoji("❎").setLabel(interaction.translate("viewer:controls.render_downvote")).setDisabled(renderingVote).setStyle(ButtonStyle.Danger)
      )
    
    const components: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = []

    if(!(leftDisabled && rightDisabled)) components.push(pagination)
    if(data.length > 1) components.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu))
    components.push(controls)
    if(!renderingVote) components.push(bugreport)

    embed.setTitle(`${options.name ? `${options.name} - ` : ""}${category.name}${leftDisabled && rightDisabled ? "" : ` - Page ${currentEmbed + 1}/${category.embeds.length}`}`)
    return { content: null, components, embeds: [embed] }
  }

  const filter: CollectorFilter<[ButtonInteraction | StringSelectMenuInteraction]> = (inte: ButtonInteraction | StringSelectMenuInteraction) => {
    if (!options.ephemeral) {
      if (inte.customId == "images" || inte.customId == "viewerhelp") return true
      if (inte.customId == "see" && inte.user.id != interaction.user.id) {
        return true
      } else if (inte.customId == "see" && inte.user.id == interaction.user.id) {
        inte.reply({ content: `**:x: | ${inte.translate("viewer:default_replies.view_own_report")}**`, ephemeral: true })
        return false
      }
      if (inte.user.id != interaction.user.id) {
        inte.deferReply({ ephemeral: true }).then(() => viewer(client, inte, data, { ephemeral: true, url: options.url, name: options.name }))
        return false
      }
      return true
    } else {
      return true
    }
  }
  
  const message = await interaction.editReply(generateMessage())
  if(!message) return interaction.editReply({ content: "um, can't get the message" })
  const collector = message.createMessageComponentCollector<ComponentType.Button | ComponentType.StringSelect>({ filter, idle: 600000 })

  collector.on("collect", async inte => {
    if(inte.isStringSelectMenu()){
      currentEmbed = 0
      currentCategory = data.findIndex(c => c.value == inte.values[0])
      await inte.update(generateMessage())
      return
    }
    if (inte.customId == "backfull") {
      currentEmbed = 0
      await inte.update(generateMessage())
      return
    } else if (inte.customId == "back") {
      currentEmbed--
      await inte.update(generateMessage())
      return
    } else if (inte.customId == "stop") {
      collector.stop()
      inte.reply({ content: `**:white_check_mark: | ${inte.translate("viewer:default_replies.connection_ended")}**`, ephemeral: true })
      return
    } else if (inte.customId == "fw") {
      currentEmbed++
      await inte.update(generateMessage())
      return
    } else if (inte.customId == "fwfull") {
      currentEmbed = data[currentCategory].embeds.length - 1
      await inte.update(generateMessage())
      return
    } else if (inte.customId == "images") {
      const embeds = []
      for(let i = 0; i < data.length; i++){
        let images = data[i].images
        if(images) for(let j = 0; j < images.length; j++) embeds.push(images[j].setDefault({ user: inte.user, translatable: inte }))
      }
      if (embeds.length) await inte.reply({ ephemeral: true, embeds })
      else await inte.reply({ ephemeral: true, content: `**:x: | ${inte.translate("viewer:default_replies.no_images")}**` })
      return
    } else if (inte.customId == "viewerhelp") {
      await inte.reply({ ephemeral: true, embeds: [new WanderersEmbed()
        .setDefault({ user: inte.user, translatable: inte })
        .setDescription(`**${inte.translate("viewer:controls_categories.embed")}**\n<:backfull:880049394022494260> » ${inte.translate("viewer:controls.backfull")}\n<:back:880049346136121354> » ${inte.translate("viewer:controls.back")}\n<:fw:880049300573417482> » ${inte.translate("viewer:controls.fw")}\n<:fwfull:880049275575353414> » ${inte.translate("viewer:controls.fwfull")}\n\n**${inte.translate("viewer:controls_categories.category")}**\nMenu » ${inte.translate("viewer:controls.category")}\n\n**${inte.translate("viewer:controls_categories.others")}**\n<:link:880062279285084200> » ${inte.translate("viewer:controls.link")}\n👀 » ${inte.translate("viewer:controls.see")}\n🖼️ » ${inte.translate("viewer:controls.images")}\n<:stop:880049324262850602> » ${inte.translate("viewer:controls.stop")}`)
      ] })
      return
    } else if (inte.customId == "see") {
      await inte.deferReply({ ephemeral: true })
      viewer(client, inte, data, { ephemeral: true, url: options.url, name: options.name })
      return
    } else if (inte.customId.startsWith("render")) {
      let state = inte.customId.includes("up")
      renderingVote = true
      await inte.update(generateMessage())

      const channel = (client.channels.cache.get(client.config.getVoteChannelID()) as TextChannel | undefined)
      channel?.send({ embeds: [new WanderersEmbed().setDefault({ translatable: inte }).setDescription(`Utilisateur : ${inte.user.tag} (${inte.user.id})\nRapport : ${options.url}\nVote : ${state ? "Positif" : "Négatif"}`)] })
      return
    }
  })

  collector.on("end", async (): Promise<any> => {
    if (message && message.deletable && !options.ephemeral && message.guild?.db && message.guild.db.deleteReport) return await message.delete()
    if (message && message.editable && !options.ephemeral) return await message.edit({ components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setEmoji("<:link:880062279285084200>").setStyle(ButtonStyle.Link).setURL(options.url))
    ] })
  })
}