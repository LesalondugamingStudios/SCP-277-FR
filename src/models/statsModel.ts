/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

/*
    Model pour l'enregistrement des statistiques

    Les statistiques sont stocké jour par jour
*/

import { Schema, model } from "mongoose";

const scpSave = new Schema({
  // Numéro du SCP
  numScp: {
    "type": String,
    "required": true
  },
  // La langue dans laquelle le SCP a été appelé
  langAsked: {
    "type": Object,
    "required": true
  },
  // Le nombre de fois où le SCP a été appelé
  calls: {
    "type": Number,
    "required": true
  }
}, { timestamps: true });

const statModel = new Schema({
  // Stocke tous les SCP qui ont été appelé via les commandes
  scp: {
    "type": [Object],
    "required": true
  },
  // Nombre de commande en tout exécuté
  nbCommandExecuted: {
    "type": Number,
    "required": true
  }
}, { timestamps: true });

const statsDb = model("statsDb", statModel)
const scpModel = model("scpModel", scpSave)
export { statsDb, scpModel }