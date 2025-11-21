import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale"

import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"


export function SelectDate({p_label, p_date, p_handleChange }) {

    return (
    <div className="flex flex-col gap-2">
        <Label>{p_label}</Label>
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-xs">
                    {p_date
                        ? format(new Date(p_date), "dd/MM/yyyy", { locale: es })
                        : "dd / mm / aaaa"}
                    <CalendarIcon className="ml-auto h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={p_date ? new Date(p_date) : undefined}
                    onSelect={p_handleChange}
                    locale={es}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    </div>
    );
};