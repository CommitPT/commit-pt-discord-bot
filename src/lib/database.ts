import Database from 'better-sqlite3';
import { join } from 'path';
// usa se o join para criar a  db dentro do ficheiro commit-pt discord bot

const dbPath = join(process.cwd(), 'database.db'); // com o join cria no sitio correto commit-pt discord bot

export const db = new Database(dbPath); // aqui verificamos se ha db se nao houver isto cria uma do zero

console.log('A base de dados está a ser criada em:', dbPath);
//comando sql para criar a tabela

//linha 15 diz para criar uma tabelaa com esse nome se nao existir

db.exec(`
    CREATE TABLE IF NOT EXISTS user_xp (    

    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    PRIMARY KEY (user_id, guild_id)
    
    
    
    )
`);
