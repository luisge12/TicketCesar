# Documentación de la Arquitectura - TicketCesar

Este documento describe la estructura organizativa y la función de cada archivo clave en el proyecto tras la reciente refactorización. El ecosistema está dividido en dos partes principales: **Backend** (Node.js/Express) y **Frontend** (React.js/Vite).

---

## 🛠 Backend (`Back/`)
El backend está construido con **Express.js** y se encarga de exponer la API REST, conectar con la base de datos MySQL, gestionar la autenticación y administrar roles. Todo el código fuente reside en `Back/src/`.

### Raíz del Backend
- **`package.json`**: Define las dependencias del servidor (express, jsonwebtoken, mysql2, zod, nodemailer, etc.) y los scripts de ejecución (`npm run dev`, `npm start`).
- **`.env`**: Archivo de variables de entorno (Oculto). Contiene credenciales de DB, SMTP (para correos), claves JWT, y pueros.
- **`src/server.js`**: El punto de entrada principal del servidor. Configura los middlewares globales (CORS, parsers), importa e inicializa todas las rutas, y finalmente monta el `errorHandler`. Inicia la escucha de peticiones HTTP.

### Directorios en `src/`

#### 📁 `config/`
- **`index.js`**: Carga y exporta las variables de entorno para que el resto de la aplicación las utilice de manera centralizada en lugar de invocar `process.env` en todos lados.

#### 📁 `models/` (Conexiones de Base de Datos)
Clases encargadas de encapsular toda la lógica de consultas a la base de datos utilizando `mysql2/promise`.
- **`User.js`**: Funciones para el registro, inicio de sesión, recuperación de contraseñas y obtención de roles de usuarios.
- **`Event.js`**: Consultas relacionadas con los eventos y su programación mensual. Inserción, actualización y borrado de los mismos, además del manejo del estado de los asientos.
- **`Blog.js`**: Operaciones CRUD (Crear, Leer, Actualizar, Borrar) para los artículos de prensa/blog.
- **`Reservation.js`**: Lógica transaccional para crear o asentar las reservaciones (asignación de sillas e historial de compra).

#### 📁 `routes/` (Controladores y Enrutadores)
Definición de los endpoints de la API (`/api/...`). Estos archivos enlazan las peticiones que llegan con la ejecución en la base de datos (Models).
- **`users.js`**: Endpoints para registro (`/register`), login (`/login`), verificación de correo y recuperación de clave.
- **`events.js`**: Endpoints para crear eventos, editarlos, obtener eventos filtrados y manejar el cronograma/programación.
- **`blog.js`**: Rutas para leer un artículo, la lista completa y métodos de administración para crear/borrar un artículo.
- **`reservations.js`**: Endpoint de creación de reservaciones (`/reservations`) que bloquea las sillas del evento pertinente.

#### 📁 `middleware/` (Interceptores de Solicitudes)
Funciones que se ejecutan antes de que la petición llegue al manejador final.
- **`auth.js`**: Verifica los web tokens (`JWT`). Expone funciones como `requireAuth` para usuarios logueados y `requireAdmin` para permisos especiales.
- **`validate.js`**: Middleware dinámico para validar los cuerpos de las peticiones HTTP antes de enviarlas al enrutador (trabaja en conjunto con la carpeta `validators`).
- **`errorHandler.js`**: Último eslabón del ciclo de vida express. Captura cualquier error asíncrono y devuelve una respuesta de Error 500/400 unificada en formato JSON.

#### 📁 `validators/` (Esquemas Zod)
- **`userValidator.js`**: Define los requisitos exactos de seguridad de información para usuarios (correos válidos, minímo 6 caracteres para password, etc).
- **`eventValidator.js`**: Reglas de validación precisas para creación de eventos y programación (validar horas, fechas y longitud de textos).

#### 📁 `services/`
- **`mailService.js`**: Configuración de `nodemailer`. Aloja funciones que disparan correos electrónicos con tokens de validación y restablecimiento de contraseñas.

---

## 🎨 Frontend (`Front/`)
Construido con React, hace las veces de "cliente". Se comunica con la API mediante fetch sobre rutas expuestas. Todo su código fuente reside en `Front/src/`.

### Raíz del Frontend
- **`package.json`**: Dependencias UI (react, react-router-dom, react-modal, etc.) y scripts de Webpack/Vite.
- **`index.html`**: Archivo HTML único en donde React inserta o inyecta toda su interfaz en el nodo `<div id="root">`.
- **`src/main.jsx`**: Fichero maestro. Enlaza React con el DOM y envuelve toda la aplicación dentro del estado global de inicio de sesión (`AuthProvider`).
- **`src/App.jsx`**: Contiene la definición y el enrutamiento de la aplicación (`<Routes>`), decidiendo qué página renderizar dependiendo de la URL (ej. `/blog`, `/insertEvent`).
- **`src/config.js`**: Un simple archivo configurativo que exporta globalmente la constante de puerto de la API (`API_URL = localhost:4000`).

### Directorios en `src/`

#### 📁 `context/`
- **`AuthContext.jsx`**: Alberga un estado global con contexto de React. Mantiene en memoria si el usuario actual está validado, sus detalles (nombre, correo) y rol (admin/client).

#### 📁 `hooks/`
- **`useNavData.js`**: Hook personalizado (Custom Hook). Abstrae toda la lógica compleja de petición de categorías, eventos y búsquedas para que componentes como el `Header` se mantengan "limpios" en su código visual.

#### 📁 `components/` (Componentes reutilizables UI)
Pequeñas piezas visuales que pueden aparecer en varios lugares de la web a la vez.
- **`Header.jsx`**: La barra de navegación principal con buscador, lista dinámica de eventos y menús.
- **`Footer.jsx`**: Pie de página estático con redes sociales y la marca.
- **`Modal-login.jsx`**: Formulario popup (ventana emergente) que permite hacer registro, login o solicitar el reseteo de clave.
- **`AdminBar.jsx`**: Componente condicional que le muestra botones de acción superior únicamente a administradores.
- **`PaymentModal.jsx`**: Interfaz auxiliar que recolecta detalles de pago antes de asentar boletos.

#### 📁 `pages/` (Páginas Completas o Vistas)
Estos archivos corresponden a cada uno de las "pantallas completas" a las que viajas en el front.
- **`MainPage.jsx`**: Carrusel de imágenes e inicio estándar con un listado resumen de eventos y artículos nuevos.
- **`Blog.jsx` & `BlogArticle.jsx`**: Panel principal para filtrar artículos de prensa, y panel de lectura individual de un único artículo.
- **`InsertEvent.jsx`, `EditEvent.jsx`, `InsertArticle.jsx`, `EditArticle.jsx`, `InsertProgramacion.jsx`**: Multiples formularios blindados administrativamente donde se inyecta o gestiona información hacia las bases de datos. Usan ImgBB para depositar las imágenes y traen alertas/límites de extracto visualizados desde Zod.
- **`ReservEvent.jsx` & `BuyTickets.jsx`**: Flujo de reserva visual del teatro donde se compran los asientos exactos.
- **`UserProfile.jsx`**: Vista de área personal del usuario autenticado que muestra su nombre y (potencialmente) compras o códigos QR previos.

#### 📁 `assets/` y `styles/`
- **`assets/`**: Guardado de imágenes permanentes locales (.webp, logotipos e iconografía pesada).
- **`styles/`**: Diferentes hojas de estilos en CSS modular. Un fichero por cada contexto o página: `header.css`, `login.css`, `blog.css`, etc.
