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
          const html = await fetch(langObj.series[j])

          let data = []
          const dom = new JSDOM(html, { virtualConsole }).window.document.getElementById("page-content");
          let list = dom?.querySelectorAll("li") ?? []

          for (let k = 0; k < list.length; k++) {
            if (list[k].innerHTML.includes("newpage")) continue
            let text = td.turndown(list[k].innerHTML)
            let splitted = text.split("|| - ")

            let type = text.split("#")[1].split("-")

            if (langObj.notavailable?.includes(splitted[1])) continue
            let id = type[0].toLowerCase(),
              nb = type.slice(1).join("-"),
              lang = i,
              name = splitted[1]

            if (!id || !nb || !lang || !name) continue
            data.push({ id, nb, lang, name })
          }

          client.mongoose.EntryName.insertMany(data, (err: any) => {
            if (err) client.error(err)
          })
          await wait(3)
        } catch (e: any) {
          client.error(e)
        }
      }
    }
  }
}

function fetch(url: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const response = await mfetch(url, {
      headers: {
        'User-Agent': 'SCP277FR/1.0 (Linux; DBOT) node-fetch'
      }
    })

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