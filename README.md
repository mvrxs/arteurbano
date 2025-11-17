<!-- Banner principal -->
<p align="center">
  <img src="https://img.shields.io/badge/Barcelona%20AR%20Art-Exploración%20Cultural-blueviolet?style=for-the-badge" />
</p>

<h1 align="center">🗺️ Barcelona AR Art</h1>
<p align="center">Mapa interactivo · Modelos 3D · Cultura digital y remediación</p>

<p align="center">
  <img src="https://img.shields.io/badge/Leaflet-Interactive%20Maps-199900?style=flat-square&logo=leaflet" />
  <img src="https://img.shields.io/badge/Three.js-3D%20Rendering-black?style=flat-square&logo=three.js" />
  <img src="https://img.shields.io/badge/Vercel-Hosting-black?style=flat-square&logo=vercel" />
  <img src="https://img.shields.io/badge/HTML-5-orange?style=flat-square&logo=html5" />
  <img src="https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-yellow?style=flat-square&logo=creativecommons" />
</p>

---

## 🎨 ¿Qué es *Barcelona AR Art*?

**Barcelona AR Art** es un proyecto interactivo que reinterpreta las guías turísticas tradicionales mediante tecnologías modernas como mapas dinámicos y la visualización 3D.

El usuario puede:

- Explorar Barcelona desde un mapa interactivo.  
- Hacer clic en chinchetas para descubrir información cultural.  
- Ver **modelos 3D** de obras o elementos artísticos en tiempo real.  
- Leer atribuciones de los recursos utilizados.  

Todo se ha desarrollado siguiendo los principios de **remediación y transcodificación** de Lev Manovich.

---

## 🌐 Demo en línea

<p align="center">
  <a href="https://urbano-lime.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Ir%20a%20la%20Demo-000?style=for-the-badge&logo=vercel&logoColor=white"/>
  </a>
</p>

---

## ✨ Características principales

### 🗺️ Mapa interactivo con Leaflet  
Exploración directa mediante un mapa dinámico y responsivo.

### 🧭 Información cultural inmediata  
Cada chincheta abre un panel contextual con detalles del lugar y la obra.

### 🎭 Visualización 3D integrada  
Modelos GLTF/GLB cargados con **Three.js** dentro de la misma interfaz.

### 📦 Datos en JSON  
Todo está modularizado:  
- `markers.json` para las chinchetas  
- `models.json` para las piezas 3D  
- Cada recurso incluye su licencia CC

### 📱 Responsive y ligero  
Diseñado para funcionar tanto en dispositivos móviles como en escritorio.

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|-----------|-----|
| **Leaflet** | Mapa interactivo |
| **Three.js** | Visualización 3D |
| **JavaScript** | Lógica del proyecto |
| **HTML/CSS** | Estructura y estilo |
| **Vercel** | Hosting del proyecto |
| **Creative Commons** | Licencias de recursos |

---

## 📁 Estructura del proyecto
arte-urbano/
│
├── dist/                     # Archivos generados por Vite (deploy)
│
├── node_modules/            # Dependencias del proyecto
│
├── public/
│   ├── 3dmodels/            # Carpetas por obra/artista con modelos .glb/.gltf
│   │   ├── besada/
│   │   ├── besos/
│   │   ├── centre-fabra/
│   │   ├── clot/
│   │   ├── fabra-i-coats/
│   │   ├── la-escocesa/
│   │   ├── macba/
│   │   ├── nau-bostik/
│   │   ├── pla-armengol/
│   │   ├── poblenou-open-w/
│   │   ├── skate-agora/
│   │   └── tres-xemeneies/
│   │
│   ├── leaflet/             # Iconos del mapa (Leaflet)
│   │
│   ├── 3dmodels.json        # Mapeo de piezas 3D y sus licencias
│   └── marcadores.json      # Chinchetas, posiciones e info
│
├── src/
│   ├── main.js              # Lógica principal (mapa, interacciones)
│   ├── viewer.js            # Visor 3D con Three.js
│   ├── style.css            # Estilos principales de la web
│   ├── javascript.svg       # Icono decorativo
│   └── counter.js           # Script auxiliar
│
├── index.html               # Página principal (mapa interactivo)
├── viewer.html              # Página del visor 3D
│
├── package.json             # Dependencias y scripts
├── package-lock.json        # Bloqueo de dependencias
├── vite.config.js           # Configuración de Vite
└── .gitignore               # Archivos ignorados por Git

---

## ✨ Características principales

### 🗺️ **1. Mapa interactivo con Leaflet**  
- Marcadores cargados dinámicamente  
- Popups limpios y accesibles  
- Diseño minimalista tipo app cultural

### 🎭 **2. Exploración 3D con Three.js**  
Cada obra:

- Se renderiza en tiempo real  
- Puede rotarse, examinarse y manipularse  
- Muestra su licencia Creative Commons correspondiente  

### 📦 **3. Datos modulares (JSON)**

Tu proyecto está perfectamente modularizado:

| Archivo | Función |
|--------|---------|
| `marcadores.json` | Chinchetas: título, ubicación, descripción |
| `3dmodels.json` | Modelos 3D + autor + licencia + ruta GLB |
| Carpetas en `3dmodels/` | Cada obra contiene sus archivos 3D |

### ⚡ **4. Vite para desarrollo rápido**  
- Hot reload  
- Build optimizado  
- Preparado para Vercel sin configuración adicional

---

## 🛠️ Instalación y ejecución

### ➤ 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/arteurbano.git
cd arteurbano
