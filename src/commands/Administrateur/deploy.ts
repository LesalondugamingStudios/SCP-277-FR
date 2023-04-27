/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { Command, ContextInteraction, WanderersClient } from "../../structures"

export default new Command({
	name: "deploy",
	description: "Redéploie toutes les commandes",
	category: "Administation",
	isDevOnly: true,
	async execute(client: WanderersClient, ctx: ContextInteraction) {
		client.deploy()
		ctx.reply({ content: "**:white_check_mark: | Déployé avec succès !**" })
	}
})