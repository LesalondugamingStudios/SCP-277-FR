/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { CommandOptions } from "../types"
import { ApplicationCommandOptionData, ApplicationCommandSubCommandData, ApplicationCommandType } from "discord.js"
import { WanderersClient } from "./Client"

export class Command {
  name: string
  nameLocalizations: {[key: string]: string}
  description: string
  descriptionLocalizations: {[key: string]: string}
  category: string
  execute: Function
  autocomplete?: Function
  options: ApplicationCommandOptionData[]
  isDevOnly: boolean
  type: ApplicationCommandType.ChatInput | ApplicationCommandType.User | ApplicationCommandType.Message
  defaultMemberPermissions: bigint[] | null
  memberPermissionsString: string[] | null
  __local?: boolean
  __type?: string

  constructor(options: CommandOptions) {
    this.name = options.name
    this.nameLocalizations = options.nameLocalizations ?? {}
    this.description = options.description ?? ""
    this.descriptionLocalizations = options.descriptionLocalizations ?? {}
    this.category = options.category ?? ""

    if(!options.execute && !options.buttonExec && !options.ctxMenuExec) throw new Error("No execute function provided")
    // @ts-ignore
    this.execute = options.execute ?? options.buttonExec ?? options.ctxMenuExec
    this.autocomplete = options.autocomplete

    this.options = (options.options as unknown as ApplicationCommandOptionData[]) || []
    this.isDevOnly = options.isDevOnly ?? false
    this.type = resolveCommandType(options.type || "CHAT_INPUT")
    this.defaultMemberPermissions = options.memberPermissions || null
    this.memberPermissionsString = options.memberPermissionsString || null

    this.__local = options.__local
    this.__type = options.__type
  }

  setLocalizations(client: WanderersClient) {
    function getValue(lang: string, key: string) {
      let language = client.i18n.get(lang)
      if(!language) return null

      let translation = language(key)
      if (!translation || translation === key.split(":")[1]) return null
      return translation
    }

    const langs = Array.from(Object.values(client.lang)).filter(l => l.i18n)
    for(const lang of langs) {
      let dlocale = lang.dlocale || lang.shortcut
      if(!lang.i18n || !dlocale) continue
      let descriptionLocalizations = getValue(lang.i18n, `help:${this.name}.description`)
      if(this.type == ApplicationCommandType.ChatInput && descriptionLocalizations) this.descriptionLocalizations[dlocale] = descriptionLocalizations

      if(this.__type != "sub"){
        for(let i = 0; i < this.options.length; i++) {
          let option = this.options[i]
          if(!option.descriptionLocalizations) option.descriptionLocalizations = {}
          let descriptionLocalizations = getValue(lang.i18n, `help:${this.name}.options.${i}`)
          // @ts-ignore
          if(descriptionLocalizations) option.descriptionLocalizations[dlocale] = descriptionLocalizations
        }
      } else {
        for(let i = 0; i < this.options.length; i++) {
          let sub = this.options[i] as ApplicationCommandSubCommandData
          if(!sub.descriptionLocalizations) sub.descriptionLocalizations = {}
          let descriptionLocalizations = getValue(lang.i18n, `help:${this.name}.subcommands.${sub.name}.description`)
          // @ts-ignore
          if(descriptionLocalizations) sub.descriptionLocalizations[dlocale] = descriptionLocalizations
          if(!sub.options) continue
          for(let j = 0; j < sub.options.length; j++) {
            let option = sub.options[j]
            if(!option.descriptionLocalizations) option.descriptionLocalizations = {}
            let descriptionLocalizations = getValue(lang.i18n, `help:${this.name}.subcommands.${sub.name}.options.${j}`)
            // @ts-ignore
            if(descriptionLocalizations) option.descriptionLocalizations[dlocale] = descriptionLocalizations
          }
        }
      }
    }
  }

  toJSON() {
    return { type: this.type, name: this.name, nameLocalizations: this.nameLocalizations, description: this.description, descriptionLocalizations: this.descriptionLocalizations, options: this.options, defaultMemberPermissions: this.defaultMemberPermissions, dmPermission: true }
  }
}

function resolveCommandType(type: "CHAT_INPUT" | "USER" | "MESSAGE"): ApplicationCommandType {
  if(type == "CHAT_INPUT") return ApplicationCommandType.ChatInput
  if(type == "USER") return ApplicationCommandType.User
  if(type == "MESSAGE") return ApplicationCommandType.Message
  return ApplicationCommandType.ChatInput
}