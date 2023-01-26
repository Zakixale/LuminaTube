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
                .setDescription("Charge une seule musique par URL")
                .addStringOption((option) => option.setName("url").setDescription("L'url de la musique").setRequired(true))
        )
        .addSubcommand((subcommand) => 
            subcommand
                .setName("search")
                .setDescription("Recherche par mots clés")
                .addStringOption((option) => option.setName("keywords").setDescription("Les mots clés de la recherche").setRequired(true))
        ),
        execute: async(client, interaction) => {

            if(!interaction.member.voice.channel)
                return interaction.reply("Vous devez être dans un salon vocal pour effectuer cela.")

            const queue = await client.player.createQueue(interaction.guild, {
                metadata: {
                    channel: interaction.channel
                }
            })

            let embed = new EmbedBuilder()

            if(interaction.options.getSubcommand() === "song"){
                let url = interaction.options.getString("url")

                const result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_VIDEO
                })

                if(result.tracks.length === 0)
                    return interaction.reply("Pas de resultat.")

                try{
                    if (!queue.connection) await queue.connect(interaction.member.voice.channel)
                }
                catch {
                    queue.destroy();
                    return await interaction.reply({ content: "Impossible de rejoindre votre salon vocal !", ephemeral: true });
                }                

                const song = result.tracks[0]

                await queue.addTrack(song)

                embed
                    .setDescription(`**[${song.title}] (${song.url})** a été ajouté à la queue ! `)
                    .setThumbnail(song.thumbnail)
                    .setFooter({text: `Durée: ${song.duration}`})

            } else if(interaction.options.getSubcommand() === "search"){
                let keywords = interaction.options.getString("keywords")

                const result = await client.player.search(keywords, {
                    requestedBy: interaction.user
                })

                if(result.tracks.length === 0)
                    return interaction.reply("Pas de resultat.")

                    try{
                        if (!queue.connection) await queue.connect(interaction.member.voice.channel)
                    }
                    catch {
                        queue.destroy();
                        return await interaction.reply({ content: "Impossible de rejoindre votre salon vocal !", ephemeral: true });
                    } 

                const song = result.tracks[0]
                await queue.addTrack(song)
                
                embed
                    .setDescription(`**[${song.title}] (${song.url})** a été ajouté à la queue ! `)
                    .setThumbnail(song.thumbnail)
                    .setFooter({text: `Durée: ${song.duration}`})
            }
            if (!queue.playing) {
                await queue.play()
            }
            await interaction.reply({
                embeds: [embed]
            })
        }
}