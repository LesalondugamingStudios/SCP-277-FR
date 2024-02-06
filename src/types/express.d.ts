/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

declare namespace Express {
  export interface Application {
    m: import("../structures").WanderersMain
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