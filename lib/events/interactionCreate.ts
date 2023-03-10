import { Events, Interaction } from 'discord.js'

let name = Events.InteractionCreate
let once = false
let execute = async(interaction: Interaction) => {
	if (!interaction.isChatInputCommand()) {return}
	const command = interaction.client.commands.get(interaction.commandName)

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`)
		return
	}

	try {
		await command.execute(interaction)
	} catch (error) {
		console.error(`Error executing ${interaction.commandName}`)
		console.error(error)
	}
}

export {name, once, execute}
