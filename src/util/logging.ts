/*
 * Copyright (C) 2024-2025  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import colors from 'colors/safe.js';

colors.setTheme({
	error: "red",
	errorm: "red",
	warn: "yellow",
	info: "green",
	data: "grey",
	loaded: "cyan"
});

/**
 * Log dans la console
 * @param {String} message 
 * @param {String} type 
 * @param {Number} shardId
 */
export function log(message: string | Error, type: "error" | "errorm" | "warn" | "info" | "data" | "loaded" = "info", shardId: number | null = null) {
  let date = new Date()
  let strdate = `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
	// @ts-expect-error
  if (type != "error") return console.log(colors[type](`${strdate} [${type.toUpperCase()}]${shardId != null ? ` (#${shardId})` : ""} ${message}`))
  else {
		// @ts-expect-error
    console.log(colors[type](`${strdate} [${typeof message == "string" ? "ERROR" : message.name}]${shardId != null ? ` (#${shardId})` : ""} ${typeof message == "string" ? message : message.message}`))
    console.error(message)
  }
}

/**
 * Error dans la console
 * @param {Error} error 
 * @param {Number} shardId
 */
export function error(error: Error, shardId: number | null = null) {
  log(error, "error", shardId)
}