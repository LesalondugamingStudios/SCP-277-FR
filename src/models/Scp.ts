/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import mongoose from "mongoose";
import { SavedSCP } from "../types";

const schema = new mongoose.Schema<SavedSCP>({
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

const model = mongoose.model<SavedSCP>("Scp", schema);

export default model