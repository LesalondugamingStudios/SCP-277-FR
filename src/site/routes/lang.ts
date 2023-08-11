/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { Router } from "express"
import { extractMiddleware } from "../middlewares/i18nMiddleware"
import { Lang, WikiReport } from "../../types"
import { getReport } from "../../crawler"
import { HTMLViewer } from "../../crawler/viewer"

export const LangRouter = Router()

LangRouter.use(extractMiddleware)

LangRouter.get("/", async (req, res) => {
  let recentSCP = await req.app.client.mongoose.Scp.find({ lang: res.locals.branch }).sort("-wikiCreatedAt").limit(2)
  let recentSCPReports: WikiReport[] = []
  let recentEntryReports: WikiReport[] = []

  for(const scp of recentSCP) {
    try {
      let report = await getReport(req.app.client, "scp", scp.nb, JSON.parse(JSON.stringify(res.locals.wiki)) as Lang)
      if("error" in report) throw report.error
      recentSCPReports.push(report)
    } catch(error: any) {
      if (typeof error == 'string') req.app.client.log(error, "errorm")
      else req.app.client.error(error)
    }
  }

  if(res.locals.wiki.backrooms) {
    let recentEntry = await req.app.client.mongoose.Entry.find({ lang: res.locals.branch }).sort("-wikiCreatedAt").limit(2)
    for(const entry of recentEntry) {
      try {
        let report = await getReport(req.app.client, "backrooms", entry.nb, JSON.parse(JSON.stringify(res.locals.wiki)) as Lang, entry.id)
        if("error" in report) throw report.error
        recentEntryReports.push(report)
      } catch(error: any) {
        if (typeof error == 'string') req.app.client.log(error, "errorm")
        else req.app.client.error(error)
      }
    }  
  }
  
  res.render("index", { recentSCPReports, recentEntryReports })
})

LangRouter.get("/scp", async (req, res) => {
  let showcase = (await req.app.client.mongoose.ScpName.find({ lang: res.locals.branch })).shuffle().slice(0, 25)
  if(typeof req.query.random != "undefined" && showcase.length) return res.redirect(`${req.baseUrl}/scp/${showcase[0].nb}`)
  res.render("scp/index", { showcase })
})
LangRouter.get("/scp/:id", async (req, res) => {
  let scp = req.params.id
  let wiki = JSON.parse(JSON.stringify(res.locals.wiki)) as Lang
  
  try {
    let report = await getReport(req.app.client, "scp", scp, wiki)
    if("error" in report) throw report.error

    res.render("scp/report", { name: report.name, scp, HTML: HTMLViewer(report), url: `${req.app.client.lang[report.lang].scp.homepage}scp-${report.id}` })
  } catch(error: any) {
    if (typeof error == 'string') req.app.client.log(error, "errorm")
    else req.app.client.error(error)

    return res.status(500).render("error", { code: 500, message: error })
  }
})

LangRouter.get("/backrooms", async (req, res) => {
  if(!res.locals.wiki.backrooms) return res.status(404).render("error", { code: 404, messageid: "site:errors.no_backrooms" })
  let showcase = (await req.app.client.mongoose.EntryName.find({ lang: res.locals.branch })).shuffle().slice(0, 25)
  if(typeof req.query.random != "undefined" && showcase.length) return res.redirect(`${req.baseUrl}/backrooms/${showcase[0].id}-${showcase[0].nb}`)
  res.render("backrooms/index", { showcase })
})

LangRouter.get("/backrooms/:type-:id", async (req, res) => {
  let type = req.params.type
  let id = req.params.id
  let wiki = JSON.parse(JSON.stringify(res.locals.wiki)) as Lang

  if(!wiki.backrooms) return res.status(404).render("error", { code: 404, messageid: "site:errors.no_backrooms" })
  if(type != "level" && type != "entity" && type != "object" && type != "other") return res.status(400).render("error", { code: 400, messageid: "site:error.bad_type" })
  
  try {
    let report = await getReport(req.app.client, "backrooms", id, wiki, type)
    if("error" in report) throw report.error

    res.render("backrooms/report", { name: report.name, id, type, HTML: HTMLViewer(report), url: `${req.app.client.lang[report.lang].backrooms.homepage}${report.backroomsType != "other" ? `${report.backroomsType}-` : ""}${report.id}`, classe: report.classe })
  } catch(error: any) {
    if (typeof error == 'string') req.app.client.log(error, "errorm")
    else req.app.client.error(error)

    return res.status(500).render("error", { code: 500, message: error })
  }
})