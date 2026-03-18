import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import 'dotenv/config';
import routes from './routes/index.js';

async function start() {
    const server = Fastify({ logger: true });

    await server.register(cors, {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
    });

    await server.register(jwt, {
        secret: process.env.JWT_SECRET || 'supersecret'
    });

    server.decorate("authenticate", async function (request, reply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });

    await server.register(routes);

    server.get('/health', async () => {
        return { service: 'BIUD Time API' };
    })

    const PORT = process.env.PORT || 3000;

    const address = await server.listen({ port: PORT, host: 'localhost' });
    console.log(`Servidor rodando em ${address}`);
}
start();