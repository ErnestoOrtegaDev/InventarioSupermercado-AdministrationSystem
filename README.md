# 📦 StockMaster

![Estado](https://img.shields.io/badge/Estado-En_Desarrollo-green)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-success?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)

**StockMaster** es un sistema profesional de gestión de inventarios multi-sucursal diseñado para optimizar el control de productos, auditar movimientos y prevenir el desabastecimiento mediante alertas en tiempo real.

---

## 🚀 Características Principales

* **Gestión Multi-Sucursal:** Control de inventario independiente para diferentes locaciones o sucursales de supermercados, administrables desde una sola interfaz.
* **Auditoría y Kardex (Historial de Movimientos):** Registro inmutable y automático de cada entrada (`IN`), salida (`OUT`) o ajuste (`ADJUST`) de mercancía para evitar mermas fantasma y tener un control estricto del almacén.
* **Alertas de Stock Crítico:** Sistema de notificaciones en tiempo real que avisa a los administradores cuando un producto alcanza su límite mínimo de inventario.
* **Dashboard Dinámico:** Panel de control con métricas clave, productos en reabastecimiento urgente y valor total del inventario.
* **Soft Delete:** Eliminación lógica de productos para mantener la integridad referencial del historial contable.

---

## 🛠️ Stack Tecnológico

El proyecto está dividido en dos aplicaciones principales utilizando el stack MERN (con algunas mejoras modernas):

### Frontend (`/client`)
* **Core:** React.js con Vite
* **Lenguaje:** TypeScript
* **Gestor de Estado:** Zustand
* **Estilos y UI:** Tailwind CSS, Headless UI, Heroicons
* **Peticiones HTTP:** Axios con interceptores

### Backend (`/server`)
* **Core:** Node.js con Express.js
* **Lenguaje:** TypeScript
* **Base de Datos:** MongoDB con Mongoose (ODM)
* **Arquitectura:** Patrón MVC (Model-View-Controller)

---

## 📂 Estructura del Proyecto

Este repositorio contiene tanto el código del cliente como el del servidor, separados en sus respectivos directorios para mantener una arquitectura limpia y modular:

```text
/
├── server/                 # API RESTful, Modelos y Controladores
│   ├── src/
│   │   ├── config/         # Conexión a Base de Datos
│   │   ├── controllers/    # Lógica de negocio (Products, Movements, etc.)
│   │   ├── middleware/     # Middlewares (Autenticación, Manejo de errores)
│   │   ├── models/         # Esquemas de Mongoose
│   │   ├── routes/         # Endpoints de la API
│   │   ├── utils/          # Helpers globales (ej. kardexLogger)
│   │   └── index.ts        # Archivo principal de entrada de Express
│   └── README.md           # Documentación específica del backend
│
├── client/                 # Interfaz de Usuario (SPA)
│   ├── src/
│   │   ├── api/            # Configuración de Axios
│   │   ├── components/     # Componentes UI modulares (inventory, layout, supermarkets, users)
│   │   ├── pages/          # Vistas principales de enrutamiento
│   │   ├── store/          # Estado global con Zustand
│   │   ├── types/          # Interfaces y tipos de TypeScript
│   │   └── App.tsx         # Enrutador y configuración raíz
│   └── README.md           # Documentación específica del frontend
│
└── README.md               # Documentación global (Este archivo)
