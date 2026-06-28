import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';
import { CHANNELS, PRIMARY_COLOR, ROLES } from '../constants';
import { logger } from '../logger';

async function fetchPageTitle(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

export const data = new SlashCommandBuilder()
  .setName('criar-noticia')
  .setDescription('Publica uma notícia manualmente no canal de notícias')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addStringOption((option) =>
    option.setName('url').setDescription('URL da notícia').setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const member = interaction.guild?.members.cache.get(interaction.user.id);
  if (!member?.roles.cache.has(ROLES.STAFF)) {
    await interaction.reply({
      content: 'Não tens permissão para usar este comando.',
      ephemeral: true,
    });
    return;
  }

  const url = interaction.options.getString('url', true);

  if (!URL.canParse(url)) {
    await interaction.reply({ content: 'URL inválido.', ephemeral: true });
    return;
  }

  const channel = interaction.guild?.channels.cache.get(CHANNELS.NEWS) as TextChannel | undefined;
  if (!channel) {
    await interaction.reply({ content: 'Canal de notícias não encontrado.', ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const title = (await fetchPageTitle(url)) ?? url;

  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setURL(url)
    .setTitle(title.slice(0, 256))
    .setFooter({ text: `Partilhado por ${interaction.user.displayName}` })
    .setTimestamp();

  await channel.send({ embeds: [embed] });

  logger.info(`[criar-noticia] ${interaction.user.tag} published: ${url}`);
  await interaction.editReply({ content: '✅ Notícia publicada.' });
}
