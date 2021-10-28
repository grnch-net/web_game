import { Layer } from './layer';

export class World extends Layer {
  camera: THREE.PerspectiveCamera;

  initialize(
    width: number,
    height: number
  ) {
    super.initialize(width, height);

    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    this.model.add(hemiLight);

    let d = 8.25;
    let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    dirLight.position.set(-8, 12, 8);
    // dirLight.castShadow = true;
    // dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    // dirLight.shadow.camera.near = 0.1;
    // dirLight.shadow.camera.far = 1500;
    // dirLight.shadow.camera.left = d * -1;
    // dirLight.shadow.camera.right = d;
    // dirLight.shadow.camera.top = d;
    // dirLight.shadow.camera.bottom = d * -1;
    this.model.add(dirLight);

    // const planeGeometry = new THREE.PlaneBufferGeometry( 2000, 2000 );
		// planeGeometry.rotateX( - Math.PI / 2 );
		// const planeMaterial = new THREE.ShadowMaterial( { opacity: 0.2 } );
		// const plane = new THREE.Mesh( planeGeometry, planeMaterial );
		// plane.position.y = 0;
		// plane.receiveShadow = false;
		// this.model.add( plane );

    var helper = new THREE.GridHelper( 2000, 100 );
		helper.position.y = 0;
		// helper.material.opacity = 0.25;
		// helper.material.transparent = true;
		this.model.add( helper );
  }

  protected initialize_model() {
    super.initialize_model();
    const backgroundColor = 0xf1f1f1;
    this.model.background = new THREE.Color(backgroundColor);
    this.model.fog = new THREE.Fog(backgroundColor, 150, 200);
  }

  protected initialize_camera() {
    this.camera = new THREE.PerspectiveCamera();
    this.camera.near = 0.1;
    this.camera.far = 200;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

}
