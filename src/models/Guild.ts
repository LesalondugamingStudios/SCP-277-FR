/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import mongoose from "mongoose";
import { SavedGuild } from "../types";

const schema = new mongoose.Schema<SavedGuild>({
	guildID: {
		"type": String,
		"required": true,
		"unique": true
	},
	defaultBranch: {
		"type": String,
		"default": "en"
	},
	deleteReport: {
		"type": Boolean,
		"default": false
	},
	scpDetection: {
		"type": Boolean,
		"default": true
	},
	messageCommand: {
		"type": Boolean,
		"default": true
	}
});

const model = mongoose.model<SavedGuild>("Guild", schema)

export default model