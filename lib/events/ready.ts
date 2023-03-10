import { Client, Events } from 'discord.js'

let name = Events.ClientReady
let once = true
let execute = (client: Client) => {
	console.log(`Ready! Logged in as ${client.user!.tag}`)
}

export {name, once, execute}
