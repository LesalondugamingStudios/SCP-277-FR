/*
 * Copyright (C) 2023-2025  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { JSDOM, VirtualConsole } from "jsdom";
import { WikiImage } from "../../../types";
import { getMetadata } from "../metadata";
import { makeSCP } from "./scp";
import { makeEntry, getClassLevel } from "./backrooms";
import { generateUserAgent } from "../../../config";

import { CrawlerError } from "../../error";

const virtualConsole = new VirtualConsole()

export async function getHTML(url: string) {
  // Envoie une requête pour récupérer les données
  const response = await fetch(url, { headers: { "User-Agent": generateUserAgent() } })
  if (!response.ok) throw new CrawlerError("request", `${response.status} : ${response.statusText}`)

  // Transforme le corps de la réponse en DOM
  const body = new JSDOM(await response.text(), { virtualConsole })
  const page = body.window.document.getElementById("page-content")
  if (!page) return

  // Récupère les métadonnées
  let metadata = await getMetadata(url)
  let classe = getClassLevel(page)

  let elements = page.querySelectorAll("p, h1, h2, h3, h4, h5, h6, ul, div.scp-image-caption")

  // Récupération des exeptions
  let elementArray: Element[] = []
  
  // Récupération de la position des images
  let imgPosition: number[] = []

  // Vérifie si chaque élément est valide
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].tagName == "P" && elements[i].parentElement?.className.includes("scp-image-caption")) continue
    if (elements[i].className.includes("scp-image-caption")) imgPosition.push(elementArray.length)
    if (!testElement(elements[i])) elementArray.push(elements[i])
  }

  // Récupère les images
  let images: WikiImage[] = []
  let imgBalise: NodeListOf<HTMLImageElement> = page.querySelectorAll("div.scp-image-block img")
  let imgDescription = page.querySelectorAll("div.scp-image-caption")

  if (imgBalise.length && imgDescription.length) {
    for (let i = 0, j = 0; i < imgBalise.length && i < imgDescription.length; i++, j++) {
      if (imgBalise[i].parentElement?.className.includes("image-click-fullscreen-base")) i++
      images.push({ url: imgBalise[i].src, description: imgDescription[j].innerHTML, position: imgPosition[j] })
    }
  }

  return { elements: elementArray, images, metadata, classe }
}

function testElement(paragraph: Element): boolean {
  if (!paragraph.parentElement) return true
  let classname = paragraph.parentElement?.className

  function integralCheck(name: string, type: "className" | "id" = "className", includes = false) {
    let finished = false
    let result = false
    let currentNode: HTMLParagraphElement | ParentNode = paragraph

    if(includes ?  paragraph[type].includes(name) : paragraph[type] == name) return true

    while (!finished) {
      if (!currentNode.parentElement) {
        finished = true
        continue
      }
      if (includes ? currentNode.parentElement[type].includes(name) : currentNode.parentElement[type] == name) {
        result = true
        finished = true
      } else {
        if (currentNode.parentElement.className == "page-content") finished = true
        if (currentNode.parentNode) currentNode = currentNode.parentNode
      }
    }

    return result
  }

  if (paragraph.tagName.toLowerCase() == "div" ||
    integralCheck("credit") ||
    integralCheck("scp-image-caption") ||
    integralCheck("custom-copyright") ||
    integralCheck("footer-wikiwalk-nav") ||
    integralCheck("u-buttonbox", "id") ||
    integralCheck("gradient-box") ||
    integralCheck("bottom-box", "className", true) ||
    integralCheck("u-infobox", "id") ||
    integralCheck("u-credit-view", "id") ||
    integralCheck("u-audio", "id") ||
    integralCheck("creditRate", "className", true) ||
    integralCheck("pseudomodal-container") ||
    integralCheck("info-container", "className", true) ||
    integralCheck("multibranch-wrapper", "className", true) ||
    integralCheck("licensebox", "className", true)) return true

  if (classname == "collapsible-block-content" && paragraph.innerHTML.includes("Cite this page as")) {
    paragraph.parentElement.setAttribute("class", "custom-copyright")
    return true
  }

  return false
}

export { makeSCP, makeEntry }