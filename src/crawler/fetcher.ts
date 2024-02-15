/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { WanderersMain } from "../structures";
import { Lang, SavedEntry, SavedSCP, WikiReportResponse } from "../types";
import { getHTML, makeEntry, makeSCP } from "./getters/html";
import { CrawlerError } from "./error"
import { error, log } from "../util/logging";

export async function getReport(m: WanderersMain, wikiType: "scp" | "backrooms", id: string, lang: Lang, type?: "level" | "entity" | "object" | "other"): Promise<WikiReportResponse> {
  let name: string
  let savedData: SavedEntry | SavedSCP | null = null

  if(wikiType == "scp") {
    if (lang.shortcut === "en" && id.split("-").length > 1) {
      let numArray = id.split("-")
      if (numArray[1].toLowerCase() != "j") {
        lang.scp.homepage = m.lang["int"].scp.homepage
        lang.scp.img = m.lang["int"].scp.img
        lang.name = m.lang["int"].name
        lang.shortcut = m.lang["int"].shortcut
      }
    }

    name = (await m.mongoose.getSCPName(id.toLowerCase(), lang.shortcut))?.name || ""
    savedData = await m.mongoose.getSCP(id, lang.shortcut)
  } else {
    if (type == "level") id = formatNum(id)
    if(!lang.backrooms) lang = m.lang["en"]
    if(!type) return { error: "Entry type not provided" }

    name = (await m.mongoose.getEntryName(type, id.toLowerCase(), lang.shortcut))?.name || ""
    savedData = await m.mongoose.getEntry(type, id, lang.shortcut)
  }

  if (savedData && Date.now() - savedData.updatedAt.getTime() < 604800000) return { data: JSON.parse(savedData.data), images: JSON.parse(savedData.images ?? "[]"), name, lastUpdate: savedData.updatedAt, createdAt: savedData.wikiCreatedAt, wiki: wikiType, lang: lang.shortcut, id, backroomsType: type, classe: "classe" in savedData ? JSON.parse(savedData.classe) : undefined }

  try {
    const html = await getHTML(wikiType == "scp" ? `${lang.scp.homepage}scp-${id}` : `${lang.backrooms.homepage}${type != "other" ? type + "-" : ""}${id}`)
    if(!html) throw new CrawlerError("html")
    if(name) html.metadata.name = name
    html.metadata.nb = id
    const data = wikiType == "scp" ? makeSCP(html.elements, lang, html.images, html.metadata, m) : makeEntry(html.elements, lang, html.images, html.metadata, html.classe, m)
    if(!data || !data.length) throw new CrawlerError("markdown")

    if(savedData) {
      wikiType == "scp" ? await m.mongoose.Scp.updateOne({ nb: id, lang: lang.shortcut }, { data: JSON.stringify(data), images: JSON.stringify(html.images) }) : await m.mongoose.Entry.updateOne({ id: type, nb: id, lang: lang.shortcut }, { data: JSON.stringify(data), images: JSON.stringify(html.images), classe: JSON.stringify(html.classe) })
    } else {
      if(wikiType == "scp"){
        const doc = new m.mongoose.Scp({ nb: id, lang: lang.shortcut, data: JSON.stringify(data), images: JSON.stringify(html.images), wikiCreatedAt: new Date(html.metadata.at != "unknown" ? html.metadata.at : 0) });
        doc.save().then(_ => log(`SCP-${id} saved (${lang.shortcut})`, "data")).catch(_ => log(`Impossible de sauvegarder SCP-${id} (${lang.shortcut})`, "errorm"));
      } else {
        const doc = new m.mongoose.Entry({ id: type, nb: id, lang: lang.shortcut, data: JSON.stringify(data), images: JSON.stringify(html.images), wikiCreatedAt: new Date(html.metadata.at != "unknown" ? html.metadata.at : 0), classe: JSON.stringify(html.classe) });
        doc.save().then(_ => log(`${type} ${id} saved (${lang.shortcut})`, "data")).catch(_ => log(`Impossible de sauvegarder ${type} ${id} (${lang.shortcut})`, "errorm"));
      }
    }

    return { data: JSON.parse(JSON.stringify(data)), images: html.images, name, lastUpdate: new Date(), createdAt: new Date(html.metadata.at != "unknown" ? html.metadata.at : 0), wiki: wikiType, lang: lang.shortcut, id, backroomsType: type, classe: html.classe }
  } catch (err: any) {
    if (typeof err == 'string') log(err, "errorm")
    else error(err)
    return { error: `${err}` }
  }
}

function formatNum(num: string): string {
  if (num.startsWith("-")) {
    num = "minus" + num
  }
  num = num.replace(/\./, "-")
  return num
}