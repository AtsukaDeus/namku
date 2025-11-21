import { signOut } from "next-auth/react";

export async function logout() {
    try {
      // Realizar el sign out y redirigir al login
      await signOut({ 
          redirect: true,
          callbackUrl: '/namku/login' 
      });
    } catch (error) {
        console.error("Error durante el logout:", error);
        // Forzar redirección al login en caso de error
        window.location.href = '/namku/login';
    }
};