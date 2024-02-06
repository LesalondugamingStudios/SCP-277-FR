/*
 * Copyright (C) 2023-2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { WanderersClient } from "../structures/Client";
import { readdirSync } from "fs";
import { Command } from "../structures";
import { log } from "./logging";
import { join } from "path";

export const loadCommands = (client: WanderersClient, dir: string = join(__dirname, "../commands")) => {
  readdirSync(dir).forEach(async dirs => {
    const commands = readdirSync(`${dir}/${dirs}/`).filter(files =>
      files.endsWith(".ts")
    );

    for (const file of commands) {
      const getFileName = await import(`../../${dir}/${dirs}/${file.split(".")[0]}`) as { default: Command };
      client.commands.set(getFileName.default.name, getFileName.default);
      log(`COMMAND: ${getFileName.default.name}`, "loaded");
    }
  });
};

export const loadEvents = (client: WanderersClient, dir: string = join(__dirname, "../events")) => {
  readdirSync(dir).forEach(async dirs => {
    const events = readdirSync(`${dir}/${dirs}/`).filter(files =>
      files.endsWith(".ts")
    );

    for (const event of events) {
      const evtName = event.split(".")[0];
      const evt = await import(`../../${dir}/${dirs}/${evtName}`) as { default: Function };
      client.on(evtName, evt.default.bind(null, client));
      log(`EVENT: ${evtName}`, "loaded");
    }
  });
};