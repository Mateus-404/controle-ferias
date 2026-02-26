import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'
import { Pool } from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '.env') })

if(!process.env.DATABASE_URL){
  throw new Error ("DATABASE_URL não encontrada")
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})