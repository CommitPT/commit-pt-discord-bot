import {
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { fetchAndPublishNews } from '../lib/news';

export const data = new SlashCommandBuilder()
  .setName('enviar-noticias')
  .setDescription('Publica manualmente os artigos de tecnologia no canal de notícias')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

  const count = await fetchAndPublishNews(interaction.client);

  if (count === 0) {
    await interaction.editReply({ content: 'Não foram encontrados artigos novos.' });
    return;
  }

  await interaction.editReply({
    content: `✅ ${count} artigo${count !== 1 ? 's' : ''} publicado${count !== 1 ? 's' : ''} no canal de notícias.`,
  });
}
