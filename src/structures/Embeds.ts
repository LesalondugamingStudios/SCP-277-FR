/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { APIEmbed, APIEmbedAuthor, APIEmbedField, APIEmbedFooter, APIEmbedImage, APIEmbedThumbnail, BaseInteraction, ButtonInteraction, Message, User } from "discord.js";
import { Lang } from "../types";
import { ContextInteraction } from "./ContextInteraction";

export class WanderersEmbed {
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

  constructor(data?: APIEmbed) {
    this.author = data?.author
    this.color = data?.color
    this.description = data?.description
    this.fields = data?.fields
    this.footer = data?.footer
    this.image = data?.image
    this.thumbnail = data?.thumbnail
    this.timestamp = data?.timestamp
    this.title = data?.title
    this.url = data?.url
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
    if(data.name.length > 256) throw new EmbedError("Author Name", 256)

    this.author = data
    if(!this.validate()) throw new EmbedError("Text Fields", 6000)
    return this
  }

  setColor(data: string | number) {
    if(typeof data == "string") this.color = parseInt(data.replace('#', ''), 16)
    else this.color = data
    return this
  }

  setDescription(data: string) {
    if(data.length > 4096) throw new EmbedError("Description", 4096)

    this.description = data
    if(!this.validate()) throw new EmbedError("Text Fields", 6000)
    return this
  }

  addField(name: string, value: string, inline: boolean = false) {
    const data = { name, value, inline }

    if(data.name.length > 256) throw new EmbedError("Field Name", 256)
    if(data.value.length > 1024) throw new EmbedError("Field Value", 1024)

    if(!this.fields) this.fields = []
    if(this.fields.length == 25) throw new EmbedError("Fields", 25, "items")

    this.fields.push(data)
    if(!this.validate()) throw new EmbedError("Text Fields", 6000)
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
    if(data.text.length > 2048) throw new EmbedError("Footer Text", 2048)

    this.footer = data
    if(!this.validate()) throw new EmbedError("Text Fields", 6000)
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
    if(data.length > 256) throw new EmbedError("Title", 256)

    this.title = data
    if(!this.validate()) throw new EmbedError("Text Fields", 6000)
    return this
  }

  setURL(data: string) {
    this.url = data
    return this
  }

  addToDescripton(data: string, separate: string | undefined) {
    if(!this.description) this.description = ""

    if((data.length + this.description.length + (separate ? separate.length : 0)) > 4096) throw new EmbedError("Description", 4096)

    this.description += (separate ?? "") + data
    if(!this.validate()) throw new EmbedError("Text Fields", 6000)
    return this
  }

  addToLastField(data: string, separate: string | undefined) {
    if(!this.fields || !this.fields.length) throw new Error("You need at least 1 field to perform this action.")

    let lastField = this.fields[this.fields.length - 1]
    if((data.length + lastField.value.length + (separate ? separate.length : 0)) > 1024) throw new EmbedError("Field Value", 1024)

    lastField.value += (separate ?? "") + data
    if(!this.validate()) throw new EmbedError("Text Fields", 6000)
    return this
  }

  validate() {
    if(this.size > 6000) return false
    return true
  }

  setDefault(data: { user?: User, lang?: Lang, translatable: ContextInteraction | Message | ButtonInteraction, type?: "scp" | "backrooms" }) {
    this.setColor("#000001").setThumbnail(data.lang && data.type ? data.lang[data.type].img : (data.translatable.client.user?.displayAvatarURL() ?? ""))
    if(data.user) this.setFooter({ text: data.translatable.translate("misc:requested_by", { user: data.user.tag }), icon_url: data.user.avatarURL() ?? undefined })
    return this
  }

  toJSON(): APIEmbed {
    return { author: this.author, color: this.color, description: this.description, fields: this.fields, footer: this.footer, image: this.image, thumbnail: this.thumbnail, timestamp: this.timestamp, title: this.title, url: this.url }
  }
}

class EmbedError extends Error {
  constructor(object: string, max: number, type: "chars" | "items" = "chars") {
    super(`Embed ${object} cannot exceed ${max} ${type}.`)
    this.name = "EmbedError"
  }
}