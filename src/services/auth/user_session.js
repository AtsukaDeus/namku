'use server'

import { authOptions } from "@/lib/auth_options";
import { getServerSession } from "next-auth";

/** Valida la session de usuario y la retorna
 * 
 * @returns { session } del usuario 
 */
export async function validar_sesion() {
    const session = await getServerSession(authOptions)
    if (!session) {
        return { error: "No autorizado", status: 401 }
    }
    return { session }
}


/**
 * Valida que exista una sesión activa y que el usuario sea administrador
 * @returns {Promise<{error?: string, status?: number, session?: any}>}
 */
export async function validar_sesion_administrador() {
    const session = await getServerSession(authOptions);
    
    if (!session) {
        return { error: "No autorizado", status: 401 };
    }
    
    if (session.user.rol !== 'admin') {
        return { error: "No tienes los permisos para efectuar esta acción", status: 403 };
    }
    
    return { session };
}


/** Obtiene la sessión en caso de que el usuario esté loggueado
 * 
 * @returns retorna la session
 */
export async function get_session() {
    const session = await getServerSession(authOptions);
    return session;
};


/** Verifica si es un usuario admin
 * 
 * @returns true en caso de serlo, false caso contrario
 */
export async function is_user_admin(){
    const session = await get_session();
    const rol = await session.user?.rol;
    return rol == 'admin';
};


/** Verifica si es un usuario normal
 * 
 * @returns true en caso de serlo, false caso contrario
 */
export async function is_user_normal(){
    const session = await get_session();
    const rol = await session.user?.rol;
    return rol == 'normal';
};
