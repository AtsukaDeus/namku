import { NextResponse } from "next/server"
import * as crear_inspeccion from "../routes/crear_inspeccion"
import * as crear_canal from "../routes/crear_canal"
import * as enviar_mensaje from "../routes/enviar_mensaje"
import * as obtener_mensajes from "../routes/obtener_mensajes"
import * as listar_inspecciones from "../routes/listar_inspecciones"
import * as listar_canales_inspeccion from "../routes/listar_canales_inspeccion"
import * as crear_obra from "../routes/crear_obra"
import * as listar_obras from "../routes/listar_obras"

export async function POST(req, { params }) {
    const { action } = await params
    const action_path = action.join("/")

    if (action_path === "crear_inspeccion") return crear_inspeccion.POST(req)
    if (action_path === "crear_canal") return crear_canal.POST(req)
    if (action_path === "enviar_mensaje") return enviar_mensaje.POST(req)
    if (action_path === "obtener_mensajes") return obtener_mensajes.POST(req)
    if (action_path === "listar_inspecciones") return listar_inspecciones.POST(req)
    if (action_path === "listar_canales_inspeccion") return listar_canales_inspeccion.POST(req)
    if (action_path === "crear_obra") return crear_obra.POST(req)
    if (action_path === "listar_obras") return listar_obras.POST(req)

    return NextResponse.json({ error: "Ruta no encontrada", action }, { status: 404 })
}
