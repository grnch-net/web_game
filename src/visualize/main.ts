import { Renderer } from './renderer';
import { World } from './world';
import { UserInterface } from './user_interface';
import { GameObject } from './game_object';
import { Player } from './player';

const screen_width = window.innerWidth;
const screen_height = window.innerHeight;
const resolution = window.devicePixelRatio;

const clock = new THREE.Clock();

const renderer = new Renderer;
renderer.initialize(screen_width, screen_height, resolution);

const world = new World;
world.initialize(screen_width, screen_height);
renderer.addLayer(world);

const ui = new UserInterface;
ui.initialize(screen_width, screen_height);
renderer.addLayer(ui);

const fox = new GameObject;
fox.load('res/fox/')
.then(() => {
  fox.model.position.set(20, 0, 50);
  fox.model.scale.set(0.1, 0.1, 0.1);
  fox.model.rotateY(Math.PI * 0.7);
  world.addChild(fox);
  // const idle = fox.mixer.clipAction(fox.animations[0]);
  // idle.play();
});

const player = new Player;
const hero = new GameObject;
hero.load('res/fox/')
.then(() => {
  player.initialize(world.camera, hero);
  hero.model.position.set(0, 0, 0);
  hero.model.scale.set(0.1, 0.1, 0.1);
  const idle = hero.mixer.clipAction(hero.animations[0]);
  idle.play();
  world.addChild(player);
});




function animator() {
  const dt = clock.getDelta();
  renderer.tick(dt);
  setTimeout(() => {
    requestAnimationFrame(animator);
  }, 1000 / 30);
}
animator();
