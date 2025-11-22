import { get_session } from "@/services/auth/user_session"
import { 
    contar_notificaciones_no_leidas, 
    obtener_notificaciones_usuario, 
    marcar_notificacion_leida, 
    marcar_todas_leidas 
} from "@/repository/notificaciones_repository"

/** Obtiene contador de notificaciones no leídas */
export async function get_contador_service() {
    const session = await get_session()
    if (!session) return { error: "No autorizado", status: 401 }

    const usuario_id = session.user.id
    const count = await contar_notificaciones_no_leidas(usuario_id)
    return { data: { count }, status: 200 }
}

/** Obtiene listado de notificaciones de un usuario */
export async function get_notificaciones_service(body) {
    const session = await get_session()
    if (!session) return { error: "No autorizado", status: 401 }

    const usuario_id = session.user.id
    const { solo_no_leidas = false, limit = 20 } = body || {}

    const notificaciones = await obtener_notificaciones_usuario(usuario_id, { solo_no_leidas, limit })
    return { data: { notificaciones }, status: 200 }
}

/** Marca una notificación como leída */
export async function marcar_leida_service(body) {
    const session = await get_session()
    if (!session) return { error: "No autorizado", status: 401 }

    const { notificacion_id } = body || {}
    if (!notificacion_id) return { error: "notificacion_id es requerido", status: 400 }

    await marcar_notificacion_leida(notificacion_id, session.user.id)
    return { data: { success: true }, status: 200 }
}

/** Marca todas las notificaciones como leídas */
export async function marcar_todas_service() {
    const session = await get_session()
    if (!session) return { error: "No autorizado", status: 401 }

    const count = await marcar_todas_leidas(session.user.id)
    return { data: { success: true, count }, status: 200 }
}
