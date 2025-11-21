"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Package,
  Users,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  Clock,
  CheckCircle2,
  UserLockIcon,
  Cog,
  CirclePlus
} from "lucide-react"
import { Button } from "@/components/ui/button"

const menuItems = [
  {
    title: "Inicio",
    href: "/",
    icon: Home,
  },
  {
    title: "Operaciones",
    icon: Package,
    items: [
      { title: "Control Operaciones", href: "/views/operaciones",          icon: Cog },
      { title: "Nueva Operación",     href: "/views/operaciones/nueva_op", icon: CirclePlus },
    ],
  },
  {
    title: "Despachos",
    icon: Package,
    items: [
      { title: "Control Despachos",   href: "/",                                    icon: Package },
      { title: "Pendientes Revisión", href: "/views/despachos/pendientes-revision", icon: Clock },
      { title: "Finalizados",         href: "/views/despachos/finalizados",         icon: CheckCircle2 },
      { title: "Reportes",            href: "/views/reportes",                      icon: BarChart3 },
    ],
  },
  {
    title: "Administrador",
    icon: UserLockIcon,
    items: [
      { title: "Home Admin",    href: "/views/admin",  icon: UserLockIcon },
      { title: "Nuevo Cliente", href: "/",             icon: CirclePlus },
    ],
  },
]

export function Sidebar({ isCollapsed, onToggle }) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-card transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle button */}
      <div className="flex h-14 items-center justify-end px-3 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              isCollapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-2 overflow-y-auto h-[calc(100%-3.5rem)] scrollbar-thin">
        {menuItems.map((item, index) => {
          if (item.items) {
            // Grupo con sub-items
            return (
              <div key={index} className="mb-2">
                {!isCollapsed && (
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {item.title}
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  {item.items.map((subItem, subIndex) => {
                    const Icon = subItem.icon
                    const isActive = pathname === subItem.href || pathname.startsWith(subItem.href + "/")

                    return (
                      <Link key={subIndex} href={subItem.href}>
                        <div
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all smooth-hover",
                            isActive
                              ? "sidebar-item-active"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          {!isCollapsed && (
                            <span className="flex-1 truncate">{subItem.title}</span>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          }

          // Item simple
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link key={index} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all smooth-hover",
                  isActive
                    ? "sidebar-item-active"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="flex-1 truncate">{item.title}</span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
