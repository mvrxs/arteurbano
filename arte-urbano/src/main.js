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
const map = L.map('map').setView([41.387, 2.170], 13);

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

// ATRIBUCIÓN FOOTER
map.attributionControl.setPrefix(false);
map.attributionControl.addAttribution('Cultura digital PEC 2 – Marcos Díaz Simón');