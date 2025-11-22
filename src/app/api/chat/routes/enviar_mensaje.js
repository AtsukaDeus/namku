import { NextResponse } from "next/server"
import { enviar_mensaje_service } from "../services/chat_service"

export async function POST(req) {
    try {
        const body = await req.json()
        const { error, data, status } = await enviar_mensaje_service(body)
        if (error) return NextResponse.json({ error }, { status })
        return NextResponse.json(data, { status })
    } catch (error) {
        console.error("Error enviando mensaje:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
