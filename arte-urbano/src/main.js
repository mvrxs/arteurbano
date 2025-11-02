import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import icon2x from 'leaflet/dist/images/marker-icon-2x.png'
import icon   from 'leaflet/dist/images/marker-icon.png'
import shadow from 'leaflet/dist/images/marker-shadow.png'

const markerIcon = L.icon({
    iconUrl: icon,
    iconRetinaUrl: icon2x,
    shadowUrl: shadow,
    iconSize: [25,41],
    iconAnchor: [12,41],
    popupAnchor: [1,-34],
    shadowSize: [41,41],
})

// Barcelona como mapa base
const map = L.map('map').setView([41.387, 2.170], 13)

// Interfaz Carto asi evito problemas
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

// Loguea tiles que fallan
map.on('tileerror', (e) => {
    console.warn('Tile error:', e.tile.src)
})

// llamada al json de las chinchetas
async function cargarPOIs() {
    try {
        const res = await fetch('/marcadores.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const pois = await res.json();

        pois.forEach(p => {
            L.marker([p.lat, p.lng]).addTo(map).bindPopup(p.html);
        });

        // (Opcional) ajustar el mapa a todos los puntos
        const bounds = L.latLngBounds(pois.map(p => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [30, 30] });

    } catch (err) {
        console.error('Error cargando pois.json:', err);
    }
}

cargarPOIs();

///////// Marcadores
///////L.marker([41.387, 2.170], { icon: markerIcon })
///////    .addTo(map)
///////    .bindPopup('<b>Arte urbano en BCN</b><br>Escultura contemporánea interactiva.')
///////
///////L.marker([41.424, 2.192], { icon: markerIcon })
///////    .addTo(map)
///////    .bindPopup('<b>B-Murals Arte</b>')



map.attributionControl.setPrefix(false)
map.attributionControl.addAttribution('Cultura digital PEC 2 – Marcos Díaz Simón')