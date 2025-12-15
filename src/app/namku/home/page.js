import { redirect } from "next/navigation";
import { get_session } from "@/services/auth/user_session";
import Home from "@/components/home";

export default async function HomePage() {
    const session = await get_session();
    if (!session) redirect("/namku/login");
    
    const user_role = await session.user?.rol;
    if (user_role != 'prevencionista' && user_role != 'admin') redirect("/");       

    return (
    <>
    <Home u_nombre={session.user.nombre} u_rol={user_role} />
    <p className="text-sm text-[#1f1b2f] dark:text-white mt-3 ml-3">Auspiciado por Grupo de la Rivera</p>
    </>);
}
