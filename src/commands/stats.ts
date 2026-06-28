import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { CATEGORIES, PRIMARY_COLOR, ROLES } from '../constants';
import { db } from '../lib/database';
import { getFooterText } from '../lib/footer';

export const data = new SlashCommandBuilder()
  .setName('stats')
  .setDescription('Mostra as estatísticas do servidor')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

function getMessageCount(days: number): number {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  const sinceDate = since.toISOString().slice(0, 10);
  const row = db
    .prepare(`SELECT SUM(count) as total FROM message_stats WHERE date >= ?`)
    .get(sinceDate) as { total: number | null };
  return row.total ?? 0;
}

function getActiveMembers(guildId: string): number {
  const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const row = db
    .prepare(`SELECT COUNT(*) as count FROM user_xp WHERE guild_id = ? AND last_message_at >= ?`)
    .get(guildId, since) as { count: number };
  return row.count;
}

function getResolvedTickets(): number {
  const row = db.prepare(`SELECT counter FROM resolved_tickets WHERE id = 1`).get() as {
    counter: number;
  };
  return row.counter;
}

function getTotalTickets(): number {
  const row = db.prepare(`SELECT counter FROM ticket_counter WHERE id = 1`).get() as {
    counter: number;
  };
  return row.counter;
}

function getXpStats(guildId: string): { total: number; avg: number } {
  const row = db
    .prepare(`SELECT SUM(xp) as total, AVG(xp) as avg FROM user_xp WHERE guild_id = ?`)
    .get(guildId) as { total: number | null; avg: number | null };
  return { total: row.total ?? 0, avg: Math.round(row.avg ?? 0) };
}

function getInviteStats(guildId: string): { total: number; topName: string; topCount: number } {
  const total = (
    db.prepare(`SELECT COUNT(*) as count FROM invite_tracker WHERE guild_id = ?`).get(guildId) as {
      count: number;
    }
  ).count;

  const top = db
    .prepare(
      `SELECT inviter_id, COUNT(*) as count FROM invite_tracker WHERE guild_id = ? GROUP BY inviter_id ORDER BY count DESC LIMIT 1`,
    )
    .get(guildId) as { inviter_id: string; count: number } | undefined;

  return {
    total,
    topName: top ? `<@${top.inviter_id}>` : '—',
    topCount: top?.count ?? 0,
  };
}

function getNewMembersThisMonth(guildId: string): number {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const row = db
    .prepare(`SELECT COUNT(*) as count FROM member_joins WHERE guild_id = ? AND joined_at >= ?`)
    .get(guildId, start.getTime()) as { count: number };
  return row.count;
}

function formatAge(createdAt: Date): string {
  const now = new Date();
  let years = now.getFullYear() - createdAt.getFullYear();
  let months = now.getMonth() - createdAt.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  const parts = [];
  if (years > 0) parts.push(`${years} ano${years !== 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} ${months !== 1 ? 'meses' : 'mês'}`);
  return parts.join(', ') || 'menos de 1 mês';
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const guild = interaction.guild!;

  const totalMembers = guild.memberCount;
  const bots = guild.members.cache.filter((m) => m.user.bot).size;
  const humans = totalMembers - bots;
  const commitPlus = guild.roles.cache.get(ROLES.COMMIT_PLUS)?.members.size ?? 0;
  const conversion = humans > 0 ? ((commitPlus / humans) * 100).toFixed(1) : '0.0';

  const openTickets = guild.channels.cache.filter(
    (c) => c.parentId === CATEGORIES.TICKETS && c.name.startsWith('ticket-'),
  ).size;

  const messagesDay = getMessageCount(1);
  const messagesWeek = getMessageCount(7);
  const activeMembers = getActiveMembers(guild.id);
  const resolvedTickets = getResolvedTickets();
  const totalTickets = getTotalTickets();
  const xp = getXpStats(guild.id);
  const invites = getInviteStats(guild.id);
  const newMembers = getNewMembersThisMonth(guild.id);

  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle('📊 Estatísticas da Commit PT')
    .addFields(
      {
        name: '👥 Membros',
        value: [
          `• Total: **${totalMembers}**`,
          `• Humanos: **${humans}**`,
          `• Bots: **${bots}**`,
        ].join('\n'),
        inline: true,
      },
      {
        name: '🟢 Atividade',
        value: [
          `• Ativos (30 dias): **${activeMembers}**`,
          `• Mensagens hoje: **${messagesDay}**`,
          `• Mensagens esta semana: **${messagesWeek}**`,
        ].join('\n'),
        inline: true,
      },
      { name: '​', value: '​', inline: false },
      {
        name: '⭐ Commit+',
        value: [`• Membros: **${commitPlus}**`, `• Conversão: **${conversion}%**`].join('\n'),
        inline: true,
      },
      {
        name: '🎫 Tickets',
        value: [
          `• Abertos: **${openTickets}**`,
          `• Resolvidos: **${resolvedTickets}** (total: ${totalTickets})`,
        ].join('\n'),
        inline: true,
      },
      { name: '​', value: '​', inline: false },
      {
        name: '🎮 XP',
        value: [
          `• Total de XP: **${xp.total.toLocaleString('pt-PT')}**`,
          `• Média por membro: **${xp.avg.toLocaleString('pt-PT')}**`,
        ].join('\n'),
        inline: true,
      },
      {
        name: '📨 Convites',
        value: [
          `• Total: **${invites.total}**`,
          `• Top convidador: ${invites.topName} (${invites.topCount})`,
        ].join('\n'),
        inline: true,
      },
      { name: '​', value: '​', inline: false },
      {
        name: '📅 Comunidade',
        value: [
          `• Criada há: **${formatAge(guild.createdAt)}**`,
          `• Novos membros este mês: **${newMembers}**`,
        ].join('\n'),
        inline: false,
      },
    )
    .setFooter({
      text: `${getFooterText(interaction)} • Estatísticas registadas desde 28 de Junho de 2026`,
    })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
