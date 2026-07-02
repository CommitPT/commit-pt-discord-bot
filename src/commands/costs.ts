import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PRIMARY_COLOR } from '../constants';
import { getFooterText } from '../lib/footer';

interface ExpenseItem {
  name: string;
  cost: number;
  currency: 'EUR' | 'USD';
  plan: 'MENSAL' | 'SEMESTRAL' | 'ANUAL';
}

interface ExpenseProject {
  name: string;
  items: ExpenseItem[];
}

interface Expenses {
  Projects: ExpenseProject[];
}

const CURRENCY_SYMBOL: Record<string, string> = {
  EUR: '€',
  USD: '$',
};

function formatItem(item: ExpenseItem): string {
  const symbol = CURRENCY_SYMBOL[item.currency] ?? item.currency;
  return `• ${item.name} — **${symbol}${item.cost}/${item.plan.toLowerCase()}**`;
}

export const data = new SlashCommandBuilder()
  .setName('costs')
  .setDescription('Mostra os custos mensais da infraestrutura da comunidade CommitPT');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const expensesPath = join(process.cwd(), 'expenses.json');
  const expenses: Expenses = JSON.parse(readFileSync(expensesPath, 'utf-8'));

  const embed = new EmbedBuilder().setColor(PRIMARY_COLOR).setTitle('💰 Despesas Fixas CommitPT');

  embed.addFields({ name: '​', value: '​', inline: false });

  for (const project of expenses.Projects) {
    const value =
      project.items.length > 0
        ? project.items.map(formatItem).join('\n')
        : '_Sem despesas registadas_';

    embed.addFields(
      { name: project.name, value, inline: false },
      { name: '​', value: '​', inline: false },
    );
  }

  embed.setFooter({ text: getFooterText(interaction) }).setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
