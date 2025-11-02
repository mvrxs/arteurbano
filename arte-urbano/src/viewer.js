import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader }   from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader }  from 'three/examples/jsm/loaders/DRACOLoader.js';

window.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    if (!app) {
        console.error('No se encontró #app');
        return;
    }

    // encuadrar camara al objeto
    function fitCameraToObject(camera, controls, object, { padding = 1.25, yAlign = 'center' } = {}) {
        const box = new THREE.Box3().setFromObject(object);
        const sphere = box.getBoundingSphere(new THREE.Sphere());
        const target = sphere.center.clone();

        if (yAlign === 'base') target.y = box.min.y; // mejor para murales/piezas “de pie”

        const fov = THREE.MathUtils.degToRad(camera.fov);
        const dist = (sphere.radius * padding) / Math.sin(fov / 2);

        camera.position.set(target.x + dist, target.y + sphere.radius * 0.5, target.z + dist);
        camera.near = Math.max(0.01, sphere.radius * 0.01);
        camera.far  = Math.max(100,   sphere.radius * 100);
        camera.updateProjectionMatrix();

        controls.target.copy(target);
        controls.minDistance = sphere.radius * 0.5;
        controls.maxDistance = sphere.radius * 10;
        controls.update();
    }

    main().catch(err => {
        console.error(err);
        app.innerHTML = `<div style="color:#fff;padding:16px;font:14px system-ui">Error cargando el visor.</div>`;
    });

    async function main() {
        const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

        // slug desde query
        const params = new URLSearchParams(location.search);
        const slug = params.get('slug');
        if (!slug) {
            app.innerHTML = `<div style="color:#fff;padding:16px;font:14px system-ui">Falta el parámetro <b>slug</b>.</div>`;
            return;
        }

        // catálogo
        const modelsUrl = `${base}/3dmodels.json`;
        const cfgResp = await fetch(modelsUrl);
        if (!cfgResp.ok) throw new Error(`No se pudo cargar ${modelsUrl} (${cfgResp.status})`);
        const cfg = await cfgResp.json();

        const item = cfg.find(x => x.slug === slug);
        if (!item) {
            app.innerHTML = `<div style="color:#fff;padding:16px;font:14px system-ui">Modelo no encontrado para <b>${slug}</b></div>`;
            return;
        }

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(item.env?.background ?? '#0f1115');

        const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
        camera.position.fromArray(item.camera?.pos ?? [2, 1.5, 2]);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.outputColorSpace  = THREE.SRGBColorSpace;
        renderer.toneMapping       = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = item.env?.exposure ?? 1.0;
        renderer.setSize(innerWidth, innerHeight);
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        app.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Luces
        scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 1.0));
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
        keyLight.position.set(3, 4, 2);
        keyLight.castShadow = true;
        scene.add(keyLight);

        // Helpers
        //scene.add(new THREE.GridHelper(10, 10));
        //scene.add(new THREE.AxesHelper(1.5));

        if (item.model) {
            // Loader (con DRACO por si vienec comprimido el glb)
            const draco = new DRACOLoader();
            draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
            const loader = new GLTFLoader();
            loader.setDRACOLoader(draco);

            // Resuelve URL del modelo con BASE_URL
            const modelUrl = item.model.startsWith('/')
                ? `${base}${item.model}`
                : `${base}/${item.model}`;

            const gltf  = await loader.loadAsync(modelUrl);
            const model = gltf.scene;

            // Material de seguridad. NOTA MENTAL: DEJARLO FALSE.
            const FORCE_DEBUG_MAT = false;
            model.traverse(o => {
                if (o.isMesh) {
                    o.frustumCulled = false;
                    o.castShadow = o.receiveShadow = true;
                    if (FORCE_DEBUG_MAT) {
                        o.material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0.0 });
                        o.material.side = THREE.DoubleSide;
                    }
                }
            });

            // Normalización: centrar y escalar (una sola vez)
            scene.add(model);

            const box = new THREE.Box3().setFromObject(model);
            const size = new THREE.Vector3();
            const center = new THREE.Vector3();
            box.getSize(size);
            box.getCenter(center);


            model.position.sub(center);

            // escala para que la mayor dimensión sea ≈ 2.5
            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const target = 2.5;
            const k = target / maxDim;
            model.scale.multiplyScalar(k);

            // PUEDE AYUDAR??? aplicar transform definidos en json después del normalizado
            if (item.transform?.rotation) {
                const [rx, ry, rz] = item.transform.rotation;
                model.rotation.set(rx, ry, rz);
            }

            //  encuadrar cámara
            fitCameraToObject(camera, controls, model, {
                padding: 0.8,
                yAlign: 'center',
            });

        } else {
            // Cubo demo
            const geo = new THREE.BoxGeometry(1, 1, 1);
            const mat = new THREE.MeshStandardMaterial({ color: 0x5da9ff, roughness: 0.35, metalness: 0.1 });
            const mesh = new THREE.Mesh(geo, mat);
            //scene.add(mesh);
            fitCameraToObject(camera, controls, mesh, { padding: 1.2, yAlign: 'center' });
        }

        if (item.license) {
            const info = document.createElement('div');
            info.style.cssText = `
                position:absolute;bottom:10px;right:12px;
                color:#ccc;font:12px system-ui;opacity:0.8;
            `;
            info.innerHTML = `
                © <a href="${item.license.source}" target="_blank" style="color:#ccc;">
                    ${item.license.author}
                </a> — ${item.license.type}
            `;
            app.appendChild(info);
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
});