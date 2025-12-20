'use client'

// Importaciones de React y hooks
import { useEffect, useMemo, useState, useRef } from "react"
import Image from "next/image"
import { useDropzone } from 'react-dropzone';
import { useSearchParams } from "next/navigation"
import { Camera, Image as Imagen, MessageCircle, Plus, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { obtener_mensaje_ayuda } from "@/constants/mensajes_sistema"

// Función auxiliar para llamadas a la API
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

// Componente principal Home
export default function Home({ u_nombre, u_rol }) {
    // Estados del componente
    const search_params = useSearchParams()
    const [mensaje, set_mensaje] = useState("")
    const [mostrar_opciones, set_mostrar_opciones] = useState(false)
    const [mostrar_dropzone, set_mostrar_dropzone]= useState(false)
    const [mensajes, set_mensajes] = useState([])
    const [info_canal, set_info_canal] = useState(null)
    const [cargando, set_cargando] = useState(false)
    const [enviando, set_enviando] = useState(false)
    const [error, set_error] = useState("")
    const [canal_activo, set_canal_activo] = useState("")

    const [archivo, set_archivo] = useState(null);

    // Estados para el modal de imagen
    const [modal_imagen_abierto, set_modal_imagen_abierto] = useState(false)
    const [imagen_modal, set_imagen_modal] = useState("")

    // Ref para el input de la cámara
    const input_camara_ref = useRef(null)

    // const obs_url = "http://127.0.0.1:9001/obtener-img"
    
    // Cálculo del canal_id activo
    const canal_id = useMemo(() => {
        if (canal_activo) return canal_activo
        const desde_url = search_params.get("canal_id")
        if (desde_url) return desde_url
        return ""
    }, [search_params, canal_activo])

    // Función para cargar mensajes del canal
    const cargar_mensajes = async () => {
        if (!canal_id) {
            set_mensajes([])
            set_info_canal(null)
            return
        }
        try {
            set_cargando(true)
            set_error("")
            const { mensajes: mensajes_api, info_canal: info_canal_api } = await api_fetch("/api/chat/obtener_mensajes", { canal_id, limit: 100 })
            // Agregar mensaje de ayuda al inicio
            const mensaje_ayuda = obtener_mensaje_ayuda(canal_id)
            const mensajes_con_ayuda = [mensaje_ayuda, ...(mensajes_api.reverse() || [])]
            set_mensajes(mensajes_con_ayuda)
            set_info_canal(info_canal_api || null)
        } catch (err) {
            set_error(err.message || "No se pudo cargar mensajes")
        } finally {
            set_cargando(false)
        }
    }

    // Efecto para cargar mensajes cuando cambia el canal
    useEffect(() => {
        cargar_mensajes()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canal_id])

    // Configuración de la zona de arrastre para archivos
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => {
            set_archivo(acceptedFiles[0]);
        },
        accept: {
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
        },
        maxFiles: 1,
    });

    // Función para abrir la cámara
    const abrir_camara = () => {
        input_camara_ref.current?.click()
    }

    // Manejar la captura de foto desde la cámara
    const manejar_captura_foto = (e) => {
        const archivo_capturado = e.target.files?.[0]
        if (archivo_capturado) {
            set_archivo(archivo_capturado)
            set_mostrar_opciones(false)
        }
    }
    
    // Función para enviar un mensaje
    const manejar_enviar_mensaje = async () => {
        if (!mensaje.trim() || !canal_id) return
        try {
            set_enviando(true)
            set_error("")
            const formData = new FormData();
            formData.append("canal_id", canal_id);
            formData.append("contenido", mensaje);
            if (archivo) {
                formData.append("imagen", archivo);
            }
            await fetch('/api/chat/enviar_mensaje', {
                method: "POST",
                body: formData
            })
            // await api_fetch_file("/api/chat/enviar_mensaje", { canal_id, contenido: mensaje, imagen: archivo })
            set_mensaje("")
            set_archivo(null)
            set_mostrar_dropzone(false)
            await cargar_mensajes()
        } catch (err) {
            set_error(err.message || "No se pudo enviar el mensaje")
        } finally {
            set_enviando(false)
        }
    }

    return (
        // ===== CONTENEDOR PRINCIPAL DEL CHAT =====
        <>
        <div className="relative h-[calc(100vh-8rem)] md:h-[calc(90vh-5rem)] overflow-hidden rounded-2xl md:rounded-3xl bg-[#f6f6fb] dark:bg-[#332d4a] border border-[#e1e3ec] dark:border-[#2f2948] shadow-md flex flex-col">
            {/* Imagen de fondo decorativa */}
            <div className="absolute inset-0 bg-[url('/handshake-line.svg')] bg-center bg-contain bg-no-repeat opacity-20 dark:opacity-10 pointer-events-none" />

                <div className="relative flex flex-col h-full flex-1">
                    {/* ===== HEADER: Información del canal e inspección ===== */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-6 px-3 pt-3 md:px-6 md:pt-6 lg:px-10 lg:pt-8 flex-shrink-0">
                        <div className="flex items-center gap-3 md:gap-4">
                            {/* Icono del chat */}
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#f6a020] text-white flex items-center justify-center shadow-lg flex-shrink-0">
                                <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            {/* Título y subtítulo con información del canal */}
                            <div className="min-w-0 flex-1">
                                {/* Título: Nombre del canal o saludo */}
                                <p className="text-base md:text-lg lg:text-xl font-semibold text-[#1f1b2f] dark:text-[#f4f3fb] truncate">
                                    {info_canal ? `${info_canal.canal_nombre || 'Canal'}` : `¡Hola${u_nombre ? ` ${u_nombre}` : ""}!`}
                                </p>
                                {/* Subtítulo: Información de inspección y obra */}
                                <p className="text-xs md:text-sm text-[#5a556c] dark:text-[#c7c4d6] truncate">
                                    {info_canal ? (
                                        <>
                                            Inspección: {info_canal.inspeccion_codigo || info_canal.inspeccion_participantes || 'Sin código'}
                                            {info_canal.obra_nombre && ` • Obra: ${info_canal.obra_nombre}`}
                                        </>
                                    ) : "Selecciona un canal para comenzar"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ===== CONTENEDOR DE MENSAJES Y PLACEHOLDER ===== */}
                    <div className={`flex-1 overflow-y-auto px-3 md:px-6 lg:px-10 py-3 md:py-4 min-h-0 flex flex-col gap-2 md:gap-3 ${!info_canal ? 'justify-center' : ''}`}>
                        {/* --- PLACEHOLDER: Mensaje cuando no hay canal seleccionado --- */}
                        {!info_canal ? (
                            <div className="flex flex-col items-center justify-center text-center px-4">
                                <div className="bg-[#e7e7f2] dark:bg-[#4a4168] border-2 border-dashed border-[#b6b0c5] dark:border-[#6f668e] rounded-2xl md:rounded-3xl p-8 md:p-16 max-w-md mb-4 md:mb-6">
                                    <MessageCircle className="h-12 w-12 md:h-16 md:w-16 mx-auto text-[#b6b0c5] dark:text-[#6f668e]" />
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold text-[#1f1b2f] dark:text-[#f4f3fb] mb-2 md:mb-3">
                                    Selecciona una inspección y canal
                                </h3>
                                <p className="text-xs md:text-sm text-[#5a556c] dark:text-[#c7c4d6] px-2">
                                    Elige una inspección del sidebar, luego selecciona un canal para comenzar a chatear
                                </p>
                            </div>
                        ) : (
                        <>
                            {/* --- MENSAJES DE ERROR/CARGA --- */}
                            {error && <div className="text-xs md:text-sm text-red-300 bg-red-900/30 border border-red-600 rounded-lg px-2 py-1.5 md:px-3 md:py-2">{error}</div>}
                            {cargando && <div className="text-xs md:text-sm text-[#c7c4d6]">Cargando mensajes...</div>}
                            {!cargando && mensajes.length === 0 && <div className="text-xs md:text-sm text-[#c7c4d6]">Sin mensajes aún.</div>}

                            {/* --- LISTA DE MENSAJES --- */}

                            {mensajes.map((m) => {
                                // Verificar si es el mensaje de ayuda del sistema
                                const es_mensaje_sistema = m.id === "ayuda-template"

                                return (
                                    // --- MENSAJE INDIVIDUAL ---
                                    <div key={m.id} className={es_mensaje_sistema ? "flex justify-start" : "flex justify-end"}>
                                        <div className={`max-w-3xl rounded-2xl p-4 shadow-lg ${
                                            es_mensaje_sistema
                                                ? "bg-[#6f668e] border-2 border-[#8c7dbe] text-white rounded-bl-none"
                                                : "bg-[#cbc7d8] dark:bg-[#6f668e] text-[#1f1b2f] dark:text-white rounded-br-none"
                                        }`}>
                                            {/* Metadatos del mensaje: fecha, hora, usuario */}
                                            <div className="flex items-center gap-4 text-xs mb-2">
                                                {es_mensaje_sistema && (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-6 w-6 rounded-full bg-[#f6a020] flex items-center justify-center text-white font-bold text-sm">
                                                            🤖
                                                        </div>
                                                    </div>
                                                )}
                                                <span className={es_mensaje_sistema ? "text-[#e1def0]" : "text-[#44404f] dark:text-[#e1def0]"}>
                                                    {new Date(m.fecha_creacion).toLocaleDateString()}
                                                </span>
                                                <span className={es_mensaje_sistema ? "text-[#e1def0]" : "text-[#44404f] dark:text-[#e1def0]"}>
                                                    {new Date(m.fecha_creacion).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                                <span className={`font-semibold ${es_mensaje_sistema ? "text-[#f6a020]" : ""}`}>{m.usuario_nombre}</span>
                                            </div>
                                            {/* Contenido del mensaje */}
                                            <p className="text-base leading-relaxed whitespace-pre-wrap">{m.contenido}</p>
                                            {/* Imagen adjunta si existe */}
                                            {m.archivo_url ? (
                                                <div className="h-64 w-80 rounded-xl bg-[#d8d5e4] dark:bg-[#4a4168] border border-[#e1e3ec] dark:border-[#2f2948] flex items-center justify-center text-[#5a556c] dark:text-[#c7c4d6] mt-2 cursor-pointer" onClick={() => { set_imagen_modal(m.archivo_url); set_modal_imagen_abierto(true); }}>
                                                    <Image src={m.archivo_url} alt="Imagen" width={200} height={200} className="rounded-lg object-cover" />
                                                    {/* cambiar src por obs_url+m.archivo_url  */}
                                                </div>
                                            ) : (<></>)}

                                        </div>
                                    </div>
                                )
                            })}
                        </>
                        )}
                    </div>

                            {/* ===== BARRA DE ENVÍO DE MENSAJES ===== */}
                            {info_canal && (
                            <div className="relative flex items-center gap-3 bg-[#e7e7f2] dark:bg-[#4a4168] border border-[#d3d2de] dark:border-[#312b48] rounded-full px-6 py-4 shadow-inner h-14 -mt-2">
                                <div className="relative">
                                    {/* Botón para opciones adicionales (foto, imagen) */}
                                    <Button
                                        type="button"
                                        onClick={() => {set_mostrar_opciones(!mostrar_opciones); set_mostrar_dropzone(false);} }
                                        className="bg-[#b6b0c5] hover:bg-[#ada6c0] dark:bg-[#6f668e] dark:hover:bg-[#7d759f] text-white rounded-full h-10 w-10 md:h-12 md:w-12 p-0"
                                    >
                                        <Plus className="h-5 w-5 md:h-6 md:w-6" />
                                    </Button>

                                    {/* Menú de opciones emergente */}
                                    {mostrar_opciones && (
                                        <div className="absolute bottom-14 left-0 bg-[#b6b0c5] dark:bg-[#6f668e] rounded-2xl p-2 space-y-1 shadow-lg">
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start text-[#1f1b2f] dark:text-white hover:bg-[#cac5d6] dark:hover:bg-[#7d759f] gap-2 rounded-xl"
                                                onClick={abrir_camara}
                                            >
                                                <Camera className="h-5 w-5" />
                                                Foto
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start text-[#1f1b2f] dark:text-white hover:bg-[#cac5d6] dark:hover:bg-[#7d759f] gap-2 rounded-xl"
                                                onClick={() => set_mostrar_dropzone(!mostrar_dropzone)}
                                            >
                                                <Imagen className="h-5 w-5" />
                                                Imagen
                                            </Button>
                                        </div>
                                    )}

                                    {/* Input oculto para captura de cámara */}
                                    <input
                                        ref={input_camara_ref}
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={manejar_captura_foto}
                                        className="hidden"
                                    />
                                    {/* Zona de arrastre para imagen */}
                                    {mostrar_dropzone && (
                                        <div className="absolute -top-62">
                                            <div {...getRootProps({ className: "h-36 w-64 rounded-xl bg-[#d8d5e4] dark:bg-[#4a4168] border border-[#e1e3ec] dark:border-[#2f2948] flex items-center justify-center text-[#5a556c] dark:text-[#c7c4d6] cursor-pointer transition-all hover:bg-[#F2EFFF] dark:hover:bg-[#8c7dbe]" })}>
                                                <input {...getInputProps()} className="hidden" />
                                                {archivo ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <p className="text-center font-medium text-sm">{archivo.name}</p>
                                                        <p className="text-xs text-[#44404f] dark:text-[#c7c4d6]">✓ Listo para enviar</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-center">Arrastra una imagen o haz clic</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Vista previa de imagen seleccionada/capturada */}
                                    {archivo && !mostrar_dropzone && (
                                        <div className="absolute bottom-14 left-0 bg-[#d8d5e4] dark:bg-[#4a4168] rounded-xl p-2 shadow-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-[#44404f] dark:text-[#c7c4d6]">📸 {archivo.name}</span>
                                                <button
                                                    onClick={() => set_archivo(null)}
                                                    className="text-red-500 hover:text-red-700"
                                                    aria-label="Eliminar imagen"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Campo de entrada de texto para el mensaje */}
                                <input
                                    type="text"
                                    placeholder="Enviar Hallazgo..."
                                    value={mensaje}
                                    onChange={(e) => set_mensaje(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && manejar_enviar_mensaje()}
                                    className="flex-1 bg-transparent text-[#1f1b2f] dark:text-white placeholder-[#7a758a] dark:placeholder-[#d3cfe1] rounded-full px-3 py-2 md:px-4 md:py-4 outline-none text-sm"
                                />

                                {/* Botón para enviar el mensaje */}
                                <Button
                                    onClick={manejar_enviar_mensaje}
                                    className="bg-[#f6a020] hover:bg-[#e59210] text-white rounded-full h-10 w-10 md:h-12 md:w-12 p-0 shadow-md flex-shrink-0"
                                >
                                    <Send className="h-4 w-4 md:h-5 md:w-5" />
                                </Button>
                            </div>
                    )}
                </div>
        </div>

        {/* Modal para visualizar imagen ampliada */}
        <Dialog open={modal_imagen_abierto} onOpenChange={set_modal_imagen_abierto}>
            <DialogContent className="max-w-12xl min-w-12xl max-h-[120vh] min-h-[120vh] p-0 bg-black/95 border-none">
                <DialogTitle className="sr-only">Imagen ampliada</DialogTitle>
                <div className="relative flex items-center justify-center p-4 max-w-12xl min-w-12xl max-h-[120vh] min-h-[120vh]">
                    <Image
                        src={imagen_modal}
                        alt="Imagen ampliada"
                        width={1500}
                        height={1200}
                        className="object-contain rounded-lg max-w-12xl min-w-12xl max-h-[120vh] min-h-[120vh]"
                    />
                </div>
            </DialogContent>
        </Dialog>
    </>
    )
}
