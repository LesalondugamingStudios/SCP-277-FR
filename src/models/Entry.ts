/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import mongoose from "mongoose";
import { SavedEntry } from "../types";

const schema = new mongoose.Schema<SavedEntry>({
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
  data: {
    "type": String,
    "required": true,
    "unique": true
  }
}, { timestamps: true });

const model = mongoose.model<SavedEntry>("Entry", schema)

export default model