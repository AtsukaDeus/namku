import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Obtiene la configuración de tema para SweetAlert2
 * @returns {Object} Objeto con los estilos según el tema actual
 */
export const getSwalThemeConfig = () => {
  const isDark = document.documentElement.classList.contains('dark');
  
  return {
    background: isDark ? '#1f2937' : '#ffffff',
    color: isDark ? '#f3f4f6' : '#1f2937',
    confirmButtonColor: isDark ? '#3b82f6' : '#2563eb',
    cancelButtonColor: isDark ? '#4b5563' : '#6b7280',
    // Colores de iconos por tipo
    iconColors: {
      success: isDark ? '#10b981' : '#22c55e',
      error: isDark ? '#ef4444' : '#dc2626',
      warning: isDark ? '#f59e0b' : '#f97316',
      info: isDark ? '#3b82f6' : '#2563eb',
      question: isDark ? '#8b5cf6' : '#7c3aed',
    }
  };
};

/** Función que recibe una fecha y devuelve un string en formato dd/mm/aaaa
 * 
 * @param {*} date 
 * @returns fecha en string dd/mm/aaaa
 */
export function format_date_to_ddmmyyyy(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Enero = 0
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

/** Función que recibe una fecha y devuelve un string en formato yyyy-mm-dd
 * 
 * @param {*} date 
 * @returns 
 */
export function format_date_to_yyyymmdd(date) {
    if (!date) return null;
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/** Función que recibe una fecha y devuelve un string en formato yyyy-mm-dd hh:mm:ss
 * 
 * @param {*} date 
 */
export function format_date_to_ddmmaaaahhmmss(date) {
    const d = new Date(date);
    const pad = n => n.toString().padStart(2, '0');
    const fechaFormateada = `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    return fechaFormateada;
}



/**
 * Muestra una alerta customizada con sweet alert con soporte para dark/light mode
 * 
 * @param {Object} options
 * @param {'success'|'error'|'warning'|'info'|'question'} options.icon - tipo de icono
 * @param {string} options.text - mensaje de la alerta (sin título)
 * @param {string} [options.position='center'] - posición de la alerta: 'top', 'top-start', 'top-end', 'center', etc.
 * @param {number} [options.timer] - duración en ms (opcional, para auto cerrar)
 * @param {boolean} [options.showConfirmButton=true] - mostrar botón de confirmación
 */
export const show_alert = (icon = 'info', text = '', position = 'top-end', timer = 3000, showConfirmButton = true) => {
  const my_swal = withReactContent(Swal);
  const themeConfig = getSwalThemeConfig();
  
  my_swal.fire({
    icon,
    text,
    position,
    timer,
    toast: true,
    showConfirmButton,
    background: themeConfig.background,
    color: themeConfig.color,
    customClass: {
      popup: 'rounded-lg shadow-lg p-4',
    },
    timerProgressBar: timer ? true : false,
    iconColor: themeConfig.iconColors[icon],
  });
};


/**
 * Helper para hacer fetch con manejo de errores y status
 * @param {string} url - URL del endpoint
 * @param {Object} options - Opciones de fetch (method, body, headers, etc)
 * @returns {Promise<any>} - Respuesta en JSON
 */
export async function fetcher(url, options = {}) {
try {
    const res = await fetch(url, options);

    if (res.status === 401) {
        // No autorizado, cerramos sesión
        show_alert("error", "Tu sesión ha expirado. Redirigiendo al login...", "top-end", 3000, false);
        await logout();
        return;
    }

    if (res.status === 400) {
        const data = await res.json();
        show_alert("warning", data?.error || "Solicitud incorrecta", "top-end", 3000, false);
        return;
    }

    if (res.status === 403) {
        show_alert("error", "No tienes permisos para realizar esta acción", "top-end", 3000, false);
        return;
    }

    if (res.status === 404) {
        show_alert("info", "Recurso no encontrado", "top-end", 3000, false);
        return;
    }

    if (!res.ok) {
        show_alert("error", `Error en la solicitud = ${res.status}`, "top-end", 3000, false);
        return;
    }

    return await res.json();
} catch (err) {
    show_alert("error", `Error en la solicitud = ${err.message}`, "top-end", 3000, false);
}
}