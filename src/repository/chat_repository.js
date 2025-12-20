import { query } from "@/lib/pg_db"

export async function crear_inspeccion_repo({
    codigo,
    revision,
    fecha_formulario,
    fecha_inspeccion,
    hora_inicio,
    hora_termino,
    encargado_id,
    obra_id,
    participantes = null,
    visita = null,
    fecha_prox_visita = null,
}) {
    const sql = `
        INSERT INTO inspecciones (
            codigo, revision, fecha_formulario, fecha_inspeccion,
            hora_inicio, hora_termino, encargado_id, obra_id,
            participantes, visita, fecha_prox_visita
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING *
    `
    const res = await query(sql, [
        codigo,
        revision,
        fecha_formulario,
        fecha_inspeccion,
        hora_inicio,
        hora_termino,
        encargado_id,
        obra_id,
        participantes,
        visita,
        fecha_prox_visita,
    ])
    return res?.[0]
}

export async function crear_canal_repo({
    tipo,
    empresa_id = null,
    obra_id = null,
    inspeccion_id = null,
    nombre = null,
    descripcion = null,
}) {
    const sql = `
        INSERT INTO canales (
            tipo, empresa_id, obra_id, inspeccion_id, nombre, descripcion
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *
    `
    const res = await query(sql, [tipo, empresa_id, obra_id, inspeccion_id, nombre, descripcion])
    return res?.[0]
}

export async function asignar_usuarios_canal_repo(canal_id, usuarios_ids = []) {
    if (!usuarios_ids || usuarios_ids.length === 0) return 0
    const unique = [...new Set(usuarios_ids)]
    let count = 0
    for (const usuario_id of unique) {
        await query(
            `INSERT INTO canales_usuarios (canal_id, usuario_id)
             VALUES ($1, $2)
             ON CONFLICT (canal_id, usuario_id) DO NOTHING`,
            [canal_id, usuario_id]
        )
        count++
    }
    return count
}

export async function crear_mensaje_repo({
    canal_id,
    usuario_id,
    usuario_nombre,
    usuario_rol = null,
    contenido = null,
    archivo_url,
    archivo_ruta,
}) {
    const sql = `
        INSERT INTO mensajes (
            canal_id, usuario_id, usuario_nombre, usuario_rol,
            contenido, archivo_url, archivo_ruta
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
    `
    const res = await query(sql, [
        canal_id,
        usuario_id,
        usuario_nombre,
        usuario_rol,
        contenido,
        archivo_url,
        archivo_ruta,
    ])
    return res?.[0]
}

export async function marcar_mensaje_leido_repo(mensaje_id, usuario_id) {
    await query(
        `INSERT INTO mensajes_leidos (mensaje_id, usuario_id)
         VALUES ($1,$2)
         ON CONFLICT (mensaje_id, usuario_id)
         DO UPDATE SET fecha_lectura = CURRENT_TIMESTAMP`,
        [mensaje_id, usuario_id]
    )
}

export async function obtener_mensajes_repo(canal_id, limit = 50) {
    const safe_limit = Math.max(1, Math.min(parseInt(limit) || 50, 200))
    const sql = `
        SELECT *
        FROM mensajes
        WHERE canal_id = $1
        ORDER BY fecha_creacion DESC
        LIMIT ${safe_limit}
    `
    return await query(sql, [canal_id])
}

export async function obtener_inspecciones_repo({ limit = 50, obra_id = null } = {}) {
    const safe_limit = Math.max(1, Math.min(parseInt(limit) || 50, 200))
    let sql = `
        SELECT *
        FROM inspecciones
    `
    const params = []
    if (obra_id) {
        sql += ` WHERE obra_id = $1`
        params.push(obra_id)
    }
    sql += `
        ORDER BY fecha_creacion DESC
        LIMIT ${safe_limit}
    `
    return await query(sql, params)
}

export async function obtener_canales_por_inspeccion_repo(inspeccion_id) {
    const sql = `
        SELECT *
        FROM canales
        WHERE inspeccion_id = $1
        ORDER BY fecha_creacion DESC
    `
    return await query(sql, [inspeccion_id])
}

export async function crear_obra_repo({
    nombre_obra,
    descripcion = null,
    tipo_obra,
    estado,
    fecha_inicio,
    fecha_fin,
    presupuesto = null,
    empresa_id = null,
    encargado_id = null,
    permiso_municipal = null,
    riesgo = null
}) {
    const sql = `
        INSERT INTO obras (
            empresa_id, nombre_obra, descripcion, tipo_obra, estado,
            fecha_inicio, fecha_fin, presupuesto, encargado_id, permiso_municipal, riesgo
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING *
    `
    const res = await query(sql, [
        empresa_id,
        nombre_obra,
        descripcion,
        tipo_obra,
        estado,
        fecha_inicio,
        fecha_fin,
        presupuesto,
        encargado_id,
        permiso_municipal,
        riesgo
    ])
    return res?.[0]
}

export async function listar_obras_repo(limit = 50) {
    const safe_limit = Math.max(1, Math.min(parseInt(limit) || 50, 200))
    const sql = `
        SELECT *
        FROM obras
        ORDER BY fecha_creacion DESC
        LIMIT ${safe_limit}
    `
    return await query(sql)
}

export async function obtener_mensajes_por_canal_repo(canal_id) {
    const sql = `
        SELECT *
        FROM mensajes
        WHERE canal_id = $1
        ORDER BY fecha_creacion DESC
    `
    return await query(sql, [canal_id])
}

export async function borrar_canal_repo(canal_id) {
    const sql = `
        DELETE FROM canales
	    WHERE id=$1
    `
    const res = await query(sql, [canal_id])
    return res?.[0]
}

export async function borrar_inspeccion_repo(inspeccion_id) {
    const sql = `
        DELETE FROM inspecciones
	    WHERE id=$1
    `
    const res = await query(sql, [inspeccion_id])
    return res?.[0]
}

export async function borrar_obra_repo(obra_id) {
    const sql = `
        DELETE FROM obras
	    WHERE id=$1
    `
    const res = await query(sql, [obra_id])
    return res?.[0]
}

export async function obtener_info_canal_repo(canal_id) {
    const sql = `
        SELECT
            c.id as canal_id,
            c.nombre as canal_nombre,
            c.descripcion as canal_descripcion,
            i.id as inspeccion_id,
            i.codigo as inspeccion_codigo,
            i.participantes as inspeccion_participantes,
            o.nombre_obra as obra_nombre
        FROM canales c
        LEFT JOIN inspecciones i ON c.inspeccion_id = i.id
        LEFT JOIN obras o ON i.obra_id = o.id
        WHERE c.id = $1
    `
    const res = await query(sql, [canal_id])
    return res?.[0]
}

export async function crear_hallazgo_repo(inspeccion_id, descripcion, criticidad, ruta_imagen) {
    const sql = `
        INSERT INTO hallazgo (inspeccion_id, descripcion, criticidad, ruta_imagen, fecha_cierre)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    `
    const res = await query(sql, [inspeccion_id, descripcion, criticidad, ruta_imagen])
    return res?.[0]?.id
}


export async function select_canal_by_canal_id(canal_id) {
    const sql = `
        SELECT * FROM canales WHERE id = ?;
    `
    return  await query(sql, [canal_id])
}
