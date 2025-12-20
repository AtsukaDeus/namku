'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, AlertTriangle, Building2, ClipboardCheck, ClipboardList, Download, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import DetalleInspeccionModal from "@/components/detalle_inspeccion_modal"

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

export default function MisInspecciones({ u_nombre, u_rol }) {
    const router = useRouter()
    const [inspecciones, set_inspecciones] = useState([])
    const [kpis, set_kpis] = useState({
        total_inspecciones: 0,
        total_hallazgos: 0,
        hallazgos_criticos: 0,
        obras_unicas: 0
    })
    const [cargando, set_cargando] = useState(false)
    const [error, set_error] = useState("")
    const [modalOpen, setModalOpen] = useState(false)
    const [inspeccionSeleccionada, setInspeccionSeleccionada] = useState(null)

    const cargar_datos = async () => {
        try {
            set_cargando(true)
            set_error("")
            const { inspecciones: insp, kpis: kpis_data } = await api_fetch("/api/chat/mis_inspecciones", { limit: 100 })
            set_inspecciones(insp || [])
            set_kpis(kpis_data || kpis)
        } catch (err) {
            set_error(err.message || "No se pudieron cargar las inspecciones")
        } finally {
            set_cargando(false)
        }
    }

    useEffect(() => {
        cargar_datos()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const abrirDetalle = (inspeccionId) => {
        setInspeccionSeleccionada(inspeccionId)
        setModalOpen(true)
    }

    const descargarImagen = () => {
        const link = document.createElement('a')
        link.href = '/important_files/namku_kpis_inspecciones.jpeg'
        link.download = 'reporte_kpis_inspecciones.jpeg'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const descargarPDF = (inspeccionId) => {
        const link = document.createElement('a')
        link.href = '/important_files/reporte_inspeccion.pdf'
        link.download = `reporte_inspeccion_${inspeccionId}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-6 -mt-15 rounded-2xl">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#1f1b2f] dark:text-white">
                        Mis Inspecciones
                    </h1>
                    <div className="flex gap-3">
                        <Button
                            onClick={descargarImagen}
                            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg px-4 py-2 shadow-md flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Descargar Reporte KPIs
                        </Button>
                        <Button
                            onClick={() => router.push("/namku/home")}
                            className="bg-[#6f668e] hover:bg-[#7d759f] text-white rounded-lg px-4 py-2 shadow-md"
                        >
                            Volver al Chat
                        </Button>
                    </div>
                </div>
                <p className="text-sm text-[#5a556c] dark:text-[#c7c4d6]">
                    Hola {u_nombre}, aquí tienes un resumen de tus inspecciones
                </p>
            </div>

            {error && (
                <div className="mb-6 bg-red-900/30 border border-red-600 rounded-lg p-4 text-red-300">
                    {error}
                </div>
            )}

            {/* KPIs Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                {/* Total Inspecciones */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 shadow-xl border border-gray-200 dark:border-slate-700 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                            <FileText className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        </div>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {kpis.total_inspecciones}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                        Inspecciones Totales
                    </p>
                </div>

                {/* Total Hallazgos */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 shadow-xl border border-gray-200 dark:border-slate-700 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                            <ClipboardCheck className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        </div>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {kpis.total_hallazgos}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                        Hallazgos Totales
                    </p>
                </div>

                {/* Hallazgos Críticos */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 shadow-xl border border-gray-200 dark:border-slate-700 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                            <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        </div>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {kpis.hallazgos_criticos}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                        Hallazgos Críticos
                    </p>
                </div>

                {/* Obras Únicas */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 shadow-xl border border-gray-200 dark:border-slate-700 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                            <Building2 className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        </div>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {kpis.obras_unicas}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                        Obras Diferentes
                    </p>
                </div>
            </div>

            {/* Tabla de Inspecciones */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                <div className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                        Listado de Inspecciones
                    </h2>
                </div>

                {cargando ? (
                    <div className="p-8 text-center text-[#5a556c] dark:text-[#c7c4d6]">
                        Cargando inspecciones...
                    </div>
                ) : inspecciones.length === 0 ? (
                    <div className="p-8 text-center">
                        <ClipboardList className="h-16 w-16 mx-auto mb-4 text-[#b6b0c5] dark:text-[#6f668e] opacity-50" />
                        <p className="text-[#5a556c] dark:text-[#c7c4d6]">
                            No tienes inspecciones aún
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                        Código
                                    </th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-[#5a556c] dark:text-[#c7c4d6] uppercase tracking-wider hidden lg:table-cell">
                                        Obra
                                    </th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-[#5a556c] dark:text-[#c7c4d6] uppercase tracking-wider hidden xl:table-cell">
                                        Participantes
                                    </th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                        Canales
                                    </th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                        Hallazgos
                                    </th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-[#5a556c] dark:text-[#c7c4d6] uppercase tracking-wider hidden md:table-cell">
                                        Críticos
                                    </th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                        Reporte
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                {inspecciones.map((insp) => (
                                    <tr
                                        key={insp.id}
                                        onClick={() => abrirDetalle(insp.id)}
                                        className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-[#1f1b2f] dark:text-white">
                                            {new Date(insp.fecha_creacion).toLocaleDateString('es-CL')}
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium text-[#1f1b2f] dark:text-white">
                                            {insp.codigo || 'Sin código'}
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-[#1f1b2f] dark:text-white hidden lg:table-cell">
                                            {insp.nombre_obra || 'Sin obra'}
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-[#1f1b2f] dark:text-white hidden xl:table-cell">
                                            {insp.participantes || '-'}
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-[#1f1b2f] dark:text-white">
                                            <span className="inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                                                {insp.total_canales || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-[#1f1b2f] dark:text-white">
                                            <span className="inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f6a020]/20 dark:bg-[#f6a020]/30 text-[#f6a020] border border-[#f6a020]/30">
                                                {insp.total_hallazgos || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-[#1f1b2f] dark:text-white hidden md:table-cell">
                                            <span className="inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/50">
                                                {(parseInt(insp.hallazgos_importantes) || 0) + (parseInt(insp.hallazgos_intolerables) || 0)}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-center">
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    descargarPDF(insp.id)
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg px-3 py-1 text-xs shadow-md flex items-center gap-1 mx-auto"
                                            >
                                                <FileDown className="h-3 w-3" />
                                                PDF
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Detalle */}
            <DetalleInspeccionModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                inspeccionId={inspeccionSeleccionada}
            />
        </div>
    )
}
