/*
 * Copyright (C) 2023-2025  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import "dotenv/config";
import { WanderersClient } from "./structures";
import { GatewayIntentBits, Partials } from "discord.js";

const client = new WanderersClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
  partials: [Partials.Channel],
  allowedMentions: { parse: [], repliedUser: false }
});
client.init()