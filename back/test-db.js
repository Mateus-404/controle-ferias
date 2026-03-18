import { pool } from './db.js';

async function testConnection() {
  try {
    console.log("Testando conexão com o banco de dados...");
    const res = await pool.query('SELECT NOW()');
    console.log("Conexão bem sucedida:", res.rows[0]);
    
    console.log("Verificando tabela users...");
    const users = await pool.query('SELECT count(*) FROM users');
    console.log("Número de usuários:", users.rows[0].count);
    
    process.exit(0);
  } catch (err) {
    console.error("ERRO DE CONEXÃO:");
    console.error(err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

testConnection();
