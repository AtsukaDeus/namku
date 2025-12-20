"use client"

import { Suspense } from "react"
import { Sidebar } from "./sidebar"

function SidebarFallback() {
    return (
        <aside className="fixed left-0 top-12 md:top-16 z-40 h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)] w-64 md:w-72 bg-[#0a071f] text-white shadow-xl">
            <div className="flex items-center justify-center h-full">
                <div className="animate-pulse text-[#c7c4d6]">Cargando...</div>
            </div>
        </aside>
    )
}

export function SidebarWrapper({ isCollapsed, onToggle }) {
    return (
        <Suspense fallback={<SidebarFallback />}>
            <Sidebar isCollapsed={isCollapsed} onToggle={onToggle} />
        </Suspense>
    )
}
