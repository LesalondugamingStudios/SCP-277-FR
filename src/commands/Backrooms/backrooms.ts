/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import langObj from "../../util/language.json";
import { Command, ContextInteraction, WanderersClient, WanderersEmbed } from "../../structures/";
import { ApplicationCommandOptionType, AutocompleteInteraction } from "discord.js";
import { Branches, Lang } from "../../types";
import { viewer } from "../../crawler";
import { getReport } from "../../crawler/fetcher";
import { error, log } from "../../util/logging";

let lang: Lang[] = [];
for (let data in langObj) {
  // @ts-ignore
  if (langObj[data].backrooms) lang.push(langObj[data]);
};

export default new Command({
  name: "backrooms",
  description: "Get any pages from the wiki.",
  category: "Backrooms",
  __type: "sub",
  options: [{
    type: ApplicationCommandOptionType.Subcommand,
    name: "level",
    description: "Displays the requested Level.",
    options: [{
      type: ApplicationCommandOptionType.String,
      name: "level",
      description: "The requested Level (example: 0, 1, -0, 0.2)",
      required: true,
      autocomplete: true
    }, {
      type: ApplicationCommandOptionType.String,
      name: "branch_language",
      description: "The report language",
      choices: lang.map(l => {
        return { name: l.name, value: l.shortcut }
      })
    }]
  }, {
    type: ApplicationCommandOptionType.Subcommand,
    name: "entity",
    description: "Displays the requested Entity.",
    options: [{
      type: ApplicationCommandOptionType.String,
      name: "entity",
      description: "The requested Entity (example: 2, 3, 140)",
      required: true,
      autocomplete: true
    }, {
      type: ApplicationCommandOptionType.String,
      name: "branch_language",
      description: "The report language",
      choices: lang.map(l => {
        return { name: l.name, value: l.shortcut }
      })
    }]
  }, {
    type: ApplicationCommandOptionType.Subcommand,
    name: "object",
    description: "Displays the requested Object.",
    options: [{
      type: ApplicationCommandOptionType.String,
      name: "object",
      description: "The requested Object (example: 1, 2)",
      required: true,
      autocomplete: true
    }, {
      type: ApplicationCommandOptionType.String,
      name: "branch_language",
      description: "The report language",
      choices: lang.map(l => {
        return { name: l.name, value: l.shortcut }
      })
    }]
  }, {
    type: ApplicationCommandOptionType.Subcommand,
    name: "other",
    description: "Get any page of the wiki.",
    options: [{
      type: ApplicationCommandOptionType.String,
      name: "page",
      description: "The requested page (example: colias-kowalski, the-decay-zone)",
      required: true
    }, {
      type: ApplicationCommandOptionType.String,
      name: "branch_language",
      description: "The report language",
      choices: lang.map(l => {
        return { name: l.name, value: l.shortcut }
      })
    }]
  }],
  
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