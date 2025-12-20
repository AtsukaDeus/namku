import { redirect } from "next/navigation"
import { get_session } from "@/services/auth/user_session"
import MisInspecciones from "@/components/mis_inspecciones"

export default async function MisInspeccionesPage() {
    const session = await get_session()
    if (!session) redirect("/namku/login")

    const user_role = session.user?.rol
    if (user_role != 'prevencionista' && user_role != 'admin') redirect("/")

    return <MisInspecciones u_nombre={session.user.nombre} u_rol={user_role} />
}
