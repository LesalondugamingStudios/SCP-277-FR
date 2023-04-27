/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import mfetch from "node-fetch"
import { JSDOM } from "jsdom"
import TurndownService from "turndown"
import { WanderersClient } from "../../../structures"
import { Lang } from "../../../types"
const td = new TurndownService()
td.addRule("links", {
  filter: ["a"],
  replacement: (content) => `${content}||`
})

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
          const html = await fetch(langObj.series[j])

          let data = []
          const dom = new JSDOM(html).window.document.getElementById("page-content");
          let list = dom?.querySelectorAll("li") ?? []

          for (let k = 0; k < list.length; k++) {
            if (list[k].innerHTML.includes("newpage")) continue
            let text = td.turndown(list[k].innerHTML)
            let splitted = text.split("|| - ")
            let regex = /scp-[0-9]+[-a-zA-Z]{0,3}/gi
            let found = splitted[0].match(regex)
            if (found && splitted[1]) {
              let nb = splitted[0].split("-").slice(1).join("-").toLowerCase(),
                lang = i,
                name = splitted[1]
              if (langObj.notavailable?.includes(splitted[1])) continue
              if (!nb || !lang || !name) continue
              data.push({ nb, lang, name })
            }
          }

          client.mongoose.ScpName.insertMany(data, (err) => {
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