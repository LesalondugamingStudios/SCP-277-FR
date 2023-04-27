/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import fetch from "node-fetch";
import TurndownService from "turndown";
const turndownService = new TurndownService();
import jsdom from "jsdom";
import { Command, ContextInteraction, WanderersClient, WanderersEmbed } from "../../structures";
import { ApplicationCommandOptionType } from "discord.js";
import { FimSelectorByCountry } from "../../types";
import { FimTitle } from '../../types/index';
const { JSDOM } = jsdom;

function mise_en_forme(text: string) {
  return turndownService.turndown(text)
}

export default new Command({
  name: "fim",
  description: "Displays the requested FIM.",
  category: "SCP",
  options: [{
    type: ApplicationCommandOptionType.String,
    name: "pays",
    description: "The country of the FIM",
    choices: [{
      name: "Française",
      value: "fr"
    }, {
      name: "Anglaise",
      value: "en"
    }, {
      name: "Allemande",
      value: "de"
    }, {
      name: "Espagnole",
      value: "es"
    }, {
      name: "Italienne",
      value: "it"
    }],
    required: true
  }, {
    type: ApplicationCommandOptionType.String,
    name: "fim",
    description: "The requested FIM"
  }],
  async execute(client: WanderersClient, ctx: ContextInteraction) {
    // get le pays (fim française, anglaise etc)
    let country = ctx.options.getString("pays")
    // get le nom de la fim (optionnelle)
    let fim_name = ctx.options.getString("fim")

    let link: string = "";
    let selecteur: string = "";

    // vu que le wiki est très bien fais, c'est des liens différents et des selecteurs CSS différents.....
    let all_country: FimSelectorByCountry = {
      "fr": ["http://fondationscp.wikidot.com/forces-intervention", `page.querySelector("#page-content > div:nth-child(3) > blockquote > div > div.collapsible-block-unfolded > div.collapsible-block-content > p:nth-child(2)").querySelectorAll("a")`], // français
      "en": ["http://fondationscp.wikidot.com/task-forces", "page.querySelector(\"blockquote div.collapsible-block-content\").querySelectorAll(\"a\")"], // anglais
      "de": ["http://fondationscp.wikidot.com/fim-allemandes", "page.querySelector(\"div#toc-list\").querySelectorAll(\"a\")"], // allemand
      "es": ["http://fondationscp.wikidot.com/destacamentos-moviles-hispanoparlantes", `page.querySelector("#page-content > div:nth-child(2) > blockquote > div > div.collapsible-block-unfolded > div.collapsible-block-content > p:nth-child(2)").querySelectorAll("a")`], // espagnol
      "it": ["http://fondationscp.wikidot.com/squadre-speciali-mobili", "page.querySelector(\"div#toc-list\").querySelectorAll(\"a\")"] // italien
    }

    // assigne le lien et le selecteur qui va avec
    for (let coun in all_country) {
      if (country === coun) {
        link = all_country[coun as keyof FimSelectorByCountry][0]
        selecteur = all_country[coun as keyof FimSelectorByCountry][1]
      }
    }

    const request = await fetch(link)
    if (!request.ok) return ctx.reply({ content: `**:x: | ${ctx.translate("misc:error")}**`, ephemeral: true })

    const html = await request.text()

    let page = new JSDOM(html).window.document.getElementById("page-content");
    let fim_name_all = eval(selecteur);
    let textSplited: Array<string> = [];
    for (let i = 0; i < fim_name_all.length; i++) {
      textSplited.push(fim_name_all[i].innerHTML + "\n");
    }

    let text: string = "";
    if (fim_name == null) {
      // AFFICHE TOUTES LES FIM'S DU PAYS

      text = textSplited.join("");

      const embed = new WanderersEmbed()
        .setTitle(ctx.translate("scp:FIM.list", { country: ctx.translate(`scp:FIM.countries.${country}`) }))
        .setColor("#000000")
        .setDescription(text)
        .setThumbnail(client.user!.displayAvatarURL({ size: 2048 }));

      ctx.reply({ embeds: [embed] });

    } else {
      if (country === "it") return ctx.reply({ content: `**:x: | ${ctx.translate("scp:FIM.errors.it_error")}**`, ephemeral: true })
      //fim_name = fim_name.substring(1)
      for (let fim of textSplited) {
        if (fim.toLowerCase().includes(fim_name.toLowerCase())) {
          fim_name = fim.slice(0, -1)
          // get le texte de toute les fim's
          // #page-content>DIV:nth-of-type(6) pour l'anglais de 6 à 47 (6 et 47 inclus)
          let all_text_fim: NodeListOf<Element> = page!.querySelectorAll("div.content-panel.standalone.series");

          // chercher le texte qui va avec la fim qu'a dit l'utilisateur
          for (let index in all_text_fim) {
            if (index.match("[a-zA-Z]+")) continue
            if (parseInt(index) <= 0) continue;
            // vu que le wiki n'es pas du tout opti, le code ici ne l'ai pas aussi
            try {
              // get le titre mais sa différe en fonction des branche de la fondation

              let check_title: FimTitle = {
                "en": "all_text_fim[index].querySelector(\"h1 span\").innerHTML",
                "fr": "all_text_fim[index].querySelector(\"h1 span\").innerHTML + ' (' + all_text_fim[index].querySelector(\"h2 span\").innerHTML + ')'",
                "de": "all_text_fim[index].querySelector(\"h2 span\").innerHTML",
                "es": "all_text_fim[index].querySelector(\"h1 span\").innerHTML"
              }

              if (eval(check_title[country as keyof FimTitle]) == fim_name) {
                // on a get le text qu'on veut
                // Tous les textes

                // si il y a un rapport d'activité : OUT
                if (all_text_fim[index].querySelectorAll("p")[1].innerHTML === "<strong>Rapports d'Activité :</strong>") return ctx.reply({ content: `**:x: | ${ctx.translate("scp:FIM.errors.not_supported")}**`, ephemeral: true })

                let mission = all_text_fim[index].querySelectorAll("p")[0].innerHTML.split(":")

                let objets_confine_liste;
                let objets_confine_text: string = "";

                try {
                  objets_confine_liste = all_text_fim[index].querySelectorAll("ul")[0].querySelectorAll("a")
                  if (objets_confine_liste[0] === undefined) throw "Erreur volontaire";
                  for (let i = 0; i < objets_confine_liste.length; i++) {
                    objets_confine_text += objets_confine_liste[i].innerHTML + "\n"
                  }
                } catch {
                  if (all_text_fim[index].querySelectorAll("ul")[0].querySelector("li")?.innerHTML === "[DONNÉES SUPPRIMÉES]") { objets_confine_text = ctx.translate("scp:FIM.default_replies.deleted_data") }
                  else { objets_confine_text = ctx.translate("scp:FIM.default_replies.no_object") }
                }

                let rapport_de_mission_liste;
                let rapport_de_mission_text: string = ""

                try {
                  rapport_de_mission_liste = all_text_fim[index].querySelectorAll("ul")[1].querySelectorAll("a")
                  if (rapport_de_mission_liste[0] === undefined) throw "Erreur volontaire";
                  for (let i = 0; i < rapport_de_mission_liste.length; i++) {
                    rapport_de_mission_text += rapport_de_mission_liste[i].innerHTML + "\n"
                  }
                } catch {
                  if (all_text_fim[index].querySelectorAll("ul")[1].querySelector("li")?.innerHTML === "[DONNÉES SUPPRIMÉES]") { rapport_de_mission_text = ctx.translate("scp:FIM.default_replies.deleted_data") }
                  else { rapport_de_mission_text = ctx.translate("scp:FIM.default_replies.no_object") }
                }


                let embed = new WanderersEmbed()
                  .setTitle(fim_name)
                  .setColor("#000000")
                  .addField(mise_en_forme(mission[0]), mise_en_forme(mission[1]))
                  .addField(`**${ctx.translate("scp:FIM.confined_objects")}**`, objets_confine_text)
                  .addField(`**${ctx.translate("scp:FIM.reports")}**`, rapport_de_mission_text)
                  .setThumbnail(client.user!.displayAvatarURL({ size: 2048 }));

                try {
                  embed.setImage(all_text_fim[index].querySelector("img")!.src)
                } catch { }


                ctx.reply({ embeds: [embed] })
                break
              }
            } catch (error) {
              ctx.reply({ content: `**:x: | ${ctx.translate("scp:FIM.errors.not_supported")}**`, ephemeral: true })
              console.log(error)
              break
            }
          }
          return
        }
      }

      return ctx.reply({ content: `**:x: | ${ctx.translate("scp:FIM.errors.not_exist")}**`, ephemeral: true })
    }
  }
})