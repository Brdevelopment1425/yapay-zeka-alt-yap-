const fs = require('fs');
const { Client, Collection, PermissionsBitField, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const table = require('table');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const chalk = require("chalk");
const db = require("croxydb");

const config = require("./config.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent] });

data = [['Command Name', 'File']];
client.commands = new Collection();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	command.execute = command.execute.bind(null, client);
	commands.push(command.data.toJSON());
	client.commands.set(command.data.name, command);
	data.push([command.data.name, file]);
}


const rest = new REST({ version: '9' }).setToken(config.token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationCommands(config.clientId),
			{ body: commands },
		);

		console.log(chalk.red(`[/] `) + chalk.green(`Slash komutları başarıyla yüklendi`));
	} catch (error) {
		console.error(error);
	}
})();

console.log(table.table(data, { header: { alignment: 'center', content: 'Commands' }, border: table.getBorderCharacters('norc') }));

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

data = [['Event Name', 'File']];
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
	data.push([event.name, file]);

}

console.log(table.table(data, { header: { alignment: 'center', content: 'Events' }, border: table.getBorderCharacters('norc') }));


client.login(config.token);

const { readingPhoto, sendChannelLlog } = require('./readImage.js');

client.on('messageCreate', async (message) => {
	if (message.author.bot) return;
	if (!message.guild) return;

	let guildID = message.guild.id;
	let guildSettings = db.get(`yapayzeka_${guildID}`);

	if (!guildSettings) return;


	const role = await message.guild.roles.fetch(guildSettings.aboneRolID);

	if (message.channel.id !== guildSettings.aboneKanalID) return;

	if (message.member?.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
	if (message.member?.roles.cache.has(`${role?.id}`)) return message.delete().then(() => { });

	if (!message.attachments.first()) return message.delete().then(() => { });
	const startedEmbed = new EmbedBuilder()
		.setColor('Random')
		.setTitle('Okuma işlemi başlatıldı..')
		.setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
		.setDescription('<a:gearspinning:1138396263700774932> **|** Fotoğraf okunuyor, lütfen bekleyiniz.')
		.setTimestamp()
		.setFooter({text: `${client.user?.username} © 2023`, iconURL: client.user?.displayAvatarURL()})
	let msg = await message.reply({ embeds: [startedEmbed]});

	let attachment = message.attachments.first();
	let picture = await readingPhoto(`${attachment?.url}`);
	let isSubscribed = false;

	for (const lang of config.langs) {
		if (picture.includes(lang) && picture.includes(guildSettings.aboneKanalAdi)) {
			isSubscribed = true;
		}
	}



	if (!isSubscribed) {
		await sendChannelLlog(message);
		const embed = new EmbedBuilder()
			.setColor(0x2B2D31)
			.setTitle('Okuma işlemi sonlandırıldı')
			.setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
			.setDescription(`❌ **|** Hey! Kanala abone olmamışsın veya ben okuyamadım lütfen tam ekran ss atınız !`)
			.setTimestamp()
			.setFooter({ text: `${client.user?.username} © 2023`, iconURL: client.user?.displayAvatarURL() })
		msg.edit({ embeds: [embed]})

		return;
	}
	await sendChannelLlog(message);
	message.member?.roles.add(`${role?.id}`);
	const embed = new EmbedBuilder()
		.setColor(0x2B2D31)
		.setTitle('Okuma işlemi sonlandırıldı')
		.setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
		.setDescription(`✅ **|** Tebrikler! Abone rolün verildi !`)
		.setTimestamp()
		.setFooter({ text: `${client.user?.username} © 2023`, iconURL: client.user?.displayAvatarURL() })
	msg.edit({embeds: [embed]});
});

process.on('unhandledRejection', error => {
	return console.log("Hata olustu: " + error)
});