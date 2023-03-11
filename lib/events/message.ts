import "dotenv/config"
import { DMChannel, Events, Message } from "discord.js"
import * as osu from "osu-api-v2-js"
import { apis } from "./interactionCreate"

let name = Events.MessageCreate
let once = false
let execute = async(message: Message) => {
	if (!(message.channel instanceof DMChannel)) {return}
	if (message.content.length < 500) {return}
	if (apis.find((a) => a.discord_id === message.author.id)) {return}

	if (process.env.ID === undefined) {console.error("no id env??"); return}
	if (process.env.SECRET === undefined) {console.error("no secret env??"); return}
	if (process.env.REDIRECT_URI === undefined) {console.error("no redirect_uri env??"); return}
	
	let code = message.content
	let api = await osu.API.createAsync(
		{id: Number(process.env.ID), secret: process.env.SECRET},
		{code, redirect_uri: process.env.REDIRECT_URI}
	)

	if (api === null) {
		await message.channel.send("I was unable to use your code, sorry 😔")
	} else {
		apis.push({
			object: api,
			discord_id: message.author.id
		})
		await message.channel.send("Success 😌 You should now be able to use commands!")
	}
	
	return
}

export {name, once, execute}
