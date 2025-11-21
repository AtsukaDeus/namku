# 🛡️ Chat para Recepción de Observaciones en Prevención de Riesgos

Sistema diseñado para facilitar la comunicación en terreno y mejorar la gestión de observaciones, hallazgos e inspecciones dentro del ámbito de **Prevención de Riesgos**.  
Permite a empresas, prevencionistas y encargados mantener un canal claro, centralizado y trazable para reportar, seguir y cerrar observaciones en obras o instalaciones.

---

## 🚀 Objetivo del Sistema

El propósito principal del sistema es **recibir, organizar y gestionar observaciones de seguridad** de manera rápida y eficiente mediante un **chat en tiempo real**, permitiendo:

- Reportar hallazgos de inmediato.  
- Mantener comunicación entre prevencionistas, supervisores y trabajadores.  
- Asignar canales específicos por obra, inspección o empresa.  
- Registrar evidencia fotográfica y comentarios.  
- Mantener trazabilidad de todas las comunicaciones.  

---

## 🧩 Funcionalidades Principales

### ✔ Chat en Tiempo Real
- Mensajería instantánea entre usuarios.
- Canales por **obra**, **inspección**, **empresa** o grupos privados.
- Envío de texto, imágenes y archivos.
- Confirmación de lectura.

### ✔ Gestión de Observaciones e Inspecciones
- Relación directa entre mensajes, inspecciones y hallazgos.
- Almacena evidencia como fotos o documentos.
- Permite seguimiento de observaciones hasta su cierre.

### ✔ Notificaciones Inteligentes
- Avisos automáticos por nuevos mensajes.
- Alertas al asignar inspecciones o cargar hallazgos.
- Sistema de “notificaciones leídas”.

### ✔ Sistema de Usuarios y Roles
- Administrador  
- Prevencionista  
- Encargado  

Cada rol con permisos diferenciados.

### ✔ Estructura Empresarial
- Múltiples empresas registradas.
- Obras asociadas a cada empresa.
- Usuarios asignados por empresa y/o obra.

---

## 🏗️ Arquitectura del Proyecto

El sistema está compuesto por:

- **Backend:** PostgreSQL (DB optimizada con índices, constraints y triggers)
- **Chat:** Canales y mensajes en tiempo real
- **Módulo de Obras e Inspecciones**
- **Módulo de Hallazgos**
- **Módulo de Notificaciones**
- **Gestión de Usuarios**

Se diseñó una base de datos sólida, escalable y optimizada para alto rendimiento y trazabilidad.

---

## 🛠️ Tecnologías Clave

- **PostgreSQL** (persistencia + integridad)
- **WebSockets** (chat en tiempo real)
- **Docker** (entorno reproducible con persistencia)
- **UUIDs** para identidad global
- **Triggers y Constraints** para integridad de datos
- **Checks y Cascades** para seguridad relacional

---

## 📦 Estructura de Base de Datos

Incluye tablas para:

- Empresas  
- Direcciones  
- Usuarios  
- Obras  
- Inspecciones  
- Hallazgos  
- Notificaciones  
- Canales (empresa/obra/inspección/privado)  
- Mensajes  
- Mensajes leídos  
- Canales por usuario  

Optimizada con:

- Índices
- Llaves foráneas con CASCADE
- Restricciones de integridad
- Triggers automáticos de actualización

---

## 🎯 Propósito General

Contribuir a un entorno laboral más seguro mediante:

- comunicación rápida,  
- trazabilidad completa,  
- evidencia centralizada,  
- seguimiento en tiempo real,  
- y una experiencia simple, clara y eficiente.

---

## 📞 Contacto

Proyecto creado por **@AtsukaDeuss** y **@Betote**.  
Para consultas o mejoras, puedes abrir un _issue_ en el repositorio o enviar un mensaje.

---
