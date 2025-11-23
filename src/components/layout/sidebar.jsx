"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronLeft, CirclePlus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    const router = useRouter()
    const [inspecciones, set_inspecciones] = useState([])
    const [canales, set_canales] = useState([])
    const [inspeccion_activa, set_inspeccion_activa] = useState("")
    const [cargando, set_cargando] = useState(false)
    const [error, set_error] = useState("")
    const [mostrar_form, set_mostrar_form] = useState(false)
    const [form_inspeccion, set_form_inspeccion] = useState({
        obra_id: "",
        codigo: "",
        fecha_inspeccion: "",
        hora_inicio: "",
        hora_termino: "",
        participantes: ""
    })

    const cargar_inspecciones = async () => {
        try {
            const { inspecciones } = await api_fetch("/api/chat/listar_inspecciones", { limit: 20 })
            set_inspecciones(inspecciones || [])
            if (inspecciones?.length && !inspeccion_activa) {
                set_inspeccion_activa(inspecciones[0].id)
                await cargar_canales(inspecciones[0].id)
            }
        } catch (err) {
            set_error(err.message || "No se pudo cargar inspecciones")
        }
    }

    const cargar_canales = async (inspeccion_id) => {
        if (!inspeccion_id) return
        try {
            const { canales: c } = await api_fetch("/api/chat/listar_canales_inspeccion", { inspeccion_id })
            set_canales(c || [])
        } catch (err) {
            set_error(err.message || "No se pudo cargar canales")
        }
    }

    const obras_opciones = useMemo(() => {
        const uniques = new Map()
        inspecciones.forEach((ins) => {
            if (ins.obra_id && !uniques.has(ins.obra_id)) {
                uniques.set(ins.obra_id, { id: ins.obra_id, nombre_obra: ins.obra_id })
            }
        })
        return Array.from(uniques.values())
    }, [inspecciones])

    useEffect(() => {
        cargar_inspecciones()
    }, [])

    const crear_inspeccion = async () => {
        if (!form_inspeccion.obra_id) {
            set_error("Selecciona obra")
            return
        }
        try {
            set_cargando(true)
            set_error("")
            const ahora = new Date().toISOString()
            const fecha_inspeccion = form_inspeccion.fecha_inspeccion || ahora
            const hora_inicio = form_inspeccion.hora_inicio || ahora
            const hora_termino = form_inspeccion.hora_termino || ahora
            await api_fetch("/api/chat/crear_inspeccion", {
                codigo: form_inspeccion.codigo || `INS-${Date.now()}`,
                revision: 1,
                fecha_formulario: ahora,
                fecha_inspeccion,
                hora_inicio,
                hora_termino,
                encargado_id: "autogenerado",
                obra_id: form_inspeccion.obra_id,
                participantes: form_inspeccion.participantes || "equipo",
                visita: 1
            })
            set_form_inspeccion({
                obra_id: "",
                codigo: "",
                fecha_inspeccion: "",
                hora_inicio: "",
                hora_termino: "",
                participantes: ""
            })
            set_mostrar_form(false)
            await cargar_inspecciones()
        } catch (err) {
            set_error(err.message || "No se pudo crear inspección")
        } finally {
            set_cargando(false)
        }
    }

    const on_select_inspeccion = async (id) => {
        set_inspeccion_activa(id)
        set_canales([])
        await cargar_canales(id)
    }

    const abrir_canal = (canal_id) => {
        if (!canal_id) return
        router.push(`/namku/home?canal_id=${canal_id}`)
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

            <div className="p-4 space-y-6">
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
                        <p className="text-sm font-semibold">Crear inspección</p>
                        <input
                            type="text"
                            placeholder="Código"
                            value={form_inspeccion.codigo}
                            onChange={(e) => set_form_inspeccion({ ...form_inspeccion, codigo: e.target.value })}
                            className="w-full rounded-md px-3 py-2 bg-[#0f0c23] border border-[#1c1837] text-sm"
                        />
                        <select
                            value={form_inspeccion.obra_id}
                            onChange={(e) => set_form_inspeccion({ ...form_inspeccion, obra_id: e.target.value })}
                            className="w-full rounded-md px-3 py-2 bg-[#0f0c23] border border-[#1c1837] text-sm"
                        >
                            <option value="">Selecciona obra</option>
                            {obras_opciones.map((o) => (
                                <option key={o.id} value={o.id}>{o.nombre_obra}</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={form_inspeccion.fecha_inspeccion}
                            onChange={(e) => set_form_inspeccion({ ...form_inspeccion, fecha_inspeccion: e.target.value })}
                            className="w-full rounded-md px-3 py-2 bg-[#0f0c23] border border-[#1c1837] text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="time"
                                value={form_inspeccion.hora_inicio}
                                onChange={(e) => set_form_inspeccion({ ...form_inspeccion, hora_inicio: e.target.value })}
                                className="w-full rounded-md px-3 py-2 bg-[#0f0c23] border border-[#1c1837] text-sm"
                            />
                            <input
                                type="time"
                                value={form_inspeccion.hora_termino}
                                onChange={(e) => set_form_inspeccion({ ...form_inspeccion, hora_termino: e.target.value })}
                                className="w-full rounded-md px-3 py-2 bg-[#0f0c23] border border-[#1c1837] text-sm"
                            />
                        </div>
                        <textarea
                            placeholder="Participantes"
                            value={form_inspeccion.participantes}
                            onChange={(e) => set_form_inspeccion({ ...form_inspeccion, participantes: e.target.value })}
                            className="w-full rounded-md px-3 py-2 bg-[#0f0c23] border border-[#1c1837] text-sm"
                        />
                        <Button className="w-full bg-[#f6a020] hover:bg-[#e59210]" onClick={crear_inspeccion} disabled={cargando}>
                            Guardar inspección
                        </Button>
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
                                    "w-full text-left px-3 py-2 rounded-lg text-sm border",
                                    inspeccion_activa === ins.id
                                        ? "bg-[#f6a020] text-[#0a071f] border-[#f6a020]"
                                        : "bg-[#1c1837] text-white border-[#1c1837] hover:bg-[#242041]"
                                )}
                            >
                                {ins.codigo || ins.id.slice(0, 6)}
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
                                className="w-full text-left px-3 py-2 rounded-lg text-sm border bg-[#1c1837] text-white border-[#1c1837] hover:bg-[#242041]"
                            >
                                {c.nombre || c.id.slice(0, 6)}
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
