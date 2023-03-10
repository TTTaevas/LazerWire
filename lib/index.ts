import "dotenv/config"
import { Client, Collection, Events, GatewayIntentBits } from "discord.js"
import fs = require("fs")
import path = require("path")

// https://stackoverflow.com/a/69534031
declare module "discord.js" {
  interface Client {
    commands: Collection<unknown, any>
  }
}

if (process.env.DISCORD_TOKEN === undefined) {throw new Error("Can't start without a discord token")}

// Create a new client instance
const client = new Client({intents: [GatewayIntentBits.Guilds]})

// Add commands to the client
client.commands = new Collection()
const commandsPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"))

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file)
	const command = require(filePath)
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ("data" in command && "execute" in command) {
		client.commands.set(command.data.name, command)
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
	}
}

// Handle supported events
const eventsPath = path.join(__dirname, "events")
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"))

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file)
	const event = require(filePath)
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args))
	} else {
		client.on(event.name, (...args) => event.execute(...args))
	}
}

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN)
