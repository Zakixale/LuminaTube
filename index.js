const { Client, Collection, Events, GatewayIntentBits, Routes } = require("discord.js")
const dotenv = require("dotenv")
const { REST } = require("@discordjs/rest")
const { Player } = require("discord-player")
const fs = require("fs")
const path = require("path")

dotenv.config()

const TOKEN = process.env.TOKEN
const CLIENT_ID = process.env.CLIENT_ID
const GUILD_ID = process.env.GUILD_ID

const commands = [];

const client = new Client({
    intents : [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
})

client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
})

const commandsPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"))
client.commands = new Collection()

for (const file  of commandFiles){
	const filePath = path.join(commandsPath, file)
	const command = require(filePath)

	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command)
		commands.push(command.data.toJSON());
	} else {
		console.log(`[ATTENTION] La commande située dans le fichier ${filePath} n'a pas de les propriétées "data" ou "execute".`)
	}
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once(Events.ClientReady, c => {
	console.log(`Prêt! Connecté sous le nom de : ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return

    const command = client.commands.get(interaction.commandName)

	if (!command) {
		console.error(`Pas de commande sous le nom de ${interaction.commandName} n'a pas été trouvée.`)
		return;
	}

	try {
		await command.execute(client, interaction);
	} catch (error) {
		console.error(`Erreur d'exécution : ${interaction.commandName}`)
		console.error(error)
	}
});

(async () => {
	try {
		const data = await rest.put(
			Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
			{ body: commands },
		);

		console.log(`${data.length} commandes rafraichie(s).`);
	} catch (error) {
		console.error(error);
	}
})();

client.login(TOKEN);