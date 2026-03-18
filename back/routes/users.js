import { pool } from '../db.js'
import bcrypt from 'bcrypt'

export default async function usersRoutes(server) {
  server.addHook('onRequest', server.authenticate)

  server.get('/', async () => {
    const { rows } = await pool.query('SELECT id, nome, email, role, balance_ferias, balance_day_off, created_at FROM users')
    return rows
  })

  server.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['nome', 'email', 'role', 'password'],
        properties: {
          nome: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['funcionario', 'gestor', 'admin'] },
          password: { type: 'string', minLength: 6 }
        }
      }
    }
  }, async (request, reply) => {
    const { nome, email, role, password } = request.body

    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      const query = `
        INSERT INTO users (nome, email, role, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id, nome, email, role, created_at
      `
      const { rows } = await pool.query(query, [nome, email, role, hashedPassword])
      return reply.status(201).send(rows[0])
    } catch (err) {
      if (err.code === '23505') {
        return reply.status(400).send({ message: 'Email já cadastrado' })
      }
      throw err
    }
  })

  server.get('/balance', async (request, reply) => {
    const userId = request.headers['x-user-id']
    const { rows } = await pool.query('SELECT balance_ferias, balance_day_off FROM users WHERE id = $1', [userId])
    return reply.send({
      vacation_balance: rows[0].balance_ferias,
      day_off_balance: rows[0].balance_day_off
    })
  })

  server.put('/reload-balance/:id', async (request, reply) => {
    const { id } = request.params

    try {
      const query = `
        UPDATE users 
        SET balance_ferias = 30, balance_day_off = 10
        WHERE id = $1
        RETURNING id, nome, email, balance_ferias, balance_day_off
      `
      const { rows } = await pool.query(query, [id])

      if (rows.length === 0) {
        return reply.status(404).send({ message: 'Usuário não encontrado' })
      }

      return reply.status(200).send({
        message: 'Saldo recarregado com sucesso',
        user: rows[0]
      })
    } catch (err) {
      throw err
    }
  })

  server.post('/reload-all-balances', {
    schema: {
      description: 'Recarrega todos os saldos para o valor padrão'
    }
  }, async (request, reply) => {
    try {
      const query = `
        UPDATE users 
        SET balance_ferias = 30, balance_day_off = 10
        RETURNING id, nome, email, balance_ferias, balance_day_off
      `
      const { rows } = await pool.query(query)

      return reply.status(200).send({
        message: `Saldos recarregados com sucesso para ${rows.length} usuários`,
        users: rows
      })
    } catch (err) {
      throw err
    }
  })
}
