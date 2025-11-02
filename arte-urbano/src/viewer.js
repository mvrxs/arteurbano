import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader }   from 'three/examples/jsm/loaders/GLTFLoader.js';

window.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById('app');
    if (!app) {
        console.error("No se encontró el contenedor #app en el DOM");
        return;
    }

    main().catch(err => {
        console.error(err);
        app.innerHTML = `<div style="color:#fff;padding:16px;font:14px system-ui">
      Error cargando el visor.
    </div>`;
    });

    async function main() {
        const params = new URLSearchParams(location.search);
        const slug = params.get('slug');

        const cfg = await fetch('/3dmodels.json').then(r => r.json());
        const item = cfg.find(x => x.slug === slug);

        if (!item) {
            app.innerHTML = `<div style="color:#fff;padding:16px;font:14px system-ui">
        Modelo no encontrado para <b>${slug ?? '(sin slug)'}</b>
      </div>`;
            return;
        }

    // Escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(item.env?.background ?? '#000');

    // Cámara
    const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
    camera.position.fromArray(item.camera?.pos ?? [2, 1.5, 2]);

    // Render
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMappingExposure = item.env?.exposure ?? 1.0;
    renderer.setSize(innerWidth, innerHeight);
    app.appendChild(renderer.domElement);

    // Controles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.fromArray(item.camera?.lookAt ?? [0, 0, 0]);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.update();

    // Luces
    scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 1.0));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(3, 4, 2);
    scene.add(dir);

    // Contenido
    if (item.model) {
        // Carga GLB/GLTF
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(item.model);
        const model = gltf.scene;
        const s = item.transform?.scale ?? 1;
        model.scale.setScalar(s);
        if (item.transform?.rotation) {
            const [rx, ry, rz] = item.transform.rotation;
            model.rotation.set(rx, ry, rz);
        }
        scene.add(model);
    } else {
        // Demo sin modelo: cubo
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshStandardMaterial({ color: 0x5da9ff, roughness: 0.35, metalness: 0.1 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.set(...(item.transform?.rotation ?? [0, 0, 0]));
        scene.add(mesh);
    }

    // Responsive
    addEventListener('resize', () => {
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(innerWidth, innerHeight);
    });

    // Loop
    renderer.setAnimationLoop(() => {
        controls.update();
        renderer.render(scene, camera);
    });
}

main().catch(err => {
    console.error(err);
    const app = document.getElementById('app');
    app.innerHTML = `<div style="color:#fff;padding:16px;font:14px system-ui">Error cargando el visor.</div>`;
});
});