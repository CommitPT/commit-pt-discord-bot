import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'; // criamos o comando com slashcommandbuilder e ao ser usar o CommandInteraction avisa o bot q foi usado
import { db } from '../lib/database'; // importar a database

// oque vai aparecer ao usar o comando

export const data = new SlashCommandBuilder()
  .setName('rankxp')
  .setDescription('ve o teu nivel e o XP no servidor')
  .addUserOption(
    (Option) =>
      Option.setName('membro')
        .setDescription('O membro que queres ver o rank( deixa vazio caso queiras ver o teu)')
        .setRequired(false), // nao e obrigatorio marcar alguem podendo ver o proprio
  );

// funcao principal

export async function execute(interaction: ChatInputCommandInteraction) {
  //se o utilizador quer ver de alguem e mencionou ve dessa pessoa
  //se nao mencionou nng ve o seu
  const pessoa_escolhida = interaction.options.getUser('membro') || interaction.user;

  const userId = pessoa_escolhida.id;
  const guildId = interaction.guildId;

  //nao usar o comaando fora do server

  if (!guildId) {
    await interaction.reply({
      content: '❌ Este comando só pode ser usado dentro de um servidor!',
      ephemeral: true, // so quem usa o comando fora consegue ver a mensagem
    });
  }

  //preparar o comando SQL para procurar  o usuario na db

  const procurarUsuario = db.prepare('SELECT * FROM user_xp Where user_id = ? AND guild_id = ?');

  // executar a busca pelo id da pessoa e do servidor

  const dadosUsuario = procurarUsuario.get(userId, guildId) as
    | { user_id: string; guild_id: string; xp: number; level: number }
    | undefined; // undefined se n encontrar o usuario naa db

  let xpAtual = 0; // let porque pode se mudaar depois
  let nivelAtual = 1;

  // se estiver na DB atualizamaos as infos

  if (dadosUsuario) {
    xpAtual = dadosUsuario.xp;
    nivelAtual = dadosUsuario.level;
  }

  // formula para o xp upar level

  const xpNecessario = 5 * Math.pow(nivelAtual, 2) + 50 * nivelAtual + 100;

  const xpEmFalta = xpNecessario - xpAtual;

  //receber os dados do bot

  await interaction.reply({
    content:
      `📊 **Rank de ${pessoa_escolhida.username}**\n` +
      `⭐ **Nível:** \`${nivelAtual}\`\n` +
      `✨ **XP Atual:** \`${xpAtual} / ${xpNecessario}\` XP\n` +
      `🎯 **Faltam:** \`${xpEmFalta}\` XP para o próximo nível!`,
  });
}
