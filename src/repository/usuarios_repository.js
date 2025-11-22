import { query } from "@/lib/pg_db";

export async function select_usuarios() {
    return await query("SELECT * FROM usuarios");
}

export async function select_usuario_by_id(id) {
    return await query("SELECT * FROM usuarios WHERE id = $1", [id]);
}

export async function select_usuario_by_email(email) {
    return await query("SELECT * FROM usuarios WHERE email = $1", [email]);
}

export async function create_usuario(usuario) {
    const sql = `
        INSERT INTO usuarios (nombre, email, contrasena, rol, activo)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const res = await query(sql, [
        usuario.nombre,
        usuario.email,
        usuario.contrasena_hashed || usuario.contrasena,
        usuario.rol,
        usuario.activo ?? true,
    ]);
    return res?.[0];
}

export async function update_usuario_by_id(n_nombre, n_email, n_rol, usu_id) {
    return await query(
        `UPDATE usuarios SET nombre = $1, email = $2, rol = $3 WHERE id = $4`,
        [n_nombre, n_email, n_rol, usu_id]
    );
}

export async function update_activo(activo, usu_id) {
    return await query(`UPDATE usuarios SET activo = $1 WHERE id = $2`, [activo, usu_id]);
}

export async function update_contrasena_by_id(contrasena_hashed, usu_id) {
    return await query(`UPDATE usuarios SET contrasena = $1 WHERE id = $2`, [contrasena_hashed, usu_id]);
}
