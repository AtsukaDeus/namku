import { NextResponse } from "next/server"
import { get_contador_service } from "../services/notificaciones_service"

export async function POST() {
    try {
        const { error, data, status } = await get_contador_service()
        if (error) return NextResponse.json({ error }, { status })
        return NextResponse.json(data, { status })
    } catch (error) {
        console.error("Error obteniendo contador de notificaciones:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
