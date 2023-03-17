import { EmbedBuilder, InteractionReplyOptions, MessagePayload, StringSelectMenuInteraction } from "discord.js";
import * as osu from "osu-api-v2-js";

export default async (interaction: StringSelectMenuInteraction, api: osu.API): Promise<InteractionReplyOptions> => {
	let x = interaction.values[0]
	let room_id = Number(x.substring(0, x.indexOf("/")))
	let item_id = Number(x.substring(x.indexOf("/") + 1))

	let room = await api.getRoom({id: room_id})
	if (room instanceof osu.APIError) {
		return {
			content: `I couldn't find the room for this item... 😔`,
			ephemeral: true
		}
	}
		
	let scores = await api.getPlaylistItemScores({id: item_id, room_id})
	if (scores instanceof osu.APIError) {
		return {
			content: `I couldn't find the scores for this item... 😔`,
			ephemeral: true
		}
	}

	let item = room.playlist.find((item) => {
		if (item.id === item_id) {return item}
	})
	if (item === undefined) {
		return {
			content: `I couldn't find the item within the room... 😔`,
			ephemeral: true
		}
	}

	let beatmap = await api.getBeatmap({id: scores[0].beatmap_id})
	if (beatmap instanceof osu.APIError) {
		return {
			content: `I couldn't find the beatmap for this item... 😔`,
			ephemeral: true
		}
	}
	let beatmapset = beatmap.beatmapset!

	let scores_field = {
		name: "Scores",
		value: ""
	}
	for (let i = 0; i < scores.length; i++) {
		let s = scores[i]
		let entry = `${i + 1}. ${s.user.username} (${s.max_combo}x/${beatmap.max_combo! - beatmap.count_sliders}x, ${s.total_score}, ${String(s.accuracy * 100).substring(0, 5)}%)\n`
		scores_field.value += entry
	}

	let mods_required_field = {
		name: "Required mods",
		value: "None"
	}
	for (let i = 0; i < item.required_mods.length; i++) {
		if (i === 0) {mods_required_field.value = ""}
		let mod = item.required_mods[i]
		mods_required_field.value += mod.acronym
		if (mod.settings) {
			mods_required_field.value += " ("
			for (let i = 0; i < Object.entries(mod.settings).length; i++) {
				let value = Object.values(mod.settings)[i]
				if (!isNaN(value)) {value = String(value).substring(0, 4)}
				mods_required_field.value += `${Object.keys(mod.settings)[i]}: ${value}`
				if (i !== Object.entries(mod.settings).length - 1) {mods_required_field.value += " / "}
			}
			mods_required_field.value += ")"
		}
		mods_required_field.value += "\n"
	}

	let mods_allowed_field = {
		name: "Allowed mods",
		value: "None"
	}
	for (let i = 0; i < item.allowed_mods.length; i++) {
		if (i === 0) {mods_allowed_field.value = ""}
		let mod = item.allowed_mods[i]
		mods_allowed_field.value += mod.acronym
		if (mod.settings) {
			mods_allowed_field.value += " ("
			for (let i = 0; i < Object.entries(mod.settings).length; i++) {
				let value = Object.values(mod.settings)[i]
				if (!isNaN(value)) {value = String(value).substring(0, 4)}
				mods_allowed_field.value += `${Object.keys(mod.settings)[i]}: ${value}`
				if (i !== Object.entries(mod.settings).length - 1) {mods_allowed_field.value += " / "}
			}
			mods_allowed_field.value += ")"
		}
		mods_allowed_field.value += "\n"
	}

	let fields = [scores_field, mods_required_field, mods_allowed_field]
	const embed = new EmbedBuilder()
		.setTitle(`${beatmapset.artist} - ${beatmapset.title} [${beatmap.version}] (${beatmap.difficulty_rating}*)`)
		.setURL(beatmap.url)
		.setImage(beatmapset.covers.cover)
		.addFields(...fields)

	return {content: "", embeds: [embed]}
}
