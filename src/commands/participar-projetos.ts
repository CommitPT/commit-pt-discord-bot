import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { PRIMARY_COLOR, PROJECT_ROLES } from '../constants';
import { getFooterText } from '../lib/footer';

export const data = new SlashCommandBuilder()
  .setName('participar-projetos')
  .setDescription('Painel de seleção de roles para projetos internos')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle('🛠️ Projetos Internos')
    .setDescription(
      'Queres fazer parte de algum dos nossos projetos internos?\n\nEscolhe o(s) projeto(s) em que queres participar:',
    )
    .addFields(PROJECT_ROLES.map((r) => ({ name: r.name, value: r.description, inline: false })))
    .setFooter({ text: getFooterText(interaction) })
    .setTimestamp();

  const buttons = PROJECT_ROLES.map((r) =>
    new ButtonBuilder()
      .setCustomId(`project-role:${r.name}`)
      .setLabel(r.name)
      .setStyle(ButtonStyle.Primary),
  );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);

  await Promise.all([
    interaction.reply({ content: 'Enviado!', flags: [MessageFlags.Ephemeral] }),
    interaction.channel?.isSendable()
      ? interaction.channel.send({ embeds: [embed], components: [row] })
      : Promise.resolve(),
  ]);
}
