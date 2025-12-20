import { select_canal_by_canal_id } from "@/repository/chat_repository";
import { crear_hallazgo_service } from "./chat_service";



/** BOT: Encargado de estudiar el mensaje para identificar un hallazgo
 * 
 * @param {*} mensaje 
 */
export async function bot_detector_hallazgo(mensaje){
    const {
        canal_id,
        usuario_id,
        usuario_nombre,
        usuario_rol,
        contenido,
        archivo_url,
        archivo_ruta,
    } = mensaje;

    // validamos mensaje si es hallazgo
    if (!archivo_url) return {error: "Mensaje no cumple con formato hallazgo."}
    if (!archivo_ruta) return {error: "Mensaje no cumple con formato hallazgo."}

    // Obtener canal por canal_id
    const canales = await select_canal_by_canal_id(canal_id)
    const canal = canales?.[0]
    if (!canal) return { error: "El canal no existe.", status: 400 }

    // Obtener inspeccion_id de canal
    const inspeccion_id = canal.inspeccion_id;

    // BOT: KAST (Pinocho)
    // ----------------------------------
    // Debemos obtener la información del 
    // hallazgo en contenido

    let cont_copy;
    let criticidad;
    let recomendacion;
    let dias;

    const splitear = (contenido) => {
        // orden -> criticidad, recomendacion
        cont_copy = contenido.toLowerCase();
        // criticidad
        let crit = cont_copy.split("criticidad ")[1];
        if (crit) {
            crit = crit.split(" ")[0];
        }

        // recomendacion
        let rec = cont_copy.split("recomendacion ")[1];

        return { criticidad: crit, recomendacion: rec }
    };

    const resultado = splitear(contenido);
    criticidad = resultado.criticidad;
    recomendacion = resultado.recomendacion;
    if (criticidad == undefined || criticidad == null) {
        return {error: "Mensaje no cumple con formato hallazgo."}
    }

    // Convertir criticidad a mayúsculas para coincidir con el array CRITICIDAD
    criticidad = criticidad.toUpperCase();

    // Mapear "INMEDIATO" a "INTOLERABLE" si es necesario
    if (criticidad === "INMEDIATO") {
        criticidad = "INTOLERABLE";
    }

    // Asignar días según criticidad
    if (criticidad === "TRIVIAL") {
        dias = 7
    } else if (criticidad === "TOLERABLE") {
        dias = 5;
    } else if (criticidad === "MODERADO") {
        dias = 3;
    } else if (criticidad === "IMPORTANTE") {
        dias = 1;
    } else if (criticidad === "INTOLERABLE") {
        dias = 0;
    } else {
        return {error: "Criticidad no válida. Usa: trivial, tolerable, moderado, importante, o intolerable"}
    }

    // Cálculo de fecha_cierre
    const hoy = new Date();

    const fecha_cierre = new Date(hoy);
    fecha_cierre.setDate(fecha_cierre.getDate() + dias);

    // Creacion del hallazgo
    const res = await crear_hallazgo_service({inspeccion_id, descripcion: contenido, criticidad, ruta_imagen: archivo_ruta, fecha_cierre});
    if (res.error) return { error: res.error, status: 400 }

    return res;
};