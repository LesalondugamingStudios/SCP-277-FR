/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { getHTML, makeSCP, makeEntry } from "./getters/html"
import { getMetadata } from "./getters/metadata"
import { getEntriesNames, getSCPNames } from "./getters/names"
import { viewer } from "./viewer"
import { getReport } from "./fetcher"

export {
  getHTML,
  getReport,
  makeSCP,
  makeEntry,
  getMetadata,
  getEntriesNames,
  getSCPNames,
  viewer
}