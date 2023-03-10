import "dotenv/config"
import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, SlashCommandBuilder } from "discord.js"
import fs = require("fs")
import path = require("path")

if (process.env.DISCORD_TOKEN === undefined) {throw new Error("Can't start without a discord token")}

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [] // what a name
// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"))

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command: {data: SlashCommandBuilder, execute: Function} = require(`./commands/${file}`)
	commands.push(command.data.toJSON())
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

// and deploy your commands!
(async () => {
	if (process.env.CLIENT_ID === undefined) {throw new Error("Can't start without a client id")}
	if (process.env.GUILD_ID === undefined) {throw new Error("Can't start without a guild id")}

	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`)

		// The put method is used to fully refresh all commands in the guild with the current set
		const data: any = await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: commands },
		)

		console.log(`Successfully reloaded ${data.length} application (/) commands.`)
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error)
	}
})()
