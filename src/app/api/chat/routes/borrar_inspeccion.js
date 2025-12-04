import { NextResponse } from "next/server"
import { borrar_inspeccion_service } from "../services/chat_service"

export async function POST(req) {
    try {
        const body = await req.json()
        const { error, data, status } = await borrar_inspeccion_service(body)
        if (error) return NextResponse.json({ error }, { status })
        return NextResponse.json(data, { status })
    } catch (error) {
        console.error("Error creando inspeccion:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}