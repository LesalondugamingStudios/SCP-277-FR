/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { WanderersMain } from "../../../structures";
import { Lang, WikiCategory, WikiClasse, WikiImage, WikiMetadata } from "../../../types";

import TurndownService from "turndown";
import { WanderersEmbed } from "../../../structures/Embeds";
const turndownService = new TurndownService();

turndownService.addRule("strikethrough", {
  filter: "span",
  replacement: (content, node) => {
    // @ts-ignore
    if (node.getAttribute("style")?.includes("line-through")) return `~~${content}~~`
    return content
  }
})

export function makeEntry(elements: Array<Element>, lang: Lang, images: WikiImage[] = [], metadata: WikiMetadata, classe: WikiClasse, m: WanderersMain): WikiCategory[] | null {
  // Vérifie la présence des éléments
  if (!elements) return null

  let i18n = lang.i18n && m.i18n.has(lang.i18n) ? m.i18n.get(lang.i18n) : m.i18n.get("en")
  if(!i18n) return null

  // Fonctions nécéssaires au bon fonctionnement du crawler
  function markdown(text: string) {
    return turndownService.turndown(text)
  }

  // Initialise les catégories
  let diamondText = classe.id || classe.classeName ? (
    classe.id ?
      `**${i18n("backroom:level.class", {
        class: i18n(`backroom:level.class_info.${classe.id}.0`)
      })}**\n🔶 ${classe.strings[0] ? classe.strings[0] : i18n(`backroom:level.class_info.${classe.id}.1`)}\n🔶 ${classe.strings[1] ? classe.strings[1] : i18n(`backroom:level.class_info.${classe.id}.2`)}\n🔶 ${classe.strings[2] ? classe.strings[2] : i18n(`backroom:level.class_info.${classe.id}.3`)}\n\n` :
      `**${i18n("backroom:level.class", {
        class: classe.classeName
      })}**\n🔶 ${classe.strings[0] ? classe.strings[0] : i18n("misc:states.unknown").capitalize()}\n🔶 ${classe.strings[1] ? classe.strings[1] : i18n("misc:states.unknown").capitalize()}\n🔶 ${classe.strings[2] ? classe.strings[2] : i18n("misc:states.unknown").capitalize()}\n\n`
  ) : ""
  const categories: WikiCategory[] = [{ name: i18n("viewer:info"), value: "infos", emoji: "<:info:1002142862181400586>", embeds: [
    new WanderersEmbed(true).setDescription(
      `${metadata.name ? `**${i18n("viewer:name")}** ${metadata.name}` : ""}\n${metadata.author ? `**${i18n("viewer:author")}** ${metadata.author}` : ""}\n${metadata.rating ? `**${i18n("viewer:rating")}** ${metadata.rating}` : ""}\n${metadata.at ? `**${i18n("viewer:created_at")}** ${metadata.at}` : ""}\n\n${diamondText}`
    )
  ], indexs: [] }]

  // Initialise les valeurs repaires
  let categoryIndex = -1

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    let text = markdown(element.innerHTML)

    // Remplace les trucs random
    text = text.replaceAll("](/", `](${lang ? lang.backrooms.homepage : "http://fondationscp.wikidot.com/"}`)
    text = text.replaceAll("&nbsp;", " ")
    text = text.replaceAll("javascript:;", "")

    // Gère les blockquotes
    if(element.parentElement?.tagName == "BLOCKQUOTE") {
      let blockquoteContent = element.parentElement.children
      let amt = blockquoteContent.length - 1

      let texts = ["```\n"]
      let j = 0
      for (let k = 0; k < blockquoteContent.length; k++) {
        let content = blockquoteContent[k] as HTMLElement
        if (texts[j].length > 3900) {
          texts[j] += "```"
          j++
          texts[j] = "```\n"
        }
        texts[j] += `${content.textContent}\n\n`
      }
      texts[j] += "```"

      for(let j = 0; j < amt; j++) {
        getCurrentCategory().indexs.push(i + j)
      }

      i += amt

      if (texts.length > 1) {
        for(let k = 0; k < texts.length; k++) {
          if(!getCurrentEmbed().description) addToEmbed(texts[k], "description", "\n\n")
          else getCurrentCategory().embeds.push(new WanderersEmbed(true).setDescription(texts[k]))
        }
      } else {
        if(!getCurrentEmbed().description) addToEmbed(texts[0], "description", "\n\n")
        else getCurrentCategory().embeds.push(new WanderersEmbed(true).setDescription(texts[0]))
      }
      continue
    } else
    // Vérifie si ce n'est pas une nouvelle catégorie
    if (element.tagName == "H1" || element.tagName == "H2") {
      // Détermine une nouvelle catégorie
      let categoryName = text.replaceAll("**", "").replace(/:$/, "").trim()
      categories.push({ name: categoryName, value: `category-${makeid(10)}`, embeds: [new WanderersEmbed(true)], indexs: [i] })
      categoryIndex++

      // Si le texte suivant est aussi une catégorie
      if(elements[i + 1].tagName == "H2") {
        addToEmbed(`### ${markdown(elements[i + 1].innerHTML)}\n`, "description", "")
        getCurrentCategory().indexs.push(i, i+1)
        i++
      }
      continue
    } else if(categoryIndex == -1) {
      if(isSmallTitle(element)) {
        categories.push({ name: i18n("viewer:default_replies.item_description"), value: `category-descentry-${makeid(5)}`, embeds: [new WanderersEmbed(true).addField(text, "")], indexs: [i] })
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
      getCurrentCategory().embeds.push(new WanderersEmbed(true).setDescription(text))
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
      if(text.length + 2 > 1024) {
        getCurrentCategory().embeds.push(new WanderersEmbed(true).setDescription(text))
        continue
      }

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
      firstEmbed.addField(i18n("viewer:images"), markdown(image.description)).setImage(image.url)
    }

    if(!category.images) category.images = []
    category.images.push(new WanderersEmbed(true).setTitle(`${category.name} - ${markdown(image.description)}`).setImage(image.url))
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

export function getClassLevel(page: HTMLElement): WikiClasse {
  let classes = {
    c0: page.getElementsByClassName("class-0"),
    c1: page.getElementsByClassName("class-1"),
    c2: page.getElementsByClassName("class-2"),
    c3: page.getElementsByClassName("class-3"),
    c4: page.getElementsByClassName("class-4"),
    c5: page.getElementsByClassName("class-5"),
    cu: page.getElementsByClassName("class-unknown"),
    ch: page.getElementsByClassName("class-habitable"),
    cp: page.getElementsByClassName("class-pending"),
    cd: page.getElementsByClassName("class-deadzone"),
    cna: page.getElementsByClassName("class-n/a"),
    ca: page.getElementsByClassName("class-amended"),
    co: page.getElementsByClassName("class-omega"),
  }

  let classe
  let i: keyof typeof classes
  for (i in classes) {
    if (classes[i].length) classe = { index: i, c: classes[i] }
  }

  let color: string | null = page.querySelector(".top-box")?.className.split(" ").find(c => c.startsWith("color"))?.split("-")[1]?.replace("#", "") || null
  if(typeof color == "string" && color.includes("color")) color = null

  if (!classe) {
    return {
      id: null, classeName: page.querySelector(".gradient-box .bottom-text p")?.innerHTML || null,
      strings: [
        page.querySelector(".bottom-box ul li:nth-child(1) > span")?.innerHTML || null,
        page.querySelector(".bottom-box ul li:nth-child(2) > span")?.innerHTML || null,
        page.querySelector(".bottom-box ul li:nth-child(3) > span")?.innerHTML || null
      ], image: page.querySelector(".diamond-image")?.className.split(" ").find(c => c.startsWith("http")) || null,
      color
    }
  }

  let extra = classe.c[3]?.children[0].children
  let infos: [string | null, string | null, string | null] = [null, null, null]

  if(!extra) return {
    id: classe.index,
    classeName: null,
    strings: infos,
    image: null,
    color
  }

  let numbers = { 1: "one", 2: "two", 3: "three" }
  let n: keyof typeof numbers = 1

  let j: keyof typeof extra
  for (j in extra) {
    if(!extra[j].children) continue
    let element = extra[j].children[0]
    // @ts-ignore
    if (element.innerHTML != `{$${numbers[n]}}`) infos[n] = element.innerHTML
    if(n + 1 < 4) n++
    else continue
  }

  return {
    id: classe.index,
    classeName: null,
    strings: infos,
    image: null,
    color
  }
}