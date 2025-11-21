'use client'

import { useState, useEffect, useMemo } from "react"
import { Package, TrendingUp, CheckCircle, Clock, AlertTriangle, RefreshCw, Maximize2, CalendarIcon, FileText, TriangleAlert } from "lucide-react"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { PedidoresCards } from "@/components/dashboard/pedidores-cards"
import { PageHeader } from "@/components/shared/page-header"
import { CardSkeleton, TableSkeleton } from "@/components/ui/loading-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { show_alert, fetcher, getSwalThemeConfig, format_date_to_ddmmyyyy } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Swal from "sweetalert2"
import { useAutoRefresh } from "@/hooks/use-auto-refresh"

export default function Home({u_nombre, u_rol}) {


    return (
        <div className="space-y-6 animate-fade-in -mt-15">
            <PageHeader title="Previchat" description="Chat para recepción de observaciones en prevención de riegos" icon={TrendingUp} />

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-card rounded-lg p-4 border">

       




            </div>

        </div>
    )
}