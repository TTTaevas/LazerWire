import "dotenv/config"
import * as osu from "osu-api-v2-js"
import { apis } from "../events/interactionCreate"
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js"

let data = new SlashCommandBuilder()
data.setName("send-code")
data.setDescription("Become allowed to use commands!")
data.addStringOption((option) => {
	return option
		.setName("code")
		.setDescription("The code you have received")
		.setRequired(true)
})

let need_api = "none"

let execute = async function(interaction: ChatInputCommandInteraction) {
	let exists = apis.find((a) => a.discord_id === interaction.user.id)
	if (exists) {
		console.log(`Removing an API (osu: ${exists.object.user} / discord: ${interaction.user.id})`)
		apis.splice(apis.indexOf(exists), 1)
	}

	if (process.env.ID === undefined) {console.error("no id env??"); return}
	if (process.env.SECRET === undefined) {console.error("no secret env??"); return}
	if (process.env.REDIRECT_URI === undefined) {console.error("no redirect_uri env??"); return}
	
	let code = interaction.options.getString("code")
	if (!code) {return await interaction.reply("No code has been given, somehow!")}
	let api = await osu.API.createAsync(
		{id: Number(process.env.ID), secret: process.env.SECRET},
		{code, redirect_uri: process.env.REDIRECT_URI}
	)

	if (api === null) {
		await interaction.reply({
			content: "I was unable to use your code, sorry 😔",
			ephemeral: true
		})
	} else {
		apis.push({
			object: api,
			discord_id: interaction.user.id
		})
		await interaction.reply({
			content: "Success 😌 You should now be able to use commands!",
			ephemeral: true
		})
	}
	
	return
}

export {data, need_api, execute}