import { query } from "@/lib/pg_db";

// ==========================================
// CREAR NOTIFICACIÓN
// ==========================================
export async function crear_notificacion({ tipo, usuario_id, usuario_nombre, recurso_tipo, recurso_id, descripcion }) {
    const result = await query(
        `INSERT INTO notificaciones 
         (tipo, usuario_id, usuario_nombre, recurso_tipo, recurso_id, descripcion) 
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [tipo, usuario_id, usuario_nombre, recurso_tipo, recurso_id, descripcion]
    )
    return result[0].id
}

// ==========================================
// ASIGNAR USUARIOS
// ==========================================
export async function asignar_usuarios(notificacion_id, usuarios_ids) {
    if (!usuarios_ids || usuarios_ids.length === 0) return

    // Eliminar duplicados
    const unique_ids = [...new Set(usuarios_ids)]
    
    // Insertar cada destinatario individualmente para asegurar compatibilidad
    for (const usuario_id of unique_ids) {
        await query(
            `INSERT INTO notificaciones_usuarios (notificacion_id, usuario_id) 
             VALUES ($1, $2)
             ON CONFLICT (notificacion_id, usuario_id) DO NOTHING`,
            [notificacion_id, usuario_id]
        )
    }
}

// ==========================================
// OBTENER NOTIFICACIONES DE UN USUARIO
// ==========================================
export async function obtener_notificaciones_usuario(usuario_id, { solo_no_leidas = false, limit = 50 } = {}) {
    // Sanitizar limit (asegurar que sea un número válido)
    const safe_limit = Math.max(1, Math.min(parseInt(limit) || 50, 100))
    
    let sql = `
        SELECT 
            n.id,
            n.tipo,
            n.usuario_nombre,
            n.recurso_tipo,
            n.recurso_id,
            n.descripcion,
            n.fecha_creacion,
            (nl.id IS NOT NULL) AS leida,
            nl.fecha_lectura
        FROM notificaciones n
        INNER JOIN notificaciones_usuarios nd 
            ON nd.notificacion_id = n.id
        LEFT JOIN notificaciones_leidas nl 
            ON nl.notificacion_id = n.id 
            AND nl.usuario_id = nd.usuario_id
        WHERE nd.usuario_id = $1
    `
    
    const params = [usuario_id]
    
    if (solo_no_leidas) {
        sql += ` AND nl.id IS NULL`
    }
    
    // Interpolación directa del LIMIT (ya está sanitizado)
    sql += ` ORDER BY n.fecha_creacion DESC LIMIT ${safe_limit}`
    
    return await query(sql, params)
}

// ==========================================
// CONTAR NO LEÍDAS
// ==========================================
export async function contar_notificaciones_no_leidas(usuario_id) {
    const result = await query(
        `SELECT COUNT(*) as total
         FROM notificaciones n
         INNER JOIN notificaciones_usuarios nd 
             ON nd.notificacion_id = n.id
         LEFT JOIN notificaciones_leidas nl 
             ON nl.notificacion_id = n.id 
             AND nl.usuario_id = nd.usuario_id
         WHERE nd.usuario_id = $1 
           AND nl.id IS NULL`,
        [usuario_id]
    )
    return parseInt(result[0]?.total) || 0
}

// ==========================================
// MARCAR COMO LEÍDA
// ==========================================
export async function marcar_notificacion_leida(notificacion_id, usuario_id) {
    await query(
        `INSERT INTO notificaciones_leidas (notificacion_id, usuario_id) 
         VALUES ($1, $2)
         ON CONFLICT (notificacion_id, usuario_id) 
         DO UPDATE SET fecha_lectura = CURRENT_TIMESTAMP`,
        [notificacion_id, usuario_id]
    )
}

// ==========================================
// MARCAR TODAS COMO LEÍDAS
// ==========================================
export async function marcar_todas_leidas(usuario_id) {
    const notificaciones = await query(
        `SELECT nd.notificacion_id
         FROM notificaciones_usuarios nd
         LEFT JOIN notificaciones_leidas nl 
             ON nl.notificacion_id = nd.notificacion_id 
             AND nl.usuario_id = nd.usuario_id
         WHERE nd.usuario_id = $1 
           AND nl.id IS NULL`,
        [usuario_id]
    )
    
    if (notificaciones.length === 0) return 0
    
    // Insertar cada notificación individualmente para asegurar compatibilidad
    for (const n of notificaciones) {
        await query(
            `INSERT INTO notificaciones_leidas (notificacion_id, usuario_id) 
             VALUES ($1, $2)
             ON CONFLICT (notificacion_id, usuario_id) 
             DO UPDATE SET fecha_lectura = CURRENT_TIMESTAMP`,
            [n.notificacion_id, usuario_id]
        )
    }
    
    return notificaciones.length
}

// ==========================================
// ELIMINAR NOTIFICACIÓN (admin)
// ==========================================
export async function eliminar_notificacion(notificacion_id) {
    await query('DELETE FROM notificaciones WHERE id = $1', [notificacion_id])
}
