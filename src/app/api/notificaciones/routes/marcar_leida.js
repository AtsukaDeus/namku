import { NextResponse } from "next/server"
import { marcar_leida_service } from "../services/notificaciones_service"

export async function POST(req) {
    try {
        const body = await req.json()
        const { error, data, status } = await marcar_leida_service(body)
        if (error) return NextResponse.json({ error }, { status })
        return NextResponse.json(data, { status })
    } catch (error) {
        console.error("Error marcando notificación como leída:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
