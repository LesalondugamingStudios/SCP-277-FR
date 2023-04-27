/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import mongoose from "mongoose";
import { SavedEntryName } from "../types";

const schema = new mongoose.Schema<SavedEntryName>({
  id: {
    "type": String,
    "required": true
  },
  nb: {
    "type": String,
    "required": true,
  },
  lang: {
    "type": String,
    "required": true
  },
  name: {
    "type": String,
    "required": true,
    "unique": true
  }
});

const model = mongoose.model<SavedEntryName>("EntryName", schema);

export default model