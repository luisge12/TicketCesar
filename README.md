# Ticket Cesar

Sistema de venta de entradas y gestión de eventos para el Teatro César.

## Estructura del proyecto

```
TicketCesarProduccion/
├── Back/          # API REST (Node.js + Express)
├── Front/         # Frontend (React + Vite)
└── README.md
```

## Requisitos

- Node.js 18+
- PostgreSQL
- npm o pnpm

## Configuración

### Backend

1. Entra a la carpeta Back:
   ```bash
   cd Back
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` a partir del ejemplo:
   ```bash
   cp .env.example .env
   ```

4. Edita `.env` con tus credenciales de base de datos y `JWT_SECRET`.

5. Inicia el servidor:
   ```bash
   npm run dev
   ```

El backend estará en `http://localhost:3000`.

### Frontend

1. Entra a la carpeta Front:
   ```bash
   cd Front
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. (Opcional) Crea `.env` para configurar la URL del API:
   ```bash
   cp .env.example .env
   ```
   Por defecto usa `http://localhost:3000` si no defines `VITE_API_URL`.

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

El frontend estará en `http://localhost:5173`.

## Variables de entorno

### Backend (Back/.env)

| Variable   | Descripción                |
|-----------|----------------------------|
| PORT      | Puerto del servidor        |
| HOST      | Host del servidor          |
| JWT_SECRET| Clave para firmar tokens   |
| DB_USER   | Usuario de PostgreSQL      |
| DB_HOST   | Host de la base de datos   |
| DB_DATABASE | Nombre de la base       |
| DB_PASSWORD | Contraseña de la base   |
| DB_PORT   | Puerto de PostgreSQL       |

### Frontend (Front/.env)

| Variable     | Descripción                    |
|-------------|--------------------------------|
| VITE_API_URL| URL del backend (ej. http://localhost:3000) |

## Base de datos

Se asume que existe PostgreSQL con las tablas necesarias: `users`, `event`, `articles`, `event_seats`, `reservations`, etc. Configura las migraciones o scripts de inicialización según tu entorno.

## Scripts

- **Back**: `npm run dev` inicia el servidor
- **Front**: `npm run dev` inicia Vite, `npm run build` genera la build de producción
