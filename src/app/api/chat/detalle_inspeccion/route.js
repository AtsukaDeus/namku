import { NextResponse } from "next/server"
import { obtener_detalle_inspeccion_service } from "../services/chat_service"

export async function POST(req) {
    try {
        const body = await req.json().catch(() => ({}))
        const { error, data, status } = await obtener_detalle_inspeccion_service(body)
        if (error) return NextResponse.json({ error }, { status })
        return NextResponse.json(data, { status })
    } catch (error) {
        console.error("Error obteniendo detalle de inspección:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
