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
        tipo,
        archivo_url,
        archivo_ruta,
    } = mensaje;

    // validamos mensaje si es hallazgo
    if (!archivo_url) return {error: "Mensaje no cumple con formato hallazgo."}
    if (!archivo_ruta) return {error: "Mensaje no cumple con formato hallazgo."}

    // Obtener canal por canal_id
    const canal = await select_canal_by_canal_id(canal_id)
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
        criticidad = cont_copy.split("criticidad ")[1];
        criticidad = criticidad.split(" ")[0];

        // recomendacion
        recomendacion = cont_copy.split("recomendacion ")[1];
        
        return criticidad, recomendacion
    };

    criticidad, recomendacion = splitear(contenido);
    if (criticidad == undefined || criticidad == null) {
        return {error: "Mensaje no cumple con formato hallazgo."}
    }

    if (criticidad == "trivial") {
        dias = 7
    }

    if (criticidad == "tolerable") {
        dias = 5;
    }

    if (criticidad == "moderado") {
        dias = 3;
    }

    if (criticidad == "importante") {
        dias = 1;
    }

    if (criticidad == "inmediato") {
        dias = 0;
    }

    // Cálculo de fecha_cierre
    const hoy = new Date();

    const fecha_cierre = new Date(hoy);
    fecha_cierre.setDate(fecha_cierre.getDate() + dias);

    // Creacion del hallazgo
    const res = await crear_hallazgo_service({inspeccion_id, contenido, criticidad, archivo_url, fecha_cierre});
    if (res.error) return { error: error, status: 400 }

    return res;
};


