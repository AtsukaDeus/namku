import { 
  select_usuarios, 
  select_usuario_by_id,
  select_usuario_by_email,
  create_usuario, 
  update_usuario_by_id, 
  update_activo,
  update_contrasena_by_id,
} from "@/repository/usuarios_repository";

import { hash } from "bcryptjs";



/**
 * Obtiene todos los usuarios del sistema
 * @returns {Promise<{error?: string, msg?: string, usuarios?: Array, status: number}>}
 */
export async function obtener_usuarios_service() {
    try {
        const usuarios = await select_usuarios();
        return { msg: "Usuarios obtenidos.", usuarios, status: 200 };

    } catch (error) {
        console.error(error);
        return { error: "Error al obtener los usuarios", status: 500 };
    }
};


/**
 * Crea un nuevo usuario en el sistema
 * @param {Object} usuario - Datos del usuario a crear
 * @param {Object} session - Sesión del usuario autenticado
 * @returns {Promise<{error?: string, msg?: string, status: number}>}
 */
export async function nuevo_usuario_service(usuario, session) {
    try {
        // Validaciones de campos obligatorios
        if (!usuario.nombre || usuario.nombre === '') {
            return { error: "El nombre no puede estar vacío", status: 400 };
        }
        if (!usuario.email || usuario.email === '') {
            return { error: "El email no puede estar vacío", status: 400 };
        }
        if (!usuario.celular || usuario.celular === '') {
            return { error: "El celular no puede estar vacío", status: 400 };
        }
        if (!usuario.pass || usuario.pass === '') {
            return { error: "La password no puede estar vacía", status: 400 };
        }
        if (!usuario.rol || usuario.rol === '') {
            return { error: "El rol no puede estar vacío", status: 400 };
        }

        // Validación de posibles valores de Rol
        if (usuario.rol !== 'usuario' && usuario.rol !== 'prevencionista') {
            return { error: "El rol debe ser: (usuario / prevencionista)", status: 400 };
        }

        // Validar la existencia del usuario (Por su email)
        const usuario_db = await select_usuario_by_email(usuario.email);
        if (usuario_db && usuario.email === usuario_db.email) {
            return { error: "El usuario ya existe!.", status: 400 };
        }

        // Hashear la password
        usuario.contrasena_hashed = await hash(usuario.pass, 10);

        // Crear usuario
        const res = await create_usuario(usuario);
        if (!res) {
            return { error: 'Hubo un error al crear al usuario.', status: 500 };
        }

        return { msg: "Usuario creado.", status: 200 };
        
    } catch (error) {
        console.error(error);
        return { error: "Error al crear al usuario", status: 500 };
    }
};


/**
 * Actualiza los datos de un usuario (nombre, email, rol)
 * @param {Object} data - Datos a actualizar
 * @param {Object} session - Sesión del usuario autenticado
 * @returns {Promise<{error?: string, msg?: string, status: number}>}
 */
export async function actualizar_usuario_service(data, session) {
    try {
        const { n_nombre, n_email, n_rol, usu_id } = data;

        // Validaciones
        if (!usu_id || usu_id === '') {
            return { error: "El id no puede estar vacío", status: 400 };
        }
        if (!n_nombre || n_nombre === '') {
            return { error: "El nombre no puede estar vacío", status: 400 };
        }
        if (!n_email || n_email === '') {
            return { error: "El email no puede estar vacío", status: 400 };
        }
        if (!n_rol || n_rol === '') {
            return { error: "El rol no puede estar vacío", status: 400 };
        }

        // Validación: No se puede cambiar datos de otro administrador
        const res_select = await select_usuario_by_id(usu_id);
        const usuario_obtenido = res_select[0];
        if (usuario_obtenido.rol === 'admin') {
            return { error: "No puedes cambiar los datos de un usuario administrador", status: 400 };
        }

        // Actualizar usuario
        const res_update = await update_usuario_by_id(n_nombre, n_email, n_rol, usu_id);
        if (!res_update) {
            return { error: 'Hubo un error al actualizar el usuario.', status: 500 };
        }

        return { msg: "Usuario actualizado", status: 200 };
    } catch (error) {
        console.error(error);
        return { error: "Error al actualizar el usuario", status: 500 };
    }
};


/**
 * Activa o desactiva un usuario
 * @param {Object} data - Datos para activar/desactivar
 * @param {Object} session - Sesión del usuario autenticado
 * @returns {Promise<{error?: string, msg?: string, status: number}>}
 */
export async function activar_desactivar_usuario_service(data, session) {
    try {
        const { usu_id, activo } = data;

        // Validaciones
        if (activo === '' || activo === null) {
            return { error: "El valor de activo no puede ser null o vacío", status: 400 };
        }
        if (!usu_id || usu_id === '') {
            return { error: "El usu_id no puede estar vacío", status: 400 };
        }

        // Validación: No se puede activar/desactivar a un administrador
        const res_select = await select_usuario_by_id(usu_id);
        const usuario_obtenido = res_select[0];
        if (usuario_obtenido.rol === 'admin') {
            return { error: "No puedes activar o desactivar a un usuario administrador", status: 400 };
        }

        const res = await update_activo(activo, usu_id);
        if (!res) {
            return { 
                error: `No se pudo ${activo === 1 ? 'activar' : 'desactivar'} al usuario.`, 
                status: 500 
            };
        }

        return { 
            msg: `Usuario ${activo === 1 ? 'Activado' : 'Desactivado'}`, 
            status: 200 
        };
    } catch (error) {
            console.error(error);
            return { error: "Error al activar/desactivar el usuario", status: 500 };
    }
}


/**
 * Actualiza la contraseña de un usuario
 * @param {Object} data - Datos para actualizar contraseña
 * @param {Object} session - Sesión del usuario autenticado
 * @returns {Promise<{error?: string, msg?: string, status: number}>}
 */
export async function actualizar_contrasena_usuario_service(data, session) {
    try {
        const { contrasena, usu_id } = data;

        // Validaciones
        if (!contrasena || contrasena === '') {
            return { error: "La contraseña no puede estar vacía", status: 400 };
        }
        if (!usu_id || usu_id === '') {
            return { error: "usu_id no puede estar vacío", status: 400 };
        }

        // Validación: No se puede cambiar contraseña de un administrador
        const res_select = await select_usuario_by_id(usu_id);
        const usuario_obtenido = res_select[0];
        if (usuario_obtenido.rol === 'admin') {
            return { error: "No puedes cambiar la contraseña a un usuario administrador.", status: 400 };
        }

        const contrasena_hashed = await hash(contrasena, 10);
        const res_update = await update_contrasena_by_id(contrasena_hashed, usu_id);
        if (!res_update) {
            return { error: "No se pudo cambiar la contraseña.", status: 400 };
        }

        return { msg: "Contraseña actualizada.", status: 200 };

    } catch (error) {
        console.error(error);
        return { error: "Error al actualizar la contraseña", status: 500 };
    }
}
