/*
 * Copyright (C) 2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import colors from 'colors/safe';

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
	 */
export function log(message: string | Error, type: "error" | "errorm" | "warn" | "info" | "data" | "loaded" = "info") {
  let date = new Date()
  let strdate = `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
	// @ts-ignore
  if (type != "error") return console.log(colors[type](`${strdate} [${type.toUpperCase()}] ${message}`))
  else {
		// @ts-ignore
    console.log(colors[type](`${strdate} [${typeof message == "string" ? "ERROR" : message.name}] ${typeof message == "string" ? message : message.message}`))
    console.error(message)
  }
}

/**
 * Error dans la console
 * @param {Error} error 
 */
export function error(error: Error) {
  log(error, "error")
}