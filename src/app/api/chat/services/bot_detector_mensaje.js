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
        recomendacion = recomendacion.split(" ")[0];
        
        return criticidad, recomendacion
    };

    criticidad, recomendacion = splitear(contenido);

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

    // Creacion del hallazgo
    const res = await crear_hallazgo_service({inspeccion_id, contenido, criticidad, archivo_url});
    if (res.error) return { error: error, status: 400 }

    return res;
};


