const screen_width = window.innerWidth;
const screen_height = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(screen_width, screen_height);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const backgroundColor = 0xf1f1f1;
scene.background = new THREE.Color(backgroundColor);
scene.fog = new THREE.Fog(backgroundColor, 150, 200);

const camera = new THREE.PerspectiveCamera();
camera.near = 0.1;
camera.far = 200;
camera.aspect = screen_width / screen_height;
camera.updateProjectionMatrix();
camera.lookAt(1, 0, -1);
camera.position.set(-30, 10, 30);

let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

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
scene.add(dirLight);

let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
let floorMaterial = new THREE.MeshPhongMaterial({
  color: 0xeeeeee,
  shininess: 0,
});

let floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -0.5 * Math.PI;
floor.receiveShadow = true;
scene.add(floor);

const clock = new THREE.Clock();
let mixer: THREE.AnimationMixer;

function animator() {
  if (mixer) {
    mixer.update(clock.getDelta());
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animator);
}
animator();


let material: THREE.Material;
let model: THREE.Scene;

function updateModel() {
  if (!material || !model) return;

  model.traverse((o: any) => {
    if (o.isSkinnedMesh) {
      console.info(o);
      o.castShadow = true;
      o.receiveShadow = true;
      o.material = material;
    }
  });

  scene.add(model);
}

const TEXTURE_PATH = 'res/fox/textures.png';
new THREE.TextureLoader().load(
  TEXTURE_PATH,
  texture => {
    console.info('texture loaded');
    texture.flipY = false;
    material = new THREE.MeshPhongMaterial({
      map: texture,
      color: 0xffffff,
      skinning: true
    });
    updateModel();
  }
);

function onLoadModel(gltf: GLTF) {
  console.info('model loaded', gltf);
  model = gltf.scene;
  model.position.set(0, 0, 0);
  model.scale.set(0.1, 0.1, 0.1);
  updateModel();

  const animations = gltf.animations;
  mixer = new THREE.AnimationMixer(model);

  const idle = mixer.clipAction(animations[0]);
  idle.play();
}

const loader = new GLTFLoader();
const MODEL_PATH = 'res/fox/scene.gltf';
loader.load(
  MODEL_PATH,
  onLoadModel,
  undefined,
  (error: any) => console.error(error)
);
