import { pool } from '../db.js'

async function makeAdmin(email) {
  if (!email) {
    console.error('Por favor, forneça um email.')
    process.exit(1)
  }

  try {
    const query = `
      UPDATE users 
      SET role = 'admin' 
      WHERE email = $1 
      RETURNING id, nome, email, role
    `
    const { rows } = await pool.query(query, [email])

    if (rows.length === 0) {
      console.error(`Usuário com email ${email} não encontrado.`)
      process.exit(1)
    }

    console.log('Usuário atualizado para admin com sucesso:')
    console.table(rows[0])
    process.exit(0)
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err)
    process.exit(1)
  }
}

const email = process.argv[2]
makeAdmin(email)
