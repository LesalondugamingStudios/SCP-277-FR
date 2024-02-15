/*
 * Copyright (C) 2024  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

export interface GuildInfos {
  guildId: string,
  guildName: string
}

export interface JoinGuild {
  type: "joined_guild",
  data: GuildInfos
}

export interface LeaveGuild {
  type: "left_guild",
  data: GuildInfos
}

export type MessageType = JoinGuild | LeaveGuild