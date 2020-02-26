import type { GameObject } from './game_object';

export class World {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  children: GameObject[];

  initialize() {
    const screen_width = window.innerWidth;
    const screen_height = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(screen_width, screen_height);
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    const backgroundColor = 0xf1f1f1;
    this.scene.background = new THREE.Color(backgroundColor);
    this.scene.fog = new THREE.Fog(backgroundColor, 150, 200);

    this.camera = new THREE.PerspectiveCamera();
    this.camera.near = 0.1;
    this.camera.far = 200;
    this.camera.aspect = screen_width / screen_height;
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(1, 0, -1);
    this.camera.position.set(-30, 10, 30);

    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    let d = 8.25;
    let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    dirLight.shadow.camera.left = d * -1;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = d * -1;
    this.scene.add(dirLight);

    let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    let floorMaterial = new THREE.MeshPhongMaterial({
      color: 0xeeeeee,
      shininess: 0,
    });

    let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;
    this.scene.add(floor);

    this.children = [];
  }

  addChild(child: GameObject) {
    this.scene.add(child.model);
    this.children.push(child);
  }

  tick(
    dt: number
  ) {
    for (const child of this.children) {
      child.tick(dt);
    }
    this.renderer.render(this.scene, this.camera);
  }
}
