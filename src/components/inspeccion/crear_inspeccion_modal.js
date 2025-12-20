"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, Check } from "lucide-react"

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

export function CrearInspeccionModal({ abierto, on_cerrar, on_creado }) {
    const { data: session } = useSession()
    const [paso_actual, set_paso_actual] = useState(1)
    const [obras, set_obras] = useState([])
    const [obra_seleccionada_id, set_obra_seleccionada_id] = useState("")
    const [inspeccion_creada_id, set_inspeccion_creada_id] = useState("")
    const [nueva_inspeccion, set_nueva_inspeccion] = useState({ nombre: "", codigo: "" })
    const [nuevo_canal, set_nuevo_canal] = useState({ nombre: "", descripcion: "" })
    const [nueva_obra, set_nueva_obra] = useState({
        nombre_obra: "",
        tipo_obra: "obra",
        estado: "en_progreso",
        fecha_inicio: "",
        fecha_fin: "",
        descripcion: ""
    })
    const [error, set_error] = useState("")
    const [mostrar_crear_obra, set_mostrar_crear_obra] = useState(false)
    const [cargando, set_cargando] = useState(false)

    useEffect(() => {
        if (abierto) {
            cargar_obras()
            reiniciar_estado()
        }
    }, [abierto])

    const reiniciar_estado = () => {
        set_paso_actual(1)
        set_obra_seleccionada_id("")
        set_inspeccion_creada_id("")
        set_nueva_inspeccion({ nombre: "", codigo: "" })
        set_nuevo_canal({ nombre: "", descripcion: "" })
        set_nueva_obra({
            nombre_obra: "",
            tipo_obra: "obra",
            estado: "en_progreso",
            fecha_inicio: "",
            fecha_fin: "",
            descripcion: ""
        })
        set_error("")
        set_mostrar_crear_obra(false)
    }

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
        set_cargando(true)
        try {
            const { obra } = await api_fetch("/api/chat/crear_obra", payload)
            set_nueva_obra({
                nombre_obra: "",
                tipo_obra: "obra",
                estado: "en_progreso",
                fecha_inicio: "",
                fecha_fin: "",
                descripcion: ""
            })
            set_mostrar_crear_obra(false)
            await cargar_obras()
            if (obra?.id) set_obra_seleccionada_id(obra.id)
            set_error("")
        } catch (err) {
            set_error(err.message || "No se pudo crear obra")
        } finally {
            set_cargando(false)
        }
    }

    const siguiente_paso_1 = () => {
        if (!obra_seleccionada_id) {
            set_error("Selecciona una obra para continuar")
            return
        }
        set_error("")
        set_paso_actual(2)
    }

    const crear_inspeccion = async () => {
        set_cargando(true)
        try {
            const { inspeccion } = await api_fetch("/api/chat/crear_inspeccion", {
                codigo: nueva_inspeccion.codigo || `INS-${Date.now()}`,
                revision: 1,
                fecha_formulario: new Date().toISOString(),
                fecha_inspeccion: new Date().toISOString(),
                hora_inicio: new Date().toISOString(),
                hora_termino: new Date().toISOString(),
                encargado_id: session.user.id,
                obra_id: obra_seleccionada_id,
                participantes: nueva_inspeccion.nombre || session.user.nombre || "equipo",
                visita: 1
            })
            if (inspeccion?.id) set_inspeccion_creada_id(inspeccion.id)
            set_error("")
            set_paso_actual(3)
        } catch (err) {
            set_error(err.message || "No se pudo crear inspección")
        } finally {
            set_cargando(false)
        }
    }

    const crear_canal = async () => {
        if (!nuevo_canal.nombre) {
            set_error("Ingresa un nombre para el canal")
            return
        }
        set_cargando(true)
        try {
            await api_fetch("/api/chat/crear_canal", {
                inspeccion_id: inspeccion_creada_id,
                nombre: nuevo_canal.nombre,
                descripcion: nuevo_canal.descripcion || "",
                usuarios_ids: []
            })
            set_error("")
            finalizar()
        } catch (err) {
            set_error(err.message || "No se pudo crear canal")
        } finally {
            set_cargando(false)
        }
    }

    const omitir_canal = () => {
        finalizar()
    }

    const finalizar = () => {
        on_creado && on_creado(obra_seleccionada_id)
        on_cerrar()
        reiniciar_estado()
    }

    const limpiar_y_cerrar = () => {
        reiniciar_estado()
        on_cerrar()
    }

    const titulos_pasos = {
        1: "Paso 1: Seleccionar Obra",
        2: "Paso 2: Crear Inspección",
        3: "Paso 3: Crear Canal (opcional)"
    }

    const descripciones_pasos = {
        1: "Selecciona una obra existente o crea una nueva",
        2: "Completa los datos de la inspección",
        3: "Opcionalmente crea un canal para esta inspección"
    }

    return (
        <Dialog open={abierto} onOpenChange={limpiar_y_cerrar}>
            <DialogContent className="bg-[#0a071f] text-white border-[#1c1837] max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-white">
                        {titulos_pasos[paso_actual]}
                    </DialogTitle>
                    <DialogDescription className="text-[#c7c4d6]">
                        {descripciones_pasos[paso_actual]}
                    </DialogDescription>
                </DialogHeader>

                {/* Indicador de pasos */}
                <div className="flex items-center justify-center gap-2 mb-4">
                    {[1, 2, 3].map((paso) => (
                        <div
                            key={paso}
                            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                                paso === paso_actual
                                    ? "bg-[#f6a020] text-white"
                                    : paso < paso_actual
                                    ? "bg-[#6f668e] text-white"
                                    : "bg-[#1c1837] text-[#8f8aa0]"
                            }`}
                        >
                            {paso < paso_actual ? <Check className="h-4 w-4" /> : paso}
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    {error && (
                        <div className="text-xs text-red-300 bg-red-900/30 border border-red-700 rounded-lg p-2">
                            {error}
                        </div>
                    )}

                    {/* PASO 1: Seleccionar obra */}
                    {paso_actual === 1 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#c7c4d6]">Obra</label>
                                <select
                                    value={obra_seleccionada_id}
                                    onChange={(e) => set_obra_seleccionada_id(e.target.value)}
                                    className="w-full rounded-lg px-3 py-2 bg-[#1f1a31] border border-[#312b48] text-sm text-white"
                                    disabled={cargando}
                                >
                                    <option value="">Selecciona una obra</option>
                                    {obras.map((o) => (
                                        <option key={o.id} value={o.id}>{o.nombre_obra}</option>
                                    ))}
                                </select>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[#f6a020] hover:text-[#e59210] hover:bg-[#1c1837] text-xs"
                                    onClick={() => set_mostrar_crear_obra(!mostrar_crear_obra)}
                                    disabled={cargando}
                                >
                                    {mostrar_crear_obra ? "Cancelar" : "+ Crear nueva obra"}
                                </Button>

                                {mostrar_crear_obra && (
                                    <div className="space-y-2 rounded-lg border border-[#1c1837] bg-[#16122e] p-3">
                                        <input
                                            type="text"
                                            placeholder="Nombre de la obra"
                                            value={nueva_obra.nombre_obra}
                                            onChange={(e) => set_nueva_obra({ ...nueva_obra, nombre_obra: e.target.value })}
                                            className="w-full rounded-lg px-3 py-2 bg-[#1f1a31] border border-[#312b48] text-sm text-white"
                                            disabled={cargando}
                                        />
                                        <textarea
                                            placeholder="Descripción"
                                            value={nueva_obra.descripcion}
                                            onChange={(e) => set_nueva_obra({ ...nueva_obra, descripcion: e.target.value })}
                                            className="w-full rounded-lg px-3 py-2 bg-[#1f1a31] border border-[#312b48] text-sm text-white"
                                            rows={2}
                                            disabled={cargando}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="date"
                                                value={nueva_obra.fecha_inicio}
                                                onChange={(e) => set_nueva_obra({ ...nueva_obra, fecha_inicio: e.target.value })}
                                                className="w-full rounded-lg px-3 py-2 bg-[#1f1a31] border border-[#312b48] text-sm text-white"
                                                disabled={cargando}
                                            />
                                            <input
                                                type="date"
                                                value={nueva_obra.fecha_fin}
                                                onChange={(e) => set_nueva_obra({ ...nueva_obra, fecha_fin: e.target.value })}
                                                className="w-full rounded-lg px-3 py-2 bg-[#1f1a31] border border-[#312b48] text-sm text-white"
                                                disabled={cargando}
                                            />
                                        </div>
                                        <Button
                                            className="w-full bg-[#6f668e] hover:bg-[#7d759f]"
                                            onClick={crear_obra}
                                            disabled={cargando}
                                        >
                                            Guardar obra
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="ghost"
                                    className="flex-1 bg-[#1c1837] hover:bg-[#242041] text-white"
                                    onClick={limpiar_y_cerrar}
                                    disabled={cargando}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    className="flex-1 bg-[#f6a020] hover:bg-[#e59210] text-white"
                                    onClick={siguiente_paso_1}
                                    disabled={cargando}
                                >
                                    Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* PASO 2: Crear inspección */}
                    {paso_actual === 2 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#c7c4d6]">Participantes</label>
                                <input
                                    type="text"
                                    placeholder="Nombre/participantes"
                                    value={nueva_inspeccion.nombre}
                                    onChange={(e) => set_nueva_inspeccion({ ...nueva_inspeccion, nombre: e.target.value })}
                                    className="w-full rounded-lg px-3 py-2 bg-[#1f1a31] border border-[#312b48] text-sm text-white"
                                    disabled={cargando}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#c7c4d6]">Código (opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Código de inspección"
                                    value={nueva_inspeccion.codigo}
                                    onChange={(e) => set_nueva_inspeccion({ ...nueva_inspeccion, codigo: e.target.value })}
                                    className="w-full rounded-lg px-3 py-2 bg-[#1f1a31] border border-[#312b48] text-sm text-white"
                                    disabled={cargando}
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="ghost"
                                    className="flex-1 bg-[#1c1837] hover:bg-[#242041] text-white"
                                    onClick={() => set_paso_actual(1)}
                                    disabled={cargando}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Atrás
                                </Button>
                                <Button
                                    className="flex-1 bg-[#f6a020] hover:bg-[#e59210] text-white"
                                    onClick={crear_inspeccion}
                                    disabled={cargando}
                                >
                                    {cargando ? "Creando..." : "Crear y Continuar"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* PASO 3: Crear canal (opcional) */}
                    {paso_actual === 3 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#c7c4d6]">Nombre del canal</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Canal general"
                                    value={nuevo_canal.nombre}
                                    onChange={(e) => set_nuevo_canal({ ...nuevo_canal, nombre: e.target.value })}
                                    className="w-full rounded-lg px-3 py-2 bg-[#1f1a31] border border-[#312b48] text-sm text-white"
                                    disabled={cargando}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#c7c4d6]">Descripción (opcional)</label>
                                <textarea
                                    placeholder="Descripción del canal"
                                    value={nuevo_canal.descripcion}
                                    onChange={(e) => set_nuevo_canal({ ...nuevo_canal, descripcion: e.target.value })}
                                    className="w-full rounded-lg px-3 py-2 bg-[#1f1a31] border border-[#312b48] text-sm text-white"
                                    rows={2}
                                    disabled={cargando}
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="ghost"
                                    className="flex-1 bg-[#1c1837] hover:bg-[#242041] text-white"
                                    onClick={omitir_canal}
                                    disabled={cargando}
                                >
                                    Omitir
                                </Button>
                                <Button
                                    className="flex-1 bg-[#f6a020] hover:bg-[#e59210] text-white"
                                    onClick={crear_canal}
                                    disabled={cargando}
                                >
                                    {cargando ? "Creando..." : "Crear y Finalizar"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
