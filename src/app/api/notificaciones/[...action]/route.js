import { NextResponse } from "next/server"
import * as get_contador from "../routes/get_contador"
import * as get_notificaciones from "../routes/get_notificaciones"
import * as marcar_leida from "../routes/marcar_leida"
import * as marcar_todas_leidas from "../routes/marcar_todas_leidas"

export async function POST(req, { params }) {
    const { action } = await params
    const action_path = action.join("/")

    //* /api/notificaciones/
    if (action_path === "get_contador") return get_contador.POST(req)
    if (action_path === "get_notificaciones") return get_notificaciones.POST(req)
    if (action_path === "marcar_leida") return marcar_leida.POST(req)
    if (action_path === "marcar_todas_leidas") return marcar_todas_leidas.POST(req)

    return NextResponse.json({ error: "Ruta no encontrada", action }, { status: 404 })
}
