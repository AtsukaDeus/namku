import { compare } from "bcryptjs";
import { query } from "@/lib/pg_db";
import * as CredentialsProviderModule from "next-auth/providers/credentials";

const CredentialsProvider = CredentialsProviderModule.default || CredentialsProviderModule;

export const authOptions = {
    providers: [
        CredentialsProvider({
        name: "Credentials",
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Contraseña", type: "password" },
        },
        async authorize(credentials) {
            const rows = await query(
                "SELECT * FROM usuarios WHERE email = $1",
                [credentials?.email]
            );
            if (!rows.length) throw new Error("Usuario no encontrado");

            const usuario = rows[0];

            // Verificar si el usuario está activo
            if (usuario.activo !== true) throw new Error("Usuario bloqueado");

            const password_ok = await compare(credentials.password, usuario.contrasena);
            if (!password_ok) throw new Error("Contraseña incorrecta");

            return { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
        },
        }),
    ],
    session: { 
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 días
    },
    pages: { 
        signIn: "/namku/login",
        signOut: "/namku/login",
        error: "/namku/login",
    },
    callbacks: {
        async jwt({ token, user }) {
        if (user) {
            token.id = user.id;
            token.rol = user.rol;
            token.nombre = user.nombre;
            token.email = user.email;
        }
        return token;
        },
        async session({ session, token }) {
        if (token) {
            session.user = session.user || {};
            session.user.id = token.id;
            session.user.rol = token.rol;
            session.user.nombre = token.nombre;
            session.user.email = token.email;
        }
        return session;
        },
        async redirect({ url, baseUrl }) {
        // Permite redirecciones relativas
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        // Permite redirecciones a la misma URL
        else if (new URL(url).origin === baseUrl) return url;
        return baseUrl;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
