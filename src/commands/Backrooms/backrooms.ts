/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import langObj from "../../util/language.json";
import { Command, ContextInteraction, WanderersClient, WanderersEmbed } from "../../structures/";
import { ApplicationCommandOptionType, AutocompleteInteraction } from "discord.js";
import { Lang } from "../../types";
import { getHTML, makeEntry, viewer } from "../../crawler";

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
    let type = ctx.options.getSubcommand(true) as string
    let num = (ctx.options.getString("level") || ctx.options.getString("entity") || ctx.options.getString("object") || ctx.options.getString("page") as unknown as string)

    if (type == "level") num = formatNum(num)

    // @ts-ignore
    let lg: Lang = ctx.options.getString("branch_language") ? client.lang[ctx.options.getString("branch_language")] : client.lang[ctx.guild?.db ? ctx.guild.db.defaultBranch : "en"]
    if (!lg.backrooms) lg = client.lang.en

    // sécurité au cas ou le site met 3 ans à répondre
    await ctx.deferReply()

    // Génère les informations du Niveau
    let name = (await client.mongoose.getEntryName(type, num.toLowerCase(), lg.shortcut))?.name

    let entrySavedData = await client.mongoose.getEntry(type, num, lg.shortcut);
    if (entrySavedData && Date.now() - entrySavedData.updatedAt.getTime() < 604800000) {
      let data = JSON.parse(entrySavedData.data);

      for(let i = 0; i < data.length; i++) {
        for(let j = 0; j < data[i].embeds.length; j++) {
          data[i].embeds[j] = new WanderersEmbed(data[i].embeds[j]).setDefault({ user: ctx.user, translatable: ctx, type: "backrooms", lang: lg })
        }

        for(let j = 0; j < (data[i].images?.length ?? 0); j++) {
          data[i].images[j] = new WanderersEmbed(data[i].images[j])
        }
      }

      viewer(client, ctx, data, { url: `${lg.backrooms.homepage}${type != "other" ? type + "-" : ""}${num}`, ephemeral: false, name })
    } else {
      try {
        const html = await getHTML(`${lg.backrooms.homepage}${type != "other" ? type + "-" : ""}${num}`)
        if(!html) throw "Cannot resolve HTML"
        if(name) html.metadata.name = name
        const data = makeEntry(html.elements, lg, html.images, html.metadata, html.classe, ctx)
        if(!data || !data.length) throw "Cannot resolve Entry"

        if(entrySavedData){
          await client.mongoose.Entry.updateOne({ id: type, nb: num, lang: lg.shortcut }, { data: JSON.stringify(data) })
        } else {
          const entryData = new client.mongoose.Entry({ id: type, nb: num, lang: lg.shortcut, data: JSON.stringify(data) });
          entryData.save().then(_ => client.log(`${type} ${num} saved (${lg.shortcut})`)).catch(_ => client.log(`Erreur, impossible de sauvegarder ${type} ${num}`, "errorm"));
        }

        for(let i = 0; i < data.length; i++) {
          for(let j = 0; j < data[i].embeds.length; j++) {
            data[i].embeds[j].setDefault({ user: ctx.user, translatable: ctx, type: "backrooms", lang: lg })
          }
        }

        viewer(client, ctx, data, { url: `${lg.backrooms.homepage}${type != "other" ? type + "-" : ""}${num}`, ephemeral: false, name })
      } catch (err: any) {
        ctx.editReply({ content: `**:x: | ${ctx.translate("misc:error")}**\n\`${err}\`` })
        if (typeof err == 'string') client.log(err, "errorm")
        else client.error(err)
      }
    }
  },
  async autocomplete(client: WanderersClient, interaction: AutocompleteInteraction) {
    let selectedoption = interaction.options.getFocused(true)
    let lang = interaction.options.getString("branch_language") || interaction.guild?.db?.defaultBranch || "en"

    const entries = await client.mongoose.EntryName.find({ id: selectedoption.name, lang })

    let selectedentries = []
    let found = entries.find(entry => entry.nb.toLowerCase() == selectedoption.value.toLowerCase())
    if (found) selectedentries.push({ name: `> ${selectedoption.name.capitalize()} ${found.nb} - ${found.name}`, value: found.nb })
    else if(selectedoption.value) selectedentries.push({ name: `> ${selectedoption.name.capitalize()} ${selectedoption.value} - [MISSING DATA]`, value: selectedoption.value })

    selectedentries.push(...entries.shuffle().filter(a => a.name.toLowerCase().includes(selectedoption.value.toLowerCase()) || a.nb.toLowerCase().includes(selectedoption.value.toLowerCase())).slice(0, 5).map(a => {
      return { name: `${selectedoption.name.capitalize()} ${a.nb} - ${a.name}`, value: a.nb }
    }))

    interaction.respond(selectedentries)
  }
})

function formatNum(num: string): string {
  if (num.startsWith("-")) {
    num = "minus" + num
  }
  num = num.replace(/\./, "-")
  return num
}