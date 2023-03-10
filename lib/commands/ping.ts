import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

let data = new SlashCommandBuilder()
data.setName("ping")
data.setDescription("Replies with Pong!")

let execute = async function(interaction: ChatInputCommandInteraction) {
	await interaction.reply("Pong!")
}

export {data, execute}
