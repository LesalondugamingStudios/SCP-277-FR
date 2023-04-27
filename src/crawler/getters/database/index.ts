/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { WanderersDatabase } from "../../../models";

let database: WanderersDatabase | undefined

export function setDB(db: WanderersDatabase){
  database = db
}

export function getDB() {
  return database
}