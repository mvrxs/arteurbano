// src/main.js
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// IMPORTS LEAFLET
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.imagePath = '';

L.Icon.Default.mergeOptions({
    iconUrl: markerIconUrl,
    iconRetinaUrl: markerIconRetinaUrl,
    shadowUrl: markerShadowUrl,
});

// CONSTANTES OVERLAY
const overlay  = document.getElementById('viewer-overlay');
const frame    = document.getElementById('viewer-frame');
const btnClose = document.getElementById('viewer-close');

// BASE URL (para Vercel / subcarpetas)
const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

// MAPA BASE

// FUNCIONES DEL OVERLAY
function openViewer(slug) {
    frame.src = `${base}/viewer.html?slug=${encodeURIComponent(slug)}`;
    overlay.style.display = 'block';
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
}

function closeViewer() {
    overlay.style.display = 'none';
    frame.src = 'about:blank'; // limpia iframe
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
}

btnClose.addEventListener('click', closeViewer);

// cerrar al clicar fuera del iframe
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeViewer();
});

// Delegación de eventos: captura clicks en los botones dentro de popups
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-3d');
    if (!btn) return;
    e.preventDefault();
    const slug = btn.getAttribute('data-slug');
    openViewer(slug);
});

// MAPA BASE
// MAPA BASE
// MAPA BASE
const map = L.map('map').setView([41.3851, 2.1734], 13);
// TEMA CARTO DEL MAPA
const capasBase = {
    Claro: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        attribution: '© OpenStreetMap, © CARTO',
        errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBA==',
    }),
    Oscuro: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        attribution: '© OpenStreetMap, © CARTO',
        errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBA==',
    }),
};

capasBase['Claro'].addTo(map);
L.control.layers(capasBase).addTo(map);

// CONTROL DE TILES FALLIDOS
map.on('tileerror', (e) => {
    console.warn('Tile error:', e.tile.src);
});

// LLAMADA A LOS MARCADORES
// OJO: marcadores.json debe estar en /public/marcadores.json
fetch('/marcadores.json')
    .then((r) => r.json())
    .then((puntos) => {
        puntos.forEach((p) => {
            const popupHTML = `
        <div class="popup">
          ${p.html}
          <div style="margin-top:8px;">
            <button class="btn-3d" data-slug="${p.slug}"
              style="display:inline-block;padding:6px 10px;border-radius:6px;
                     text-decoration:none;border:1px solid #444;background:#111;
                     color:#fff;cursor:pointer">
              Ver modelo 3D
            </button>
          </div>
        </div>`;
            L.marker([p.lat, p.lng]).addTo(map).bindPopup(popupHTML);
        });
    });



// --- Toasts Manovich ---

const manovichToast   = document.getElementById('manovich-toast');
const manovichTitle   = manovichToast?.querySelector('.manovich-toast-title');
const manovichBody    = manovichToast?.querySelector('.manovich-toast-body');
const manovichClose   = manovichToast?.querySelector('.manovich-toast-close');
const manovichButtons = document.querySelectorAll('.manovich-btn');

let manovichTimer = null;

// Mensajes de Manovich
const MANOVICH_MESSAGES = {
    gafas: {
        title: 'Las gafas de Manovich',
        body: `Antes el acceso al patrimonio se hacía con visitas físicas y guías en papel.
En esta web, el software remedia esa experiencia: usa mapas digitales,
datos y modelos 3D para transformar cómo exploramos las obras, siguiendo
los principios de los nuevos medios de Manovich (modularidad, variabilidad,
automatización y transcodificación).`
    },
    remediacion: {
        title: '¿Qué es la Remediación?',
        body: `La remediación significa que un medio se apropia de otro.
Esta web digital remedia la experiencia tradicional de visitar la ciudad: transforma el recorrido físico,
las guías turísticas impresas y la observación directa en una exploración digital interactiva mediante mapa,
popups y modelos 3D.`
    },
    num: {
        title: 'Principio: Representación Numérica',
        body: `Todo lo que ves aquí está representado como datos digitales.
Las obras, coordenadas, imágenes y modelos 3D existen en forma de números,
lo que permite manipularlos, moverlos, mostrar detalles o cambiar su escala mediante software.`
    },
    modularidad: {
        title: 'Principio: Modularidad',
        body: `Esta experiencia está construida por módulos independientes.
El mapa, los marcadores, los textos, los modelos 3D y los popups funcionan como bloques separados que se combinan.
Este enfoque modular es esencial en los nuevos medios según Manovich.`
    },
    automatizacion: {
        title: 'Principio: Automatización',
        body: `El software realiza tareas que antes dependían del usuario.
Leaflet calcula las posiciones en el mapa, Three.js renderiza automáticamente los modelos 3D,
y la interfaz genera información en tiempo real sin intervención humana directa.`
    },
    variabilidad: {
        title: 'Principio: Variabilidad',
        body: `Cada usuario vive una experiencia diferente.
El recorrido depende de tus clics, de qué obras selecciones y de cómo navegues el mapa.
No hay una ruta fija: la interfaz genera múltiples versiones posibles de la experiencia.`
    },
    transcodificacion: {
        title: 'Principio: Transcodificación',
        body: `Lo cultural se convierte en computacional.
Las obras físicas se traducen a coordenadas, modelos 3D, imágenes y código.
El significado cultural original convive con una nueva estructura basada en datos y algoritmos.`
    },
    metamedio: {
        title: '¿Qué es un metamedio?',
        body: `El ordenador combina múltiples medios en uno solo.
En esta misma interfaz se mezclan fotografía, geolocalización, texto, datos, hipertexto, 3D y animación:
esto convierte al ordenador en un metamedio, como describen Kay y Manovich.`
    },
    interfaz: {
        title: 'La interfaz cultural',
        body: `El mapa es una interfaz cultural.
Decide qué vemos, cómo lo exploramos y qué información recibimos.
Organiza la experiencia visual y cognitiva del usuario, transformando la ciudad en un sistema navegable.`
    }
};

function showManovichToast(key) {
    if (!manovichToast || !manovichTitle || !manovichBody) return;

    const msg = MANOVICH_MESSAGES[key];
    if (!msg) return;

    manovichTitle.textContent = msg.title;
    manovichBody.textContent  = msg.body;

    manovichToast.classList.add('is-visible');
    manovichToast.setAttribute('aria-hidden', 'false');

    if (manovichTimer) clearTimeout(manovichTimer);
    manovichTimer = setTimeout(hideManovichToast, 12000); // 12s
}

function hideManovichToast() {
    if (!manovichToast) return;
    manovichToast.classList.remove('is-visible');
    manovichToast.setAttribute('aria-hidden', 'true');
}

manovichButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const key = btn.dataset.toast;
        showManovichToast(key);
    });
});

manovichClose?.addEventListener('click', (e) => {
    e.preventDefault();
    hideManovichToast();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideManovichToast();
});

// ATRIBUCIÓN FOOTER
map.attributionControl.setPrefix(false);
map.attributionControl.addAttribution('Cultura digital PEC 2 – Marcos Díaz Simón');