import  { Layer } from './layer';
import  { Text } from './text';

export class UserInterface extends Layer {
  camera: THREE.OrthographicCamera;
  protected bitmap: CanvasRenderingContext2D;
  protected texture: THREE.Texture;

  text: Text;

  initialize(
    width: number,
    height: number
  ) {
    super.initialize(width, height);
    this.initialize_hud();
  }

  protected initialize_camera() {
    const left = -this.width/2;
    const right = this.width/2;
    const top = this.height/2;
    const bottom = -this.height/2;
    this.camera = new THREE.OrthographicCamera(left, right, top, bottom, 0, 10);
  }

  protected initialize_hud() {
    this.text = new Text;
    const style = {
      fontSize: 30,
      color: 'white',
      stroke: 3
    };
    this.text.initialize('Player', style, true);
    this.text.model.center.set( 0.0, 1.0 );
    this.text.model.position.set(-this.width / 2, this.height / 2,0);
    this.model.add(this.text.model);
  }

  tick(
    dt: number
  ) {
    // this.bitmap.clearRect(0, 0, this.width, this.height);
    // this.bitmap.fillText("" + dt , this.width / 2, this.height / 2);
    // this.texture.needsUpdate = true;
  }
}
