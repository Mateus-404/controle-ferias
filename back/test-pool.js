import { pool } from "./db.js"

try {
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "CONFIGURADA" : "NÃO ENCONTRADA")
  const result = await pool.query("SELECT NOW()")
  console.log("Conexão bem-sucedida:", result.rows[0])
  await pool.end()
} catch (err) {
  console.error("ERRO:", err.message)
  console.error("Stack:", err.stack)
  process.exit(1)
}
