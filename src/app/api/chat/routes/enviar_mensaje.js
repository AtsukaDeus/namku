import { NextResponse } from "next/server"
import { enviar_mensaje_service } from "../services/chat_service"

export async function POST(req) {
    try {
        const body = await req.formData();
        console.log("Recibido request para enviar mensaje")
        const { error, data, status } = await enviar_mensaje_service(body)
        if (error) {
            console.error("Error en enviar_mensaje_service:", error)
            return NextResponse.json({ error }, { status })
        }
        console.log("Mensaje enviado exitosamente")
        return NextResponse.json(data, { status })
    } catch (error) {
        console.error("Error crítico enviando mensaje:", error.message)
        console.error("Stack trace:", error.stack)
        return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
    }
}
