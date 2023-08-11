/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import mfetch from "node-fetch"
import { JSDOM, VirtualConsole } from "jsdom"
import TurndownService from "turndown"
import { WanderersClient } from "../../../structures"
import { Lang } from "../../../types"
import { generateUserAgent } from "../../../config"

const td = new TurndownService()
td.addRule("links", {
  filter: ["a"],
  // @ts-ignore
  replacement: (_, node) => `#${node.href.substring(1)}#||`
})

const virtualConsole = new VirtualConsole()

export default async (client: WanderersClient) => {
  await client.mongoose.EntryName.deleteMany({});
  client.log("ALL ENTRIES NAMES HAVE BEEN REMOVED FROM DB", "data")

  let langs = client.lang
  for (let i in langs) {
    // @ts-ignore
    let langObj = (langs[i] as Lang).backrooms
    if (!langObj) continue
    if (langObj.series) {
      for (let j in langObj.series) {
        try {
          // @ts-ignore
          await fetchBackroomsSerie(client, langObj.series[j], langs[i])
          await wait(3)
        } catch (e: any) {
          client.log(`Error @ ${i}.${j}`, "errorm")
          client.error(e)
        }
      }
    }
  }
}

export async function fetchBackroomsSerie(client: WanderersClient, serie: string, branch: Lang){
  const html = await fetch(serie)

  let data = []
  const dom = new JSDOM(html, { virtualConsole }).window.document.getElementById("page-content");
  let list = dom?.querySelectorAll("li") ?? []

  for (let k = 0; k < list.length; k++) {
    if (list[k].innerHTML.includes("newpage")) continue
    let text = td.turndown(list[k].innerHTML)
    let splitted = text.split(/\|\| [-—] /gi)

    let type = text.split("#")[1]?.split("-")
    if(!type) continue

    if(text.split("#")[1].includes("ttp://")) type = text.split("#")[1].split("/").slice(3).join("/").split("-")

    if (branch.backrooms.notavailable?.includes(splitted[1])) continue
    let id = type[0].toLowerCase(),
      nb = type.slice(1).join("-"),
      lang = branch.shortcut,
      name = splitted[1]

    if(id != "level" && id != "object" && id != "entity") {
      nb = `${id}-${nb}`
      id = "other"
    }
    if(!name) name = list[k].getElementsByTagName("a")[0].innerHTML
    if (!id || !nb || !lang || !name) continue

    data.push({ id, nb, lang, name })
  }

  await client.mongoose.EntryName.insertMany(data)
}

function fetch(url: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const response = await mfetch(url, { headers: { "User-Agent": generateUserAgent() } })

    if(!response.ok) return reject(`${response.status} - ${response.url}`)

    resolve(await response.text())
  })
}

function wait(sec: number) {
  return new Promise(resolve => {
    setTimeout(function () {
      resolve(true)
    }, sec * 1000)
  })
}