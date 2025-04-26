/*
 * Copyright (C) 2023-2025  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { WanderersClient } from "../structures/Client";
import { readdirSync } from "fs";
import { log } from "./logging";
import { join } from "path";

export const loadCommands = (client: WanderersClient, dir: string = join(import.meta.dirname, "../commands")) => {
  readdirSync(dir).forEach(async dirs => {
    const commands = readdirSync(`${dir}/${dirs}/`).filter(files =>
      files.endsWith(".ts") || files.endsWith(".js")
    );

    for (const file of commands) {
      const getFileName = await import(`file:///${dir}/${dirs}/${file}`);
      client.commands.set(getFileName.default.command.name, getFileName.default);
      log(`COMMAND: ${getFileName.default.command.name}`, "loaded", client.shardId);
    }
  });
};

export const loadEvents = (client: WanderersClient, dir: string = join(import.meta.dirname, "../events")) => {
  readdirSync(dir).forEach(async dirs => {
    const events = readdirSync(`${dir}/${dirs}/`).filter(files =>
      files.endsWith(".ts") || files.endsWith(".js")
    );

    for (const event of events) {
      const evtName = event.split(".")[0];
      const evt = await import(`file:///${dir}/${dirs}/${event}`);
      client.on(evtName, evt.default.bind(null, client));
      log(`EVENT: ${evtName}`, "loaded", client.shardId);
    }
  });
};