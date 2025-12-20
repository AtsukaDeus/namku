

export const obtener_mensaje_ayuda = (canal_id) => ({
    id: "ayuda-template",
    canal_id: canal_id,
    usuario_id: "sistema",
    usuario_nombre: "Sistema Namku",
    usuario_rol: "asistente",
    contenido: `¡Hola! 👋 Soy tu asistente para reportar hallazgos de inspección.
📝 Para reportar un hallazgo, sigue estos pasos:

🔴 CRITICIDAD (obligatorio):
criticidad: [trivial | tolerable | moderado | importante | inmediato]

📸 IMAGEN (obligatorio):
Haz clic en el botón ➕ → selecciona "Imagen" → arrastra o selecciona tu foto

💡 RECOMENDACIÓN (opcional):
recomendacion: Describe aquí la acción correctiva o sugerencia

✅ Ejemplo de reporte completo:
criticidad: importante
recomendacion: Se recomienda reforzar la estructura con vigas adicionales antes de continuar con la obra
📸 [imagen adjunta]

✅ Ejemplo sin recomendación:
criticidad: tolerable
📸 [imagen adjunta]

⚠️ Recuerda: La criticidad y la imagen son obligatorias. La recomendación es opcional.`,
    tipo: "texto",
    archivo_url: null,
    archivo_ruta: null,
    fecha_creacion: new Date().toISOString()
})
