import { ActionRowBuilder, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder } from "discord.js"
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

	let leaderboard = await api.getRoomLeaderboard(room)
	if (leaderboard instanceof osu.APIError) {
		return await interaction.reply("Failed to get that match's details...")
	}

	let description = `Started: ${room.starts_at.toISOString()}`
	if (room.ends_at) {description += `\nEnded: ${room.ends_at.toISOString()}`}

	let players = ""
	leaderboard.sort((x, y) => y.total_score - x.total_score).forEach((l, i) => {
		let p = `${i + 1}. ${l.user.username} / ${String(l.accuracy * 100).substring(0, 5)}% / ${String(l.total_score / 1000000).substring(0, 4)}M score`
		p += ` (Played ${l.attempts} times)\n`
		players += p
	})

	const embed = new EmbedBuilder()
		.setTitle(room.name)
		.setURL(`https://osu.ppy.sh/multiplayer/rooms/${room.id}`)
		.setDescription(description)
		.addFields({
			name: "Players",
			value: players
		})
	
	let options = room.playlist.map((item, i) => {
		let beatmapset = item.beatmap.beatmapset
		let option = {
			label: `${i + 1}.`,
			description: `${beatmapset ? `${beatmapset.artist} - ${beatmapset.title} [${item.beatmap.version}]`.substring(0, 95) + "..." : "Beatmap"}`,
			value: `r${item.room_id}/i${item.id}`
		}
		return option
	})
	
	const row = new ActionRowBuilder<StringSelectMenuBuilder>()
	.addComponents(
		new StringSelectMenuBuilder()
			.setCustomId("select")
			.setPlaceholder("No Beatmap selected...")
			.addOptions(...options)
	)
	
	await interaction.reply({
		embeds: [embed],
		components: [row]
	})
}

export {data, need_api, execute}
