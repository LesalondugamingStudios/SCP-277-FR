/*
 * Copyright (C) 2023-2025  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { CommandOptions } from "../types"
import { APIApplicationCommandSubcommandOption, ApplicationCommandType, ContextMenuCommandBuilder, Locale, RESTPostAPIChatInputApplicationCommandsJSONBody, RESTPostAPIContextMenuApplicationCommandsJSONBody, SlashCommandBuilder } from "discord.js"
import { WanderersClient } from "./Client"

export class Command {
  command: RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIContextMenuApplicationCommandsJSONBody
  category: string
  execute: Function
  autocomplete?: Function
  isDevOnly: boolean
  memberPermissions: bigint[]
  memberPermissionsString: string[]
  __local?: boolean
  __type?: string

  constructor(options: CommandOptions) {
    this.command = options.command
    this.category = options.category ?? ""

    if(!options.execute && !options.buttonExec && !options.ctxMenuExec) throw new Error("No execute function provided")
    this.execute = (options.execute ?? options.buttonExec ?? options.ctxMenuExec)!
    this.autocomplete = options.autocomplete

    this.isDevOnly = options.isDevOnly ?? false

    this.memberPermissionsString = options.memberPermissionsString || []
    this.memberPermissions = options.memberPermissions || []

    this.__local = options.__local
    this.__type = options.__type
  }

  setLocalizations(client: WanderersClient) {
    function getValue(lang: string, key: string) {
      let language = client.m.i18n.get(lang)
      if(!language) return null

      let translation = language(key)
      if (!translation || translation === key.split(":")[1]) return null
      return translation
    }

    const langs = Array.from(Object.values(client.m.lang)).filter(l => l.i18n)
    for(const lang of langs) {
      let dlocale = (lang.dlocale || lang.shortcut) as Locale
      if(!lang.i18n || !dlocale) continue

      let nameLocalization = getValue(lang.i18n, `help:${this.command.name}.name`)
      if(nameLocalization) {
        if(!this.command.name_localizations) this.command.name_localizations = {}
        this.command.name_localizations[dlocale] = nameLocalization
      }

      let descriptionLocalization = getValue(lang.i18n, `help:${this.command.name}.description`)
      if(this.command.type == ApplicationCommandType.ChatInput && descriptionLocalization) {
        if(!this.command.description_localizations) this.command.description_localizations = {}
        this.command.description_localizations[dlocale] = descriptionLocalization

        if(this.__type != "sub"){
          for(let i = 0; i < (this.command.options?.length ?? 0); i++) {
            let option = this.command.options![i]

            if(!option.name_localizations) option.name_localizations = {}
            if(!option.description_localizations) option.description_localizations = {}

            let nameLocalization = getValue(lang.i18n, `help:${this.command.name}.options.${i}.name`)
            if(nameLocalization) option.name_localizations[dlocale] = nameLocalization

            let descriptionLocalization = getValue(lang.i18n, `help:${this.command.name}.options.${i}.description`)
            if(descriptionLocalization) option.description_localizations[dlocale] = descriptionLocalization
          }
        } else {
          for(let i = 0; i < (this.command.options?.length ?? 0); i++) {
            let sub = this.command.options![i] as APIApplicationCommandSubcommandOption

            if(!sub.name_localizations) sub.name_localizations = {}
            if(!sub.description_localizations) sub.description_localizations = {}

            let nameLocalization = getValue(lang.i18n, `help:${this.command.name}.subcommands.${sub.name}.name`)
            if(nameLocalization) sub.name_localizations[dlocale] = nameLocalization

            let descriptionLocalization = getValue(lang.i18n, `help:${this.command.name}.subcommands.${sub.name}.description`)
            if(descriptionLocalization) sub.description_localizations[dlocale] = descriptionLocalization

            if(!sub.options) continue

            for(let j = 0; j < sub.options.length; j++) {
              let option = sub.options[j]

              if(!option.name_localizations) option.name_localizations = {}
              if(!option.description_localizations) option.description_localizations = {}

              let nameLocalization = getValue(lang.i18n, `help:${this.command.name}.subcommands.${sub.name}.options.${j}.name`)
              if(nameLocalization) option.name_localizations[dlocale] = nameLocalization

              let descriptionLocalization = getValue(lang.i18n, `help:${this.command.name}.subcommands.${sub.name}.options.${j}.description`)
              if(descriptionLocalization) option.description_localizations[dlocale] = descriptionLocalization
            }
          }
        }
      }
    }
  }
}

export class ChatCommand extends Command {
  command: RESTPostAPIChatInputApplicationCommandsJSONBody

  constructor(options: { command: RESTPostAPIChatInputApplicationCommandsJSONBody } & Omit<CommandOptions, "command">) {
    super(options)
    this.command = options.command
  }
}

export class ContextCommand extends Command {
  command: RESTPostAPIContextMenuApplicationCommandsJSONBody

  constructor(options: { command: RESTPostAPIContextMenuApplicationCommandsJSONBody } & Omit<CommandOptions, "command">) {
    super(options)
    this.command = options.command
  }
}