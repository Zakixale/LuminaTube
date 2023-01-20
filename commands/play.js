const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { QueryType } = require("discord-player")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("loads songs from youtube")
        .addSubcommand((subcommand) => 
            subcommand
                .setName("song")
                .setDescription("Loads a single song from url")
                .addStringOption((option) => option.setName("url").setDescription("the song's url").setRequired(true))
        )
        .addSubcommand((subcommand) => 
            subcommand
                .setName("search")
                .setDescription("Seaches for sogn based on provided keywords")
                .addStringOption((option) => option.setName("searchterms").setDescription("the search keywords").setRequired(true))
        ),
        execute: async(client, interaction) => {

            if(!interaction.member.voice.channel)
                return interaction.reply("Vous devez être dans un salon vocal pour effectuer cela.")

            const queue = await client.player.createQueue(interaction.guild)

            let embed = new EmbedBuilder()

            if(interaction.options.getSubcommand() === "song"){
                let url = interaction.options.getString("url")

                const result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_VIDEO
                })

                if(result.tracks.length === 0)
                    return interaction.reply("Pas de resultat.")

                if (!queue.connection) await queue.connect(interaction.member.voice.channel)

                const song = result.tracks[0]
                await queue.addTrack(song)

                embed
                    .setDescription(`**[${song.title}] (${song.url})** a été ajouté à la queue ! `)
                    .setThumbnail(song.thumbnail)
                    .setFooter({text: `Durée: ${song.duration}`})

            } else if(interaction.options.getSubcommand() === "search"){
                let searchterms = interaction.options.getString("searchterms")

                const result = await client.player.search(searchterms, {
                    requestedBy: interaction.user
                })

                if(result.tracks.length === 0)
                    return interaction.reply("Pas de resultat.")

                if (!queue.connection) await queue.connect(interaction.member.voice.channel)

                const song = result.tracks[0]
                await queue.addTrack(song)
                
                embed
                    .setDescription(`**[${song.title}] (${song.url})** a été ajouté à la queue ! `)
                    .setThumbnail(song.thumbnail)
                    .setFooter({text: `Durée: ${song.duration}`})
            }
            if (!queue.playing) await queue.play()
            await interaction.reply({
                embeds: [embed]
            })
        }
}