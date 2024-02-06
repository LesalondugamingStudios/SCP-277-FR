/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import mongoose from "mongoose";
import { SavedEntry, SavedEntryName, SavedGuild, SavedSCP, SavedSCPName } from "../types";

// Importation des models
import Entry from "./Entry"
import EntryName from "./EntryName"
import Guild from "./Guild"
import Scp from "./Scp"
import ScpName from "./ScpName"
import { config } from "../config";
import { error, log } from "../util/logging"

export class WanderersDatabase {
	Entry: typeof Entry
	EntryName: typeof EntryName
	Guild: typeof Guild
	Scp: typeof Scp
	ScpName: typeof ScpName
	
	constructor() {
		const o = {
			autoIndex: false,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
			family: 4
		}
		mongoose.connect("mongodb://localhost:27017/" + config.getDbPath(), o)
		mongoose.Promise = global.Promise
		mongoose.connection.on("connecting", () => log("Connecting ...", "data"))
		mongoose.connection.on("connected", () => log("Connected!", "data"))

		this.Entry = Entry
		this.EntryName = EntryName
		this.Guild = Guild
		this.Scp = Scp
		this.ScpName = ScpName
	}

	getSCP(nb: string, lang: string): Promise<SavedSCP | null> {
		return new Promise(resolve => {
			this.Scp.findOne({ nb, lang })
				.then((result: SavedSCP | null) => {
					if (!result) resolve(null)
					else resolve(result);
				})
				.catch((err: Error) => {
					error(err);
					resolve(null)
				});
		});
	}

	getSCPName(nb: string, lang: string): Promise<SavedSCPName | null> {
		return new Promise(resolve => {
			this.ScpName.findOne({ nb, lang })
				.then((result: SavedSCPName | null) => {
					if (!result) resolve(null)
					else resolve(result);
				})
				.catch((err: Error) => {
					error(err);
					resolve(null)
				});
		});
	}

	getEntry(id: string, nb: string, lang: string): Promise<SavedEntry | null> {
		return new Promise(resolve => {
			this.Entry.findOne({ nb, id, lang })
				.then((result: SavedEntry | null) => {
					if (!result) resolve(null)
					else resolve(result);
				})
				.catch((err: Error) => {
					error(err);
					resolve(null)
				});
		});
	}

	getEntryName(id: string, nb: string, lang: string): Promise<SavedEntryName | null> {
		return new Promise(resolve => {
			this.EntryName.findOne({ nb, id, lang })
				.then((result: SavedEntryName | null) => {
					if (!result) resolve(null)
					else resolve(result);
				})
				.catch((err: Error) => {
					error(err);
					resolve(null)
				});
		});
	}

	getGuild(guildID: string): Promise<SavedGuild | null> {
		return new Promise(resolve => {
			this.Guild.findOne({ guildID })
				.then((result: SavedGuild | null) => {
					if (!result) resolve(null);
					else resolve(result);
				})
				.catch((err: Error) => {
					error(err);
					resolve(null);
				});
		});
	}
}