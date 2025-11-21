"use client"

import Link from "next/link"
import { Bell, Menu, LogOut } from "lucide-react"
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
import { useRouter } from "next/navigation"

export function Navbar({ onMenuClick }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { count, cargarNotificaciones, marcarLeida, marcarTodasLeidas } = useNotificaciones()
  const [notificaciones, setNotificaciones] = useState([])
  const [loadingNotis, setLoadingNotis] = useState(false)

  const getInitials = (name) => name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"

  const handleLoadNotificaciones = async () => {
    setLoadingNotis(true)
    const notis = await cargarNotificaciones(false)
    setNotificaciones(notis)
    setLoadingNotis(false)
  }

  const handleClickNotificacion = async (noti) => {
    if (!noti.leida) await marcarLeida(noti.id)
    // if (noti.recurso_tipo === 'despacho') router.push(`/views/despachos/pendientes-revision`)
  }

  const handleMarcarTodasLeidas = async () => {
    await marcarTodasLeidas()
    await handleLoadNotificaciones()
  }

  const NotificacionItem = ({ noti }) => (
    <DropdownMenuItem
      onClick={() => handleClickNotificacion(noti)}
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
    <header className="sticky top-0 z-50 w-full glass-effect">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo y Menu Mobile */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-sm shadow-md">
              ACH
            </div>
            <span className="hidden md:inline-block font-semibold text-lg">ACH Lite - Control Operacional</span>
          </Link>
        </div>

        {/* Center */}
        <div className="hidden lg:flex items-center">
          <h1 className="text-sm font-medium text-muted-foreground">Control Operacional (by AtsukaDeuss)</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notificaciones */}
          <DropdownMenu onOpenChange={(open) => { if (open) handleLoadNotificaciones() }}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
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
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleMarcarTodasLeidas}>
                    Marcar todas leídas
                  </Button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {loadingNotis ? (
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

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                    {getInitials(session?.user?.nombre || "Usuario")}
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
