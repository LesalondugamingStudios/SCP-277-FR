/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

export class CrawlerError extends Error {
  constructor(type: "request" | "html" | "markdown", info?: string) {
    let message = ""
    if(type == "request") {
      message = `Could not proceed the request. (${info})`
    } else if(type == "html") {
      message = "HTML parsing failed."
    } else if(type == "markdown") {
      message = "Markdown transformation failed."
    }
    super(message)
    this.name = "CrawlerError"
  }
}