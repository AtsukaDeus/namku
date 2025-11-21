import { useState, useCallback } from 'react'
import { useAutoRefresh } from './use-auto-refresh'

export function useNotificaciones() {
    const [count, setCount] = useState(0)

    // Función para obtener el contador (polling cada 30 segundos)
    const fetchContador = useCallback(async (signal) => {
        const res = await fetch('/api/notificaciones/get_contador', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal
        })
        const data = await res.json()
        setCount(data.count || 0)
        return [data] // useAutoRefresh espera array
    }, [])

    // Auto-refresh del contador cada 30 segundos
    const { refetch: refrescarContador } = useAutoRefresh({
        fetch_function: fetchContador,
        interval_ms: 30000, // 30 segundos
        enabled: true
    })

    const cargarNotificaciones = async (solo_no_leidas = false) => {
        try {
            const res = await fetch('/api/notificaciones/get_notificaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ solo_no_leidas, limit: 20 })
            })
            const data = await res.json()
            return data.notificaciones || []
        } catch (error) {
            console.error('Error cargando notificaciones:', error)
            return []
        }
    }

    const marcarLeida = async (notificacion_id) => {
        try {
            await fetch('/api/notificaciones/marcar_leida', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificacion_id })
            })
            
            // Refrescar contador
            setCount(prev => Math.max(0, prev - 1))
            refrescarContador()
        } catch (error) {
            console.error('Error marcando como leída:', error)
        }
    }

    const marcarTodasLeidas = async () => {
        try {
            await fetch('/api/notificaciones/marcar_todas_leidas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            
            setCount(0)
            refrescarContador()
        } catch (error) {
            console.error('Error marcando todas como leídas:', error)
        }
    }

    return {
        count,
        cargarNotificaciones,
        marcarLeida,
        marcarTodasLeidas,
        refrescarContador
    }
}
