/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { ButtonInteraction } from "discord.js"
import { getHTML, makeSCP, viewer } from "../../crawler"
import { Command, WanderersClient, WanderersEmbed } from "../../structures"
import { Branches } from "../../types"

export default new Command({
  __local: true,
  name: "detectionsee",
  async buttonExec(client: WanderersClient, interaction: ButtonInteraction, args: string[]) {
    await interaction.deferReply({ ephemeral: true })

    let nb = args[0]
    let branch = args[1] as unknown as Branches

    let lg = JSON.parse(JSON.stringify(client.lang[branch]))
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
    if (scpSavedData) {
      let data = JSON.parse(scpSavedData.data);

      for(let i = 0; i < data.length; i++) {
        for(let j = 0; j < data[i].embeds.length; j++) {
          data[i].embeds[j] = new WanderersEmbed(data[i].embeds[j]).setDefault({ user: interaction.user, translatable: interaction, type: "scp", lang: lg })
        }
      }

      viewer(client, interaction, data, { url: `${lg.scp.homepage}scp-${nb}`, ephemeral: true, name, button: true })
    } else {
      try {
        const html = await getHTML(`${lg.scp.homepage}scp-${nb}`)
        if(!html) throw "Cannot resolve HTML"
        if(name) html.metadata.name = name
        const data = makeSCP(html.elements, lg, html.images, html.metadata, interaction)
        if(!data || !data.length) throw "Cannot resolve SCP"
        
        const scpData = new client.mongoose.Scp({ nb, lang: lg.shortcut, data: JSON.stringify(data), images: html.images });
        scpData.save().then(_ => client.log(`SCP-${nb} saved (${lg.shortcut})`)).catch(_ => client.log("Erreur, impossible de sauvegarder SCP-" + nb, "errorm"));

        viewer(client, interaction, data, { url: `${lg.scp.homepage}scp-${nb}`, ephemeral: false, name })
      } catch (err: any) {
        interaction.editReply({ content: `**:x: | ${interaction.translate("misc:error")}**\n\`${err}\`` })
        if (typeof err != 'string') client.error(err)
      }
    }
  }
})