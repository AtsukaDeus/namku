import { NextResponse } from "next/server"
import * as crear_inspeccion from "../routes/crear_inspeccion"
import * as crear_canal from "../routes/crear_canal"
import * as enviar_mensaje from "../routes/enviar_mensaje"
import * as obtener_mensajes from "../routes/obtener_mensajes"
import * as listar_inspecciones from "../routes/listar_inspecciones"
import * as listar_canales_inspeccion from "../routes/listar_canales_inspeccion"
import * as crear_obra from "../routes/crear_obra"
import * as listar_obras from "../routes/listar_obras"
import * as borrar_obra from "../routes/borrar_obra"
import * as borrar_inspeccion from "../routes/borrar_inspeccion"
import * as borrar_canal from "../routes/borrar_canal"
import * as mis_inspecciones from "../routes/mis_inspecciones"
import * as crear_hallazgo from "../routes/crear_hallazgo"

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
    if (action_path === "borrar_obra") return borrar_obra.POST(req)
    if (action_path === "borrar_inspeccion") return borrar_inspeccion.POST(req)
    if (action_path === "borrar_canal") return borrar_canal.POST(req)
    if (action_path === "mis_inspecciones") return mis_inspecciones.POST(req)
    if (action_path === "crear_hallazgo") return crear_hallazgo.POST(req)

    return NextResponse.json({ error: "Ruta no encontrada", action }, { status: 404 })
}
