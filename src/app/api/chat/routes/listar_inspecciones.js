import { NextResponse } from "next/server"
import { listar_inspecciones_service } from "../services/chat_service"

export async function POST(req) {
    try {
        const body = await req.json().catch(() => ({}))
        const { limit } = body || {}
        const { error, data, status } = await listar_inspecciones_service(limit)
        if (error) return NextResponse.json({ error }, { status })
        return NextResponse.json(data, { status })
    } catch (error) {
        console.error("Error listando inspecciones:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
