/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import mongoose from "mongoose";
import { SavedSCPName } from "../types";

const schema = new mongoose.Schema<SavedSCPName>({
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

const model = mongoose.model<SavedSCPName>("ScpName", schema);

export default model