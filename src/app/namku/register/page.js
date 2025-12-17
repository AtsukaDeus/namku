"use client"

import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { show_alert } from "@/lib/utils"

export default function RegisterPage() {
    const router = useRouter();
    const [form, set_form] = useState({
        nombre: "",
        email: "",
        celular: "",
        contrasena: "",
        confirmar: ""
    })
    const [error, set_error] = useState("")
    const [cargando, set_cargando] = useState(false)
    const [mostrar_pass, set_mostrar_pass] = useState(false)

    const on_change = (campo, valor) => set_form({ ...form, [campo]: valor })

    const on_submit = async (e) => {
        e.preventDefault()
        set_error("")
        if (!form.nombre || !form.email || !form.contrasena || !form.confirmar) {
            set_error("Completa los campos obligatorios")
            return
        }
        if (form.contrasena !== form.confirmar) {
            set_error("Las contraseñas no coinciden")
            return
        }
        try {
            set_cargando(true)
            const res = await fetch("/api/usuarios/nuevo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "nuevo",
                    nombre: form.nombre,
                    email: form.email,
                    pass: form.contrasena,
                    rol: "prevencionista",
                    celular: form.celular || null
                })
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data?.error || "No se pudo registrar")

            show_alert('success', 'Cuenta creada exitósamente!', 'top-end', 3000, false);
            router.push("/namku/login")
        } catch (err) {
            set_error(err.message || "No se pudo registrar")
        } finally {
            set_cargando(false)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#f6f6fb] text-[#1f1b2f] dark:bg-[#0a071f] dark:text-white px-4">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-xl flex flex-col items-center gap-6">
                <div className="flex items-center gap-3">
                    <Image src="/logo-namku.png" alt="Namku" width={76} height={76} priority />
                    <h1 className="text-3xl font-semibold">Namku</h1>
                </div>

                <div className="w-full bg-white text-[#1f1b2f] dark:bg-[#151020] dark:text-[#f4f3fb] border border-[#e1e3ec] dark:border-[#2f2948] rounded-3xl shadow-2xl p-10 relative overflow-hidden">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-24 w-24 rounded-full bg-[#f6a020] flex items-center justify-center shadow-lg ring-4 ring-white/60 dark:ring-[#0a071f]">
                        <Image src="/logo-namku.png" alt="Avatar" width={56} height={56} />
                    </div>

                    <div className="mt-14 text-center mb-8">
                        <h2 className="text-2xl font-semibold">Crear cuenta</h2>
                        <p className="text-sm text-[#6b6680] dark:text-[#b8b4c6]">Registrate como prevencionista</p>
                    </div>

                    {error && (
                        <div className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-100 border border-red-300 dark:border-red-700 rounded-xl p-4 flex items-start gap-3 mb-4">
                            <AlertCircle className="h-5 w-5 mt-0.5" />
                            <div className="text-sm">{error}</div>
                        </div>
                    )}

                    <form onSubmit={on_submit} className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7a758a]">
                                <User className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Nombre completo"
                                value={form.nombre}
                                onChange={(e) => on_change("nombre", e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[#e6e6ef] dark:bg-[#0f0b1f] border border-[#d3d2de] dark:border-[#2f2948] rounded-full outline-none focus:ring-2 focus:ring-[#f6a020] text-[#1f1b2f] dark:text-white placeholder-[#8f8a9d]"
                                disabled={cargando}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7a758a]">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                type="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={(e) => on_change("email", e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[#e6e6ef] dark:bg-[#0f0b1f] border border-[#d3d2de] dark:border-[#2f2948] rounded-full outline-none focus:ring-2 focus:ring-[#f6a020] text-[#1f1b2f] dark:text-white placeholder-[#8f8a9d]"
                                disabled={cargando}
                                autoComplete="email"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7a758a]">
                                <Phone className="h-5 w-5" />
                            </div>
                            <input
                                type="tel"
                                placeholder="Celular"
                                value={form.celular}
                                onChange={(e) => on_change("celular", e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[#e6e6ef] dark:bg-[#0f0b1f] border border-[#d3d2de] dark:border-[#2f2948] rounded-full outline-none focus:ring-2 focus:ring-[#f6a020] text-[#1f1b2f] dark:text-white placeholder-[#8f8a9d]"
                                disabled={cargando}
                                autoComplete="tel"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7a758a]">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                type={mostrar_pass ? "text" : "password"}
                                placeholder="Contraseña"
                                value={form.contrasena}
                                onChange={(e) => on_change("contrasena", e.target.value)}
                                className="w-full pl-12 pr-12 py-3 bg-[#e6e6ef] dark:bg-[#0f0b1f] border border-[#d3d2de] dark:border-[#2f2948] rounded-full outline-none focus:ring-2 focus:ring-[#f6a020] text-[#1f1b2f] dark:text-white placeholder-[#8f8a9d]"
                                disabled={cargando}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => set_mostrar_pass(!mostrar_pass)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#7a758a] hover:text-[#5a556c]"
                                disabled={cargando}
                            >
                                {mostrar_pass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7a758a]">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                type={mostrar_pass ? "text" : "password"}
                                placeholder="Confirmar contraseña"
                                value={form.confirmar}
                                onChange={(e) => on_change("confirmar", e.target.value)}
                                className="w-full pl-12 pr-12 py-3 bg-[#e6e6ef] dark:bg-[#0f0b1f] border border-[#d3d2de] dark:border-[#2f2948] rounded-full outline-none focus:ring-2 focus:ring-[#f6a020] text-[#1f1b2f] dark:text-white placeholder-[#8f8a9d]"
                                disabled={cargando}
                                autoComplete="new-password"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#f6a020] hover:bg-[#e59210] text-white py-3 rounded-full font-semibold shadow-lg flex items-center justify-center gap-2"
                            disabled={cargando}
                        >
                            {cargando ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Registrando...
                                </>
                            ) : (
                                <>
                                    Registrar
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-xs text-[#7a758a] dark:text-[#c7c4d6]">
                        ¿Ya tienes cuenta? <button onClick={() => router.push("/namku/login")} className="underline hover:text-[#f6a020]">Inicia sesión</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
