
export default function carga_imagenes({ src, width, quality }){
    return `${src}?w=${width}&q=${quality || 75}`;
}