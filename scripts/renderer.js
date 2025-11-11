class NeuroRenderer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.lifeFormMeshes = new Map();
        this.environmentMesh = null;
        this.clock = new THREE.Clock();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();
        this.setupEnvironment();
        this.setupEventListeners();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.Fog(0x0a0a0a, 20, 50);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 10, 30);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('neuroCanvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0x00ff00, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xff00ff, 0.5, 100);
        pointLight.position.set(-10, -10, -5);
        this.scene.add(pointLight);
    }

    setupEnvironment() {
        const gridHelper = new THREE.GridHelper(50, 50, 0x00ff00, 0x004400);
        this.scene.add(gridHelper);

        const boundaryGeometry = new THREE.BoxGeometry(50, 50, 50);
        const boundaryMaterial = new THREE.MeshBasicMaterial({
            color: 0x003300,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        const boundary = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
        this.scene.add(boundary);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            this.camera.position.x -= deltaX * 0.01;
            this.camera.position.y += deltaY * 0.01;
            
            this.camera.lookAt(0, 0, 0);
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.camera.position.z += e.deltaY * 0.01;
            this.camera.position.z = Math.max(10, Math.min(100, this.camera.position.z));
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render(ecosystem) {
        this.updateLifeForms(ecosystem.getLifeForms());
        this.updateEnvironment(ecosystem.getEnvironment());
        
        this.renderer.render(this.scene, this.camera);
    }

    updateLifeForms(lifeForms) {
        const currentIds = new Set(lifeForms.map(lf => lf.id));
        
        this.lifeFormMeshes.forEach((mesh, id) => {
            if (!currentIds.has(id)) {
                this.scene.remove(mesh);
                this.lifeFormMeshes.delete(id);
            }
        });

        lifeForms.forEach(lifeForm => {
            let mesh = this.lifeFormMeshes.get(lifeForm.id);
            const meshData = lifeForm.getMeshData();
            
            if (!mesh) {
                mesh = this.createLifeFormMesh(meshData);
                this.lifeFormMeshes.set(lifeForm.id, mesh);
                this.scene.add(mesh);
            }
            
            this.updateLifeFormMesh(mesh, meshData);
        });
    }

    createLifeFormMesh(meshData) {
        let geometry;
        
        switch (meshData.geometry.type) {
            case 'plant':
                geometry = new THREE.ConeGeometry(meshData.size, meshData.size * 2, 8);
                break;
            case 'fungus':
                geometry = new THREE.SphereGeometry(meshData.size, 6, 6);
                break;
            case 'crystal':
                geometry = new THREE.OctahedronGeometry(meshData.size);
                break;
            case 'energy':
                geometry = new THREE.TetrahedronGeometry(meshData.size);
                break;
            default:
                geometry = new THREE.SphereGeometry(meshData.size, 8, 6);
        }
        
        const material = new THREE.MeshPhongMaterial({
            color: meshData.color,
            shininess: 30,
            transparent: true,
            opacity: 0.8
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(meshData.position.x, meshData.position.y, meshData.position.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        return mesh;
    }

    updateLifeFormMesh(mesh, meshData) {
        mesh.position.set(meshData.position.x, meshData.position.y, meshData.position.z);
        mesh.rotation.y = meshData.rotation;
        mesh.scale.setScalar(meshData.size);
        
        mesh.material.color.set(meshData.color);
        mesh.material.opacity = 0.6 + (meshData.size / 5) * 0.4;
    }

    updateEnvironment(environment) {
        if (!this.environmentMesh) {
            const geometry = new THREE.SphereGeometry(15, 32, 32);
            const material = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                wireframe: true,
                transparent: true,
                opacity: 0.05
            });
            this.environmentMesh = new THREE.Mesh(geometry, material);
            this.scene.add(this.environmentMesh);
        }
        
        const energyScale = 1 + (environment.energy / 100) * 0.5;
        this.environmentMesh.scale.setScalar(energyScale);
        
        const hue = (environment.temperature + 10) * 3;
        this.environmentMesh.material.color.setHSL(hue / 360, 0.5, 0.3);
    }
}