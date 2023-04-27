/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { getDB } from ".";

export async function getName(data: { nb: string, lang: string, type: "scp" | "backrooms", id?: string }): Promise<string> {
  const database = getDB()
  if(!database) return ""

  if(data.type == "backrooms") {
    if(!data.id) return ""

    const filter = { nb: data.nb, lang: data.lang, id: data.id }
    const query = await database.EntryName.findOne(filter)

    return query?.name ?? ""
  } else {
    const filter = { nb: data.nb, lang: data.lang }
    const query = await database.ScpName.findOne(filter)

    return query?.name ?? ""
  }
}