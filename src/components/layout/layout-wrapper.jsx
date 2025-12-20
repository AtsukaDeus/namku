"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "./navbar"
import { SidebarWrapper } from "./sidebar-wrapper"
import { cn } from "@/lib/utils"

export function LayoutWrapper({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Rutas donde NO se debe mostrar el navbar y sidebar
  const isAuthPage = pathname === "/namku/login" || pathname === "/namku/register"

  // Si es página de autenticación, solo renderizar children sin layout
  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Navbar */}
      <Navbar onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      {/* Sidebar Desktop */}
      <div className="hidden md:block">
        <SidebarWrapper
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Sidebar Mobile - Overlay */}
      {isMobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden animate-fade-in"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="md:hidden animate-slide-in-left">
            <SidebarWrapper
              isCollapsed={false}
              onToggle={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300 ease-in-out pt-16",
          isSidebarCollapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        <div className="container mx-auto p-4 md:p-6 lg:p-8 min-w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
