import { NextResponse } from "next/server"

export async function GET() {
    return NextResponse.json({
        domain: "chat",
        version: "1.0",
        description: "Inspecciones, canales y mensajería",
        endpoints: {
            POST: [
                "/crear_inspeccion",
                "/crear_canal",
                "/enviar_mensaje",
                "/obtener_mensajes",
                "/listar_inspecciones",
                "/listar_canales_inspeccion",
                "/crear_obra",
                "/listar_obras"
            ]
        }
    })
}
