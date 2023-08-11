/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { ApplicationCommandOptionChoiceData, ApplicationCommandOptionType, AutocompleteInteraction, ButtonInteraction, GuildChannelTypes, InteractionDeferReplyOptions, InteractionReplyOptions, MessageContextMenuCommandInteraction, MessageEditOptions, BaseMessageOptions, UserContextMenuCommandInteraction, WebhookFetchMessageOptions, MessageCreateOptions } from "discord.js"
import { ContextInteraction, WanderersClient, WanderersEmbed } from "../structures"

// Core
export interface CommandOptions {
  name: string
  nameLocalizations?: {[key: string]: string}
  description?: string
  descriptionLocalizations?: {[key: string]: string}
  category?: string
  execute?: (client: WanderersClient, ctx: ContextInteraction, args?: string[]) => Promise<any>
  autocomplete?: (client: WanderersClient, interaction: AutocompleteInteraction) => Promise<any>
  buttonExec?: (client: WanderersClient, interaction: ButtonInteraction, args: string[]) => Promise<any>
  ctxMenuExec?: (client: WanderersClient, interaction: UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction) => Promise<any>
  options?: AnyOption[]
  isDevOnly?: boolean
  type?: "CHAT_INPUT" | "USER" | "MESSAGE"
  memberPermissions?: bigint[]
  memberPermissionsString?: string[]
  __local?: boolean
  __type?: string
}

// Language Module
export interface Lang {
  /**
   * Le nom complet de la langue
   */
  name: string
  /**
   * Le raccourci de la langue
   */
  shortcut: Branches
  /**
   * Le code i18n de la langue
   */
  i18n: string | null
  /**
   * Le code du pays
   */
  countryFlagId: string
  scp: SCPLang
  backrooms: BackroomsLang
  /**
   * Discord locale
   */
  dlocale?: string
}

export interface SCPLang {
  /**
   * L'URL de la page d'acceuil de la langue
   */
  homepage: string
  /**
   * L'image de la langue
   */
  img: string
  categories?: {name: string, value: string, emoji?: string, startsWith: string}[]
  /**
   * Objet des series de la langue
   */
  series?: object
  notavailable?: Array<string>
}

export interface BackroomsLang {
  /**
   * L'URL de la page d'acceuil de la langue
   */
  homepage: string
  /**
   * L'image de la langue
   */
  img: string
  /**
   * Objet des series de la langue
   */
  series?: object
  notavailable?: Array<string>
}

export type Branches = "de" | "en" | "es" | "fr" | "it" | "pl" | "pt" | "cz" | "ru" | "ua" | "th" | "cn" | "jp" | "zh-tr" | "ko" | "vn" | "tr" | "el" | "int"

// Database
export interface SavedGuild {
  guildID: string
  defaultBranch: Branches
  deleteReport: boolean
  scpDetection: boolean
  messageCommand: boolean
}

export interface SavedSCP {
  nb: string
  lang: Branches
  data: string
  wikiCreatedAt: Date
  images?: string
  createdAt: Date
  updatedAt: Date
}

export interface SavedSCPName {
  nb: string
  lang: string
  name: string
}

export interface SavedEntry {
  id: string
  nb: string
  lang: string
  data: string
  wikiCreatedAt: Date
  images?: string
  classe: string
  createdAt: Date
  updatedAt: Date
}

export interface SavedEntryName {
  id: string
  nb: string
  lang: string
  name: string
}

// Crawler
export interface CromResponse {
  page: {
    wikidotInfo: {
      rating: number
      voteCount: number
      createdBy: {
        name: string
      }
      createdAt: string
    }
  }
}

export interface WikiImage {
  url: string
  description: string
  position: number
}

export type LevelClasse = "c0" | "c1" | "c2" | "c3" | "c4" | "c5" | "cu" | "ch" | "cd" | "cp" | "cna" | "ca" | "co"

export interface WikiClasse {
  id: LevelClasse | null
  classeName: string | null
  strings: [string | null, string | null, string | null]
  color: string | null
  image: string | null
}

export interface WikiMetadata {
  url: string
  name?: string
  nb?: string
  rating: string
  author: string
  at: string
}

export interface WikiCategory {
  name: string
  value: string
  emoji?: string
  description?: string
  default?: boolean
  embeds: WanderersEmbed[]
  images?: WanderersEmbed[]
  indexs: number[]
}

export interface WikiReport {
  data: WikiCategory[]
  images?: WikiImage[]

  name?: string
  createdAt: Date
  lastUpdate: Date

  wiki: "scp" | "backrooms"
  lang: Branches
  id: string
  backroomsType?: "level" | "entity" | "object" | "other"

  classe?: WikiClasse
}

export type WikiReportResponse = WikiReport | { error: any }

export interface WikiReportOptions {
  decoratorStart?: string
  decoratorEnd?: string
  inParagraph?: boolean
}

export interface OldSCP {
  title?: string
  desc?: string
  fields?: Array<OldSCPField>
  img?: string
}

export interface OldSCPField {
  name: string
  val: string
}

// Viewer
export interface OldViewerOptions {
  ephemeral?: boolean,
  url: string,
  button?: boolean,
  name?: string
}

// Fim
export interface FimSelectorByCountry {
  fr: Array<string>,
  en: Array<string>,
  de: Array<string>,
  es: Array<string>,
  it: Array<string>
}

export interface FimTitle {
  fr: string,
  en: string,
  de: string,
  es: string
}

// Retyping djs
export interface AnyOption {
  type: ApplicationCommandOptionType
  name: string
  nameLocalizations?: string[]
  nameLocalized?: string
  description?: string
  descriptionLocalizations?: string[]
  descriptionLocalized?: string
  options?: AnyOption[]
  required?: boolean
  autocomplete?: boolean
  choices?: ApplicationCommandOptionChoiceData[]
  channelTypes?: GuildChannelTypes[]
  minValue?: number
  maxValue?: number
  _isLong?: boolean
}

export type CommandReplyOption = InteractionReplyOptions &
  MessageCreateOptions &
  InteractionDeferReplyOptions &
  WebhookFetchMessageOptions &
  MessageEditOptions;
