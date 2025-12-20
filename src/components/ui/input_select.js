"use client"

import { useState, useRef, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ChevronDown, X } from "lucide-react"

export function InputSelect({ 
    label, 
    name,
    value, 
    onChange, 
    options = [], 
    placeholder = "Seleccionar o escribir...",
    required = false,
    disabled = false,
    className = ""
}) {
    const [is_open, set_is_open] = useState(false)
    const [search, set_search] = useState(value || "")
    const [filtered_options, set_filtered_options] = useState(options)
    const wrapper_ref = useRef(null)

    // Filtrar opciones según búsqueda
    useEffect(() => {
        if (search) {
            const filtered = options.filter(option =>
                option.nombre?.toLowerCase().includes(search.toLowerCase())
            )
            set_filtered_options(filtered)
        } else {
            set_filtered_options(options)
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
    }, [search, options])

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handle_click_outside = (event) => {
            if (wrapper_ref.current && !wrapper_ref.current.contains(event.target)) {
                set_is_open(false)
            }
        }
        document.addEventListener("mousedown", handle_click_outside)
        return () => document.removeEventListener("mousedown", handle_click_outside)
    }, [])

    // Actualizar search cuando cambia value desde props
    useEffect(() => {
        if (value !== undefined && value !== search) {
            set_search(value)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    const handle_select = (option) => {
        set_search(option.nombre)
        // Simular evento onChange para compatibilidad con handleChange
        const fake_event = {
            target: {
                name: name,
                value: option.id
            }
        }
        onChange(fake_event)
        set_is_open(false)
    }

    const handle_input_change = (e) => {
        const new_value = e.target.value
        set_search(new_value)
        set_is_open(true)
        
        // Si el usuario escribe algo, pasar el texto como valor
        const fake_event = {
            target: {
                name: name,
                value: new_value
            }
        }
        onChange(fake_event)
    }

    const handle_clear = () => {
        set_search("")
        const fake_event = {
            target: {
                name: name,
                value: ""
            }
        }
        onChange(fake_event)
        set_is_open(false)
    }

    return (
        <div className="flex flex-col gap-1" ref={wrapper_ref}>
            {label && (
                <Label className="text-sm font-medium">
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            
            <div className="relative">
                <Input
                    type="text"
                    name={name}
                    value={search}
                    onChange={handle_input_change}
                    onFocus={() => set_is_open(true)}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`pr-20 ${className}`}
                />
                
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-[0px]">
                    {search && !disabled && (
                        <button
                            type="button"
                            onClick={handle_clear}
                            className="h-6 w-6 rounded-sm hover:bg-muted flex items-center justify-center transition-colors"
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => !disabled && set_is_open(!is_open)}
                        className="h-6 w-6 rounded-sm hover:bg-muted flex items-center justify-center transition-colors"
                        disabled={disabled}
                    >
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${is_open ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Dropdown de opciones */}
                {is_open && !disabled && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-[250px] overflow-y-auto">
                        {filtered_options.length > 0 ? (
                            <ul className="py-1">
                                {filtered_options.map((option) => (
                                    <li
                                        key={option.id}
                                        onClick={() => handle_select(option)}
                                        className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                        {option.nombre}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                                No se encontraron resultados
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}