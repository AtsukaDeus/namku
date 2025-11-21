import { NextResponse } from "next/server";
import { validar_sesion_administrador } from "@/services/auth/user_session";
import { activar_desactivar_usuario_service, actualizar_contrasena_usuario_service } from "../services/usuario_service";

/**
 * Endpoint para actualizar la contraseña de un usuario 
 */
export async function PUT(req) {
    // Validación de sessión como administrador
    const auth = await validar_sesion_administrador();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    
    // Ejecución del servicio
    const data = await req.json();
    const result = await activar_desactivar_usuario_service(data, auth.session);
    
    if (result.error)  return NextResponse.json({ error: result.error }, { status: result.status });

    return NextResponse.json(
        { msg: result.msg, usuarios: result.usuarios }, 
        { status: result.status }
    );
}
