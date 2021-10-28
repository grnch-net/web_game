import { DisplayObject } from './display_object';

class TextStyle {
  align?: CanvasTextAlign = 'center';
  fontSize?: number = 24;
  color?: string = 'black';
  wordWrapWidth?: number;
  stroke?: number = 0;
  strokeColor?: string = 'black';
}

export class Text extends DisplayObject {
  model: THREE.Sprite;
  style: TextStyle;
  protected width: number;
  protected height: number;
  protected bitmap: CanvasRenderingContext2D;
  protected texture: THREE.Texture;

  initialize(
    text: string = '',
    style?: TextStyle,
    orthographic: boolean = false
  ) {
    this.style = new TextStyle;
    this.style = { ...this.style, ...style };

    this.bitmap = document.createElement('canvas').getContext('2d');
    const font =  `${this.style.fontSize}px bold sans-serif`;
    this.bitmap.font = font;
    let textWidth = this.bitmap.measureText(text).width;
    textWidth += this.style.stroke;

    this.width = this.style.wordWrapWidth || textWidth;
    const scale = Math.min(1, this.width / textWidth);
    this.height = this.style.fontSize * scale + this.style.stroke;
    this.bitmap.canvas.width = this.width;
    this.bitmap.canvas.height = this.height;

    this.bitmap.font = font;
    this.bitmap.textBaseline = 'middle';
    this.bitmap.textAlign = this.style.align;

    // this.bitmap.fillStyle = 'blue';
    // this.bitmap.fillRect(0, 0, this.width, this.height);

    this.bitmap.translate(this.width / 2, this.height / 2);
    this.bitmap.scale(scale, scale);

    if (this.style.stroke) {
      this.bitmap.strokeStyle = this.style.strokeColor;
      this.bitmap.lineWidth = this.style.stroke * scale;
      this.bitmap.strokeText(text, 0, 0);
    }
    this.bitmap.fillStyle = this.style.color;
    this.bitmap.fillText(text, 0, 0);

    this.texture = new THREE.CanvasTexture(this.bitmap.canvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.wrapS = THREE.ClampToEdgeWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;

    const material = new THREE.SpriteMaterial({
      map: this.texture,
      transparent: true,
    });
    this.model = new THREE.Sprite(material);


    if (orthographic) {
      this.model.scale.set(this.width, this.height, 1);
    } else {
      this.model.scale.set(this.width * 0.01, this.height * 0.01, 1);
    }
  }

  setText(text: string) {
    this.bitmap.clearRect(-this.width / 2, -this.height / 2, this.width, this.height);
    this.bitmap.fillText(text, 0, 0);
    this.texture.needsUpdate = true;
  }

}
