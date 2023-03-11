/**
 * This script here does the opposite of `deploy_commands`
 */

import "dotenv/config"
import { REST, Routes } from "discord.js"

if (process.env.DISCORD_TOKEN === undefined) {throw new Error("Can't start without a discord token")}
if (process.env.CLIENT_ID === undefined) {throw new Error("Can't start without a client id")}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN)

rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] })
	.then(() => console.log("Successfully deleted all application commands."))
	.catch(console.error)
