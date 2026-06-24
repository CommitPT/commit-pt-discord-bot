// Lista temporária na memória RAM do bot
const xpCoolDown = new Set<string>();
const COOLDOWN_TEMPO = 30;

// o bot vai verificar se esta em cool down a pessoaa se tiver n gaanha xp durante esse tempo

//verificações

export function verificarEAtivarDelay(userId: string): boolean {
  if (xpCoolDown.has(userId)) {
    return false;
  }

  xpCoolDown.add(userId);

  setTimeout(() => {
    xpCoolDown.delete(userId);
  }, COOLDOWN_TEMPO);

  return true;
}
