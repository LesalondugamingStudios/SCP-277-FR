/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { WanderersClient } from "../structures/Client"
import { BaseInteraction, Message } from "discord.js"
import langs from "./language.json"
import { TFunction } from "i18next"
import { log } from "./logging"

declare global {
  interface String {
    capitalize: () => this
  }
  interface Array<T> {
    shuffle: () => Array<T>
  }
}

declare module "discord.js" {
  // @ts-ignore
  interface Guild {
    client: WanderersClient
    db?: import("../types").SavedGuild
  }
  // @ts-ignore
  interface BaseInteraction {
    client: WanderersClient
    getLang: () => string
    translate: (key: string, args?: {[key:string]: string}) => string
  }
  // @ts-ignore
  interface Message {
    client: WanderersClient
    getLang: () => string
    translate: (key: string, args?: {[key:string]: string}) => string
  }
}

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase()
}
Array.prototype.shuffle = function () {
  let currentIndex = this.length, randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [this[currentIndex], this[randomIndex]] = [
      this[randomIndex], this[currentIndex]
    ];
  }

  return this;
}

BaseInteraction.prototype.getLang = function(){
  if (!this.guild?.db || !this.guild?.db.defaultBranch) return "en"
  return langs[this.guild?.db.defaultBranch].i18n ?? "en"
}

BaseInteraction.prototype.translate = function(key: string, args: {[key:string]: string} = {}) {
  let language = this.client.m.i18n.get(this.getLang())
  let en = this.client.m.i18n.get("en")
  if (!language) language = en
  if (!language) return "um, well, no texts here. you should contact us on our support server https://discord.gg/NyUukwA"

  let translation = language(key, args)
  if (!translation || translation === key.split(":")[1]) {
    log(`Key inconnu ${this.getLang()} ${key} ${args}`, "warn")
    if (en) translation = en(key, args)
    if (!translation || translation === key.split(":")[1]) translation = (this.client.m.i18n.get("fr") as TFunction)(key, args)
  }

  return translation
}

Message.prototype.getLang = function(){
  if (!this.guild?.db || !this.guild?.db.defaultBranch) return "en"
  return langs[this.guild?.db.defaultBranch].i18n ?? "en"
}

Message.prototype.translate = function(key: string, args: {[key:string]: string} = {}) {
  let language = this.client.m.i18n.get(this.getLang())
  let en = this.client.m.i18n.get("en")
  if (!language) language = en
  if (!language) return "um, well, no texts here. you should contact us on our support server https://discord.gg/NyUukwA"

  let translation = language(key, args)
  if (!translation || translation === key.split(":")[1]) {
    log(`Key inconnu ${this.getLang()} ${key} ${args}`, "warn")
    if (en) translation = en(key, args)
    if (!translation || translation === key.split(":")[1]) translation = (this.client.m.i18n.get("fr") as TFunction)(key, args)
  }

  return translation
}