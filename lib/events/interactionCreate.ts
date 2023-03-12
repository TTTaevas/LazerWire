import { EmbedBuilder, Events, Interaction } from "discord.js"
import * as osu from "osu-api-v2-js"

export let apis: {
	object: osu.API,
	discord_id: string
}[] = []

let name = Events.InteractionCreate
let once = false
let execute = async(interaction: Interaction) => {
	if (process.env.ID === undefined) {console.error("no id env??"); return}
	if (process.env.REDIRECT_URI === undefined) {console.error("no redirect_uri env??"); return}
	let api = apis.find((a) => a.discord_id === interaction.user.id)
	let authorization_link = osu.generateAuthorizationURL(
		Number(process.env.ID),
		process.env.REDIRECT_URI,
		["public"]
	)

	// handle commands
	if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName)
		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`)
			return
		}

		if (command.need_api === "none") {
			try {
				await command.execute(interaction)
			} catch (error) {
				console.error(`Error executing ${interaction.commandName}`)
				console.error(error)
			}
			return
		}

		if (api === undefined) {
			return await interaction.reply({
				content: `Can you please click this link and send me the code you receive by using \`/send-code\`? 🥺👉👈\n${authorization_link}\nAfter I receive the code, I won't be bothering you again!`,
				ephemeral: true
			})
		}

		try {
			await command.execute(interaction, api.object)
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}`)
			console.error(error)
		}
		
		return
	}

	// handle select menus
	// with spaghetti
	if (interaction.isStringSelectMenu()) {
		try {
			if (api === undefined) {
				return await interaction.reply({
					content: `Can you please click this link and send me the code you receive by using \`/send-code\`? 🥺👉👈\n${authorization_link}\nAfter I receive the code, I won't be bothering you again!`,
					ephemeral: true
				})
			}

			if (interaction.customId === "match-item") {
				let x = interaction.values[0]
				let room_id = Number(x.substring(0, x.indexOf("/")))
				let item_id = Number(x.substring(x.indexOf("/") + 1))

				let room = await api.object.getRoom({id: room_id})
				if (room instanceof osu.APIError) {
					return await interaction.reply({
						content: `I couldn't find the room for this item... 😔`,
						ephemeral: true
					})
				}
				
				let scores = await api.object.getPlaylistItemScores({id: item_id, room_id})
				if (scores instanceof osu.APIError) {
					return await interaction.reply({
						content: `I couldn't find the scores for this item... 😔`,
						ephemeral: true
					})
				}

				let item = room.playlist.find((item) => {
					if (item.id === item_id) {return item}
				})
				if (item === undefined) {
					return await interaction.reply({
						content: `I couldn't find the item within the room... 😔`,
						ephemeral: true
					})
				}

				let beatmap = await api.object.getBeatmap({id: scores[0].beatmap_id})
				if (beatmap instanceof osu.APIError) {
					return await interaction.reply({
						content: `I couldn't find the beatmap for this item... 😔`,
						ephemeral: true
					})
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

				return await interaction.reply({embeds: [embed]})
			}
			return await interaction.reply("???")
		} catch (e) {
			console.log("select menu failed")
			console.error(e)
		}
	}
}

export {name, once, execute}
