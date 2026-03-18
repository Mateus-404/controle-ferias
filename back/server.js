import Fastify from 'fastify';
import cors from '@fastify/cors';
import 'dotenv/config';
import routes from './routes/index.js';

async function start() {
    const server = Fastify();

    await server.register(cors, {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
    });
    await server.register(routes);

    server.addHook('onRequest', async (request) => {
        request.user = {
            id: '00000000-0000-0000-0000-000000000001',
            role: 'employee'
        }
    })

    server.get('/health', async () => {
        return { service: 'BIUD Time API' };
    })

    const PORT = process.env.PORT || 3000;

    server.listen({ port: PORT, host: 'localhost' }, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    }) 
}
start();