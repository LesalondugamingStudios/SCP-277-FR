/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { WanderersClient } from "../structures/Client"
import { BaseInteraction, Message } from "discord.js"
import langs from "./language.json"
import { TFunction } from "i18next"

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

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [this[currentIndex], this[randomIndex]] = [
      this[randomIndex], this[currentIndex]
    ];
  }

  return this;
}

BaseInteraction.prototype.getLang = function(){
  if (!this.guild?.db || !this.guild?.db.defaultBranch) return "en-US"
  // @ts-ignore
  return langs[this.guild?.db.defaultBranch].i18n ?? "en-US"
}

BaseInteraction.prototype.translate = function(key: string, args: {[key:string]: string} = {}) {
  let language = this.client.i18n.get(this.getLang())
  let en = this.client.i18n.get("en-US")
  if (!language) language = en
  if (!language) return "um, well, no texts here. you should contact us on our support server https://discord.gg/NyUukwA"

  let translation = language(key, args)
  if (!translation || translation === key.split(":")[1]) {
    this.client.log(`Key inconnu ${this.getLang()} ${key} ${args}`, "warn")
    if (en) translation = en(key, args)
    if (!translation || translation === key.split(":")[1]) translation = (this.client.i18n.get("fr-FR") as TFunction)(key, args)
  }

  return translation
}

Message.prototype.getLang = function(){
  if (!this.guild?.db || !this.guild?.db.defaultBranch) return "en-US"
  // @ts-ignore
  return langs[this.guild?.db.defaultBranch].i18n ?? "en-US"
}

Message.prototype.translate = function(key: string, args: {[key:string]: string} = {}) {
  let language = this.client.i18n.get(this.getLang())
  let en = this.client.i18n.get("en-US")
  if (!language) language = en
  if (!language) return "um, well, no texts here. you should contact us on our support server https://discord.gg/NyUukwA"

  let translation = language(key, args)
  if (!translation || translation === key.split(":")[1]) {
    this.client.log(`Key inconnu ${this.getLang()} ${key} ${args}`, "warn")
    if (en) translation = en(key, args)
    if (!translation || translation === key.split(":")[1]) translation = (this.client.i18n.get("fr-FR") as TFunction)(key, args)
  }

  return translation
}