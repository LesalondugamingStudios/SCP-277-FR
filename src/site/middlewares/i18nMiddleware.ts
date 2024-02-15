/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { NextFunction, Request, Response } from "express";
import { WanderersMain } from "../../structures";
import languages from "../../util/language.json";
import { Branches } from "../../types";
import { TFunction } from "i18next";

export default (m: WanderersMain) => (req: Request, res: Response, next: NextFunction) => {
  res.locals.root = `${req.protocol}://${req.hostname}${req.hostname == "localhost" ? ":5000" : ""}`
  res.locals.location = res.locals.root + req.originalUrl

  function translate(l: Branches): (key: string, args: {[key: string]: string}) => string {
    return (key: string, args: {[key: string]: string} = {}): string => {
      let language = m.i18n.get(l)
      let en = m.i18n.get("en")
      if (!language) language = en
      if (!language) return "um, well, no texts here. you should contact us on our support server https://discord.gg/NyUukwA"
    
      let translation = language(key, args)
      if (!translation || translation === key.split(":")[1]) {
        if (en) translation = en(key, args)
        if (!translation || translation === key.split(":")[1]) translation = (m.i18n.get("fr") as TFunction)(key, args)
      }
    
      return translation
    }
  }

  let langParams = `${req.originalUrl.split("/")[1]}` as Branches | undefined
  if(langParams && m.i18n.has(langParams)) {
    res.locals.t = translate(langParams)
    res.locals.l = langParams
    res.locals.wiki = m.lang[langParams]
    return next()
  }

  if(langParams && !(langParams in m.lang)) {
    res.locals.l = getLanguage(m, req)
    res.locals.t = translate(res.locals.l)
    res.locals.wiki = m.lang[res.locals.l]
    return next()
  }

  res.locals.t = translate("en")
  res.locals.l = "en"
  res.locals.wiki = m.lang.en
  return next()
}

export function getLanguage(m: WanderersMain, req: Request): Branches {
  let languagesRaw = req.headers['accept-language'] || 'en';
  let lparts = languagesRaw.split(',');
  let languages: string[] = [];

  for (let x = 0; x < lparts.length; x++) {
    let unLangParts = lparts[x].split(';');
    languages.push(unLangParts[0]);
  }

  for(let i = 0; i < languages.length; i++) {
    if(languages[i] in m.lang) return languages[i] as Branches
  }
  return "en"
}

export function extractMiddleware(req: Request, res: Response, next: NextFunction){
  if(req.params.lang){
    res.locals.locA = res.locals.location.split(`/${req.params.lang}`)
    res.locals.branch = req.params.lang as Branches
    res.locals.wiki = req.app.m.lang[req.params.lang as Branches]
  } else {
    let l = req.baseUrl.replaceAll("/", "") as Branches
    if(languages[l]) {
      res.locals.locA = res.locals.location.split(`/${l}`)
      res.locals.branch = l
      res.locals.wiki = req.app.m.lang[l as Branches]
    }
  }
  return next()
}