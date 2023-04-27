/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

// @ts-nocheck
import { WanderersClient } from "./Client";
import { statsDb, scpModel } from "../models/statsModel";
import { Branches } from "../types";

export class WanderersStats {
  client: WanderersClient

  constructor(client: WanderersClient) {
    this.client = client
    this.init()
  }

  async init() {
    // Check si il y la table qui est mit pour la journée (les stats sont stocké jour par jour)
    this.createTodayStats();

    this.client.log("Statistics module initialized", "data");
  }

  /**
   * Add a view to a specific SCP in statistics.json
   */
  async addScpView(nb: string, lang: Branches): Promise<any> {
    let todayStats = await this.getTodayStats();
    if (!todayStats) {
      await this.createTodayStats();
      return this.addScpView(nb, lang);
    }

    // Check si le SCP a déjà était call
    let indexScp = undefined;
    for (let i = 0; i < todayStats.scp.length; i++) {
      if (todayStats.scp[i].numScp === nb) {
        indexScp = i;
        break;
      }
    }

    if (indexScp === undefined) {
      // Le scp n'a pas été call de la journée, on le créer
      const scp = new scpModel({
        numScp: nb,
        langAsked: { [lang]: 1 },
        calls: 1
      });
      todayStats.scp.push(scp);
    } else {
      // On met à jour les données du scp
      todayStats.scp[indexScp].calls += 1;
      if (todayStats.scp[indexScp].langAsked.hasOwnProperty(lang)) {
        this.client.log(`Lang ${lang} added (Stats)`, "data")
        todayStats.scp[indexScp].langAsked[lang] += 1;
      } else {
        this.client.log(`Lang ${lang} created (Stats)`, "data")
        todayStats.scp[indexScp].langAsked[lang] = 1;
      }
    }
    todayStats.markModified("scp");
    todayStats.markModified("scp.langAsked");
    todayStats.save();
  }

  /**
   * Get today statistics in database
   */
  async getTodayStats() {
    return new Promise((resolve, reject) => {
      statsDb.findOne({}, {}, { sort: { "created_at": -1 } }, (err, post) => {
        if (err) {
          reject(err);
        }
        resolve(post);
      });
    })
  }

  /**
   * Create statistics for the day if they does not exist
   */
  async createTodayStats() {
    // Check if today statistics already exist
    let todayStats = await this.getTodayStats();
    if (!todayStats) {
      // Create data for the actual day
      const todayStatsDb = new statsDb({
        scp: [],
        nbCommandExecuted: 0
      });
      todayStatsDb.save();
      this.client.log("Today statistics database created", "data")
    }
  }
}