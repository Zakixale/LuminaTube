const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("stop")
		.setDescription("Arrête le bot et la queue de musiques."),
	execute: async(client, interaction) => {
		const queue = client.player.getQueue(interaction.guildId)

		if (!queue) return await interaction.reply("Il n'y a pas de musiques en queue.")

		queue.destroy()
        await interaction.reply("Le bot a été arrêté et la queue de musiques est supprimée !")
	},
}