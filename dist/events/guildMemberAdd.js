"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGuildMemberAdd = handleGuildMemberAdd;
const discord_js_1 = require("discord.js");
async function handleGuildMemberAdd(member) {
    const channelId = process.env.WELCOME_CHANNEL_ID;
    if (!channelId) {
        console.warn('WELCOME_CHANNEL_ID is not set in .env');
        return;
    }
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel || !channel.isTextBased()) {
        console.warn(`Welcome channel ${channelId} not found or is not a text channel`);
        return;
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle(`Bem-vindo/a à comunidade CommitPT, ${member.displayName}! 🎉`)
        .setDescription(`Olá ${member}! Fica à vontade e começa por te apresentar.\n\n` +
        `📝 Faz a tua apresentação em <#${process.env.PRESENTATIONS_CHANNEL_ID ?? 'apresentações'}>\n` +
        `💬 Envia a tua primeira mensagem em <#${process.env.GENERAL_CHANNEL_ID ?? 'chat-geral'}>\n` +
        `🔒 Informações sobre a Commit+ em <#${process.env.COMMIT_PLUS_CHANNEL_ID ?? 'acesso-commit-plus'}>`)
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp();
    await channel.send({ embeds: [embed] });
}
