'use client'

import { useEffect, useState } from "react"
import {
    FileText,
    AlertTriangle,
    Building2,
    Calendar,
    Clock,
    Users,
    MessageSquare,
    CheckCircle,
    XCircle,
    Info
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

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

const CRITICIDAD_CONFIG = {
    INTOLERABLE: {
        color: "bg-red-600 text-white border-red-700",
        label: "Intolerable",
        icon: XCircle
    },
    IMPORTANTE: {
        color: "bg-orange-500 text-white border-orange-600",
        label: "Importante",
        icon: AlertTriangle
    },
    MODERADO: {
        color: "bg-yellow-500 text-white border-yellow-600",
        label: "Moderado",
        icon: AlertTriangle
    },
    TOLERABLE: {
        color: "bg-blue-500 text-white border-blue-600",
        label: "Tolerable",
        icon: Info
    },
    TRIVIAL: {
        color: "bg-gray-400 text-white border-gray-500",
        label: "Trivial",
        icon: CheckCircle
    }
}

export default function DetalleInspeccionModal({ open, onOpenChange, inspeccionId }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [data, setData] = useState(null)

    useEffect(() => {
        if (open && inspeccionId) {
            cargarDetalle()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, inspeccionId])

    const cargarDetalle = async () => {
        try {
            setLoading(true)
            setError("")
            const result = await api_fetch("/api/chat/detalle_inspeccion", {
                inspeccion_id: inspeccionId
            })
            setData(result)
        } catch (err) {
            setError(err.message || "No se pudo cargar el detalle de la inspección")
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (!data && !loading && !error) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] sm:max-w-[90vw] sm:max-h-[85vh] md:max-w-[85vw] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-[#1f1b2f] dark:text-white flex items-center gap-2">
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-[#f6a020]" />
                        Detalle de Inspección
                    </DialogTitle>
                </DialogHeader>

                {loading && (
                    <div className="p-4 sm:p-6 md:p-8 text-center text-sm sm:text-base text-[#5a556c] dark:text-[#c7c4d6]">
                        Cargando detalles...
                    </div>
                )}

                {error && (
                    <div className="p-3 sm:p-4 bg-red-900/30 border border-red-600 rounded-lg text-sm sm:text-base text-red-300">
                        {error}
                    </div>
                )}

                {data && (
                    <div className="space-y-4 sm:space-y-5 md:space-y-6">
                        {/* Información General */}
                        <section className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                            <h3 className="text-base sm:text-lg font-semibold text-[#1f1b2f] dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
                                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-[#6f668e]" />
                                Información General
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-[#5a556c] dark:text-[#c7c4d6]">
                                        Código
                                    </label>
                                    <p className="text-sm sm:text-base text-[#1f1b2f] dark:text-white font-semibold">
                                        {data.inspeccion.codigo}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-[#5a556c] dark:text-[#c7c4d6]">
                                        Revisión
                                    </label>
                                    <p className="text-sm sm:text-base text-[#1f1b2f] dark:text-white font-semibold">
                                        {data.inspeccion.revision}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-[#5a556c] dark:text-[#c7c4d6] flex items-center gap-1">
                                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                        Fecha de Inspección
                                    </label>
                                    <p className="text-sm sm:text-base text-[#1f1b2f] dark:text-white">
                                        {formatDate(data.inspeccion.fecha_inspeccion)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-[#5a556c] dark:text-[#c7c4d6] flex items-center gap-1">
                                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                        Horario
                                    </label>
                                    <p className="text-sm sm:text-base text-[#1f1b2f] dark:text-white">
                                        {formatTime(data.inspeccion.hora_inicio)} - {formatTime(data.inspeccion.hora_termino)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-[#5a556c] dark:text-[#c7c4d6]">
                                        Encargado
                                    </label>
                                    <p className="text-sm sm:text-base text-[#1f1b2f] dark:text-white">
                                        {data.inspeccion.nombre_encargado || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-[#5a556c] dark:text-[#c7c4d6]">
                                        Visita N°
                                    </label>
                                    <p className="text-sm sm:text-base text-[#1f1b2f] dark:text-white">
                                        {data.inspeccion.visita}
                                    </p>
                                </div>
                                {data.inspeccion.fecha_prox_visita && (
                                    <div className="md:col-span-2">
                                        <label className="text-xs sm:text-sm font-medium text-[#5a556c] dark:text-[#c7c4d6] flex items-center gap-1">
                                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                            Próxima Visita Programada
                                        </label>
                                        <p className="text-sm sm:text-base text-[#1f1b2f] dark:text-white">
                                            {formatDate(data.inspeccion.fecha_prox_visita)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Obra Asociada */}
                        <section className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                            <h3 className="text-base sm:text-lg font-semibold text-[#1f1b2f] dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
                                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                                Obra Asociada
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-[#5a556c] dark:text-[#c7c4d6]">
                                        Nombre de la Obra
                                    </label>
                                    <p className="text-sm sm:text-base text-[#1f1b2f] dark:text-white font-semibold">
                                        {data.inspeccion.nombre_obra || 'Sin obra'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-[#5a556c] dark:text-[#c7c4d6]">
                                        Tipo de Obra
                                    </label>
                                    <p className="text-sm sm:text-base text-[#1f1b2f] dark:text-white">
                                        {data.inspeccion.tipo_obra || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-[#5a556c] dark:text-[#c7c4d6]">
                                        Estado
                                    </label>
                                    <p className="text-sm sm:text-base text-[#1f1b2f] dark:text-white">
                                        {data.inspeccion.estado_obra || '-'}
                                    </p>
                                </div>
                            </div>
                            {data.inspeccion.participantes && (
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-[#5a556c] dark:text-[#c7c4d6] flex items-center gap-1">
                                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                                        Participantes
                                    </label>
                                    <p className="text-sm sm:text-base text-[#1f1b2f] dark:text-white whitespace-pre-line">
                                        {data.inspeccion.participantes}
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Canales de Comunicación */}
                        <section className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                            <h3 className="text-base sm:text-lg font-semibold text-[#1f1b2f] dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                                Canales de Comunicación
                                <Badge className="bg-blue-500 text-white ml-1 sm:ml-2 text-xs">
                                    {data.canales.length}
                                </Badge>
                            </h3>
                            {data.canales.length === 0 ? (
                                <p className="text-xs sm:text-sm text-[#5a556c] dark:text-[#c7c4d6] text-center py-3 sm:py-4">
                                    No hay canales asociados a esta inspección
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {data.canales.map((canal) => (
                                        <div
                                            key={canal.id}
                                            className="bg-white dark:bg-slate-700 rounded-lg p-2.5 sm:p-3 border border-gray-200 dark:border-slate-600"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-sm sm:text-base text-[#1f1b2f] dark:text-white truncate">
                                                        {canal.nombre || 'Canal sin nombre'}
                                                    </p>
                                                    {canal.descripcion && (
                                                        <p className="text-xs sm:text-sm text-[#5a556c] dark:text-[#c7c4d6] line-clamp-2">
                                                            {canal.descripcion}
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge variant="outline" className="shrink-0 text-xs">
                                                    {canal.tipo}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Hallazgos */}
                        <section className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                            <h3 className="text-base sm:text-lg font-semibold text-[#1f1b2f] dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-[#f6a020]" />
                                Hallazgos
                                <Badge className="bg-[#f6a020] text-white ml-1 sm:ml-2 text-xs">
                                    {data.hallazgos.length}
                                </Badge>
                            </h3>

                            {/* Dashboard de Criticidad */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                                {Object.entries(CRITICIDAD_CONFIG).map(([key, config]) => {
                                    const Icon = config.icon
                                    const count = data.hallazgos_por_criticidad[key]?.length || 0
                                    return (
                                        <div
                                            key={key}
                                            className={`${config.color} rounded-lg p-2 sm:p-3 text-center`}
                                        >
                                            <Icon className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-0.5 sm:mb-1" />
                                            <p className="text-lg sm:text-xl md:text-2xl font-bold">{count}</p>
                                            <p className="text-[10px] sm:text-xs leading-tight">{config.label}</p>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Lista de Hallazgos */}
                            {data.hallazgos.length === 0 ? (
                                <p className="text-xs sm:text-sm text-[#5a556c] dark:text-[#c7c4d6] text-center py-3 sm:py-4">
                                    No hay hallazgos registrados en esta inspección
                                </p>
                            ) : (
                                <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                                    {data.hallazgos.map((hallazgo) => {
                                        const config = CRITICIDAD_CONFIG[hallazgo.criticidad] || CRITICIDAD_CONFIG.TRIVIAL
                                        const Icon = config.icon
                                        const estaCerrado = !!hallazgo.fecha_cierre

                                        return (
                                            <div
                                                key={hallazgo.id}
                                                className="bg-white dark:bg-slate-700 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-slate-600"
                                            >
                                                <div className="flex items-start gap-2 sm:gap-3">
                                                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5 sm:mt-1 ${config.color.includes('bg-red') ? 'text-red-500' : config.color.includes('bg-orange') ? 'text-orange-500' : config.color.includes('bg-yellow') ? 'text-yellow-500' : config.color.includes('bg-blue') ? 'text-blue-500' : 'text-gray-500'}`} />
                                                    <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                                            <p className="text-sm sm:text-base text-[#1f1b2f] dark:text-white">
                                                                {hallazgo.descripcion}
                                                            </p>
                                                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                                                <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium ${config.color}`}>
                                                                    {config.label}
                                                                </span>
                                                                {estaCerrado && (
                                                                    <Badge className="bg-green-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2">
                                                                        Cerrado
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-[10px] sm:text-xs text-[#5a556c] dark:text-[#c7c4d6]">
                                                            <span>
                                                                Registrado: {formatDate(hallazgo.fecha_creacion)}
                                                            </span>
                                                            {estaCerrado && (
                                                                <span>
                                                                    Cerrado: {formatDate(hallazgo.fecha_cierre)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
