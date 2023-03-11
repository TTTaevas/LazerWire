/**
 * Registering a command means making a slash command's name and description available to the user
 * This script here registers and edit those properties of every command in ./commands
 * It doesn't need to be launched upon editing the function of a command, so it's not executed upon bot startup
 * Note that it doesn't unregister deleted commands
 */

import "dotenv/config"
import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, SlashCommandBuilder } from "discord.js"
import fs = require("fs")
import path = require("path")

if (process.env.DISCORD_TOKEN === undefined) {throw new Error("Can't start without a discord token")}

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [] // what a name
const commandsPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"))

for (const file of commandFiles) {
	const command: {data: SlashCommandBuilder, execute: Function} = require(`./commands/${file}`)
	commands.push(command.data.toJSON())
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
	if (process.env.CLIENT_ID === undefined) {throw new Error("Can't start without a client id")}

	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`)

		// The put method is used to fully refresh all commands in the guild with the current set
		const data: any = await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: commands },
		)

		console.log(`Successfully reloaded ${data.length} application (/) commands.`)
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error)
	}
})()
