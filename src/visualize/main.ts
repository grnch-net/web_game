import { World } from './world';
import { GameObject } from './game_object';

const clock = new THREE.Clock();
const world = new World;
world.initialize();

function animator() {
  const dt = clock.getDelta();
  world.tick(dt);
  setTimeout(() => {
    requestAnimationFrame(animator);
  }, 1000 / 30);
}
animator();


const fox = new GameObject;
fox.load('res/fox/')
.then(() => {
  fox.model.position.set(0, 0, 0);
  fox.model.scale.set(0.1, 0.1, 0.1);
  world.addChild(fox);
  const idle = fox.mixer.clipAction(fox.animations[0]);
  idle.play();
});
