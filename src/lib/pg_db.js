import pkg from 'pg';
const { Pool } = pkg;

let pool;

const construir_pool = () => {
    const host = process.env.DB_HOST;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASS;
    const database = process.env.DB_NAME;
    const port = parseInt(process.env.DB_PORT || "5432", 10);

    if (password === "") throw new Error("DB_PASS no puede estar vacío");

    return new Pool({
        host,
        user,
        password,
        database,
        port,
        max: 20,  // Máximas conexiones simultaneas
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
};

const necesita_recrear = (p, { host, user, password, database, port }) => {
    if (!p) return true;
    const cfg = p.options || {};
    return (
        cfg.host !== host ||
        cfg.user !== user ||
        cfg.password !== password ||
        cfg.database !== database ||
        cfg.port !== port
    );
};

(() => {
    const host = process.env.DB_HOST;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASS;
    const database = process.env.DB_NAME;
    const port = parseInt(process.env.DB_PORT || "5432", 10);

    if (necesita_recrear(global._pg_pool, { host, user, password, database, port })) {
        if (global._pg_pool) {
            global._pg_pool.end().catch(() => {});
        }
        global._pg_pool = construir_pool();
    }

    pool = global._pg_pool;
})();

export async function query(sql, params = []) {
    const result = await pool.query(sql, params);
    return result.rows;
}

export default pool;
