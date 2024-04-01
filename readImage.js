// @ts-check

const { Message, ChannelType, EmbedBuilder } = require('discord.js');
const ocrspaceapi = require("ocr-space-api");
const tesseract = require("tesseract.js");
const db = require("croxydb");
const config = require('./config');


module.exports = {
    /**
 * @param {string} photo
 */
    async readingPhoto(photo) {
            var options = {
                apikey: config.key,
                language: 'eng',
                imageFormat: 'image/png',
                isOverlayRequired: true
            };

            try {
                const { data: { text } } = await tesseract.recognize(photo, 'eng');
                const result2 = await ocrspaceapi.parseImageFromUrl(photo, options);

                return text + " " + result2.parsedText;
            } catch (err) {
                throw new Error(err);
            }
    },
      /**
     * 
     * @param {Message} message 
     */
    async sendChannelLlog(message) {
        let guildID = message.guild?.id;
        let guildSettings = db.get(`yapayzeka_${guildID}`);
        let channel = await message.guild?.channels.fetch(guildSettings.aboneLogID);

        if (channel && channel.type === ChannelType.GuildText) {
            const embed = new EmbedBuilder()
                .setTitle(`${message.author.tag}`)
                .setColor('Red')
                .setImage(`${message.attachments.first()?.url}`)
                .setTimestamp()
                .setFooter({ text: `${message.author.tag} Adlı kullanıcının attığı ss.`, iconURL: message.author.displayAvatarURL() })
            channel.send({embeds: [embed]})
        }
    }
}