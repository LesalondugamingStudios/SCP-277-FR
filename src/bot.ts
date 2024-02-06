/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import "dotenv/config";
import { WanderersClient } from "./structures";

const client = new WanderersClient({ intents: 33281, allowedMentions: { parse: [], repliedUser: false } });
client.init()