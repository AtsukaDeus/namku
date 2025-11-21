import { NextResponse } from "next/server"

export async function GET() {
    return NextResponse.json({ 
        domain: "usuarios",
        version: "1.0",
        description: "Gestión de usuarios del sistema",
        endpoints: {
            GET:    ["/obtener_todos"],
            POST:   ["/nuevo"],
            PUT:    ["/actualizar", "/actualizar_contrasena", "/activar_desactivar"],
        }
    })
}
