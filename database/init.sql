-- =========================================================
-- INIT.SQL - Esquema base + chat
-- Hecho por @AtsukaDeuss (versión PRO PostgreSQL)
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- FUNCION GLOBAL PARA AUTO-ACTUALIZAR fecha_actualizacion
-- =========================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- TABLA: EMPRESAS
-- =========================================================
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rut VARCHAR NOT NULL,
    nombre VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    razon_social VARCHAR NOT NULL,
    giro VARCHAR NOT NULL,
    descripcion TEXT DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- rut único por empresa
ALTER TABLE empresas
    ADD CONSTRAINT uk_empresas_rut UNIQUE (rut);

-- =========================================================
-- TABLA: DIRECCIONES
-- (entidad_id es polimórfico: empresa, obra, etc.)
-- =========================================================
CREATE TABLE direcciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pais VARCHAR NOT NULL,
    region VARCHAR NOT NULL,
    ciudad VARCHAR NOT NULL,
    comuna VARCHAR NOT NULL,
    calle VARCHAR NOT NULL,
    nro_calle VARCHAR NOT NULL,
    cod_postal VARCHAR DEFAULT NULL,
    direccion_fisica VARCHAR DEFAULT NULL,
    entidad_id UUID NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- TABLA: USUARIOS
-- =========================================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    celular VARCHAR NOT NULL,
    contrasena VARCHAR NOT NULL,
    rol VARCHAR CHECK (rol IN ('admin', 'prevencionista', 'encargado')),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    empresa_id UUID DEFAULT NULL REFERENCES empresas(id) ON DELETE SET NULL
);

-- email único
ALTER TABLE usuarios
    ADD CONSTRAINT uk_usuarios_email UNIQUE (email);

-- índice por empresa
CREATE INDEX idx_usuarios_empresa ON usuarios (empresa_id);

-- =========================================================
-- TABLA: OBRAS
-- =========================================================
CREATE TABLE obras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id), -- NO CASCADE para mantener histórico

    nombre_obra VARCHAR NOT NULL,
    descripcion TEXT,
    tipo_obra VARCHAR NOT NULL,
    estado VARCHAR NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    presupuesto DECIMAL DEFAULT NULL,
    encargado_id UUID DEFAULT NULL, -- podría referenciar usuarios más adelante
    permiso_municipal VARCHAR DEFAULT NULL,
    riesgo VARCHAR CHECK (riesgo IN ('bajo', 'medio', 'alto', 'elevado')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- índice por empresa
CREATE INDEX idx_obras_empresa ON obras (empresa_id);

-- =========================================================
-- TABLA: INSPECCIONES
-- =========================================================
CREATE TABLE inspecciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR NOT NULL,
    revision VARCHAR NOT NULL,
    fecha_formulario TIMESTAMP,
    fecha_inspeccion TIMESTAMP,
    hora_inicio TIMESTAMP,
    hora_termino TIMESTAMP,
    encargado_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    participantes TEXT,
    visita INT NOT NULL,
    fecha_prox_visita TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inspecciones_obra ON inspecciones (obra_id);
CREATE INDEX idx_inspecciones_encargado ON inspecciones (encargado_id);

-- =========================================================
-- TABLA: HALLAZGO
-- =========================================================
CREATE TABLE hallazgo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspeccion_id UUID NOT NULL REFERENCES inspecciones(id) ON DELETE CASCADE,
    descripcion VARCHAR NOT NULL,
    criticidad VARCHAR NOT NULL CHECK (criticidad IN ('TRIVIAL', 'TOLERABLE', 'MODERADO', 'IMPORTANTE', 'INTOLERABLE')),
    ruta_imagen VARCHAR NOT NULL,
    fecha_cierre TIMESTAMP,
    fecha_levantamiento TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hallazgo_inspeccion ON hallazgo (inspeccion_id);

-- =========================================================
-- TABLA: NOTIFICACIONES
-- =========================================================
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR NOT NULL, -- Ej: recurso_subido, doc_enviado, correo_enviado, etc...
    usuario_id UUID NULL REFERENCES usuarios(id) ON DELETE SET NULL,
    usuario_nombre VARCHAR NULL,
    recurso_tipo VARCHAR NULL,
    recurso_id UUID NULL,
    descripcion TEXT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notificaciones_usuario ON notificaciones (usuario_id);
CREATE INDEX idx_notificaciones_recurso ON notificaciones (recurso_tipo, recurso_id);
CREATE INDEX idx_notificaciones_tipo ON notificaciones (tipo);

-- =========================================================
-- TABLA: NOTIFICACIONES_LEIDAS
-- =========================================================
CREATE TABLE notificaciones_leidas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notificacion_id UUID NOT NULL REFERENCES notificaciones(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_lectura TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- evitar duplicados notificacion-usuario
ALTER TABLE notificaciones_leidas
    ADD CONSTRAINT uk_notificaciones_leidas UNIQUE (notificacion_id, usuario_id);

-- =========================================================
-- TABLA: NOTIFICACIONES_USUARIOS
-- (para asignar notificaciones a usuarios)
-- =========================================================
CREATE TABLE notificaciones_usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notificacion_id UUID NOT NULL REFERENCES notificaciones(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE
);

ALTER TABLE notificaciones_usuarios
    ADD CONSTRAINT uk_notificaciones_usuarios UNIQUE (notificacion_id, usuario_id);

-- =========================================================
-- CHAT: CANALES
-- =========================================================
CREATE TABLE canales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR NOT NULL CHECK (tipo IN ('empresa', 'obra', 'inspeccion', 'privado', 'grupo')),
    empresa_id UUID DEFAULT NULL REFERENCES empresas(id) ON DELETE SET NULL,
    obra_id UUID DEFAULT NULL REFERENCES obras(id) ON DELETE SET NULL,
    inspeccion_id UUID DEFAULT NULL REFERENCES inspecciones(id) ON DELETE SET NULL,
    nombre VARCHAR DEFAULT NULL,
    descripcion TEXT DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_canales_empresa ON canales (empresa_id);
CREATE INDEX idx_canales_obra ON canales (obra_id);
CREATE INDEX idx_canales_inspeccion ON canales (inspeccion_id);

-- =========================================================
-- CHAT: CANALES_USUARIOS
-- =========================================================
CREATE TABLE canales_usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canal_id UUID NOT NULL REFERENCES canales(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_union TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- evitar duplicar usuario en canal
ALTER TABLE canales_usuarios
    ADD CONSTRAINT uk_canales_usuarios UNIQUE (canal_id, usuario_id);

CREATE INDEX idx_canales_usuarios_usuario ON canales_usuarios (usuario_id);
CREATE INDEX idx_canales_usuarios_canal_usuario ON canales_usuarios (usuario_id, canal_id);

-- =========================================================
-- CHAT: MENSAJES
-- =========================================================
CREATE TABLE mensajes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canal_id UUID NOT NULL REFERENCES canales(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
    usuario_nombre VARCHAR NOT NULL,
    usuario_rol VARCHAR DEFAULT NULL,
    contenido TEXT DEFAULT NULL,
    archivo_url VARCHAR DEFAULT NULL,
    archivo_ruta VARCHAR DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_mensaje_contenido
        CHECK (contenido IS NOT NULL OR archivo_url IS NOT NULL)
);

-- evita error de rutas duplicadas
ALTER TABLE mensajes
    ADD CONSTRAINT uk_mensajes UNIQUE (archivo_url, archivo_ruta);

CREATE INDEX idx_mensajes_canal ON mensajes (canal_id, fecha_creacion);
CREATE INDEX idx_mensajes_usuario ON mensajes (usuario_id);

-- =========================================================
-- CHAT: LEVANTAMIENTO
-- =========================================================

CREATE TABLE levantamiento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mensaje_id UUID NOT NULL REFERENCES mensajes(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
    contenido TEXT DEFAULT NULL,
    archivo_url VARCHAR DEFAULT NULL,
    archivo_ruta VARCHAR DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_levantamiento_contenido
        CHECK (contenido IS NOT NULL OR archivo_url IS NOT NULL)
);

ALTER TABLE levantamiento
    ADD CONSTRAINT uk_levantamiento UNIQUE (archivo_url, archivo_ruta);

CREATE INDEX idx_levantamiento_canal ON levantamiento (mensaje_id, fecha_creacion);
CREATE INDEX idx_levantamiento_usuario ON levantamiento (usuario_id);

-- =========================================================
-- CHAT: MENSAJES_LEIDOS
-- =========================================================
CREATE TABLE mensajes_leidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mensaje_id UUID NOT NULL REFERENCES mensajes(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_lectura TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE mensajes_leidos
    ADD CONSTRAINT uk_mensajes_leidos UNIQUE (mensaje_id, usuario_id);

CREATE INDEX idx_mensajes_leidos_usuario ON mensajes_leidos (usuario_id);

-- =========================================================
-- TRIGGERS update_timestamp PARA TODAS LAS TABLAS CON fecha_actualizacion
-- =========================================================

CREATE TRIGGER trg_empresas_update
BEFORE UPDATE ON empresas
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_direcciones_update
BEFORE UPDATE ON direcciones
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_usuarios_update
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_obras_update
BEFORE UPDATE ON obras
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_inspecciones_update
BEFORE UPDATE ON inspecciones
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_hallazgo_update
BEFORE UPDATE ON hallazgo
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_canales_update
BEFORE UPDATE ON canales
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_mensajes_update
BEFORE UPDATE ON mensajes
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_levantamiento_update
BEFORE UPDATE ON levantamiento
FOR EACH ROW EXECUTE FUNCTION update_timestamp();