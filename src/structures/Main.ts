/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { TFunction } from "i18next";
import { config } from "../config";
import { WanderersDatabase } from "../models";
import i18n from "./i18n";
import { Branches, Lang } from "../types";
import { getEntriesNames, getSCPNames } from "../crawler";
import { fetchBackroomsSerie } from "../crawler/getters/names/getEntriesNames";
import { fetchSCPSerie } from "../crawler/getters/names/getSCPNames";
import langs from "../util/language.json";
import scpexeptions from "../util/exeptions.json";
import { setDB } from "../crawler/getters/database";

export class WanderersMain {
  config: typeof config
	mongoose: WanderersDatabase
	i18n: Map<string, TFunction>
	lang: { [key in Branches]: Lang }
	exeptions: string[]
	fn: { getEntriesNames: typeof getEntriesNames, getSCPNames: typeof getSCPNames, fetchBackroomsSerie: typeof fetchBackroomsSerie, fetchSCPSerie: typeof fetchSCPSerie }

  constructor() {
    this.config = config
		this.mongoose = new WanderersDatabase()

    this.lang = langs as unknown as { [key in Branches]: Lang }
    this.exeptions = scpexeptions
    this.i18n = new Map()

    this.fn = { getEntriesNames, getSCPNames, fetchBackroomsSerie, fetchSCPSerie }
  }

  async init() {
    this.i18n = await i18n()
    setDB(this.mongoose)

    if(this.config.state == "release") {
			//this.updateNames()
			setInterval(() => this.updateNames, 604800000)
		}
  }

  async updateNames() {
		await this.fn.getSCPNames(this)
		await this.fn.getEntriesNames(this)
		return true
	}
}