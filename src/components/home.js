'use client'

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Camera, Image as Imagen, MessageCircle, Plus, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

const api_fetch = async (url, body = {}) => {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || "Error al llamar API")
    return data
}

export default function Home({ u_nombre, u_rol }) {
    const search_params = useSearchParams()
    const [mensaje, set_mensaje] = useState("")
    const [mostrar_opciones, set_mostrar_opciones] = useState(false)
    const [mensajes, set_mensajes] = useState([])
    const [cargando, set_cargando] = useState(false)
    const [enviando, set_enviando] = useState(false)
    const [error, set_error] = useState("")
    const [inspecciones, set_inspecciones] = useState([])
    const [canales, set_canales] = useState([])
    const [inspeccion_activa, set_inspeccion_activa] = useState("")
    const [canal_activo, set_canal_activo] = useState("")
    const [nueva_inspeccion, set_nueva_inspeccion] = useState({ nombre: "", codigo: "", obra_id: "" })
    const [nuevo_canal, set_nuevo_canal] = useState({ nombre: "", descripcion: "" })
    const [obras, set_obras] = useState([])
    const [nueva_obra, set_nueva_obra] = useState({
        nombre_obra: "",
        tipo_obra: "obra",
        estado: "en_progreso",
        fecha_inicio: "",
        fecha_fin: "",
        descripcion: ""
    })

    const canal_id = useMemo(() => {
        if (canal_activo) return canal_activo
        const desde_url = search_params.get("canal_id")
        if (desde_url) return desde_url
        return ""
    }, [search_params, canal_activo])

    const cargar_mensajes = async () => {
        if (!canal_id) return
        try {
            set_cargando(true)
            set_error("")
            const { mensajes: mensajes_api } = await api_fetch("/api/chat/obtener_mensajes", { canal_id, limit: 100 })
            set_mensajes(mensajes_api || [])
        } catch (err) {
            set_error(err.message || "No se pudo cargar mensajes")
        } finally {
            set_cargando(false)
        }
    }

    useEffect(() => {
        cargar_mensajes()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canal_id])

    const cargar_inspecciones = async () => {
        try {
            const { inspecciones } = await api_fetch("/api/chat/listar_inspecciones", { limit: 50 })
            set_inspecciones(inspecciones || [])
        } catch (err) {
            set_error(err.message || "No se pudo cargar inspecciones")
        }
    }

    const cargar_canales = async (inspeccion_id) => {
        if (!inspeccion_id) return
        try {
            const { canales: canales_res } = await api_fetch("/api/chat/listar_canales_inspeccion", { inspeccion_id })
            set_canales(canales_res || [])
        } catch (err) {
            set_error(err.message || "No se pudo cargar canales")
        }
    }

    useEffect(() => {
        cargar_inspecciones()
        cargar_obras()
    }, [])

    const cargar_obras = async () => {
        try {
            const { obras } = await api_fetch("/api/chat/listar_obras", { limit: 50 })
            set_obras(obras || [])
        } catch (err) {
            set_error(err.message || "No se pudo cargar obras")
        }
    }

    const crear_obra = async () => {
        const hoy = new Date().toISOString().slice(0, 10)
        const payload = {
            ...nueva_obra,
            fecha_inicio: nueva_obra.fecha_inicio || hoy,
            fecha_fin: nueva_obra.fecha_fin || hoy
        }
        if (!payload.nombre_obra) {
            set_error("Ingresa nombre de la obra")
            return
        }
        try {
            await api_fetch("/api/chat/crear_obra", payload)
            set_nueva_obra({
                nombre_obra: "",
                tipo_obra: "obra",
                estado: "en_progreso",
                fecha_inicio: "",
                fecha_fin: "",
                descripcion: ""
            })
            await cargar_obras()
        } catch (err) {
            set_error(err.message || "No se pudo crear obra")
        }
    }

    const crear_inspeccion = async () => {
        try {
            set_error("")
            await api_fetch("/api/chat/crear_inspeccion", {
                codigo: nueva_inspeccion.codigo || `INS-${Date.now()}`,
                revision: 1,
                fecha_formulario: new Date().toISOString(),
                fecha_inspeccion: new Date().toISOString(),
                hora_inicio: new Date().toISOString(),
                hora_termino: new Date().toISOString(),
                encargado_id: u_nombre || "usuario",
                obra_id: nueva_inspeccion.obra_id || null,
                participantes: nueva_inspeccion.nombre || u_nombre || "equipo",
                visita: 1
            })
            set_nueva_inspeccion({ nombre: "", codigo: "", obra_id: "" })
            await cargar_inspecciones()
        } catch (err) {
            set_error(err.message || "No se pudo crear inspección")
        }
    }

    const crear_canal = async () => {
        if (!inspeccion_activa) {
            set_error("Primero selecciona una inspección")
            return
        }
        try {
            set_error("")
            await api_fetch("/api/chat/crear_canal", {
                inspeccion_id: inspeccion_activa,
                nombre: nuevo_canal.nombre || "Canal",
                descripcion: nuevo_canal.descripcion || "",
                usuarios_ids: []
            })
            set_nuevo_canal({ nombre: "", descripcion: "" })
            await cargar_canales(inspeccion_activa)
        } catch (err) {
            set_error(err.message || "No se pudo crear canal")
        }
    }

    const manejar_enviar_mensaje = async () => {
        if (!mensaje.trim() || !canal_id) return
        try {
            set_enviando(true)
            set_error("")
            await api_fetch("/api/chat/enviar_mensaje", { canal_id, contenido: mensaje })
            set_mensaje("")
            await cargar_mensajes()
        } catch (err) {
            set_error(err.message || "No se pudo enviar el mensaje")
        } finally {
            set_enviando(false)
        }
    }

    return (
        <div className="relative min-h-[calc(90vh-5rem)] overflow-hidden rounded-3xl bg-[#f6f6fb] dark:bg-[#332d4a] border border-[#e1e3ec] dark:border-[#2f2948] shadow-md flex flex-col -mt-15">
            <div className="absolute inset-0 bg-[url('/handshake-line.svg')] bg-center bg-contain bg-no-repeat opacity-20 dark:opacity-10 pointer-events-none" />

            <div className="relative flex flex-col h-full px-6 py-6 md:px-10 md:py-8 space-y-4 flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-[#f6a020] text-white flex items-center justify-center shadow-lg">
                            <MessageCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-lg md:text-xl font-semibold text-[#1f1b2f] dark:text-[#f4f3fb]">
                                ¡Hola{u_nombre ? ` ${u_nombre}` : ""}!, ¿En qué puedo ayudarte hoy?
                            </p>
                            <p className="text-sm text-[#5a556c] dark:text-[#c7c4d6]">
                                {u_rol ? `Canal ${u_rol}` : "Chat de prevención"}
                            </p>
                        </div>
                    </div>

                    <div className="flex-shrink-0">
                        <div className="h-36 w-64 rounded-xl bg-[#d8d5e4] dark:bg-[#4a4168] border border-[#e1e3ec] dark:border-[#2f2948] flex items-center justify-center text-[#5a556c] dark:text-[#c7c4d6]">
                            Imagen
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 flex-1 min-h-0">
                    <div className="rounded-2xl bg-[#ebe9f4] dark:bg-[#28223f] border border-[#d3d2de] dark:border-[#312b48] p-4 space-y-3 overflow-y-auto">
                        <p className="text-sm font-semibold text-[#1f1b2f] dark:text-white">Flujo: inspección → canal → chat</p>

                        <div className="space-y-2">
                            <p className="text-xs text-[#5a556c] dark:text-[#c7c4d6]">0. Crea una obra para vincular.</p>
                            <input
                                type="text"
                                placeholder="Nombre de la obra"
                                value={nueva_obra.nombre_obra}
                                onChange={(e) => set_nueva_obra({ ...nueva_obra, nombre_obra: e.target.value })}
                                className="w-full rounded-lg px-3 py-2 bg-white dark:bg-[#1f1a31] border border-[#d3d2de] dark:border-[#312b48] text-sm"
                            />
                            <textarea
                                placeholder="Descripción"
                                value={nueva_obra.descripcion}
                                onChange={(e) => set_nueva_obra({ ...nueva_obra, descripcion: e.target.value })}
                                className="w-full rounded-lg px-3 py-2 bg-white dark:bg-[#1f1a31] border border-[#d3d2de] dark:border-[#312b48] text-sm"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    value={nueva_obra.fecha_inicio}
                                    onChange={(e) => set_nueva_obra({ ...nueva_obra, fecha_inicio: e.target.value })}
                                    className="w-full rounded-lg px-3 py-2 bg-white dark:bg-[#1f1a31] border border-[#d3d2de] dark:border-[#312b48] text-sm"
                                />
                                <input
                                    type="date"
                                    value={nueva_obra.fecha_fin}
                                    onChange={(e) => set_nueva_obra({ ...nueva_obra, fecha_fin: e.target.value })}
                                    className="w-full rounded-lg px-3 py-2 bg-white dark:bg-[#1f1a31] border border-[#d3d2de] dark:border-[#312b48] text-sm"
                                />
                            </div>
                            <Button className="w-full bg-[#6f668e] hover:bg-[#7d759f]" onClick={crear_obra}>
                                Crear obra
                            </Button>
                            <select
                                value={nueva_inspeccion.obra_id}
                                onChange={(e) => set_nueva_inspeccion({ ...nueva_inspeccion, obra_id: e.target.value })}
                                className="w-full rounded-lg px-3 py-2 bg-white dark:bg-[#1f1a31] border border-[#d3d2de] dark:border-[#312b48] text-sm"
                            >
                                <option value="">Selecciona obra para inspección</option>
                                {obras.map((o) => (
                                    <option key={o.id} value={o.id}>{o.nombre_obra}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs text-[#5a556c] dark:text-[#c7c4d6]">1. Crea una inspección (ej. formulario de la imagen).</p>
                            <input
                                type="text"
                                placeholder="Nombre/participantes"
                                value={nueva_inspeccion.nombre}
                                onChange={(e) => set_nueva_inspeccion({ ...nueva_inspeccion, nombre: e.target.value })}
                                className="w-full rounded-lg px-3 py-2 bg-white dark:bg-[#1f1a31] border border-[#d3d2de] dark:border-[#312b48] text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Código (opcional)"
                                value={nueva_inspeccion.codigo}
                                onChange={(e) => set_nueva_inspeccion({ ...nueva_inspeccion, codigo: e.target.value })}
                                className="w-full rounded-lg px-3 py-2 bg-white dark:bg-[#1f1a31] border border-[#d3d2de] dark:border-[#312b48] text-sm"
                            />
                            <Button className="w-full bg-[#f6a020] hover:bg-[#e59210]" onClick={crear_inspeccion}>
                                Crear inspección
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs text-[#5a556c] dark:text-[#c7c4d6]">2. Elige inspección y crea canal.</p>
                            <select
                                value={inspeccion_activa}
                                onChange={async (e) => { 
                                    set_inspeccion_activa(e.target.value)
                                    set_canal_activo("")
                                    await cargar_canales(e.target.value)
                                }}
                                className="w-full rounded-lg px-3 py-2 bg-white dark:bg-[#1f1a31] border border-[#d3d2de] dark:border-[#312b48] text-sm"
                            >
                                <option value="">Selecciona inspección</option>
                                {inspecciones.map((ins) => (
                                    <option key={ins.id} value={ins.id}>{ins.codigo || ins.id.slice(0, 6)}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Nombre canal"
                                value={nuevo_canal.nombre}
                                onChange={(e) => set_nuevo_canal({ ...nuevo_canal, nombre: e.target.value })}
                                className="w-full rounded-lg px-3 py-2 bg-white dark:bg-[#1f1a31] border border-[#d3d2de] dark:border-[#312b48] text-sm"
                            />
                            <Button className="w-full bg-[#6f668e] hover:bg-[#7d759f]" onClick={crear_canal}>
                                Crear canal
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs text-[#5a556c] dark:text-[#c7c4d6]">3. Selecciona canal para abrir chat.</p>
                            <div className="space-y-2 max-h-52 overflow-y-auto">
                                {canales.length === 0 && <p className="text-xs text-[#8f8aa0]">Sin canales</p>}
                                {canales.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => set_canal_activo(c.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg border text-sm ${canal_activo === c.id ? "bg-[#f6a020] text-white border-[#f6a020]" : "bg-white dark:bg-[#1f1a31] border-[#d3d2de] dark:border-[#312b48] text-[#1f1b2f] dark:text-white"}`}
                                    >
                                        {c.nombre || c.id.slice(0, 6)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-end gap-3 pb-6">
                        <div className="flex flex-col gap-3 overflow-y-auto pr-1 max-h-[55vh]">
                            {error && <div className="text-sm text-red-300 bg-red-900/30 border border-red-600 rounded-lg px-3 py-2">{error}</div>}
                            {cargando && <div className="text-sm text-[#c7c4d6]">Cargando mensajes...</div>}
                            {!cargando && mensajes.length === 0 && <div className="text-sm text-[#c7c4d6]">Sin mensajes aún.</div>}

                        {mensajes.map((m) => (
                            <div key={m.id} className="flex justify-end">
                                <div className="max-w-3xl bg-[#cbc7d8] dark:bg-[#6f668e] text-[#1f1b2f] dark:text-white rounded-2xl rounded-br-none p-4 shadow-sm">
                                    <div className="flex items-center gap-4 text-xs text-[#44404f] dark:text-[#e1def0] mb-2">
                                        <span>{new Date(m.fecha_creacion).toLocaleDateString()}</span>
                                        <span>{new Date(m.fecha_creacion).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                        <span className="font-semibold">{m.usuario_nombre}</span>
                                    </div>
                                    <p className="text-base leading-relaxed whitespace-pre-wrap">{m.contenido}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="relative flex items-end gap-3 bg-[#e7e7f2] dark:bg-[#4a4168] border border-[#d3d2de] dark:border-[#312b48] rounded-full px-4 py-3 shadow-inner">
                        <div className="relative">
                            <Button
                                type="button"
                                onClick={() => set_mostrar_opciones(!mostrar_opciones)}
                                className="bg-[#b6b0c5] hover:bg-[#ada6c0] dark:bg-[#6f668e] dark:hover:bg-[#7d759f] text-white rounded-full h-12 w-12 p-0"
                            >
                                <Plus className="h-6 w-6" />
                            </Button>

                            {mostrar_opciones && (
                                <div className="absolute bottom-14 left-0 bg-[#b6b0c5] dark:bg-[#6f668e] rounded-2xl p-2 space-y-1 shadow-lg">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-[#1f1b2f] dark:text-white hover:bg-[#cac5d6] dark:hover:bg-[#7d759f] gap-2 rounded-xl"
                                    >
                                        <Camera className="h-5 w-5" />
                                        Foto
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-[#1f1b2f] dark:text-white hover:bg-[#cac5d6] dark:hover:bg-[#7d759f] gap-2 rounded-xl"
                                    >
                                        <Imagen className="h-5 w-5" />
                                        Imagen
                                    </Button>
                                </div>
                            )}
                        </div>

                        <input
                            type="text"
                            placeholder="Enviar"
                            value={mensaje}
                            onChange={(e) => set_mensaje(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && manejar_enviar_mensaje()}
                            className="flex-1 bg-transparent text-[#1f1b2f] dark:text-white placeholder-[#7a758a] dark:placeholder-[#d3cfe1] rounded-full px-4 py-3 outline-none"
                        />

                        <Button
                            onClick={manejar_enviar_mensaje}
                            className="bg-[#f6a020] hover:bg-[#e59210] text-white rounded-full h-12 w-12 p-0 shadow-md"
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}
