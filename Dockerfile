# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copia los archivos de dependencias (ajusta si usas yarn)
COPY package*.json ./
RUN npm install

# Copia todo el código fuente
COPY . ./

# Construye el proyecto (ajusta si no es `build`)
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copia los archivos generados al servidor nginx
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
