"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronLeft, CirclePlus, Trash2, Building2, ClipboardList, MessageSquare, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { CrearInspeccionModal } from "@/components/inspeccion/crear_inspeccion_modal"

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
    const search_params = useSearchParams()
    const [obras, set_obras] = useState([])
    const [inspecciones, set_inspecciones] = useState([])
    const [canales, set_canales] = useState([])
    const [obra_activa, set_obra_activa] = useState("")
    const [inspeccion_activa, set_inspeccion_activa] = useState("")
    const [canal_activo, set_canal_activo] = useState("")
    const [error, set_error] = useState("")
    const [modal_abierto, set_modal_abierto] = useState(false)
    const [nuevo_canal, set_nuevo_canal] = useState({ nombre: "", descripcion: "" })
    const [sincronizado, set_sincronizado] = useState(false)

    const cargar_obras = async () => {
        try {
            const { obras } = await api_fetch("/api/chat/listar_obras", { limit: 50 })
            set_obras(obras || [])
        } catch (err) {
            set_error(err.message || "No se pudo cargar obras")
        }
    }

    const cargar_inspecciones = async (obra_id = null) => {
        try {
            const { inspecciones } = await api_fetch("/api/chat/listar_inspecciones", { limit: 50, obra_id })
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

    const sincronizar_sidebar_con_url = async (canal_id) => {
        if (!canal_id || sincronizado) return
        try {
            const { info_canal } = await api_fetch("/api/chat/obtener_mensajes", { canal_id, limit: 1 })
            if (info_canal) {
                set_canal_activo(canal_id)
                if (info_canal.inspeccion_id) {
                    set_inspeccion_activa(info_canal.inspeccion_id)
                    await cargar_canales(info_canal.inspeccion_id)
                }
                if (info_canal.obra_id) {
                    set_obra_activa(info_canal.obra_id)
                    await cargar_inspecciones(info_canal.obra_id)
                }
                set_sincronizado(true)
            }
        } catch (err) {
            console.error("Error sincronizando sidebar:", err)
        }
    }

    useEffect(() => {
        cargar_obras()
    }, [])

    useEffect(() => {
        const canal_id = search_params.get("canal_id")
        if (canal_id && !sincronizado) {
            sincronizar_sidebar_con_url(canal_id)
        }
    }, [search_params, sincronizado])

    const limpiar_mensajes = () => {
        set_canal_activo("")
        router.push(`/`)
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

    const on_select_obra = async (id) => {
        set_obra_activa(id)
        set_inspeccion_activa("")
        set_canales([])
        await cargar_inspecciones(id)
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
            await cargar_inspecciones(obra_activa)
            limpiar_mensajes()
        } catch (error) {
            set_error(error.message || "No se pudo borrar la inspección")
        }
    }

    const borrar_canal = async (canal_id) => {
        try {
            await api_fetch("/api/chat/borrar_canal", {canal_id})
            await cargar_canales(inspeccion_activa)
            limpiar_mensajes()
        } catch (error) {
            set_error(error.message || "No se pudo borrar el canal")
        }
    }

    return (
        <aside
            className={cn(
                "fixed left-0 top-12 md:top-16 z-40 h-[calc(100vh-3rem)] md:h-[calc(120vh-4rem)] bg-[#0a071f] text-white shadow-xl transition-all duration-300 ease-in-out flex flex-col",
                isCollapsed ? "w-16 md:w-20" : "w-64 md:w-72"
            )}
        >
            <div className="flex items-center justify-between px-2 md:px-4 py-2 md:py-4 border-b border-[#1c1837]">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="h-7 w-7 md:h-10 md:w-10 rounded-full bg-[#f6a020]/40 flex items-center justify-center shadow-md">
                        <Image src="/logo-namku.png" alt="Logo Namku" width={52} height={52} className="scale-75 md:scale-100" />
                    </div>
                    {!isCollapsed && <span className="text-base md:text-xl font-semibold">Namku</span>}
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-[#1c1837] h-7 w-7 md:h-10 md:w-10" aria-label="Colapsar" onClick={onToggle}>
                        <ChevronLeft className={cn("h-4 w-4 md:h-5 md:w-5 transition-transform", isCollapsed ? "rotate-180" : "")} />
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex flex-col p-2 md:p-4 space-y-3 md:space-y-6 overflow-y-auto">
                <Button
                    className="w-full bg-[#6f668e] hover:bg-[#7d759f] text-white rounded-full py-3 md:py-5 text-xs md:text-base font-semibold shadow-md flex items-center justify-center gap-1.5 md:gap-2"
                    onClick={() => set_modal_abierto(true)}
                >
                    <CirclePlus className="h-4 w-4 md:h-5 md:w-5" />
                    {!isCollapsed && "Nueva Inspección"}
                </Button>

                <Button
                    className="w-full bg-[#4a4168] hover:bg-[#5a516e] text-white rounded-full py-2 md:py-3 text-xs md:text-base font-medium shadow-md flex items-center justify-center gap-1.5 md:gap-2"
                    onClick={() => router.push("/namku/mis-inspecciones")}
                >
                    <FileText className="h-4 w-4 md:h-5 md:w-5" />
                    {!isCollapsed && "Mis Inspecciones"}
                </Button>

                {!isCollapsed && error && <div className="text-[10px] md:text-xs text-red-300 bg-red-900/30 border border-red-700 rounded-lg p-1.5 md:p-2">{error}</div>}

                {/* Sección: Obras */}
                <div className="space-y-1.5 md:space-y-2">
                    {!isCollapsed && (
                        <div className="flex items-center gap-1.5 md:gap-2 px-1 md:px-2">
                            <Building2 className="h-3 w-3 md:h-4 md:w-4 text-[#f6a020]" />
                            <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#c7c4d6]">
                                Obras
                            </p>
                            {obras.length > 0 && (
                                <span className="ml-auto text-[10px] md:text-xs bg-[#f6a020]/20 text-[#f6a020] px-1.5 md:px-2 py-0.5 rounded-full font-medium">
                                    {obras.length}
                                </span>
                            )}
                        </div>
                    )}
                    <div className="space-y-1 md:space-y-1.5 max-h-32 md:max-h-40 overflow-y-auto pr-0.5 md:pr-1">
                        {obras.map((obra) => (
                            <button
                                key={obra.id}
                                onClick={() => on_select_obra(obra.id)}
                                className={cn(
                                    "w-full text-left px-2 py-1.5 md:px-3 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm transition-all duration-200 group",
                                    obra_activa === obra.id
                                        ? "bg-gradient-to-r from-[#f6a020] to-[#e59210] text-white shadow-lg shadow-[#f6a020]/30"
                                        : "bg-[#1c1837]/50 text-[#c7c4d6] hover:bg-[#242041] hover:text-white hover:shadow-md"
                                )}
                            >
                                <div className="flex items-center gap-1.5 md:gap-2">
                                    <div className={cn(
                                        "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all",
                                        obra_activa === obra.id ? "bg-white" : "bg-[#6f668e] group-hover:bg-[#f6a020]"
                                    )} />
                                    <span className="truncate font-medium">{obra.nombre_obra || obra.id.slice(0, 6)}</span>
                                </div>
                            </button>
                        ))}
                        {obras.length === 0 && (
                            <div className="w-full text-center py-3 md:py-4 text-[10px] md:text-xs text-[#8f8aa0]">
                                <Building2 className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-1 md:mb-2 opacity-30" />
                                Sin obras disponibles
                            </div>
                        )}
                    </div>
                </div>

                {/* Separador visual */}
                <div className="h-px bg-[#1c1837] my-1 md:my-2" />

                {/* Sección: Inspecciones */}
                <div className="space-y-1.5 md:space-y-2">
                    {!isCollapsed && (
                        <div className="flex items-center gap-1.5 md:gap-2 px-1 md:px-2">
                            <ClipboardList className="h-3 w-3 md:h-4 md:w-4 text-[#f6a020]" />
                            <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#c7c4d6]">
                                Inspecciones
                            </p>
                            {inspecciones.length > 0 && (
                                <span className="ml-auto text-[10px] md:text-xs bg-[#f6a020]/20 text-[#f6a020] px-1.5 md:px-2 py-0.5 rounded-full font-medium">
                                    {inspecciones.length}
                                </span>
                            )}
                        </div>
                    )}
                    <div className="space-y-1 md:space-y-1.5 max-h-32 md:max-h-40 overflow-y-auto pr-0.5 md:pr-1">
                        {inspecciones.map((ins) => (
                            <div key={ins.id} className="relative group">
                                <button
                                    onClick={() => on_select_inspeccion(ins.id)}
                                    className={cn(
                                        "w-full text-left px-2 py-1.5 md:px-3 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm transition-all duration-200",
                                        inspeccion_activa === ins.id
                                            ? "bg-gradient-to-r from-[#f6a020] to-[#e59210] text-white shadow-lg shadow-[#f6a020]/30"
                                            : "bg-[#1c1837]/50 text-[#c7c4d6] hover:bg-[#242041] hover:text-white hover:shadow-md"
                                    )}
                                >
                                    <div className="flex items-center gap-1.5 md:gap-2">
                                        <div className={cn(
                                            "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all",
                                            inspeccion_activa === ins.id ? "bg-white" : "bg-[#6f668e] group-hover:bg-[#f6a020]"
                                        )} />
                                        <span className="truncate font-medium">
                                            {ins.fecha_creacion
                                                ? new Date(ins.fecha_creacion).toLocaleDateString('es-CL', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                  })
                                                : ins.id.slice(0, 6)
                                            }
                                        </span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => borrar_inspeccion(ins.id)}
                                    className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 md:p-1.5 rounded-lg bg-red-500/90 hover:bg-red-600 text-white"
                                    aria-label="Borrar inspección"
                                >
                                    <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                </button>
                            </div>
                        ))}
                        {inspecciones.length === 0 && (
                            <div className="w-full text-center py-3 md:py-4 text-[10px] md:text-xs text-[#8f8aa0]">
                                <ClipboardList className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-1 md:mb-2 opacity-30" />
                                {obra_activa ? "Sin inspecciones" : "Selecciona obra"}
                            </div>
                        )}
                    </div>
                </div>

                {/* Separador visual */}
                <div className="h-px bg-[#1c1837] my-1 md:my-2" />

                {/* Sección: Canales */}
                <div className="space-y-1.5 md:space-y-2">
                    {!isCollapsed && (
                        <div className="flex items-center gap-1.5 md:gap-2 px-1 md:px-2">
                            <MessageSquare className="h-3 w-3 md:h-4 md:w-4 text-[#f6a020]" />
                            <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#c7c4d6]">
                                Canales
                            </p>
                            {canales.length > 0 && (
                                <span className="ml-auto text-[10px] md:text-xs bg-[#f6a020]/20 text-[#f6a020] px-1.5 md:px-2 py-0.5 rounded-full font-medium">
                                    {canales.length}
                                </span>
                            )}
                        </div>
                    )}
                    <div className="space-y-1 md:space-y-1.5 max-h-32 md:max-h-40 overflow-y-auto pr-0.5 md:pr-1">
                        {canales.map((c) => (
                            <div key={c.id} className="relative group">
                                <button
                                    onClick={() => abrir_canal(c.id)}
                                    className={cn(
                                        "w-full text-left px-2 py-1.5 md:px-3 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm transition-all duration-200",
                                        canal_activo === c.id
                                            ? "bg-gradient-to-r from-[#f6a020] to-[#e59210] text-white shadow-lg shadow-[#f6a020]/30"
                                            : "bg-[#1c1837]/50 text-[#c7c4d6] hover:bg-[#242041] hover:text-white hover:shadow-md"
                                    )}
                                >
                                    <div className="flex items-center gap-1.5 md:gap-2">
                                        <div className={cn(
                                            "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all",
                                            canal_activo === c.id ? "bg-white" : "bg-[#6f668e] group-hover:bg-[#f6a020]"
                                        )} />
                                        <span className="truncate font-medium">{c.nombre || c.id.slice(0, 6)}</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => borrar_canal(c.id)}
                                    className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 md:p-1.5 rounded-lg bg-red-500/90 hover:bg-red-600 text-white"
                                    aria-label="Borrar canal"
                                >
                                    <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                </button>
                            </div>
                        ))}
                        {canales.length === 0 && (
                            <div className="w-full text-center py-3 md:py-4 text-[10px] md:text-xs text-[#8f8aa0]">
                                <MessageSquare className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-1 md:mb-2 opacity-30" />
                                {inspeccion_activa ? "Sin canales" : "Selecciona inspección"}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer fijo en la parte inferior */}
            <div className="p-2 md:p-4 border-t border-[#1c1837]">
                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-[#dcd8ec]">
                    <span className="h-6 w-6 md:h-8 md:w-8 rounded-full border border-[#1c1837] flex items-center justify-center text-xs md:text-base">?</span>
                    {!isCollapsed && <span>Ayuda y soporte</span>}
                </div>
            </div>

            <CrearInspeccionModal
                abierto={modal_abierto}
                on_cerrar={() => set_modal_abierto(false)}
                on_creado={async (obra_id) => {
                    if (obra_id) {
                        await cargar_obras()
                        set_obra_activa(obra_id)
                        await cargar_inspecciones(obra_id)
                    }
                }}
            />
        </aside>
    )
}
