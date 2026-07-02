import {
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { brBuilder } from '../lib/brBuilder';

const COMMUNITY_LINKS = {
  instagram: 'https://www.instagram.com/commitpt_/',
  website: 'https://www.commitpt.com',
  linkedin: 'https://www.linkedin.com/company/commit-pt',
};

const CREATOR_LINKS = {
  github: 'https://github.com/spars57',
  instagram: 'https://instagram.com/@brumoisao',
  linkedin: 'https://linkedin.com/in/brunomoisao',
  tiktok: 'https://tiktok.com/@brumoisao2',
};

export const data = new SlashCommandBuilder()
  .setName('links')
  .setDescription('Mostra todos os links da comunidade e do criador CommitPT');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const container = new ContainerBuilder({
    accent_color: 0x79c0ff,
    components: [
      {
        type: ComponentType.TextDisplay,
        content: brBuilder('# 🔗 Links CommitPT', '', '### 🌍 Comunidade'),
      },
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ButtonStyle.Link,
            label: 'Instagram',
            emoji: { name: '📸' },
            url: COMMUNITY_LINKS.instagram,
          },
          {
            type: ComponentType.Button,
            style: ButtonStyle.Link,
            label: 'Website',
            emoji: { name: '🌐' },
            url: COMMUNITY_LINKS.website,
          },
          {
            type: ComponentType.Button,
            style: ButtonStyle.Link,
            label: 'LinkedIn',
            emoji: { name: '💼' },
            url: COMMUNITY_LINKS.linkedin,
          },
        ],
      },
      {
        type: ComponentType.Separator,
        divider: true,
        spacing: 2,
      },
      {
        type: ComponentType.TextDisplay,
        content: brBuilder('### 👤 Bruno Moisão (Criador)'),
      },
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ButtonStyle.Link,
            label: 'Github',
            emoji: { name: '🐙' },
            url: CREATOR_LINKS.github,
          },
          {
            type: ComponentType.Button,
            style: ButtonStyle.Link,
            label: 'Instagram',
            emoji: { name: '📸' },
            url: COMMUNITY_LINKS.instagram,
          },
          {
            type: ComponentType.Button,
            style: ButtonStyle.Link,
            label: 'LinkedIn',
            emoji: { name: '💼' },
            url: COMMUNITY_LINKS.linkedin,
          },
          {
            type: ComponentType.Button,
            style: ButtonStyle.Link,
            label: 'TikTok',
            emoji: { name: '🎵' },
            url: CREATOR_LINKS.tiktok,
          },
        ],
      },
    ],
  });

  await Promise.all([
    interaction.reply({ content: 'Enviado!', flags: [MessageFlags.Ephemeral] }),
    interaction.channel?.isSendable()
      ? interaction.channel.send({ components: [container], flags: [MessageFlags.IsComponentsV2] })
      : Promise.resolve(),
  ]);
}
