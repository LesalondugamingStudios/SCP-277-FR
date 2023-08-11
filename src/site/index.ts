/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import express from "express"
import { join } from "path"
import { WanderersClient } from "../structures"
import i18nMiddleware, { getLanguage } from "./middlewares/i18nMiddleware"
import cookieParser from "cookie-parser"
import { LangRouter } from "./routes/lang"

export default (client: WanderersClient) => {
  const app = express()

  app.disable("x-powered-by")
  app.client = client
  app.locals.langs = client.lang

  app.use(cookieParser())
  app.use(express.static("src/site/public"))
  app.use(i18nMiddleware(client))

  app.set('view engine', 'ejs');
  app.set("views", join(__dirname, "/views"))

  app.get("/", (req, res) => res.redirect(`/${getLanguage(client, req)}/`))
  app.get("/invite", (req, res) => res.redirect("https://discord.com/api/oauth2/authorize?client_id=568437925453234176&permissions=388096&scope=bot%20applications.commands"))
  app.get("/vote", (req, res) => res.redirect("https://top.gg/bot/568437925453234176/vote"))
  app.get("/support", (req, res) => res.redirect("https://discord.gg/NyUukwA"))
  app.get("/translate", (req, res) => res.redirect("https://crowdin.com/project/scp-277-fr"))
  app.get("/terms", (req, res) => res.render("legal/terms"))
  app.get("/privacy", (req, res) => res.render("legal/privacy"))

  app.get("/search/json", async (req, res) => {
    let { type, keyword, lang } = req.query
    if(type != "scp" && type != "backrooms") return res.status(400).send({ code: 400, error: "Invalid type" })
    if(typeof keyword != "string") return res.status(400).send({ code: 400, error: "Invalid keyword" })
    if(typeof lang != "string") return res.status(400).send({ code: 400, error: "Invalid lang" })

    let filter = { lang }
    const data = await (type == "scp" ? client.mongoose.ScpName.find(filter) : client.mongoose.EntryName.find(filter))
    if(!data.length) return res.send([])

    let keywords = keyword.split(" ").map(k => k.toLowerCase())

    let sureMatch = data.filter(entry => keywords.includes(entry.nb.toLowerCase()))
    let otherMatchesPct = data.map(entry => {
      let score = 0
      let name = entry.name.replaceAll(/[?.\/!*()"]+/gm, "").replaceAll(/(?<= )-(?= )/gm, "").split(" ").filter(s => s).map(n => n.toLowerCase())
      for(let keyword of keywords) {
        for(let namePart of name) {
          if(namePart == keyword) score++
        }
        if(entry.nb.toLowerCase().includes(keyword)) score += 0.5
      }
      
      return { score: score / ((name.length * (keywords.length == 1 && name.length != 1 ? 2 : keywords.length)) / 2), entry }
    })
    let otherMatches = otherMatchesPct.filter((d, i) => d.score > 0.2).sort((a, b) => b.score - a.score)

    let response = [...sureMatch.map(m =>  Object.assign({ score: 1 }, m.toJSON())), ...otherMatches.map(m => Object.assign({ score: m.score }, m.entry.toJSON()))]
    let responseIds = response.map(e => e._id.toString())

    res.send(response.filter((e, i) => responseIds.findIndex(id => id == e._id.toJSON()) == i).slice(0, 25))
  })
  
  for(const key of Object.keys(client.lang)) {
    if(key == "int") continue
    // @ts-ignore
    app.use(`/${client.lang[key].shortcut}`, LangRouter)
  }

  return app
}