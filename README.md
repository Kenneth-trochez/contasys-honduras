# ContaSys Honduras

Sistema contable web para PYMES. Proyecto universitario de UNICAH.

## Tecnologías

- Node.js
- TypeScript
- Express
- Sequelize
- MySQL
- React
- Vite
- GitHub
- ClickUp

## Estructura del proyecto

```text
backend/     API y lógica del servidor
frontend/    Interfaz web
docs/        Documentación y evidencia del proyecto
.github/     Configuración de Pull Requests

## Requisitos

Node.js LTS
MySQL 8
Git

## Instalación
1. Clonar el repositorio
git clone https://github.com/Kenneth-trochez/contasys-honduras.git
cd contasys-honduras

2. Backend
cd backend

Copiar .env.example como .env y completar los datos de conexión a MySQL.

Luego instalar las dependencias:

npm install

El backend está escrito en TypeScript (modo estricto). El código fuente está en `backend/src` (archivos `.ts`) y se compila a `backend/dist`.

Para iniciar el servidor en desarrollo (se reinicia solo al guardar):

npm run dev

Otros comandos:

npm run typecheck   # revisa los tipos sin generar archivos
npm run build       # compila TypeScript a dist/
npm start           # ejecuta la versión compilada (dist/server.js)
npm run db:migrate  # compila y ejecuta las migraciones de dist/migrations

3. Frontend

Desde la raíz del proyecto:

cd frontend

Copiar .env.example como .env.

Instalar las dependencias:

npm install

Iniciar el proyecto:

npm run dev
Flujo de trabajo

El proyecto utiliza Git Flow simplificado:

feature/HU-XX-nombre
        ↓
Pull Request
        ↓
develop
        ↓
Pull Request
        ↓
main


## Ramas

main: versión estable del proyecto.
develop: integración del trabajo del equipo.
feature/HU-XX-nombre: rama individual para cada historia o tarea.

No se debe hacer push directamente a main ni a develop.

Convención de commits

Los commits deben ser claros, estar en español y relacionarse con la historia correspondiente.

Ejemplo:

feat(cuentas): agregar creación de cuentas (HU-04)
Seguridad

No subir archivos .env, contraseñas, claves privadas ni otros datos sensibles al repositorio.

Utilizar los archivos .env.example como referencia para configurar el entorno local.

Equipo
Edar Castillo — Product Owner
Kenneth Troches — Scrum Master
Henry Viera
Alex Flores
Erik Mencina
Oscar Sanches
Erik Martinez