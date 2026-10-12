# Estándares Maestros de Documentación Técnica y Arquitectura (Carnet Digital & Enterprise Suite)

Reglas obligatorias para la generación de manuales, especificaciones de arquitectura, guías de usuario y documentación técnica en **Carnet Digital** y cualquier proyecto de software empresarial.

---

## 📚 1. Marco Estructural Diátaxis (Los 4 Cuadrantes Cognitivos)
Toda documentación técnica debe clasificarse estrictamente en uno de los 4 cuadrantes del framework **Diátaxis**:
1. **Tutoriales (Aprendizaje):** Guiar paso a paso al principiante hacia un primer resultado exitoso sin digresiones teóricas.
2. **Guías How-To (Problemas):** Solución práctica a un caso de uso o incidencia de producción (ej. *"Cómo rotar certificados JWT"*).
3. **Referencia Técnica (Información Exacta):** Diccionarios de datos, endpoints REST, cabeceras, códigos HTTP y modelos tabulados.
4. **Explicaciones / Arquitectura (Comprensión):** El *por qué* del diseño, *trade-offs*, alternativas descartadas y contexto conceptual.

---

## 🏛️ 2. Arquitectura de Software bajo el Estándar arc42 (ISO/IEC/IEEE 42010)
Todo manual de arquitectura integral debe articularse sobre las 12 secciones estandarizadas de arc42:
* **Sec 1 a 4:** Introducción y Metas, Restricciones Técnicas/Legales, Contexto & Alcance (Negocio y Técnico), Estrategia de Solución.
* **Sec 5 a 7:** Vista de Bloques de Construcción (C4 Niveles 1-3), Vista de Ejecución (Runtime/Secuencias) y Vista de Despliegue (Infraestructura).
* **Sec 8 a 12:** Conceptos Transversales (Seguridad, Caching, Logs), Decisiones de Arquitectura (ADRs), Requerimientos de Calidad (ATAM), Riesgos/Deuda Técnica y Glosario.

---

## 📐 3. Modelado Visual C4 y Diagramas como Código (Mermaid.js)
* **Nivel 1 (Contexto de Sistema):** Muestra actores y sistemas externos vinculados.
* **Nivel 2 (Contenedores):** Aplicaciones desplegables (Frontend SPA, Backend API, Base de Datos, Reverse Proxy, Schedulers).
* **Nivel 3 (Componentes):** Desglose interno de controladores, middlewares, servicios y modelos Sequelize.
* **Nivel 4 (Código / Entidades):** Diagramas ER de bases de datos y máquinas de estados.
* **Regla estricta:** Toda caja debe indicar **Nombre**, **Tipo/Tecnología** y **Responsabilidad**. Toda flecha debe indicar **Verbo de acción** y **Protocolo** (`[HTTPS / JSON]`).

---

## 📜 4. Registros de Decisiones de Arquitectura (ADR - Formato MADR)
Toda decisión de alto impacto (elección de base de datos, motor de renderizado, pasarelas de pago, esquemas de autenticación) debe registrarse formalmente documentando:
* Estado (Propuesto, Aceptado, Deprecado, Reemplazado).
* Contexto y Fuerzas Impulsoras (*Decision Drivers*).
* Opciones Consideradas con Pros (+) y Contras (-).
* Resultado de la Decisión y Justificación.
* Consecuencias Positivas, Negativas y Neutras.

---

## ✍️ 5. Guía de Estilo Editorial (Microsoft & Google Developer Style Guide)
* **Encabezados en Sentence-Case:** Usar mayúscula solo en la primera palabra y nombres propios. **Prohibido** colocar punto final o dos puntos en encabezados (`## 1.1 Configuración de base de datos` -> correcto).
* **Voz Activa:** El sujeto ejecuta la acción (`El servicio valida el token` en lugar de `El token es validado por el servicio`).
* **Tiempo Presente:** Describir el comportamiento del sistema en presente, no en futuro.
* **Modo Imperativo:** Pasos e instructivos redactados como verbos de acción directa (`1. Abre el panel... 2. Ingresa la clave...`).
* **Alertas Estandarizadas:** `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]`.
* **Enlaces Descriptivos:** Describir siempre el destino del hipervínculo (nunca usar "haz clic aquí" ni URLs crudas).
