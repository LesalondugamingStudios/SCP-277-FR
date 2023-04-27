/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { ActivityType, Client, ClientOptions, Collection } from "discord.js";
import { config } from "../config";
import { WanderersDatabase } from "../models";
import i18n from "./i18n";
import { loadCommands, loadEvents } from "../util/loader";
import colors from 'colors/safe';
import { Command } from "./Command";
import { Branches, Lang } from "../types";
import { TFunction } from "i18next";
import { WanderersStats } from "./Stats";
import { WanderersBotListManager } from "./BotList";
import { setDB } from "../crawler/getters/database";
import { getEntriesNames, getSCPNames } from "../crawler";
import langs from "../util/language.json";
import scpexeptions from "../util/exeptions.json";

colors.setTheme({
	error: "red",
	errorm: "red",
	warn: "yellow",
	info: "green",
	data: "grey",
	loaded: "cyan"
});

export class WanderersClient extends Client {
	config: typeof config
	mongoose: WanderersDatabase
	commands: Collection<string, Command>
	i18n: Map<string, TFunction>
	lang: { [key in Branches]: Lang }
	exeptions: string[]
	botlists: WanderersBotListManager
	stats: WanderersStats
	fn: { getEntriesNames: typeof getEntriesNames, getSCPNames: typeof getSCPNames }

	constructor(options: ClientOptions) {
		super(options)

		this.config = config
		this.mongoose = new WanderersDatabase(this)

		this.commands = new Collection()
		this.lang = langs as unknown as { [key in Branches]: Lang }
		this.exeptions = scpexeptions
		this.botlists = new WanderersBotListManager(this)
		this.i18n = new Map()

		this.stats = new WanderersStats(this)

		this.fn = { getEntriesNames, getSCPNames }

		import("../util/prototypes")
	}

	async init() {
		loadCommands(this)
		loadEvents(this)
		await this.login(this.config.getToken())
		this.i18n = await i18n()

		setDB(this.mongoose)
	}

	/**
	 * Log dans la console
	 * @param {String} message 
	 * @param {String} type 
	 */
	log(message: string | Error, type: "error" | "errorm" | "warn" | "info" | "data" | "loaded" = "info") {
		let date = new Date()
		let strdate = `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
		// @ts-ignore
		if (type != "error") return console.log(colors[type](`${strdate} [${type.toUpperCase()}] ${message}`))
		else {
			// @ts-ignore
			console.log(colors[type](`${strdate} [${message && message.name ? message.name : "ERROR"}] ${message && message.message ? message.message : message}`))
			console.error(message)
		}
	}

	/**
	 * Error dans la console
	 * @param {Error} error 
	 */
	error(error: Error) {
		this.log(error, "error")
	}

	/**
	 * Défini le status du bot
	 */
	setStatus() {
		this.user?.setPresence({ status: "online", activities: [{ name: `#StandWithUkraine | /help | ${this.guilds.cache.size} serveurs`, type: ActivityType.Streaming, url: "https://twitch.tv/ " }] })
	}

	async deploy() {
		let array: any[] = []
		this.commands.filter(c => !c.isDevOnly && !c.__local).each(c => {
			c.setLocalizations(this)
			array.push(c.toJSON())
		})

		await this.application?.fetch()
		if(!this.application) return

		this.application?.commands.set(array).then(() => this.log("Les commandes sont chargées !")).catch(e => this.error(e))

		let guild = this.guilds.cache.get(this.config.getServId())
		if(!guild) return

		this.commands.filter(c => c.isDevOnly && !c.__local).each(c => {
			// @ts-ignore
			guild.commands.create(c)
		})
	}
}