/*
 * Copyright (C) 2023-2025  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { WanderersMain } from "../../../structures";
import { Lang, WikiCategory, WikiImage, WikiMetadata } from "../../../types";

import TurndownService from "turndown";
import { WanderersEmbed } from "../../../structures/Embeds";
const turndownService = new TurndownService();

turndownService.addRule("strikethrough", {
  filter: "span",
  replacement: (content, node) => {
    // @ts-expect-error
    if(node.getAttribute("style")?.includes("line-through")) return `~~${content}~~`
    return content
  }
})

export function makeSCP(elements: Array<Element>, lang: Lang, images: WikiImage[] = [], metadata: WikiMetadata, m: WanderersMain): WikiCategory[] | null {
  // Vérifie la présence des éléments
  if (!elements) return null

  let i18n = lang.i18n && m.i18n.has(lang.i18n) ? m.i18n.get(lang.i18n) : m.i18n.get("en")
  if(!i18n) return null

  // Fonctions nécéssaires au bon fonctionnement du crawler
  function markdown(text: string) {
    return turndownService.turndown(text)
  }

  const baseCatogories = lang.scp.categories

  // Initialise les catégories
  const categories: WikiCategory[] = [{ name: i18n("viewer:info"), value: "infos", emoji: "<:info:1002142862181400586>", embeds: [new WanderersEmbed(true).setDescription(`${metadata.name ? `**${i18n("viewer:name")}** ${metadata.name}` : ""}\n${metadata.author ? `**${i18n("viewer:author")}** ${metadata.author}` : ""}\n${metadata.rating ? `**${i18n("viewer:rating")}** ${metadata.rating}` : ""}\n${metadata.at ? `**${i18n("viewer:created_at")}** ${metadata.at}` : ""}`)], indexs: [] }]

  if(!baseCatogories || !baseCatogories.length || (metadata.nb && m.exeptions.includes(metadata.nb))) {
    categories[0].name = i18n("viewer:default_replies.report")

    for(let i = 0; i < elements.length; i++){
      const element = elements[i]
      let text = markdown(element.innerHTML)
  
      // Remplace les trucs random
      text = text.replaceAll("](/", `](${lang ? lang.scp.homepage : "http://fondationscp.wikidot.com/"}`)
      text = text.replaceAll("&nbsp;", " ")
      text = text.replaceAll("javascript:;", "")

      generateDefault(text, "\n\n")
    }
    
    return categories
  }

  // Initialise les valeurs repaires
  let categoryIndex = -1

  for(let i = 0; i < elements.length; i++){
    const element = elements[i]
    let text = markdown(element.innerHTML)

    // Remplace les trucs random
    text = text.replaceAll("](/", `](${lang ? lang.scp.homepage : "http://fondationscp.wikidot.com/"}`)
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
    if(text.startsWith("**") && text.split(":**").length == 2) {
      // Vérifie si le contenu en gras correspond à une catégorie
      if(categoryIndex + 1 >= baseCatogories.length || !text.startsWith(baseCatogories[categoryIndex + 1].startsWith, 2)) {
        // Si c'est les trucs du début (Objet, classe) ça l'ajoute à l'embed présent
        if(categoryIndex == -1) {
          generateDefault(text)
          getCurrentCategory().indexs.push(i)
          continue
        } else {
          // Sinon le bot tente de déterminer une nouvelle catégorie (IL ESSAYE LE PAUVRE LAISSEZ LE TRANQUILLE)
          let splittedText = text.split("**")
          let categoryName = splittedText[1]
          if(categoryName.endsWith(":")) categoryName = categoryName.slice(0, -1).trim()

          if(splittedText[2]) {
            // Enlève le nom de la catégorie
            let cleanedTextArray = text.split("**")
            cleanedTextArray.splice(0, 2)
            let cleanedText = cleanedTextArray.join("**")

            // Créé la nouvelle catégorie
            categories.push({ name: categoryName, value: `category-${makeid(10)}`, embeds: [new WanderersEmbed(true).setDescription(cleanedText)], indexs: [i] })
            categoryIndex++

            continue
          } else {
            // Si le texte suivant est aussi une catégorie, ça le texte actuel
            let nextText = markdown(elements[i + 1].innerHTML)
            if(nextText.startsWith("**") && nextText.split(":**").length == 2) {
              getCurrentCategory().indexs.push(i)
              continue
            }

            // Créé la nouvelle catégorie
            categories.push({ name: categoryName, value: `category-${makeid(10)}`, embeds: [new WanderersEmbed(true)], indexs: [i] })
            categoryIndex++

            continue
          }
        }
      } else {
        // Enlève le nom de la catégorie
        let cleanedTextArray = text.split("**")
        cleanedTextArray.splice(0, 2)
        let cleanedText = cleanedTextArray.join("**")

        // Créé la nouvelle catégorie
        categoryIndex++
        categories.push({ name: baseCatogories[categoryIndex].name, value: baseCatogories[categoryIndex].value, emoji: baseCatogories[categoryIndex].emoji ?? undefined, embeds: [new WanderersEmbed(true).setDescription(cleanedText)], indexs: [i] })

        continue
      }
    }
    
    getCurrentCategory().indexs.push(i)
    let embed = getCurrentEmbed()

    // Vérifie la taille de l'embed ou du champ, en créé un nouveau si dépassement
    if(embed.size + text.length + 2 > 5700 || ((embed.description?.length ?? 0) + text.length + 2 > 2048) && (text.length + 2 > 1024)) {
      getCurrentCategory().embeds.push(new WanderersEmbed(true).setDescription(text))
      continue
    }

    // Ajoute le texte dans la description
    if(!embed.fields || !embed.fields.length) {
      if(!embed.description || !embed.description.length) {
        embed.setDescription(text)
        continue
      }

      if(embed.description.length + text.length + 2 <= 4096) {
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
      if(!field) {
        embed.addField("\u200B", text)
        continue
      }

      if(field.value.length + text.length + 2 <= 1024 ) {
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

    if(arg == "description") currentEmbed.addToDescripton(text, separate)
    else currentEmbed.addToLastField(text, separate)
  }

  function generateDefault(text: string, separate = "\n") {
    if(getCurrentEmbed().size + text.length + 1 > 5700) {
      getCurrentCategory().embeds.push(new WanderersEmbed(true).setDescription(text))
      return
    }
    if((getCurrentEmbed().description?.length ?? 0) + text.length + 1 < 4096) addToEmbed(text, "description", separate)
    else {
      if(text.length > 1024) {
        getCurrentCategory().embeds.push(new WanderersEmbed(true).setDescription(text))
        return
      }
      if(!getCurrentField() || (getCurrentField()?.value?.length ?? 0) + text.length + 1 > 1024) getCurrentEmbed().addField("\u200B", text)
      else addToEmbed(text, "field", separate)
    }
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

function makeid(length:number): string {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
