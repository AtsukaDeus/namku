import { NextResponse } from "next/server";
import { validar_sesion_administrador } from "@/services/auth/user_session";
import { obtener_usuarios_service } from "../services/usuario_service";

/**
 * Endpoint para obtener todos los usuarios del sistema
 */
export async function GET(req) {
    // Validación de sessión como administrador
    const auth = await validar_sesion_administrador();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    
    // Ejecución del servicio
    const result = await obtener_usuarios_service();
    
    if (result.error)  return NextResponse.json({ error: result.error }, { status: result.status });

    return NextResponse.json(
        { msg: result.msg, usuarios: result.usuarios }, 
        { status: result.status }
    );
}
