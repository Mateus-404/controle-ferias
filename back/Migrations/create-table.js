import { pool } from "../db.js";
import bcrypt from "bcrypt";


async function createTable() {
  try {
    console.log("Iniciando criação de tabelas...")
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`)

    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK (role IN ('funcionario', 'gestor', 'admin')),
      balance_ferias INT DEFAULT 30,
      balance_day_off INT DEFAULT 10,
      password TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`)

    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS balance_ferias INT DEFAULT 30`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS balance_day_off INT DEFAULT 10`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT`)

    await pool.query(`CREATE TABLE IF NOT EXISTS requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      type TEXT NOT NULL CHECK (type IN ('ferias', 'home-office', 'day-off')),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      CONSTRAINT valid_date_range CHECK (end_date >= start_date),
      status TEXT NOT NULL CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED')),
      created_at TIMESTAMP DEFAULT NOW()
    )`)

    await pool.query(`CREATE TABLE IF NOT EXISTS requests_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      request_id UUID NOT NULL REFERENCES requests(id),
      status TEXT NOT NULL,
      changed_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    )`)

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_requests_user ON requests(user_id)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status)`)

    const seedPassword = await bcrypt.hash('123456', 10)
    await pool.query(`
      INSERT INTO users (id, nome, email, role, password)
      VALUES ('00000000-0000-0000-0000-000000000001', 'Usuário Padrão', 'user@example.com', 'admin', $1)
      ON CONFLICT (id) DO UPDATE SET 
        password = EXCLUDED.password,
        email = EXCLUDED.email
    `, [seedPassword])

    console.log("Tabelas criadas com sucesso!")
    await pool.end()
    process.exit(0)
  } catch (err) {
    console.error("Erro ao criar tabelas:", err.message)
    console.error("Detalhes:", err)
    await pool.end()
    process.exit(1)
  }
}
createTable()

/*async function dropTables() {
  try {
    await pool.query(`
      DROP TABLE IF EXISTS users;
    `)

    console.log("Tabelas apagadas com sucesso!")
    process.exit(0)
  } catch (err) {
    console.error("Erro ao apagar tabelas:", err)
    process.exit(1)
  }
}

dropTables().catch(err => {
  console.error("Erro não capturado em dropTables:", err)
  process.exit(1)
})*/