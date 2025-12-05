"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronLeft, CirclePlus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"

const api_fetch = async (url, body = {}) => {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.error || "Error al llamar API")
    return data
}

export function Sidebar({ isCollapsed, onToggle }) {
    const { data: session } = useSession()
    const router = useRouter()
    const [inspecciones, set_inspecciones] = useState([])
    const [canales, set_canales] = useState([])
    const [inspeccion_activa, set_inspeccion_activa] = useState("")
    const [canal_activo, set_canal_activo] = useState("")
    const [cargando, set_cargando] = useState(false)
    const [error, set_error] = useState("")
    const [mostrar_form, set_mostrar_form] = useState(false)
    const [obras, set_obras] = useState([])
    const [nueva_inspeccion, set_nueva_inspeccion] = useState({ nombre: "", codigo: "", obra_id: "" })
    const [nuevo_canal, set_nuevo_canal] = useState({ nombre: "", descripcion: "" })
    const [nueva_obra, set_nueva_obra] = useState({
        nombre_obra: "",
        tipo_obra: "obra",
        estado: "en_progreso",
        fecha_inicio: "",
        fecha_fin: "",
        descripcion: ""
    })

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
            await api_fetch("/api/chat/crear_inspeccion", {
                codigo: nueva_inspeccion.codigo || `INS-${Date.now()}`,
                revision: 1,
                fecha_formulario: new Date().toISOString(),
                fecha_inspeccion: new Date().toISOString(),
                hora_inicio: new Date().toISOString(),
                hora_termino: new Date().toISOString(),
                encargado_id: session.user.id,
                obra_id: nueva_inspeccion.obra_id || null,
                participantes: nueva_inspeccion.nombre || session.user.nombre || "equipo",
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

    const on_select_inspeccion = async (id) => {
        set_inspeccion_activa(id)
        set_canales([])
        await cargar_canales(id)
    }

    const abrir_canal = (canal_id) => {
        set_canal_activo(canal_id)
        if (!canal_id) return
        router.push(`/namku/home?canal_id=${canal_id}`)
    }

    const borrar_inspeccion = async (inspeccion_id) => {
        try {
            await api_fetch("/api/chat/borrar_inspeccion", {inspeccion_id})
        } catch (error) {
            set_error(error.message || "No se pudo borrar la inspección")
        }
    }

    const borrar_canal = async (canal_id) => {
        try {
            await api_fetch("/api/chat/borrar_canal", {canal_id})
        } catch (error) {
            set_error(error.message || "No se pudo borrar el canal")
        }
    }

    return (
        <aside
            className={cn(
                "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-[#0a071f] text-white shadow-xl transition-all duration-300 ease-in-out",
                isCollapsed ? "w-20" : "w-72"
            )}
        >
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#1c1837]">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#f6a020]/40 flex items-center justify-center shadow-md">
                        <Image src="/logo-namku.png" alt="Logo Namku" width={52} height={52} />
                    </div>
                    {!isCollapsed && <span className="text-xl font-semibold">Namku</span>}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-[#1c1837]" aria-label="Colapsar" onClick={onToggle}>
                        <ChevronLeft className={cn("h-5 w-5 transition-transform", isCollapsed ? "rotate-180" : "")} />
                    </Button>
                </div>
            </div>

            <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
                <Button
                    className="w-full bg-[#6f668e] hover:bg-[#7d759f] text-white rounded-full py-5 font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                    onClick={() => set_mostrar_form(!mostrar_form)}
                    disabled={cargando}
                >
                    <CirclePlus className="h-5 w-5" />
                    {!isCollapsed && (mostrar_form ? "Cerrar formulario" : "Nueva Inspección")}
                </Button>

                {!isCollapsed && error && <div className="text-xs text-red-300 bg-red-900/30 border border-red-700 rounded-lg p-2">{error}</div>}

                {!isCollapsed && mostrar_form && (
                    <div className="space-y-2 rounded-lg border border-[#1c1837] bg-[#16122e] p-3">
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
                                        onClick={() => abrir_canal(c.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg border text-sm ${canal_activo === c.id ? "bg-[#f6a020] text-white border-[#f6a020]" : "bg-white dark:bg-[#1f1a31] border-[#d3d2de] dark:border-[#312b48] text-[#1f1b2f] dark:text-white"}`}
                                    >
                                        {c.nombre || c.id.slice(0, 6)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {!isCollapsed && <p className="text-sm uppercase tracking-[0.08em] text-[#c7c4d6]">Inspecciones</p>}
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {inspecciones.map((ins) => (
                            <button
                                key={ins.id}
                                onClick={() => on_select_inspeccion(ins.id)}
                                className={cn(
                                    "w-4/5 text-left px-3 py-2 rounded-lg text-sm border",
                                    inspeccion_activa === ins.id
                                        ? "bg-[#f6a020] text-[#0a071f] border-[#f6a020]"
                                        : "bg-[#1c1837] text-white border-[#1c1837] hover:bg-[#242041]"
                                )}
                            >
                                {ins.codigo || ins.id.slice(0, 6)}
                            </button>
                        ))}
                        {inspecciones.map((ins) => (
                            <button
                                key={ins.id}
                                onClick={() => borrar_inspeccion(ins.id)}
                                className="w-1/5 text-left px-3 py-2 rounded-lg text-sm border bg-[#1c1837] text-white border-[#1c1837] hover:bg-[#242041]"
                            >
                                B
                            </button>
                        ))}
                        {inspecciones.length === 0 && <div className="text-xs text-[#8f8aa0]">Sin inspecciones</div>}
                    </div>
                </div>

                <div className="space-y-3">
                    {!isCollapsed && <p className="text-sm uppercase tracking-[0.08em] text-[#c7c4d6]">Canales</p>}
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {canales.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => abrir_canal(c.id)}
                                className={`w-4/5 text-left px-3 py-2 rounded-lg text-sm border ${canal_activo === c.id ? "bg-[#f6a020] text-[#0a071f] border-[#f6a020]" : "bg-[#1c1837] text-white border-[#1c1837] hover:bg-[#242041]"}`}
                            >
                                {c.nombre || c.id.slice(0, 6)}
                            </button>
                        ))}
                        {canales.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => borrar_canal(c.id)}
                                className="w-1/5 text-left px-3 py-2 rounded-lg text-sm border bg-[#1c1837] text-white border-[#1c1837] hover:bg-[#242041]"
                            >
                                B
                            </button>
                        ))}
                        {canales.length === 0 && <div className="text-xs text-[#8f8aa0]">Selecciona inspección</div>}
                    </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-3 text-sm text-[#dcd8ec]">
                        <span className="h-8 w-8 rounded-full border border-[#1c1837] flex items-center justify-center">?</span>
                        {!isCollapsed && <span>Ayuda y soporte</span>}
                    </div>
                </div>
            </div>
        </aside>
    )
}
