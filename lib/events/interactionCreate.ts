import { Events, Interaction } from "discord.js"
import * as osu from "osu-api-v2-js"

export let apis: {
	object: osu.API,
	discord_id: string
}[] = []

let name = Events.InteractionCreate
let once = false
let execute = async(interaction: Interaction) => {
	if (!interaction.isChatInputCommand()) {return}

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

	let api = apis.find((a) => a.discord_id === interaction.user.id)
	if (api === undefined) {
		if (process.env.ID === undefined) {console.error("no id env??"); return}
		if (process.env.REDIRECT_URI === undefined) {console.error("no redirect_uri env??"); return}

		let link = osu.generateAuthorizationURL(
			Number(process.env.ID),
			process.env.REDIRECT_URI,
			["public"]
		)
		await interaction.reply({
			content: `Can you please click this link and send me the code you receive by using \`/send-code\`? 🥺👉👈\n${link}\nAfter I receive the code, I won't be bothering you again!`,
			ephemeral: true
		})
		return
	}

	try {
		await command.execute(interaction, api.object)
	} catch (error) {
		console.error(`Error executing ${interaction.commandName}`)
		console.error(error)
	}
}

export {name, once, execute}
