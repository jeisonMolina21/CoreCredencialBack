# Multi-stage lightweight Dockerfile para producción
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache tzdata
ENV TZ=America/Bogota

# Etapa 1: Instalación de dependencias de producción
FROM base AS dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Etapa 2: Imagen final optimizada y segura
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copiar dependencias limpias
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Crear carpeta de uploads con permisos adecuados
RUN mkdir -p /app/uploads && chown -R node:node /app

# Ejecutar como usuario sin privilegios root
USER node

EXPOSE 4000

CMD ["node", "src/server.js"]
