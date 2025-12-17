'use client'

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useDropzone } from 'react-dropzone';
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
    const [mostrar_dropzone, set_mostrar_dropzone]= useState(false)
    const [mensajes, set_mensajes] = useState([])
    const [cargando, set_cargando] = useState(false)
    const [enviando, set_enviando] = useState(false)
    const [error, set_error] = useState("")
    const [canal_activo, set_canal_activo] = useState("")

    const [archivo, set_archivo] =useState(null);
    
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

    // covierte el contenedor en zona de arrastre
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

                        
                    </div>

                    <div className="grid grid-cols-1 gap-4 flex-1 min-h-0 -mt-15">

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
                                        {m.ruta_relativa ? (
                                            <div className="h-36 w-64 rounded-xl bg-[#d8d5e4] dark:bg-[#4a4168] border border-[#e1e3ec] dark:border-[#2f2948] flex items-center justify-center text-[#5a556c] dark:text-[#c7c4d6] mt-2">
                                                <Image src={m.archivo_url} alt="Imagen" width={90} height={90} />
                                            </div>
                                        ) : (<></>)}
                                        
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="relative flex items-end gap-3 bg-[#e7e7f2] dark:bg-[#4a4168] border border-[#d3d2de] dark:border-[#312b48] rounded-full px-4 py-3 shadow-inner">
                            <div className="relative">
                                <Button
                                    type="button"
                                    onClick={() => {set_mostrar_opciones(!mostrar_opciones); set_mostrar_dropzone(false);} }
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
                                            onClick={() => set_mostrar_dropzone(!mostrar_dropzone)}
                                        >
                                            <Imagen className="h-5 w-5" />
                                            Imagen
                                        </Button>
                                    </div>
                                )}
                                {mostrar_dropzone && (
                                    <div className="absolute -top-62">
                                        <div {...getRootProps({ className: "h-36 w-64 rounded-xl bg-[#d8d5e4] dark:bg-[#4a4168] border border-[#e1e3ec] dark:border-[#2f2948] flex items-center justify-center text-[#5a556c] dark:text-[#c7c4d6] cursor-pointer transition-all hover:bg-[#F2EFFF] dark:hover:bg-[#8c7dbe]" })}>
                                            <input {...getInputProps()} className="hidden" />
                                            {archivo ? (
                                                <p className="text-center font-medium">{archivo.name}</p>
                                            ) : (
                                                <p className="text-center">Imagen</p>
                                            )}
                                        </div>
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
