# ContaSys Honduras

Sistema contable web para PYMES. Proyecto universitario de UNICAH.

## Tecnologías

- Node.js
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

Las migraciones y seeders se ejecutarán cuando el backend esté implementado:

npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

Para iniciar el servidor:

npm run dev

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