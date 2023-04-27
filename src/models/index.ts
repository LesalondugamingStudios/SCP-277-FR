/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import mongoose from "mongoose";
import { WanderersClient } from "../structures/Client";
import { SavedEntry, SavedEntryName, SavedGuild, SavedSCP, SavedSCPName } from "../types";

// Importation des models
import Entry from "./Entry"
import EntryName from "./EntryName"
import Guild from "./Guild"
import Scp from "./Scp"
import ScpName from "./ScpName"

export class WanderersDatabase {
	client: WanderersClient
	Entry: typeof Entry
	EntryName: typeof EntryName
	Guild: typeof Guild
	Scp: typeof Scp
	ScpName: typeof ScpName
	
	constructor(client: WanderersClient) {
		this.client = client

		const o = {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			autoIndex: false,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
			family: 4
		}
		mongoose.connect("mongodb://localhost:27017/" + client.config.getDbPath(), o)
		mongoose.Promise = global.Promise
		mongoose.connection.on("connecting", () => client.log("Connecting ...", "data"))
		mongoose.connection.on("connected", () => client.log("Connected!", "data"))

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
					console.log(err);
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
					console.log(err);
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
					console.log(err);
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
					console.log(err);
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
					console.log(err);
					resolve(null);
				});
		});
	}
}