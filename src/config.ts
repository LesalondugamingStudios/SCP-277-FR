/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import os from "os";

export const config = {
  /**
   * Prefix du bot lorsqu'il n'est pas en / commands
   */
  prefix: "scp/",
  /**
   * Status du bot (dev | release)
   */
  state: "release",
  /**
   * Nombre de jour requis pour qu'un SCP enregistré se fasse supprimer
   */
  nbDaysToDeleteScp: 7,
  /**
   * Nombre de jour requis pour qu'une entrée enregistrée se fasse supprimer
   */
  nbDaysToDeleteEntry: 7,
  /**
   * Retourne le token du bot en fonctions de son status (dev | release)
   * @returns {String} Token
   */
  getToken: function (): string {
    if (this.state === "release")
      return `${process.env.TOKEN_RELEASE}`; // Token de 277-FR
    else
      return `${process.env.TOKEN_DEV}`; // Token du bot de test
  },
  /**
   * Retourne l'id du serveur en fonction du status du bot (dev | release)
   * @returns {String} Server ID
   */
  getServId: function (): string {
    if (this.state === "release")
      return "568774161632329753";
    else
      return "624894081591410708";
  },
  /**
   * Retourne l'id du salon des votes du bot
   * @returns {String} Channel ID
   */
  getVoteChannelID(): string {
    if (this.state === "release")
      return "568775163475394560";
    else
      return "902333139853119549";
  },

  /**
   * Retourne le chemin de la base de données
   * @returns {String} Path
   */
  getDbPath(): string {
    if (this.state === "release")
      return "scp";
    else
      return "scpdev";
  },
}

export const generateUserAgent = (): string => {
  return `SCP277FR/1.0 (${os.type().replace("_", " ")}; ${os.arch()}; DiscordBOT) node-fetch`
}
