/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */


declare namespace Express {
  export interface Application {
    client: import("../structures").WanderersClient
  }
  export interface Locals {
    langs: { [key in import(".").Branches]: import(".").Lang }
    wiki: import(".").Lang
    branch: import(".").Branches
    l: import(".").Branches
    t: (key: string, args: {[key: string]: string}) => string
    root: string
    location: string
    locA?: string[]
  }
}