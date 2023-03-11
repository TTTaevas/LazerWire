import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import * as osu from "osu-api-v2-js"

let data = new SlashCommandBuilder()
data.setName("match")
data.setDescription("Get info on a lazer match!")
data.addIntegerOption((option) => {
	return option
		.setName("id")
		.setDescription("The id of the lazer match")
		.setRequired(true)
})

let need_api = "user"

let execute = async function(interaction: ChatInputCommandInteraction, api: osu.API) {
	const room_id = interaction.options.getInteger("id")
	if (!room_id) {return await interaction.reply("No ID has been given, somehow!")}
	
	let room = await api.getRoom({id: room_id})
	if (room instanceof osu.APIError) {
		return await interaction.reply("Couldn't find a match with that ID...")
	}
	
	await interaction.reply(`Started: ${room.starts_at.toUTCString()}`)
}

export {data, need_api, execute}
