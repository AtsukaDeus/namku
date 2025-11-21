"use client"

import Image from "next/image"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { APP_VERSION } from "@/constants/app_version"
import { ThemeToggle } from "@/components/layout/theme-toggle"

export default function LoginPage() {
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
                window.location.href = "/"
            }
        } catch (err) {
            set_error("Error al iniciar sesión. Intenta nuevamente.")
        } finally {
            set_iniciando_sesion(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 relative">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg">
                                <Image src="/agenciach_logo.webp" width={80} height={80} alt="Logo Agencia CH" className="rounded-full" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Previchat</h1>
                        <p className="text-blue-100 dark:text-blue-200 text-sm mt-2">Chat para recepción de observaciones en prevención de riegos</p>
                    </div>

                    <form onSubmit={func_login} className="p-8 space-y-6">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Iniciar Sesión</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ingresa tus credenciales para continuar</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Error de autenticación</p>
                                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => set_email(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                    disabled={iniciando_sesion}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                </div>
                                <input
                                    type={mostrar_password ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => set_password(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                    disabled={iniciando_sesion}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => set_mostrar_password(!mostrar_password)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    disabled={iniciando_sesion}
                                >
                                    {mostrar_password ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                            disabled={iniciando_sesion}
                        >
                            {iniciando_sesion ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Iniciando sesión...
                                </>
                            ) : (
                                <>
                                    <LogIn className="h-5 w-5" />
                                    Iniciar Sesión
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="bg-gray-50 dark:bg-gray-900 px-8 py-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-center space-y-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Lite Version {APP_VERSION}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                Developed by <a href="https://atsuka-portafolio.vercel.app/" target="_blank" rel="noopener noreferrer">AtsukaDeuss</a>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">¿Necesitas ayuda? Contacta al administrador</p>
                </div>
            </div>
        </div>
    )
}
