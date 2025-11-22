import { NextResponse } from "next/server"

export async function GET() {
    return NextResponse.json({
        domain: "notificaciones",
        version: "1.0",
        description: "Gestión de notificaciones del sistema",
        endpoints: {
            POST: [
                "/get_contador",
                "/get_notificaciones",
                "/marcar_leida",
                "/marcar_todas_leidas"
            ]
        }
    })
}
