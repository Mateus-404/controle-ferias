import requestRoutes from './request.js'
import userRoutes from './users.js'
import { pool } from '../db.js'
import bcrypt from 'bcrypt'

export default async function routes(server) {
  await server.register(requestRoutes, { prefix: '/requests' })
  await server.register(userRoutes, { prefix: '/users' })

  server.post('/auth/login', async (request, reply) => {
    const { email, password } = request.body

    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])

      if (rows.length === 0) {
        return reply.status(401).send({ message: 'Credenciais inválidas' })
      }

      const user = rows[0]
      const validPassword = await bcrypt.compare(password, user.password)

      if (!validPassword) {
        return reply.status(401).send({ message: 'Credenciais inválidas' })
      }

      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role
      }

      const token = server.jwt.sign(tokenPayload, { expiresIn: '1h' })

      return reply.status(200).send({
        token,
        message: `Bem vindo ${user.nome}`,
        user: {
          id: user.id,
          nome: user.nome,
          role: user.role
        }
      })
    } catch (err) {
      server.log.error(err)
      return reply.status(500).send({ message: 'Erro interno no servidor' })
    }
  })

  server.post('/auth/register', {
    schema: {
      body: {
        type: 'object',
        required: ['nome', 'email', 'password'],
        properties: {
          nome: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 }
        }
      }
    }
  }, async (request, reply) => {
    const { nome, email, password } = request.body

    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      const role = 'funcionario'
      const query = `
        INSERT INTO users (nome, email, role, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id, nome, email, role, created_at
      `
      const { rows } = await pool.query(query, [nome, email, role, hashedPassword])
      const user = rows[0]

      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role
      }

      const token = server.jwt.sign(tokenPayload, { expiresIn: '1h' })

      return reply.status(201).send({
        token,
        message: `Cadastrado com sucesso! Bem vindo ${user.nome}`,
        user: {
          id: user.id,
          nome: user.nome,
          role: user.role
        }
      })
    } catch (err) {
      if (err.code === '23505') {
        return reply.status(400).send({ message: 'Email já cadastrado' })
      }
      server.log.error(err)
      return reply.status(500).send({ message: 'Erro interno no servidor' })
    }
  })
}