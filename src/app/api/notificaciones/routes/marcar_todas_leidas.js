import { NextResponse } from "next/server"
import { marcar_todas_service } from "../services/notificaciones_service"

export async function POST() {
    try {
        const { error, data, status } = await marcar_todas_service()
        if (error) return NextResponse.json({ error }, { status })
        return NextResponse.json(data, { status })
    } catch (error) {
        console.error("Error marcando todas las notificaciones como leídas:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
