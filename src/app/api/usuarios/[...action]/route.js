//* /api/usuarios/
import { NextResponse } from "next/server"
import * as nuevo_usuario from "../routes/nuevo_usuario"
import * as obtener_todos from "../routes/obtener_todos"
import * as actualizar_usuario from "../routes/actualizar_usuario"
import * as actualizar_contrasena_usuario from "../routes/actualizar_contrasena_usuario"
import * as activar_desactivar_usuario from "../routes/activar_desactivar_usuario"

export async function GET(req, {params}) {
  const { action } = await params
  const actionPath = action.join("/")
  
  //* /api/usuarios/
  if (actionPath == "obtener_todos") return obtener_todos.GET(req)
}

export async function POST(req, { params }) {
  const { action } = await params
  const actionPath = action.join("/")
  
  //* /api/usuarios/
  if (actionPath === "nuevo") return nuevo_usuario.POST(req)

  return NextResponse.json({ error: "Ruta no encontrada", action }, { status: 404 })
}

export async function PUT(req, { params }) {
  const { action } = await params
  const actionPath = action.join("/")

  //* /api/usuarios/
  if (actionPath === "actualizar") return actualizar_usuario.PUT(req)
  if (actionPath === "actualizar_contrasena") return actualizar_contrasena_usuario.PUT(req)
  if (actionPath === "activar_desactivar") return activar_desactivar_usuario.PUT(req)

  return NextResponse.json({ error: "Ruta no encontrada", action }, { status: 404 })
}
