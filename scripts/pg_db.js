// Helper CJS para scripts: conecta a Postgres usando .env
const { resolve } = require("node:path")
const { config } = require("dotenv")
const { Pool } = require("pg")

config({ path: resolve(process.cwd(), ".env") })

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    max: 10,
})

async function query(sql, params = []) {
    const res = await pool.query(sql, params)
    return res.rows
}

module.exports = { query, pool }
