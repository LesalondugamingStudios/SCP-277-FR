/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { ButtonInteraction } from "discord.js"
import { getReport, viewer } from "../../crawler"
import { Command, WanderersClient, WanderersEmbed } from "../../structures"
import { Branches } from "../../types"
import { error, log } from "../../util/logging"

export default new Command({
  __local: true,
  name: "detectionsee",
  async buttonExec(client: WanderersClient, interaction: ButtonInteraction, args: string[]) {
    await interaction.deferReply({ ephemeral: true })

    let nb = args[0]
    let branch = args[1] as Branches

    let lg = JSON.parse(JSON.stringify(client.m.lang[branch]))
    
    try {
      let report = await getReport(client.m, "scp", nb, lg)
      if("error" in report) throw report.error

      for(let i = 0; i < report.data.length; i++) {
        for(let j = 0; j < report.data[i].embeds.length; j++) {
          report.data[i].embeds[j] = new WanderersEmbed(report.data[i].embeds[j]).setDefault({ user: interaction.user, translatable: interaction, type: "scp", lang: lg })
        }

        for(let j = 0; j < (report.data[i].images?.length ?? 0); j++) {
          report.data[i].images![j] = new WanderersEmbed(report.data[i].images![j])
        }
      }

      client.stats.addScpView(nb, lg.shortcut);
      viewer(client, interaction, report, { url: `${lg.scp.homepage}scp-${nb}`, ephemeral: false, name: report.name })
    } catch(e: any) {
      interaction.editReply({ content: `**:x: | ${interaction.translate("misc:error")}**\n\`${e}\`` })
      if (typeof e == 'string') log(e, "errorm")
      else error(e)
    }
  }
})