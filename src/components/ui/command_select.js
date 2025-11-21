"use client"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export function CommandSelect({ label, value, onChange, options = [], placeholder = "Seleccionar" }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="flex flex-col gap-2">
            {label && <Label>{label}</Label>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="justify-between text-xs truncate"
                    >
                        {value || `${placeholder} ${label || ""}`}
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className="p-0 w-[300px] pointer-events-auto"
                    side="bottom"
                    align="start"
                    onWheel={(e) => e.stopPropagation()}
                >
                    <Command>
                        <CommandInput placeholder={`Buscar ${label}...`} className="text-xs" />
                        <CommandList
                            className="max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300"
                            onWheel={(e) => e.stopPropagation()}
                        >
                            <CommandEmpty>No se encontraron resultados</CommandEmpty>
                            <CommandGroup>
                                {options.map((o) => (
                                    <CommandItem
                                        key={o.id}
                                        value={o.nombre}
                                        onSelect={(v) => {
                                            onChange(v)
                                            setOpen(false)
                                        }}
                                        className="text-xs"
                                    >
                                        {o.nombre}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
