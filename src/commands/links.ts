import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

const COMMUNITY_LINKS = {
  instagram: 'https://instagram.com/PLACEHOLDER',
  website: 'https://www.commitpt.com',
  linkedin: 'https://linkedin.com/company/PLACEHOLDER',
};

const CREATOR_LINKS = {
  github: 'https://github.com/PLACEHOLDER',
  instagram: 'https://instagram.com/PLACEHOLDER',
  linkedin: 'https://linkedin.com/in/PLACEHOLDER',
  tiktok: 'https://tiktok.com/@PLACEHOLDER',
};

export const data = new SlashCommandBuilder()
  .setName('links')
  .setDescription('Shows all CommitPT community and creator links');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor('#e74c3c')
    .setTitle('🔗 Links CommitPT')
    .addFields(
      {
        name: '🌍 Comunidade',
        value: [
          `📸 Instagram — ${COMMUNITY_LINKS.instagram}`,
          `🌐 Website — ${COMMUNITY_LINKS.website}`,
          `💼 LinkedIn — ${COMMUNITY_LINKS.linkedin}`,
        ].join('\n'),
      },
      {
        name: '👤 Bruno Moisão (Criador)',
        value: [
          `🐙 GitHub — ${CREATOR_LINKS.github}`,
          `📸 Instagram — ${CREATOR_LINKS.instagram}`,
          `💼 LinkedIn — ${CREATOR_LINKS.linkedin}`,
          `🎵 TikTok — ${CREATOR_LINKS.tiktok}`,
        ].join('\n'),
      },
    )
    .setFooter({ text: 'CommitPT — Para de programar sozinho.' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
