"use client"

import Image from "next/image"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { AlertCircle, Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { APP_VERSION } from "@/constants/app_version"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { useRouter } from "next/navigation"
import { show_alert } from "@/lib/utils"
import carga_imagenes from "../../../utils/carga_imagen"

export default function LoginPage() {
    const router = useRouter();
    
    const [email, set_email] = useState("")
    const [password, set_password] = useState("")
    const [error, set_error] = useState("")
    const [iniciando_sesion, set_iniciando_sesion] = useState(false)
    const [mostrar_password, set_mostrar_password] = useState(false)

    const func_login = async (e) => {
        e.preventDefault()
        set_error("")

        if (!email || !password) {
            set_error("Por favor completa todos los campos")
            return
        }

        set_iniciando_sesion(true)
        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
            })

            if (res?.error) {
                set_error(`${res.error}`)
            } else {
                show_alert('success', 'Sesión Iniciada.', 'top-end', 3000, false);
                router.push("/");
            }
        } catch (err) {
            set_error("Error al iniciar sesión. Intenta nuevamente.")
        } finally {
            set_iniciando_sesion(false)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#f6f6fb] text-[#1f1b2f] dark:bg-[#0a071f] dark:text-white px-4">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-xl flex flex-col items-center gap-6">
                <div className="flex items-center gap-3">
                    <Image loader={carga_imagenes} src="/logo-namku.png" alt="Namku" width={76} height={76} priority />
                    <h1 className="text-3xl font-semibold">Namku</h1>
                </div>

                <div className="w-full bg-white text-[#1f1b2f] dark:bg-[#151020] dark:text-[#f4f3fb] border border-[#e1e3ec] dark:border-[#2f2948] rounded-3xl shadow-2xl p-10 relative overflow-hidden">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-24 w-24 rounded-full bg-[#f6a020] flex items-center justify-center shadow-lg ring-4 ring-white/60 dark:ring-[#0a071f]">
                        <Image loader={carga_imagenes} src="/logo-namku.png" alt="Avatar" width={112} height={112} />
                    </div>

                    <div className="mt-14 text-center mb-8">
                        <h2 className="text-2xl font-semibold">Iniciar sesión</h2>
                        <p className="text-sm text-[#6b6680] dark:text-[#b8b4c6]">Gestión de inspecciones, canales y chat</p>
                    </div>

                    {error && (
                        <div className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-100 border border-red-300 dark:border-red-700 rounded-xl p-4 flex items-start gap-3 mb-4">
                            <AlertCircle className="h-5 w-5 mt-0.5" />
                            <div className="text-sm">{error}</div>
                        </div>
                    )}

                    <form onSubmit={func_login} className="space-y-5">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7a758a]">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => set_email(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[#e6e6ef] dark:bg-[#0f0b1f] border border-[#d3d2de] dark:border-[#2f2948] rounded-full outline-none focus:ring-2 focus:ring-[#f6a020] text-[#1f1b2f] dark:text-white placeholder-[#8f8a9d]"
                                disabled={iniciando_sesion}
                                autoComplete="email"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7a758a]">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                type={mostrar_password ? "text" : "password"}
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => set_password(e.target.value)}
                                className="w-full pl-12 pr-12 py-3 bg-[#e6e6ef] dark:bg-[#0f0b1f] border border-[#d3d2de] dark:border-[#2f2948] rounded-full outline-none focus:ring-2 focus:ring-[#f6a020] text-[#1f1b2f] dark:text-white placeholder-[#8f8a9d]"
                                disabled={iniciando_sesion}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => set_mostrar_password(!mostrar_password)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#7a758a] hover:text-[#5a556c]"
                                disabled={iniciando_sesion}
                            >
                                {mostrar_password ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#f6a020] hover:bg-[#e59210] text-white py-3 rounded-full font-semibold shadow-lg flex items-center justify-center gap-2"
                            disabled={iniciando_sesion}
                        >
                            {iniciando_sesion ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Iniciando...
                                </>
                            ) : (
                                <>
                                    <LogIn className="h-5 w-5" />
                                    Acceso
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-xs text-[#7a758a] dark:text-[#c7c4d6] space-y-2">
                        <p>Beta version {APP_VERSION}</p>
                        <p>Desarrollado por <a href="https://github.com/AtsukaDeus?tab=repositories">@FranciscoArgandoña</a>, <a href="https://github.com/AlbertoZegers?tab=repositories">@AlbertoZegers</a> y <a href="https://github.com/mochiis76?tab=repositories">@FernandaRapiman</a></p>
                        <p>
                            ¿No tienes cuenta?{" "}
                            <button
                                type="button"
                                onClick={() => (window.location.href = "/namku/register")}
                                className="underline hover:text-[#f6a020]"
                            >
                                Regístrate aquí
                            </button>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    )
}
