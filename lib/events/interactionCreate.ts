import { Events, Interaction } from "discord.js"
import * as osu from "osu-api-v2-js"

import matchItem from "../menu/item"

export let apis: {
	object: osu.API,
	discord_id: string
}[] = []

let name = Events.InteractionCreate
let once = false
let execute = async(interaction: Interaction) => {
	if (process.env.ID === undefined) {console.error("no id env??"); return}
	if (process.env.REDIRECT_URI === undefined) {console.error("no redirect_uri env??"); return}
	let api = apis.find((a) => a.discord_id === interaction.user.id)
	let authorization_link = osu.generateAuthorizationURL(
		Number(process.env.ID),
		process.env.REDIRECT_URI,
		["public"]
	)

	// handle commands
	if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName)
		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`)
			return
		}

		if (command.need_api === "none") {
			try {
				await command.execute(interaction)
			} catch (error) {
				console.error(`Error executing ${interaction.commandName}`)
				console.error(error)
			}
			return
		}

		if (api === undefined) {
			return await interaction.reply({
				content: `Can you please click this link and send me the code you receive by using \`/send-code\`? 🥺👉👈\n${authorization_link}\nAfter I receive the code, I won't be bothering you again!`,
				ephemeral: true
			})
		}

		try {
			await command.execute(interaction, api.object)
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}`)
			console.error(error)
		}
		
		return
	}

	if (interaction.isStringSelectMenu()) {
		try {
			if (api === undefined) {
				return await interaction.reply({
					content: `Can you please click this link and send me the code you receive by using \`/send-code\`? 🥺👉👈\n${authorization_link}\nAfter I receive the code, I won't be bothering you again!`,
					ephemeral: true
				})
			}

			if (interaction.customId === "match-item") {
				await interaction.reply("Loading item...")
				let reply = await matchItem(interaction, api.object)
				await interaction.editReply(reply)
			}
			
		} catch (e) {
			console.log("select menu failed")
			console.error(e)
		}
	}
}

export {name, once, execute}
