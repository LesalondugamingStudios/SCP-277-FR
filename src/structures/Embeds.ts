/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { APIEmbed, APIEmbedAuthor, APIEmbedField, APIEmbedFooter, APIEmbedImage, APIEmbedThumbnail, BaseInteraction, ButtonInteraction, Message, User } from "discord.js";
import { Lang } from "../types";
import { ContextInteraction } from "./ContextInteraction";

export class WanderersEmbed {
  id?: string
  author?: APIEmbedAuthor
  color?: number
  description?: string
  fields?: APIEmbedField[]
  footer?: APIEmbedFooter
  image?: APIEmbedImage
  thumbnail?: APIEmbedThumbnail
  timestamp?: string
  title?: string
  url?: string
  /**
   * If true, disable EmbedErrors related to text
   * addFields excluded
   */
  soft: boolean

  constructor(soft: boolean)
  constructor(data?: APIEmbed & { id?: string }, soft?: boolean)
  constructor(dataOrSoft?: APIEmbed & { id?: string } | boolean, soft?: boolean) {
    if(typeof dataOrSoft == "boolean") this.soft = !!dataOrSoft
    else {
      this.soft = !!soft

      this.id = dataOrSoft?.id

      this.author = dataOrSoft?.author
      this.color = dataOrSoft?.color
      this.description = dataOrSoft?.description
      this.fields = dataOrSoft?.fields
      this.footer = dataOrSoft?.footer
      this.image = dataOrSoft?.image
      this.thumbnail = dataOrSoft?.thumbnail
      this.timestamp = dataOrSoft?.timestamp
      this.title = dataOrSoft?.title
      this.url = dataOrSoft?.url
    }

    if(this.soft && !this.id) this.id = makeid(60)
  }

  private __validateText(input: string, type: "author" | "title" | "description" | "field:name" | "field:value" | "footer") {
    if(this.soft) return true
    if(type == "author") if(input.length > 256) throw new EmbedError("Author Name", 256)
    if(type == "title") if(input.length > 256) throw new EmbedError("Title", 256)
    if(type == "description") if(input.length > 4096) throw new EmbedError("Description", 4096)
    if(type == "field:name") if(input.length > 256) throw new EmbedError("Field Name", 256)
    if(type == "field:value") if(input.length > 1024) throw new EmbedError("Field Value", 1024)
    if(type == "footer") if(input.length > 2048) throw new EmbedError("Footer Text", 2048)
    if(this.size + input.length > 6000) throw new EmbedError("Text Fields", 6000)
    return true
  }

  get size(): number {
    let size = 0

    if(this.description) size += this.description.length
    if(this.title) size += this.title.length
    if(this.author) size += this.author.name.length
    if(this.footer) size += this.footer.text.length

    if(this.fields && this.fields.length) {
      for(const field of this.fields) {
        size += field.name.length + field.value.length
      }
    }

    return size
  }

  setAuthor(data: APIEmbedAuthor) {
    this.__validateText(data.name, "author")

    this.author = data
    return this
  }

  setColor(data: string | number) {
    if(typeof data == "string") this.color = parseInt(data.replace('#', ''), 16)
    else this.color = data
    return this
  }

  setDescription(data: string) {
    this.__validateText(data, "description")

    this.description = data
    return this
  }

  addField(name: string, value: string, inline: boolean = false) {
    const data = { name, value, inline }

    if(!this.fields) this.fields = []
    if(this.fields.length == 25) throw new EmbedError("Fields", 25, "items")

    this.__validateText(data.name, "field:name")
    this.__validateText(data.value, "field:value")

    this.fields.push(data)
    return this
  }

  addFields(...data: APIEmbedField[]) {
    if(!this.fields) this.fields = []
    if(this.fields.length + data.length > 25) throw new EmbedError("Fields", 25, "items")

    for(let i = 0; i < data.length; i++) {
      if(data[i].name.length > 256) throw new EmbedError(`Field Name [${i}]`, 256)
      if(data[i].value.length > 1024) throw new EmbedError(`Field Value [${i}]`, 1024)
    }

    this.fields.push(...data)
    if(!this.validate()) throw new EmbedError("Text Fields", 6000)
    return this
  }

  setFooter(data: APIEmbedFooter) {
    this.__validateText(data.text, "footer")

    this.footer = data
    return this
  }

  setImage(data: string) {
    this.image = { url: data }
    return this
  }

  setThumbnail(data: string) {
    this.thumbnail = { url: data }
    return this
  }

  setTimestamp(data: Date | number = Date.now()) {
    this.timestamp = data ? new Date(data).toISOString() : undefined
    return this
  }

  setTitle(data: string) {
    this.__validateText(data, "title")

    this.title = data
    return this
  }

  setURL(data: string) {
    this.url = data
    return this
  }

  addToDescripton(data: string, separate: string | undefined) {
    if(!this.description) this.description = ""

    this.__validateText(`${this.description}${separate ?? ""}${data}`, "description")

    this.description += (separate ?? "") + data
    return this
  }

  addToLastField(data: string, separate: string | undefined) {
    if(!this.fields || !this.fields.length) throw new Error("You need at least 1 field to perform this action.")

    let lastField = this.fields[this.fields.length - 1]
    this.__validateText(`${lastField.value}${separate ?? ""}${data}`, "field:value")

    lastField.value += (separate ?? "") + data
    return this
  }

  validate(): boolean {
    if(
      (this.description ?? "").length > 4096 ||
      (this.title ?? "").length > 256 ||
      (this.author?.name ?? "").length > 256 ||
      (this.footer?.text ?? "").length > 2048
    ) return false
    if(this.fields && this.fields.length) for(const field of this.fields) if(field.name.length > 256 || field.value.length > 1024) return false
    if(this.size > 6000) return false
    return true
  }

  setDefault(data: { user?: User, lang?: Lang, translatable: ContextInteraction | Message | ButtonInteraction, type?: "scp" | "backrooms" }) {
    this.setColor("#000001").setThumbnail(data.lang && data.type ? data.lang[data.type].img : (data.translatable.client.user?.displayAvatarURL() ?? ""))
    if(data.user) this.setFooter({ text: data.translatable.translate("misc:requested_by", { user: data.user.tag }), icon_url: data.user.avatarURL() ?? undefined })
    return this
  }

  errorEmbed(message?: string){
    return new WanderersEmbed({
      thumbnail: this.thumbnail,
      footer: this.footer,
      color: 0xFF0000,
      description: message ?? ":x: | This element could not be loaded correctly.\n:information_source: | You can continue browsing the report.",
      title: this.title,
      url: this.url
    })
  }

  toJSON(): APIEmbed & { id?: string } {
    if(!this.soft && !this.validate()) return this.errorEmbed().toJSON()
    return { id: this.id, author: this.author, color: this.color, description: this.description, fields: this.fields, footer: this.footer, image: this.image, thumbnail: this.thumbnail, timestamp: this.timestamp, title: this.title, url: this.url }
  }
}

class EmbedError extends Error {
  constructor(object: string, max: number, type: "chars" | "items" = "chars") {
    super(`Embed ${object} cannot exceed ${max} ${type}.`)
    this.name = "EmbedError"
  }
}

function makeid(length: number): string {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}