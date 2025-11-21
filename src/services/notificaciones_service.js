import { crear_notificacion, asignar_destinatarios } from '../repository/notificaciones_repository.js'
import { query } from "@/lib/pg_db";
 
// ==========================================
// HELPERS: OBTENER USUARIOS POR ROL
// ==========================================
async function obtener_usuarios_por_rol(rol) {
    return await query('SELECT id, nombre, email FROM usuarios WHERE rol = ?', [rol])
}

async function obtener_usuario_por_nombre(nombre) {
    if (!nombre) return null
    const usuarios = await query('SELECT id, nombre FROM usuarios WHERE nombre = ?', [nombre])
    return usuarios[0] || null
}

// ==========================================
// NOTIFICACIÓN: NUEVO DESPACHO
// ==========================================
export async function notificar_despacho_nuevo(despacho) {
    const noti_id = await crear_notificacion({
        tipo: 'despacho_nuevo',
        usuario_id: null, // Sistema/Worker
        usuario_nombre: 'Sistema',
        recurso_tipo: 'despacho',
        recurso_id: despacho.id,
        descripcion: `Nuevo despacho ${despacho.correlativo || despacho.despacho} - ${despacho.cliente_nombre || despacho.cliente}`
    })
    
    const destinatarios = []
    
    // Todos los admins y ejecutivos (roles del sistema)
    const admins = await obtener_usuarios_por_rol('admin')
    const ejecutivos = await obtener_usuarios_por_rol('ejecutivo')
    destinatarios.push(...admins.map(u => u.id), ...ejecutivos.map(u => u.id))
    
    // Si tiene pedidor asignado, buscar si existe como usuario
    if (despacho.pedidor_nombre) {
        const pedidor_usuario = await obtener_usuario_por_nombre(despacho.pedidor_nombre)
        if (pedidor_usuario) {
            destinatarios.push(pedidor_usuario.id)
        }
    }
    
    await asignar_destinatarios(noti_id, destinatarios)
    
    return noti_id
}

// ==========================================
// NOTIFICACIÓN: CAMBIO DE ESTADO
// ==========================================
export async function notificar_cambio_estado(despacho, estado_anterior, estado_nuevo, usuario_actor) {
    const noti_id = await crear_notificacion({
        tipo: 'estado_cambiado',
        usuario_id: usuario_actor.id,
        usuario_nombre: usuario_actor.nombre,
        recurso_tipo: 'despacho',
        recurso_id: despacho.id,
        descripcion: `Despacho ${despacho.correlativo || despacho.despacho}: ${estado_anterior} → ${estado_nuevo}`
    })
    
    const destinatarios = []
    
    // Admins (excluir al usuario que ejecuta la acción)
    const admins = await obtener_usuarios_por_rol('admin')
    const admins_filtrados = admins.filter(u => u.id !== usuario_actor.id)
    destinatarios.push(...admins_filtrados.map(u => u.id))
    
    // Pedidor asignado (buscar si existe como usuario)
    if (despacho.pedidor_nombre) {
        const pedidor_usuario = await obtener_usuario_por_nombre(despacho.pedidor_nombre)
        if (pedidor_usuario && pedidor_usuario.id !== usuario_actor.id) {
            destinatarios.push(pedidor_usuario.id)
        }
    }
    
    await asignar_destinatarios(noti_id, destinatarios)
    
    return noti_id
}

// ==========================================
// NOTIFICACIÓN: NUEVA OBSERVACIÓN
// ==========================================
export async function notificar_observacion_nueva(despacho, observacion_texto, usuario_actor) {
    const noti_id = await crear_notificacion({
        tipo: 'observacion_nueva',
        usuario_id: usuario_actor.id,
        usuario_nombre: usuario_actor.nombre,
        recurso_tipo: 'observacion',
        recurso_id: despacho.id,
        descripcion: `Nueva observación en despacho ${despacho.correlativo || despacho.despacho}: ${observacion_texto.substring(0, 100)}${observacion_texto.length > 100 ? '...' : ''}`
    })
    
    const destinatarios = []
    
    // Admins y ejecutivos (excluir al usuario que ejecuta la acción)
    const admins = await obtener_usuarios_por_rol('admin')
    const ejecutivos = await obtener_usuarios_por_rol('ejecutivo')
    destinatarios.push(
        ...admins.filter(u => u.id !== usuario_actor.id).map(u => u.id),
        ...ejecutivos.filter(u => u.id !== usuario_actor.id).map(u => u.id)
    )
    
    // Pedidor del despacho (buscar si existe como usuario)
    if (despacho.pedidor_nombre) {
        const pedidor_usuario = await obtener_usuario_por_nombre(despacho.pedidor_nombre)
        if (pedidor_usuario && pedidor_usuario.id !== usuario_actor.id) {
            destinatarios.push(pedidor_usuario.id)
        }
    }
    
    await asignar_destinatarios(noti_id, destinatarios)
    
    return noti_id
}

// ==========================================
// NOTIFICACIÓN: DOCUMENTO SUBIDO
// ==========================================
export async function notificar_documento_subido(despacho, documento_nombre, usuario_actor) {
    const noti_id = await crear_notificacion({
        tipo: 'documento_subido',
        usuario_id: usuario_actor.id,
        usuario_nombre: usuario_actor.nombre,
        recurso_tipo: 'documento',
        recurso_id: despacho.id,
        descripcion: `Nuevo documento en ${despacho.correlativo || despacho.despacho}: ${documento_nombre}`
    })
    
    const destinatarios = []
    
    // Solo admins (excluir al usuario que ejecuta la acción)
    const admins = await obtener_usuarios_por_rol('admin')
    destinatarios.push(...admins.filter(u => u.id !== usuario_actor.id).map(u => u.id))
    
    // Pedidor del despacho (buscar si existe como usuario)
    if (despacho.pedidor_nombre) {
        const pedidor_usuario = await obtener_usuario_por_nombre(despacho.pedidor_nombre)
        if (pedidor_usuario && pedidor_usuario.id !== usuario_actor.id) {
            destinatarios.push(pedidor_usuario.id)
        }
    }
    
    await asignar_destinatarios(noti_id, destinatarios)
    
    return noti_id
}

// ==========================================
// NOTIFICACIÓN: DESPACHO ASIGNADO A PEDIDOR
// ==========================================
export async function notificar_asignacion_pedidor(despacho, pedidor_nombre, usuario_actor) {
    // Buscar si el pedidor existe como usuario
    const pedidor_usuario = await obtener_usuario_por_nombre(pedidor_nombre)
    
    if (!pedidor_usuario) {
        // Si el pedidor no existe como usuario, no enviar notificación
        console.log(`[Notificación] Pedidor "${pedidor_nombre}" no existe como usuario, omitiendo notificación`)
        return null
    }
    
    const noti_id = await crear_notificacion({
        tipo: 'despacho_asignado',
        usuario_id: usuario_actor.id,
        usuario_nombre: usuario_actor.nombre,
        recurso_tipo: 'despacho',
        recurso_id: despacho.id,
        descripcion: `Se te asignó el despacho ${despacho.correlativo || despacho.despacho}`
    })
    
    // Solo notificar al pedidor asignado
    await asignar_destinatarios(noti_id, [pedidor_usuario.id])
    
    return noti_id
}

// ==========================================
// NOTIFICACIÓN: CARGA IMO ACTUALIZADA
// ==========================================
export async function notificar_carga_imo(despacho, es_carga_imo, clase_imo, usuario_actor) {
    const descripcion = es_carga_imo 
        ? `Despacho ${despacho.correlativo || despacho.despacho} marcado como carga IMO${clase_imo ? ` - Clase: ${clase_imo}` : ''}`
        : `Despacho ${despacho.correlativo || despacho.despacho} desmarcado como carga IMO`
    
    const noti_id = await crear_notificacion({
        tipo: 'carga_imo_actualizada',
        usuario_id: usuario_actor.id,
        usuario_nombre: usuario_actor.nombre,
        recurso_tipo: 'despacho',
        recurso_id: despacho.id,
        descripcion
    })
    
    const destinatarios = []
    
    // Admins y ejecutivos (excluir al usuario que ejecuta la acción)
    const admins = await obtener_usuarios_por_rol('admin')
    const ejecutivos = await obtener_usuarios_por_rol('ejecutivo')
    destinatarios.push(
        ...admins.filter(u => u.id !== usuario_actor.id).map(u => u.id),
        ...ejecutivos.filter(u => u.id !== usuario_actor.id).map(u => u.id)
    )
    
    // Pedidor del despacho (buscar si existe como usuario)
    if (despacho.pedidor_nombre) {
        const pedidor_usuario = await obtener_usuario_por_nombre(despacho.pedidor_nombre)
        if (pedidor_usuario && pedidor_usuario.id !== usuario_actor.id) {
            destinatarios.push(pedidor_usuario.id)
        }
    }
    
    await asignar_destinatarios(noti_id, destinatarios)
    
    return noti_id
}

// ==========================================
// NOTIFICACIÓN: VISTO BUENO ACTUALIZADO
// ==========================================
export async function notificar_visto_bueno(despacho, visto_bueno, usuario_actor) {
    const descripcion = visto_bueno 
        ? `Despacho ${despacho.correlativo || despacho.despacho} marcado con Visto Bueno ✓`
        : `Despacho ${despacho.correlativo || despacho.despacho} desmarcado de Visto Bueno`
    
    const noti_id = await crear_notificacion({
        tipo: 'visto_bueno_actualizado',
        usuario_id: usuario_actor.id,
        usuario_nombre: usuario_actor.nombre,
        recurso_tipo: 'despacho',
        recurso_id: despacho.id,
        descripcion
    })
    
    const destinatarios = []
    
    // Admins y ejecutivos (excluir al usuario que ejecuta la acción)
    const admins = await obtener_usuarios_por_rol('admin')
    const ejecutivos = await obtener_usuarios_por_rol('ejecutivo')
    destinatarios.push(
        ...admins.filter(u => u.id !== usuario_actor.id).map(u => u.id),
        ...ejecutivos.filter(u => u.id !== usuario_actor.id).map(u => u.id)
    )
    
    // Pedidor del despacho (buscar si existe como usuario)
    if (despacho.pedidor_nombre) {
        const pedidor_usuario = await obtener_usuario_por_nombre(despacho.pedidor_nombre)
        if (pedidor_usuario && pedidor_usuario.id !== usuario_actor.id) {
            destinatarios.push(pedidor_usuario.id)
        }
    }
    
    await asignar_destinatarios(noti_id, destinatarios)
    
    return noti_id
}
