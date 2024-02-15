/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import langObj from "../../util/language.json";
import { Command, ContextInteraction, WanderersClient, WanderersEmbed } from "../../structures";
import { ApplicationCommandOptionType, AutocompleteInteraction } from "discord.js";
import { Lang, SavedSCPName } from "../../types";
import { viewer } from "../../crawler";
import { getReport } from "../../crawler/fetcher";
import { error, log } from "../../util/logging";

let lang: Lang[] = [];
for (let data in langObj) {
  // @ts-ignore
  lang.push(langObj[data]);
};

export default new Command({
  name: "scp",
  description: "Displays the requested SCP.",
  category: "SCP",
  options: [{
    type: ApplicationCommandOptionType.String,
    name: "scp",
    description: "The requested SCP (example: 002, 173, 277-fr)",
    required: true,
    autocomplete: true
  }, {
    type: ApplicationCommandOptionType.String,
    name: "branch_language",
    description: "The report language",
    choices: lang.slice(0, lang.length - 1).map(l => {
      return { name: l.name, value: l.shortcut }
    })
  }],
  async execute(client: WanderersClient, ctx: ContextInteraction) {
    if (!ctx.guild) return
    let nb = ctx.options.getString("scp", true) as string
    // Deep copy de la langue pour éviter les conflits avec la prochaine commande
    let lg = JSON.parse(JSON.stringify(ctx.options.getString("branch_language") ? client.m.lang[ctx.options.getString("branch_language")] : client.m.lang[ctx.guild.db ? ctx.guild.db.defaultBranch : "en"])) as Lang

    // sécurité au cas ou le site met 3 ans à répondre
    await ctx.deferReply()

    try {
      let report = await getReport(client.m, "scp", nb, lg)
      if("error" in report) throw report.error

      for(let i = 0; i < report.data.length; i++) {
        for(let j = 0; j < report.data[i].embeds.length; j++) {
          report.data[i].embeds[j] = new WanderersEmbed(report.data[i].embeds[j]).setDefault({ user: ctx.user, translatable: ctx, type: "scp", lang: lg })
        }

        for(let j = 0; j < (report.data[i].images?.length ?? 0); j++) {
          report.data[i].images![j] = new WanderersEmbed(report.data[i].images![j])
        }
      }

      client.stats.addScpView(nb, lg.shortcut);
      viewer(client, ctx, report, { url: `${lg.scp.homepage}scp-${nb}`, ephemeral: false, name: report.name })
    } catch(e: any) {
      ctx.editReply({ content: `**:x: | ${ctx.translate("misc:error")}**\n\`${e}\`` })
      if (typeof e == 'string') log(e, "errorm")
      else error(e)
    }
  },
  async autocomplete(client: WanderersClient, interaction: AutocompleteInteraction) {
    let selectedoption = interaction.options.getFocused(true)
    let lang = interaction.options.getString("branch_language") || interaction.guild?.db?.defaultBranch || "en"

    const entries = await client.m.mongoose.ScpName.find({ lang })

    let selectedentries: { name: string, value: string }[] = []
    let found: SavedSCPName | undefined = entries.find(entry => entry.nb.toLowerCase() == selectedoption.value.toLowerCase())
    if (found) selectedentries.push({ name: `> SCP-${found.nb.toUpperCase()} - ${found.name}`, value: found.nb })
    else if (selectedoption.value) selectedentries.push({ name: `> SCP-${selectedoption.value.toUpperCase()} - [MISSING DATA]`, value: selectedoption.value })

    selectedentries.push(...entries.shuffle().filter(a => a.name.toLowerCase().includes(selectedoption.value.toLowerCase()) || a.nb.toLowerCase().includes(selectedoption.value.toLowerCase())).slice(0, 5).map(a => {
      return { name: `SCP-${a.nb.toUpperCase()} - ${a.name}`, value: a.nb }
    }))
    interaction.respond(selectedentries)
  }
})