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
}).addRule("bold", {
  filter: ["strong", "b"],
  replacement: (content) => content
})

const virtualConsole = new VirtualConsole()

export default async (client: WanderersClient) => {
  await client.mongoose.ScpName.deleteMany({});
  client.log("ALL SCP NAMES HAVE BEEN REMOVED FROM DB", "data")

  let langs = client.lang
  for (let i in langs) {
    // @ts-ignore
    let langObj = (langs[i] as Lang).scp
    if (!langObj) continue
    if (langObj.series) {
      for (let j in langObj.series) {
        try {
          // @ts-ignore
          await fetchSCPSerie(client, langObj.series[j], langs[i])
          await wait(3)
        } catch (e: any) {
          client.log(`Error @ ${i}.${j}`, "errorm")
          client.error(e)
        }
      }
    }
  }
}

export async function fetchSCPSerie(client: WanderersClient, serie: string, branch: Lang){
  const html = await fetch(serie)

  let data = []
  const dom = new JSDOM(html, { virtualConsole }).window.document.getElementById("page-content");
  let list = dom?.querySelectorAll("li") ?? []

  for (let k = 0; k < list.length; k++) {
    if (list[k].innerHTML.includes("newpage")) continue
    let text = td.turndown(list[k].innerHTML)
    let splitted = text.split(/\|\| [-—] /gi)

    let nb = text.split("#")[1]
    if(!nb) continue
    if(nb.includes("ttp://")) nb = nb.split("/").slice(3).join("/")

    let regex = /^scp-(?:(?:[0-9]{3,}(?:-[a-zA-Z]{2})?)|(?:[a-zA-Z]{2}-[0-9]{3,}))(?:-[a-z]{1,3})?/gi
    let found = nb.match(regex)

    nb = nb.split("-").slice(1).join("-")

    if (found && splitted[1]) {
      let lang = branch.shortcut,
        name = splitted[1]
      if (branch.scp.notavailable?.includes(splitted[1])) continue
      if (!name) continue
      data.push({ nb, lang, name })
    }
  }

  await client.mongoose.ScpName.insertMany(data)
}

function fetch(url: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const response = await mfetch(url, { headers: { "User-Agent": generateUserAgent() } })
    const html = await response.text()

    if(!response.ok) return reject(`${response.status} - ${response.url}`)

    resolve(html)
  })
}

function wait(sec: number) {
  return new Promise(resolve => {
    setTimeout(function () {
      resolve(true)
    }, sec * 1000)
  })
}