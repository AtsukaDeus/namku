import pkg from 'pg';
const { Pool } = pkg;

let pool;

if (!global._pg_pool) {
    global._pg_pool = new Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432,
        max: 20,  // Máximas conexiones simultaneas
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
}

pool = global._pg_pool;

export async function query(sql, params = []) {
    const result = await pool.query(sql, params);
    return result.rows;
}

export default pool;
