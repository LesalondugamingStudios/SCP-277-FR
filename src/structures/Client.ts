/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { Client, ClientOptions, Collection } from "discord.js";
import { config } from "../config";
import { loadCommands, loadEvents } from "../util/loader";
import { Command } from "./Command";
import { WanderersStats } from "./Stats";
import { getEntriesNames, getSCPNames } from "../crawler";
import { fetchSCPSerie } from "../crawler/getters/names/getSCPNames";
import { fetchBackroomsSerie } from "../crawler/getters/names/getEntriesNames";
import { error, log } from "../util/logging";
import { WanderersMain } from "./Main";

export class WanderersClient extends Client {
	config: typeof config
	commands: Collection<string, Command>
	stats: WanderersStats
	fn: { getEntriesNames: typeof getEntriesNames, getSCPNames: typeof getSCPNames, fetchBackroomsSerie: typeof fetchBackroomsSerie, fetchSCPSerie: typeof fetchSCPSerie }
	m: WanderersMain
	shardId: number | null

	constructor(options: ClientOptions) {
		super(options)

		import("../util/prototypes.js")

		this.config = config
		this.shardId = null

		this.commands = new Collection()

		this.stats = new WanderersStats(this)

		this.fn = { getEntriesNames, getSCPNames, fetchBackroomsSerie, fetchSCPSerie }
		this.m = new WanderersMain()
	}

	async init() {
		loadCommands(this)
		loadEvents(this)
		await this.login(this.config.getToken())
		this.m.init()
	}

	/**
	 * Défini le status du bot
	 */
	setStatus() {
		this.user?.setPresence({ status: "online", activities: [{ name: `#StandWithUkraine | Shard #${this.shardId}` }] })
	}

	async deploy() {
		let array: any[] = []
		this.commands.filter(c => !c.isDevOnly && !c.__local).each(c => {
			c.setLocalizations(this)
			array.push(c.toJSON())
		})

		await this.application?.fetch()
		if(!this.application) return

		this.application?.commands.set(array).then(() => log("Les commandes sont chargées !")).catch(e => error(e))

		let guild = this.guilds.cache.get(this.config.getServId())
		if(!guild) return

		this.commands.filter(c => c.isDevOnly && !c.__local).each(c => {
			// @ts-ignore
			guild.commands.create(c)
		})
	}
}