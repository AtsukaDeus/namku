"use client"

import Image from "next/image"
import Link from "next/link"
import { Bell, HelpCircle, Menu, LogOut, Settings } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { signOut, useSession } from "next-auth/react"
import { useNotificaciones } from "@/hooks/use-notificaciones"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export function Navbar({ onMenuClick }) {
    const { data: session } = useSession()
    const { count, cargarNotificaciones, marcarLeida, marcarTodasLeidas } = useNotificaciones()
    const [notificaciones, set_notificaciones] = useState([])
    const [cargando_notificaciones, set_cargando_notificaciones] = useState(false)

    const obtener_iniciales = (nombre) => nombre?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"

    const cargar_notificaciones_ui = async () => {
        set_cargando_notificaciones(true)
        const notis = await cargarNotificaciones(false)
        set_notificaciones(notis)
        set_cargando_notificaciones(false)
    }

    const manejar_click_notificacion = async (noti) => {
        if (!noti.leida) await marcarLeida(noti.id)
        // if (noti.recurso_tipo === 'despacho') router.push(`/views/despachos/pendientes-revision`)
    }

    const manejar_marcar_todas_leidas = async () => {
        await marcarTodasLeidas()
        await cargar_notificaciones_ui()
    }

    const NotificacionItem = ({ noti }) => (
        <DropdownMenuItem
            onClick={() => manejar_click_notificacion(noti)}
            className={`cursor-pointer p-3 focus:bg-accent ${!noti.leida ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
        >
            <div className="flex flex-col gap-1 w-full">
                <p className="text-sm leading-snug">{noti.descripcion}</p>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(noti.fecha_creacion), { addSuffix: true, locale: es })}
                    </span>
                    {!noti.leida && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                </div>
            </div>
        </DropdownMenuItem>
    )

    return (
        <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#4e476c] border-b border-[#e1e3ec] dark:border-[#332d4a] shadow-sm">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="md:hidden text-[#1f1b2f] dark:text-[#f4f3fb]" onClick={onMenuClick}>
                        <Menu className="h-6 w-6" />
                    </Button>
                    <Link href="/" className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#f6a020]/40 shadow-md flex items-center justify-center">
                            <Image src="/logo-namku.png" alt="Namku" width={64} height={64} priority />
                        </div>
                        <span className="hidden md:inline-block font-semibold text-2xl text-[#1f1b2f] dark:text-[#f6f5fb]">
                            Namku <span className="text-sm ml-4">{`(Versión 1.0)`}</span>
                        </span>
                    </Link>
                </div>

                <div className="hidden lg:flex items-center text-base text-[#1f1b2f] dark:text-[#f4f3fb]">
                    Hola {session?.user?.nombre || "prevencionista"}
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                    <Button variant="ghost" size="icon" className="text-[#1f1b2f] dark:text-[#f4f3fb] hover:bg-[#e7e7f2] dark:hover:bg-[#5b5377]">
                        <Settings className="h-5 w-5" />
                    </Button>

                    <DropdownMenu onOpenChange={(open) => { if (open) cargar_notificaciones_ui() }}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative text-[#1f1b2f] dark:text-[#f4f3fb] hover:bg-[#e7e7f2] dark:hover:bg-[#5b5377]">
                                <Bell className="h-5 w-5" />
                                {count > 0 && (
                                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                                        {count > 9 ? '9+' : count}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <div className="flex items-center justify-between p-2 border-b">
                                <DropdownMenuLabel className="p-0">Notificaciones</DropdownMenuLabel>
                                {count > 0 && (
                                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={manejar_marcar_todas_leidas}>
                                        Marcar todas leídas
                                    </Button>
                                )}
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {cargando_notificaciones ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">Cargando...</div>
                                ) : notificaciones.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">No hay notificaciones</div>
                                ) : (
                                    notificaciones.map((noti) => <NotificacionItem key={noti.id} noti={noti} />)
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <ThemeToggle />

                    <Button variant="ghost" size="icon" className="text-[#1f1b2f] dark:text-[#f4f3fb] hover:bg-[#e7e7f2] dark:hover:bg-[#5b5377]">
                        <HelpCircle className="h-5 w-5" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-[#e7e7f2] dark:hover:bg-[#5b5377]">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-[#f6a020] text-[#1f1b2f] font-semibold">
                                        {obtener_iniciales(session?.user?.nombre || "Usuario")}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{session?.user?.nombre || "Usuario"}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{session?.user?.email || "email@ejemplo.com"}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => signOut()}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Cerrar sesión</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
