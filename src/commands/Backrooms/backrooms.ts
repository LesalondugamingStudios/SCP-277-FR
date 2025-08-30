/*
 * Copyright (C) 2023-2025  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import langObj from "../../util/language.json" with {type: "json"};
import { ChatCommand, ContextInteraction, WanderersClient, WanderersEmbed } from "../../structures/";
import { ApplicationIntegrationType, AutocompleteInteraction, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { Branches, Lang } from "../../types";
import { viewer } from "../../crawler";
import { getReport } from "../../crawler/fetcher";
import { error, log } from "../../util/logging";

let lang: Lang[] = [];
for (let data in langObj) {
  // @ts-expect-error
  if (langObj[data].backrooms) lang.push(langObj[data]);
};

let choices = lang.map(l => {
  return { name: l.name, value: l.shortcut }
})

export default new ChatCommand({
  command: new SlashCommandBuilder()
    .setName("backrooms")
    .setDescription("Get any pages from the wiki.")
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .addSubcommand(s => s
      .setName("level")
      .setDescription("Displays the requested Level.")
      .addStringOption(o => o
        .setName("level")
        .setDescription("The requested Level (example: 0, 1, -0, 0.2)")
        .setRequired(true)
        .setAutocomplete(true)
      )
      .addStringOption(o => o
        .setName("branch_language")
        .setDescription("The report language")
        .setChoices(choices)
      )
    )
    .addSubcommand(s => s
      .setName("entity")
      .setDescription("Displays the requested Entity.")
      .addStringOption(o => o
        .setName("entity")
        .setDescription("The requested Entity (example: 2, 3, 140)")
        .setRequired(true)
        .setAutocomplete(true)
      )
      .addStringOption(o => o
        .setName("branch_language")
        .setDescription("The report language")
        .setChoices(choices)
      )
    )
    .addSubcommand(s => s
      .setName("object")
      .setDescription("Displays the requested Object.")
      .addStringOption(o => o
        .setName("object")
        .setDescription("The requested Object (example: 1, 2)")
        .setRequired(true)
        .setAutocomplete(true)
      )
      .addStringOption(o => o
        .setName("branch_language")
        .setDescription("The report language")
        .setChoices(choices)
      )
    )
    .addSubcommand(s => s
      .setName("other")
      .setDescription("Get any page of the wiki.")
      .addStringOption(o => o
        .setName("page")
        .setDescription("The requested page (example: colias-kowalski, the-decay-zone)")
        .setRequired(true)
      )
      .addStringOption(o => o
        .setName("branch_language")
        .setDescription("The report language")
        .setChoices(choices)
      )
    )
    .toJSON(),
  category: "Backrooms",
  __type: "sub",
  async execute(client: WanderersClient, ctx: ContextInteraction) {
    let type = ctx.options.getSubcommand(true) as "level" | "entity" | "object" | "other"
    let num = (ctx.options.getString("level") || ctx.options.getString("entity") || ctx.options.getString("object") || ctx.options.getString("page") as unknown as string)

    let lg: Lang = ctx.options.getString("branch_language") ? client.m.lang[ctx.options.getString("branch_language") as Branches] : client.m.lang[ctx.guild?.db ? ctx.guild.db.defaultBranch : "en"]

    // sécurité au cas ou le site met 3 ans à répondre
    await ctx.deferReply()

    try {
      let report = await getReport(client.m, "backrooms", num, lg, type)
      if("error" in report) throw report.error

      for(let i = 0; i < report.data.length; i++) {
        for(let j = 0; j < report.data[i].embeds.length; j++) {
          report.data[i].embeds[j] = new WanderersEmbed(report.data[i].embeds[j]).setDefault({ user: ctx.user, translatable: ctx, type: "backrooms", lang: lg })
        }

        for(let j = 0; j < (report.data[i].images?.length ?? 0); j++) {
          report.data[i].images![j] = new WanderersEmbed(report.data[i].images![j])
        }
      }

      viewer(client, ctx, report, { url: `${lg.backrooms.homepage}${type != "other" ? type + "-" : ""}${num}`, ephemeral: false, name: report.name })
    } catch(e: any) {
      ctx.editReply({ content: `**:x: | ${ctx.translate("misc:error")}**\n\`${e}\`` })
      if (typeof e == 'string') log(e, "errorm")
      else error(e)
    }
  },
  async autocomplete(client: WanderersClient, interaction: AutocompleteInteraction) {
    let selectedoption = interaction.options.getFocused(true)
    let lang = interaction.options.getString("branch_language") || interaction.guild?.db?.defaultBranch || "en"

    const entries = await client.m.mongoose.EntryName.find({ id: selectedoption.name, lang })

    let selectedentries: { name: string, value: string }[] = []
    let found = entries.find(entry => entry.nb.toLowerCase() == selectedoption.value.toLowerCase())
    if (found) selectedentries.push({ name: `> ${selectedoption.name.capitalize()} ${found.nb} - ${found.name}`, value: found.nb })
    else if(selectedoption.value) selectedentries.push({ name: `> ${selectedoption.name.capitalize()} ${selectedoption.value} - [MISSING DATA]`, value: selectedoption.value })

    selectedentries.push(...entries.shuffle().filter(a => a.name.toLowerCase().includes(selectedoption.value.toLowerCase()) || a.nb.toLowerCase().includes(selectedoption.value.toLowerCase())).slice(0, 5).map(a => {
      return { name: `${selectedoption.name.capitalize()} ${a.nb} - ${a.name}`, value: a.nb }
    }))

    interaction.respond(selectedentries)
  }
})