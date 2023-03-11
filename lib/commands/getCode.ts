import "dotenv/config"
import { generateAuthorizationURL } from "osu-api-v2-js"
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js"

let data = new SlashCommandBuilder()
data.setName("get-code")
data.setDescription("To get the code you'll need to send using `/send-code`")

let need_api = "none"

let execute = async function(interaction: ChatInputCommandInteraction) {
	if (process.env.ID === undefined) {console.error("no id env??"); return}
	if (process.env.REDIRECT_URI === undefined) {console.error("no redirect_uri env??"); return}

	let link = generateAuthorizationURL(
		Number(process.env.ID),
		process.env.REDIRECT_URI,
		["public"]
	)
	return await interaction.reply({
		content: `Please click this link and send me the code you receive by using \`/send-code\`! \n${link}`,
		ephemeral: true
	})
}

export {data, need_api, execute}