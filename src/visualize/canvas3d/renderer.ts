import type { Layer } from './layer';

export class Renderer {
  renderer: THREE.WebGLRenderer;
  layers: Layer[];

  initialize(
    width: number,
    height: number,
    resolution: number
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.autoClear = false;
    this.renderer.setPixelRatio(resolution);
    this.renderer.setSize(width, height);
    document.body.appendChild(this.renderer.domElement);
    this.layers = [];
  }

  addLayer(
    layer: Layer
  ) {
    if (layer.renderer) {
      layer.renderer.removeLayer(layer);
    }
    this.layers.push(layer);
    layer.renderer = this;
  }

  removeLayer(
    layer: Layer
  ) {
    const index = this.layers.indexOf(layer);
    if (index != -1) {
      this.layers.splice(index, 1);
      delete layer.renderer;
    }
  }

  tick(
    dt: number
  ) {
    for (const layer of this.layers) {
      layer.tick(dt);
      this.renderer.render(layer.model, layer.camera);
    }
  }
}
