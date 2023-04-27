/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import langObj from "../../util/language.json";
import { Command, ContextInteraction, WanderersClient, WanderersEmbed } from "../../structures";
import { ApplicationCommandOptionType, AutocompleteInteraction } from "discord.js";
import { Lang, SavedSCPName } from "../../types";
import { getHTML, makeSCP, viewer } from "../../crawler";

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
    // @ts-ignore
    let lg = JSON.parse(JSON.stringify(ctx.options.getString("branch_language") ? client.lang[ctx.options.getString("branch_language")] : client.lang[ctx.guild.db ? ctx.guild.db.defaultBranch : "en"])) as Lang

    // sécurité au cas ou le site met 3 ans à répondre
    await ctx.deferReply()

    // Gérer la commande pour l'anglais
    if (lg.shortcut === "en" && nb.split("-").length > 1) {
      let numArray = nb.split("-")
      if (numArray[1].toLowerCase() != "j") {
        lg.scp.homepage = client.lang["int"].scp.homepage
        lg.scp.img = client.lang["int"].scp.img
        lg.name = client.lang["int"].name
        lg.shortcut = client.lang["int"].shortcut
      }
    }

    // Génère les informations du SCP
    let name = (await client.mongoose.getSCPName(nb.toLowerCase(), lg.shortcut))?.name

    let scpSavedData = await client.mongoose.getSCP(nb, lg.shortcut);
    if (scpSavedData && Date.now() - scpSavedData.updatedAt.getTime() < 604800000) {
      let data = JSON.parse(scpSavedData.data);

      for(let i = 0; i < data.length; i++) {
        for(let j = 0; j < data[i].embeds.length; j++) {
          data[i].embeds[j] = new WanderersEmbed(data[i].embeds[j]).setDefault({ user: ctx.user, translatable: ctx, type: "scp", lang: lg })
        }

        for(let j = 0; j < (data[i].images?.length ?? 0); j++) {
          data[i].images[j] = new WanderersEmbed(data[i].images[j])
        }
      }

      client.stats.addScpView(nb, lg.shortcut);
      viewer(client, ctx, data, { url: `${lg.scp.homepage}scp-${nb}`, ephemeral: false, name })
    } else {
      try {
        const html = await getHTML(`${lg.scp.homepage}scp-${nb}`)
        if(!html) throw "Cannot resolve HTML"
        if(name) html.metadata.name = name
        html.metadata.nb = nb
        const data = makeSCP(html.elements, lg, html.images, html.metadata, ctx)
        if(!data || !data.length) throw "Cannot resolve SCP"

        client.stats.addScpView(nb, lg.shortcut);

        if(scpSavedData) {
          await client.mongoose.Scp.updateOne({ nb, lang: lg.shortcut }, { data: JSON.stringify(data) })
        } else {
          const scpData = new client.mongoose.Scp({ nb, lang: lg.shortcut, data: JSON.stringify(data) });
          scpData.save().then(_ => client.log(`SCP-${nb} saved (${lg.shortcut})`)).catch(_ => client.log("Erreur, impossible de sauvegarder SCP-" + nb, "errorm"));
        }

        for(let i = 0; i < data.length; i++) {
          for(let j = 0; j < data[i].embeds.length; j++) {
            data[i].embeds[j].setDefault({ user: ctx.user, translatable: ctx, type: "scp", lang: lg })
          }
        }

        viewer(client, ctx, data, { url: `${lg.scp.homepage}scp-${nb}`, ephemeral: false, name })
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

    const entries = await client.mongoose.ScpName.find({ lang })

    let selectedentries = []
    let found: SavedSCPName | undefined = entries.find(entry => entry.nb.toLowerCase() == selectedoption.value.toLowerCase())
    if (found) selectedentries.push({ name: `> SCP-${found.nb.toUpperCase()} - ${found.name}`, value: found.nb })
    else if (selectedoption.value) selectedentries.push({ name: `> SCP-${selectedoption.value.toUpperCase()} - [MISSING DATA]`, value: selectedoption.value })

    selectedentries.push(...entries.shuffle().filter(a => a.name.toLowerCase().includes(selectedoption.value.toLowerCase()) || a.nb.toLowerCase().includes(selectedoption.value.toLowerCase())).slice(0, 5).map(a => {
      return { name: `SCP-${a.nb.toUpperCase()} - ${a.name}`, value: a.nb }
    }))
    interaction.respond(selectedentries)
  }
})