import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconUrl,
    iconRetinaUrl,
    shadowUrl
});

// CONSTANTES
const overlay   = document.getElementById('viewer-overlay');
const frame     = document.getElementById('viewer-frame');
const btnClose  = document.getElementById('viewer-close');
const markerIcon = L.icon({
    iconUrl: icon,
    iconRetinaUrl: icon2x,
    shadowUrl: shadow,
    iconSize: [25,41],
    iconAnchor: [12,41],
    popupAnchor: [1,-34],
    shadowSize: [41,41],
})


//FUNCIONES DEL OVERLAY
function openViewer(slug) {
    // Carga el visor existente dentro del iframe
    frame.src = `/viewer.html?slug=${encodeURIComponent(slug)}`;
    overlay.style.display = 'block';
    // (opcional) congelar interacciones del mapa mientras está abierto
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
}
function closeViewer() {
    overlay.style.display = 'none';
    // limpia el iframe para liberar GPU
    frame.src = 'about:blank';
    // reactivar mapa
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
const map = L.map('map').setView([41.387, 2.170], 13)

// TEMA CARTO DEL MAPA
const capasBase = {
    'Claro': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        attribution: '© OpenStreetMap, © CARTO',
        errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBA==' // tile transparente
    }),
    'Oscuro': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        attribution: '© OpenStreetMap, © CARTO',
        errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBA=='
    }),
}

capasBase['Claro'].addTo(map)
L.control.layers(capasBase).addTo(map)

// CONTROL DE MARCADORES FALLIDOS
map.on('tileerror', (e) => {
    console.warn('Tile error:', e.tile.src)
})

// LLAMADA A LOS MARCADORES CON THREE
const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

fetch(`${base}/marcadores.json`)
    .then(r => r.json())
    .then(puntos => {
        puntos.forEach(p => {
            const popupHTML = `
        <div class="popup">
          ${p.html}
          <div style="margin-top:8px;">
            <button class="btn-3d" data-slug="${p.slug}"
              style="display:inline-block;padding:6px 10px;border-radius:6px;text-decoration:none;border:1px solid #444;background:#111;color:#fff;cursor:pointer">
              Ver modelo 3D
            </button>
          </div>
        </div>`;
            L.marker([p.lat, p.lng]).addTo(map).bindPopup(popupHTML);
        });
    });

map.on('popupopen', (e) => {
    const root = e.popup._contentNode;
    const btn = root.querySelector('.btn-3d');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const slug = btn.dataset.slug;
        //window.open(`${base}/viewer.html?slug=${encodeURIComponent(slug)}`, '_blank', 'noopener');
    }, { once: true });
});



//ATRIBUCION FOOTER MAPA
map.attributionControl.setPrefix(false)
map.attributionControl.addAttribution('Cultura digital PEC 2 – Marcos Díaz Simón')