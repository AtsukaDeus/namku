import fs from 'fs/promises';
import path from 'path';
import { get_session } from "@/services/auth/user_session"
import { select_usuario_by_email, select_usuario_by_id } from "@/repository/usuarios_repository"
import {
    crear_inspeccion_repo,
    crear_canal_repo,
    asignar_usuarios_canal_repo,
    crear_mensaje_repo,
    marcar_mensaje_leido_repo,
    obtener_mensajes_repo,
    obtener_inspecciones_repo,
    obtener_canales_por_inspeccion_repo,
    crear_obra_repo,
    listar_obras_repo,
    obtener_mensajes_por_canal_repo,
    borrar_canal_repo,
    borrar_inspeccion_repo,
    borrar_obra_repo,
    obtener_info_canal_repo,
    crear_hallazgo_repo
} from "@/repository/chat_repository"
import { CRITICIDAD } from '@/constants/criticidad';
import { bot_detector_hallazgo } from './bot_detector_mensaje';

const es_uuid = (valor) => /^[0-9a-fA-F-]{36}$/.test(String(valor || "").trim())

/** Esta función permite ver si el usuario existe en la base de datos antes de realizar una transacción
 * 
 * @param {*} session session del usuario 
 * @returns 
 */
const resolver_usuario = async (session) => {
    const id = session?.user?.id
    if (es_uuid(id)) return { usuario_id: id, usuario_nombre: session.user?.nombre, usuario_rol: session.user?.rol }

    const email = session?.user?.email
    if (!email) return { error: "No autorizado", status: 401 }

    const encontrado = await select_usuario_by_email(email)
    const usuario = encontrado?.[0]
    
    if (!usuario) return { error: "Usuario no encontrado", status: 404 }
    return { usuario_id: usuario.id, usuario_nombre: usuario.nombre, usuario_rol: usuario.rol }
}

export async function crear_inspeccion_service(payload) {
    const session = await get_session()
    if (!session) return { error: "No autorizado", status: 401 }

    const requeridos = ["codigo", "revision", "fecha_formulario", "fecha_inspeccion", "hora_inicio", "hora_termino", "encargado_id", "obra_id"]
    for (const campo of requeridos) {
        if (!payload?.[campo]) return { error: `Falta ${campo}`, status: 400 }
    }

    const inspeccion = await crear_inspeccion_repo(payload)
    return { data: { inspeccion }, status: 201 }
}

export async function crear_canal_service(payload) {
    const session = await get_session()
    if (!session) return { error: "No autorizado", status: 401 }

    const { inspeccion_id, nombre, descripcion, empresa_id = null, obra_id = null, usuarios_ids = [] } = payload || {}
    if (!inspeccion_id) return { error: "inspeccion_id requerido", status: 400 }

    const canal = await crear_canal_repo({
        tipo: "inspeccion",
        empresa_id,
        obra_id,
        inspeccion_id,
        nombre,
        descripcion,
    })

    const count = await asignar_usuarios_canal_repo(canal.id, usuarios_ids)
    return { data: { canal, usuarios_agregados: count }, status: 201 }
}

// Envío de mensaje ----------
export async function enviar_mensaje_service(payload) {
    const session = await get_session()
    if (!session) return { error: "No autorizado", status: 401 }

    const { usuario_id, usuario_nombre, usuario_rol, error, status } = await resolver_usuario(session)
    if (error) return { error, status }

    const canal_id = payload.get('canal_id')
    const contenido = payload.get('contenido')
    const tipo = "texto"
    const imagen = payload.get('imagen')
    //const { canal_id, contenido, tipo = "texto", imagen } = payload || {}
    if (!canal_id) return { error: "canal_id requerido", status: 400 }
    if (!es_uuid(canal_id)) return { error: "canal_id inválido", status: 400 }
    if (tipo === "texto" && (!contenido || !contenido.trim())) return { error: "contenido requerido", status: 400 }

    
    let archivo_url = null
    let archivo_ruta = null
    if (imagen) {
        //Se trasforma el archivo en buffer
        const file = imagen;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes)

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadDir, { recursive: true }); // Comprueba que el fichero exista y si no lo crea
        const fileName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase(); // Elimina los caracteres que no coincidan con a-z0-9 y remplaza espacios por _
        archivo_ruta = path.join(uploadDir, fileName); //Crea la ruta absoluta
        archivo_url = path.join('/uploads', fileName).replace(/\\/g, '/'); //Crea la ruta relativa
        await fs.writeFile(archivo_ruta, buffer); //Escribe el buffer en la ruta especifica
    }
    
    const mensaje = await crear_mensaje_repo({
        canal_id,
        usuario_id,
        usuario_nombre,
        usuario_rol,
        contenido,
        tipo,
        archivo_url,
        archivo_ruta,
    })

    // Creación del hallazgo
    const res = await bot_detector_hallazgo({
        canal_id,
        usuario_id,
        usuario_nombre,
        usuario_rol,
        contenido,
        tipo,
        archivo_url,
        archivo_ruta,
    })

    if (res.error) {
        console.log(`Error en la creación del hallazgo: ${res.error}`)
    }

    console.log("Mensaje creado:", mensaje)

    // marcar como leído para el autor
    await marcar_mensaje_leido_repo(mensaje.id, usuario_id)

    return { data: { mensaje }, status: 201 }
}
// -------------

export async function obtener_mensajes_service(payload) {
    const session = await get_session()
    if (!session) return { error: "No autorizado", status: 401 }

    const { canal_id, limit = 50 } = payload || {}
    if (!canal_id) return { error: "canal_id requerido", status: 400 }
    if (!es_uuid(canal_id)) return { error: "canal_id inválido", status: 400 }

    const mensajes = await obtener_mensajes_repo(canal_id, limit)
    const info_canal = await obtener_info_canal_repo(canal_id)

    console.log("Mensajes obtenidos para canal", canal_id, ":", mensajes)

    return { data: { mensajes, info_canal }, status: 200 }
}

export async function listar_inspecciones_service(payload = {}) {
    const session = await get_session()
    if (!session) return { error: "No autorizado", status: 401 }
    const { limit = 50, obra_id = null } = payload || {}
    const inspecciones = await obtener_inspecciones_repo({ limit, obra_id })
    return { data: { inspecciones }, status: 200 }
}

export async function listar_canales_inspeccion_service(payload) {
    const session = await get_session()
    if (!session) return { error: "No autorizado", status: 401 }
    const { inspeccion_id } = payload || {}
    if (!inspeccion_id) return { error: "inspeccion_id requerido", status: 400 }
    if (!es_uuid(inspeccion_id)) return { error: "inspeccion_id inválido", status: 400 }
    const canales = await obtener_canales_por_inspeccion_repo(inspeccion_id)
    return { data: { canales }, status: 200 }
}

export async function crear_obra_service(payload) {
    const session = await get_session()
    if (!session) return { error: "No autorizado", status: 401 }
    const requeridos = ["nombre_obra", "tipo_obra", "estado", "fecha_inicio", "fecha_fin"]
    for (const campo of requeridos) {
        if (!payload?.[campo]) return { error: `Falta ${campo}`, status: 400 }
    }
    const obra = await crear_obra_repo(payload)
    return { data: { obra }, status: 201 }
}

export async function listar_obras_service(limit = 50) {
    const session = await get_session()
    if (!session) return { error: "No autorizado", status: 401 }
    const obras = await listar_obras_repo(limit)
    return { data: { obras }, status: 200 }
}

export async function borrar_obra_service(payload) {
    const session = await get_session()
    if (!session) return { error: "No autorizado", status: 401 }
    const { obra_id } = payload || {}
    if (!obra_id) return { error: "obra_id requerido", status: 400 }
    const obra = await borrar_obra_repo(obra_id)
    return { data: { obra }, status: 200 }
}

export async function borrar_inspeccion_service(payload) {
    const session = await get_session()
    if (!session) return { error: "No autorizado", status: 401 }
    const { inspeccion_id } = payload || {}
    if (!inspeccion_id) return { error: "inspeccion_id requerido", status: 400 }
    const inspeccion = await borrar_inspeccion_repo(inspeccion_id)
    return { data: { inspeccion }, status: 200 }
}

export async function borrar_canal_service(payload) {
    const session = await get_session()
    if (!session) return { error: "No autorizado", status: 401 }
    const { canal_id } = payload || {}
    
    if (!canal_id) return { error: "canal_id requerido", status: 400 }
    const mensajes = await obtener_mensajes_por_canal_repo(canal_id)
    
    for (let i = 0; i < mensajes.length; i++) {
        const elemento = mensajes[i];
        if (elemento.archivo_ruta) {
            await fs.rm(elemento.archivo_ruta); //En elemento.archivo_ruta se guarda la ruta completa
        }
    }
    const canal = await borrar_canal_repo(canal_id)
    return { data: { canal }, status: 200 }
}


// Servicio para crear un hallazgo 
export async function crear_hallazgo_service(payload) {
    const session = await get_session()
    if (!session) return { error: "No autorizado", status: 401 }

    const {inspeccion_id, descripcion, criticidad, ruta_imagen, fecha_cierre} = payload || {}; 
    
    // Validaciones
    if (!inspeccion_id) return { error: "inspeccion_id es requerido", status: 400 } 
    if (!descripcion) return { error: "descripcion es requerido", status: 400 } 
    
    if (!criticidad) return { error: "criticidad es requerido", status: 400 } 
    if (!CRITICIDAD.includes(criticidad)) return { error: "Valor erroneo para criticidad", status: 400 } 

    if (!ruta_imagen) return { error: "ruta_imagen es requerido", status: 400 } 

    const hallazgo_id = await crear_hallazgo_repo(inspeccion_id, descripcion, criticidad, ruta_imagen, fecha_cierre)
    if (!hallazgo_id) return { error: "Hubo un error en el servidor al crear el hallazgo", status: 500 }

    return {data: {hallazgo_id}, status: 201}
}
