# BIUD Time API

API de back-end para gerenciamento de tempo e requisições. Construída com Fastify e PostgreSQL.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Fastify** - Framework web rápido e de baixa overhead
- **PostgreSQL** - Banco de dados relacional
- **CORS** - Permite requisições de diferentes origens
- **dotenv** - Gerenciamento de variáveis de ambiente

## 📋 Pré-requisitos

- Node.js (v16 ou superior)
- PostgreSQL instalado e rodando
- npm ou yarn

## ⚙️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/SEU_USUARIO/biud-time.git
cd biud-time
```

2. Entre na pasta do backend:
```bash
cd back
```

3. Instale as dependências:
```bash
npm install
```

4. Configure as variáveis de ambiente:
```bash
# Crie um arquivo .env na pasta /back
PORT=3000
DATABASE_URL=postgresql://usuario:senha@localhost:5432/biud_time
```

5. Execute as migrações do banco de dados:
```bash
npm run migrate
```

## 🏃 Como Executar

### Modo Desenvolvimento
```bash
npm run dev
```
O servidor será iniciado em `http://localhost:3000`

### Verificar Status
```bash
curl http://localhost:3000/health
```

Resposta esperada:
```json
{
  "service": "BIUD Time API"
}
```

## 📁 Estrutura do Projeto

```
back/
├── Migrations/
│   └── create-table.js        # Scripts de criação das tabelas
├── routes/
│   ├── index.js               # Registro das rotas
│   ├── request.js             # Rotas de requisições
│   └── users.js               # Rotas de usuários
├── db.js                       # Configuração do banco de dados
├── server.js                   # Arquivo principal do servidor
├── package.json                # Dependências do projeto
└── .env                        # Variáveis de ambiente (não versionado)
```

## 🔌 Endpoints Principais

### Health Check
- `GET /health` - Verifica se a API está funcionando

### Requisições
- `GET /requests` - Lista todas as requisições
- `POST /requests` - Cria uma nova requisição
- `GET /requests/:id` - Obtém uma requisição específica
- `PUT /requests/:id` - Atualiza uma requisição
- `DELETE /requests/:id` - Deleta uma requisição

### Usuários
- `GET /users` - Lista todos os usuários
- `POST /users` - Cria um novo usuário
- `GET /users/:id` - Obtém um usuário específico
- `PUT /users/:id` - Atualiza um usuário
- `DELETE /users/:id` - Deleta um usuário

## 🔐 Autenticação

A API utiliza um sistema básico de autenticação. O usuário é mockado a cada requisição com:
```javascript
{
  id: '00000000-0000-0000-0000-000000000001',
  role: 'employee'
}
```

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo watch (desenvolvimento)
- `npm run migrate` - Executa as migrações do banco de dados

## 🛠️ Configuração Adicional

### Variáveis de Ambiente

Crie um arquivo `.env` na pasta `/back` com as seguintes variáveis:

```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
```

## 📝 Notas

- CORS está habilitado para aceitar requisições de qualquer origem
- O servidor está configurado para rodar em `localhost` por padrão
- As migrações devem ser executadas antes de usar a API