const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('croxydb'); // CroxyDB'yi içe aktarıyoruz

module.exports = {
    data: new SlashCommandBuilder()
        .setName('abone-ayarla')
        .setDescription('Yapay Zeka Abone Sistemini Ayarlar.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('ss Kanalını seçin.')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        )
        .addChannelOption(option =>
            option.setName('logchannel')
                .setDescription('ss Kanalını seçin.')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )

        .addRoleOption(option =>
            option.setName('role')
                .setDescription('abone rolünü seçn')
                .setRequired(true)
                
    )
        .addStringOption(option =>
            option
            .setName('kanalismi')
                .setDescription("Youtube kanal ismi")
            .setRequired(true)
            ),
    async execute(client, interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply('Bu komutu kullanmak için **Yönetici** Yetkinizin olması gerekiyor.');
        }

        const channel = interaction.options.getChannel('channel');
        const logchannel = interaction.options.getChannel('logchannel');
        const role = interaction.options.getRole('role');
        const channelName = interaction.options.getString('kanalismi');

        let guildID = interaction.guild.id;

        db.set(`yapayzeka_${guildID}.aboneKanalID`, channel.id); // Veritabanına abone kanal id'yi ekliyoruz
        db.set(`yapayzeka_${guildID}.aboneLogID`, logchannel.id); // Veritabanına log kanal id'yi ekliyoruz
        db.set(`yapayzeka_${guildID}.aboneRolID`, role.id); // Veritabanına rol id'yi ekliyoruz
        db.set(`yapayzeka_${guildID}.aboneKanalAdi`, channelName); // Veritabanına rol id'yi ekliyoruz

        const embed = new EmbedBuilder()
            .setColor('Random') // Embed rengini mavi olarak ayarlama
            .setTitle('Abone Ayarları Eklendi !') // Başlık ekleyin
            .setDescription(`
              > **Abone kanalı:** ${channel}
              > **Abone Log Kanalı:** ${logchannel}
              > **Abone rolü:** ${role}
              > **Abone Kanal Adi:** ${channelName}
              `)

        await interaction.reply({ embeds: [embed] });
    },
};
