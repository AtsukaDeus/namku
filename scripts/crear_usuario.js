#!/usr/bin/env node

// Script simple para crear un usuario desde consola (CommonJS).
// Uso: node scripts/crear_usuario.js "Nombre" "email@ejemplo.com" "contrasena" "rol"

const readline = require("node:readline")
const { hash } = require("bcryptjs")
const { query } = require("./pg_db")

const pedir_input = (pregunta) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    return new Promise((resolve) => rl.question(pregunta, (resp) => {
        rl.close()
        resolve(resp.trim())
    }))
}

const validar_args = (args) => {
    const [nombre, email, contrasena, rol] = args
    if (!nombre) throw new Error("Falta nombre")
    if (!email) throw new Error("Falta email")
    if (!contrasena) throw new Error("Falta contraseña")
    if (!rol || !["admin", "prevencionista", "encargado", "usuario"].includes(rol)) {
        throw new Error("Rol inválido (admin, prevencionista, encargado, usuario)")
    }
    return { nombre, email, contrasena, rol }
}

const crear_usuario = async ({ nombre, email, contrasena, rol }) => {
    const contrasena_hash = await hash(contrasena, 10)

    // La tabla define columnas: nombre, email, contrasena (texto), rol, activo
    const sql = `
        INSERT INTO usuarios (nombre, email, contrasena, rol, activo)
        VALUES ($1, $2, $3, $4, TRUE)
        RETURNING id, email, rol
    `
    const res = await query(sql, [nombre, email, contrasena_hash, rol])
    return res?.[0]
}

const main = async () => {
    try {
        // Preferir args, si faltan, preguntar
        const args = process.argv.slice(2)
        let data
        try {
            data = validar_args(args)
        } catch (err) {
            console.log("Faltan datos, los pediremos ahora...")
            const nombre = await pedir_input("Nombre: ")
            const email = await pedir_input("Email: ")
            const contrasena = await pedir_input("Contraseña: ")
            const rol = await pedir_input("Rol (admin/prevencionista/encargado/usuario): ")
            data = validar_args([nombre, email, contrasena, rol])
        }

        const usuario = await crear_usuario(data)
        console.log("Usuario creado:", usuario)
        process.exit(0)
    } catch (error) {
        console.error("Error creando usuario:", error.message || error)
        process.exit(1)
    }
}

main()
