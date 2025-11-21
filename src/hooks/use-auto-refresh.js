import { useEffect, useRef, useState } from "react"

// Igualdad superficial entre objetos
const shallow_equal = (a, b) => {
    if (a === b) return true
    if (!a || !b) return false
    const ka = Object.keys(a), kb = Object.keys(b)
    if (ka.length !== kb.length) return false
    for (const k of ka) if (a[k] !== b[k]) return false
    return true
}

// Conserva referencias de items iguales por id
function merge_by_id(prev, next, get_id) {
    const map_prev = new Map(prev.map(it => [get_id(it), it]))
    const merged = next.map(nxt => {
        const id = get_id(nxt)
        const old = map_prev.get(id)
        return old && shallow_equal(old, nxt) ? old : nxt
    })

    const is_same = prev.length === merged.length && merged.every((item, i) => item === prev[i])
    return is_same ? prev : merged
}

/**
 * Hook para refrescar datos automáticamente con polling
 * @param {Function} fetch_function - Función async que obtiene datos
 * @param {Array} deps - Dependencias externas
 * @param {number} interval_ms - Intervalo de actualización (ms)
 * @param {boolean} enabled - Si el refresco está activo
 * @param {Function} get_item_id - Cómo identificar cada ítem
 */
export function useAutoRefresh({
    fetch_function,
    deps = [],
    interval_ms = 2000,
    enabled = true,
    get_item_id = (x) => x.id ?? x.created_at,
}) {
    const [data, set_data] = useState([])
    const [cargando_inicial, set_cargando_inicial] = useState(true)
    const [refrescando, set_refrescando] = useState(false)
    const interval_ref = useRef(null)
    const controller_ref = useRef(null)
    const is_first_fetch = useRef(true)

    const refetch = async (signal, es_manual = false) => {
        if (!fetch_function) return
        try {
            if (is_first_fetch.current) {
                set_cargando_inicial(true)
            } else if (es_manual) {
                set_refrescando(true)
            }
            
            const fresh = await fetch_function(signal)
            set_data(prev => merge_by_id(prev, fresh, get_item_id))
            
            if (is_first_fetch.current) is_first_fetch.current = false
        } catch (e) {
            if (e.name !== "AbortError") console.error("Error en auto-refresh:", e)
        } finally {
            set_cargando_inicial(false)
            set_refrescando(false)
        }
    }

    useEffect(() => {
        if (!enabled) return
        
        is_first_fetch.current = true
        controller_ref.current = new AbortController()
        refetch(controller_ref.current.signal)

        interval_ref.current = setInterval(() => {
            controller_ref.current?.abort()
            controller_ref.current = new AbortController()
            refetch(controller_ref.current.signal, false)
        }, interval_ms)

        return () => {
            clearInterval(interval_ref.current)
            controller_ref.current?.abort()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, interval_ms, ...deps])

    const refrescar_manual = () => {
        controller_ref.current?.abort()
        controller_ref.current = new AbortController()
        refetch(controller_ref.current.signal, true)
    }

    return { 
        data, 
        cargando_inicial,
        refrescando,
        loading: cargando_inicial, // Compatibilidad
        refetch: refrescar_manual 
    }
}

