/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { ContextInteraction } from "../../../structures";
import { Lang, WikiCategory, WikiImage, WikiMetadata } from "../../../types";

import TurndownService from "turndown";
import { WanderersEmbed } from "../../../structures/Embeds";
import { ButtonInteraction } from "discord.js";
const turndownService = new TurndownService();

turndownService.addRule("strikethrough", {
  filter: "span",
  replacement: (content, node) => {
    // @ts-ignore
    if (node.getAttribute("style")?.includes("line-through")) return `~~${content}~~`
    return content
  }
})
export function makeEntry(elements: Array<Element>, lang: Lang, images: WikiImage[] = [], metadata: WikiMetadata, classe: (string | null)[] | null, interaction: ContextInteraction | ButtonInteraction): WikiCategory[] | null {
  // Vérifie la présence des éléments
  if (!elements) return null

  // Fonctions nécéssaires au bon fonctionnement du crawler
  function markdown(text: string) {
    return turndownService.turndown(text)
  }

  // Initialise les catégories
  const categories: WikiCategory[] = [{ name: interaction.translate("viewer:info"), value: "infos", emoji: "<:info:1002142862181400586>", embeds: [new WanderersEmbed().setDescription(`${metadata.name ? `**${interaction.translate("viewer:name")}** ${metadata.name}` : ""}\n${metadata.author ? `**${interaction.translate("viewer:author")}** ${metadata.author}` : ""}\n${metadata.rating ? `**${interaction.translate("viewer:rating")}** ${metadata.rating}` : ""}\n${metadata.at ? `**${interaction.translate("viewer:created_at")}** ${metadata.at}` : ""}\n\n${classe != null && classe.length == 4 ? `**${interaction.translate("backroom:level.class", { class: interaction.translate(`backroom:level.class_info.${classe[0]}.0`) })}**\n🔶 ${classe[1] ? classe[1] : interaction.translate(`backroom:level.class_info.${classe[0]}.1`)}\n🔶 ${classe[2] ? classe[2] : interaction.translate(`backroom:level.class_info.${classe[0]}.2`)}\n🔶 ${classe[3] ? classe[3] : interaction.translate(`backroom:level.class_info.${classe[0]}.3`)}\n` : ""}`)], indexs: [] }]

  // Initialise les valeurs repaires
  let categoryIndex = -1

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    let text = markdown(element.innerHTML)

    // Remplace les trucs random
    text = text.replaceAll("](/", `](${lang ? lang.backrooms.homepage : "http://fondationscp.wikidot.com/"}`)
    text = text.replaceAll("&nbsp;", " ")
    text = text.replaceAll("javascript:;", "")

    // Vérifie si ce n'est pas une nouvelle catégorie
    if (element.tagName == "H1" || element.tagName == "H2") {
      // Détermine une nouvelle catégorie
      let categoryName = text.replaceAll("**", "").replace(/:$/, "").trim()
      categories.push({ name: categoryName, value: `category-${makeid(10)}`, embeds: [new WanderersEmbed()], indexs: [i] })
      categoryIndex++
      continue
    } else if(categoryIndex == -1) {
      if(isSmallTitle(element)) {
        categories.push({ name: interaction.translate("viewer:default_replies.item_description"), value: `category-descentry-${makeid(5)}`, embeds: [new WanderersEmbed().addField(text, "")], indexs: [i] })
        categoryIndex++
      } else {
        addToEmbed(text, "description", "\n")
        getCurrentCategory().indexs.push(i)
      }
      continue
    } else if(isSmallTitle(element)) {
      getCurrentEmbed().addField(text, "")
      getCurrentCategory().indexs.push(i)
      continue
    }

    getCurrentCategory().indexs.push(i)
    let embed = getCurrentEmbed()

    // Vérifie la taille de l'embed ou du champ, en créé un nouveau si dépassement
    if (embed.size + text.length + 2 > 5700 || ((embed.description?.length ?? 0) + text.length + 2 > 2048) && (text.length + 2 > 1024)) {
      getCurrentCategory().embeds.push(new WanderersEmbed().setDescription(text))
      continue
    }

    // Ajoute le texte dans la description
    if (!embed.fields || !embed.fields.length) {
      if (!embed.description || !embed.description.length) {
        embed.setDescription(text)
        continue
      }

      if (embed.description.length + text.length + 2 <= 4096) {
        addToEmbed(text, "description", "\n\n")
        continue
      } else {
        embed.addField("\u200B", text)
        continue
      }

    } else {
      let field = getCurrentField()
      if (!field) {
        embed.addField("\u200B", text)
        continue
      }

      if ((field.value.length + text.length + 2) <= 1024) {
        addToEmbed(text, "field", "\n\n")
        continue
      } else {
        embed.addField("\u200B", text)
        continue
      }
    }

  }

  function getCurrentCategory() {
    return categories[categories.length - 1]
  }

  function getCurrentEmbed() {
    let currentCategory = getCurrentCategory()
    return currentCategory.embeds[currentCategory.embeds.length - 1]
  }

  function getCurrentField() {
    let currentEmbed = getCurrentEmbed()
    return currentEmbed.fields?.[currentEmbed.fields.length - 1]
  }

  function addToEmbed(text: string, arg: "description" | "field", separate: string) {
    let currentEmbed = getCurrentEmbed()

    if (arg == "description") currentEmbed.addToDescripton(text, separate)
    else currentEmbed.addToLastField(text, separate)
  }

  function isSmallTitle(element: Element) {
    if(element.tagName == "H3" || element.tagName == "H4") return true
    return false
  }

  // Ajoute les images aux catégories
  for(let i = 0; i < images.length; i++) {
    const image = images[i]
    
    let category = categories.find(c => c.indexs.includes(image.position))
    if(!category) continue

    let firstEmbed = category.embeds[0]
    if(!firstEmbed.image?.url) {
      firstEmbed.addField(interaction.translate("viewer:images"), markdown(image.description)).setImage(image.url)
    }

    if(!category.images) category.images = []
    category.images.push(new WanderersEmbed().setTitle(`${category.name} - ${markdown(image.description)}`).setImage(image.url))
  }

  return categories
}

function makeid(length: number): string {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

export function getClassLevel(page: HTMLElement) {
  let classes = {
    c0: page.getElementsByClassName("class-0"),
    c1: page.getElementsByClassName("class-1"),
    c2: page.getElementsByClassName("class-2"),
    c3: page.getElementsByClassName("class-3"),
    c4: page.getElementsByClassName("class-4"),
    c5: page.getElementsByClassName("class-5"),
    cu: page.getElementsByClassName("class-unknown"),
    ch: page.getElementsByClassName("class-habitable"),
    cp: page.getElementsByClassName("class-pending")
  }
  let classe

  let i: keyof typeof classes

  for (i in classes) {
    if (classes[i].length) classe = { index: i, c: classes[i] }
  }

  if (!classe) return null

  let extra = classe.c[3].children[0].children
  let infos: ("c0" | "c1" | "c2" | "c3" | "c4" | "c5" | "cu" | "ch" | "cp" | string | null)[]= [classe.index, null, null, null]

  let n: keyof typeof numbers = 1
  let numbers = { 1: "one", 2: "two", 3: "three" }

  let j: keyof typeof extra
  for (j in extra) {
    if(!extra[j].children) continue
    let element = extra[j].children[0]
    // @ts-ignore
    if (element.innerHTML != `{$${numbers[n]}}`) infos[n] = element.innerHTML
    if(n + 1 < 4) n++
    else continue
  }

  return infos
}