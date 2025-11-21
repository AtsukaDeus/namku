"use client"

import React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function Checkbox({ id, checked = false, onCheckedChange, disabled = false, className, ...rest }) {
  return (
    <span className={cn("relative inline-flex items-center justify-center", className)}>
      {/* input real para accesibilidad */}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className={cn(
          "absolute inset-0 opacity-0 cursor-pointer",
          disabled && "cursor-not-allowed"
        )}
        {...rest}
      />

      {/* cuadro visual */}
      <span
        aria-hidden="true"
        className={cn(
          "block size-4 rounded-[4px] border transition-colors flex items-center justify-center",
          disabled ? "opacity-50" : "",
          checked ? "bg-black border-black" : "bg-white border-gray-400"
        )}
      >
        {checked && <CheckIcon className="size-3.5 text-white stroke-[3]" />}
      </span>
    </span>
  )
}
