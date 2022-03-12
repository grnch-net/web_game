(function() {
  const WSEvent = {
    CharEnter: 'char:enter',
    CharLeave: 'char:leave',
    CharCancelLeave: 'char:cancel-leave',
    CharSay: 'char:say',
    CharMove: 'char:move',
    CharUseSkill: 'char:use-skill'
  };

  const APIEvent = {
    CharacterCreate: '/character-create',
    CharacterGet: '/character-get',
    WorldEnter: '/world-enter',
    WorldLeave: '/world-leave'
  };

  const main_screen_node = document.querySelector('#main-screen');
  const character_name_node = document.querySelector('#character-name');
  const character_create_node = document.querySelector('#character-create');
  const character_get_node = document.querySelector('#character-get');
  const character_enter_node = document.querySelector('#character-enter');
  const world_screen_node = document.querySelector('#world-screen');
  const world_characters_node = document.querySelector('#world-characters');
  const character_leave_node = document.querySelector('#character-leave');
  const character_cancel_leave_node = document.querySelector('#character-cancel-leave');
  const user_character_name_node = document.querySelector('#user-character-name');
  const world_chat_node = document.querySelector('#world-chat');
  const character_say_node = document.querySelector('#character-say');
  const character_say_text_node = document.querySelector('#character-say-text');
  const svg_node = document.querySelector('svg');
  const world_scene_node = document.querySelector('#world-scene');

  const world_latitude = 180;
  const world_longitude = 180;
  const world_height = 1;

  class Game {

    constructor() {
      this.character = null;
      this.worldData = null;
      this.worldIndex = null;
      this.socket = null;
      this.sceneCharacters = null;
      this.onDestroyWorldHandlers = null;
      this.userCharacterDirections = null;
    }

    initialize() {
      this.initialize_view();
    }

    initialize_view() {
      character_create_node.addEventListener('click' , () => this.createCharacterRequest(this.getInputName()));
      character_get_node.addEventListener('click' , () => this.getCharacterRequest(this.getInputName()));
      character_enter_node.addEventListener('click' , () => this.enterToWorld(this.getInputName()));
      character_leave_node.addEventListener('click' , () => this.leaveFromWorld());
      character_cancel_leave_node.addEventListener('click' , () => this.cancelLeaveFromWorld());
      character_say_node.addEventListener('click' , () => this.characterSay());
    }

    async sendRequest(url, data) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .catch(e => console.log(e));
  
      if (!response) {
        console.error('Fatal error.');
        return;
      } else
      if (response.error) {
        console.error(response);
        return;
      } else
      if (!response.data) {
        console.error(response);
        return;
      }
  
      return response.data;
    }

    getInputName() {
      const name = character_name_node.value;
      return name;
    }

    async createCharacterRequest(characterName) {
      const data = await this.sendRequest(APIEvent.CharacterCreate, { name: characterName });
      console.log('create character', data);
      if (!data) {
        this.character = null;
        return;
      }
      this.character = data.parameters;
    }

    async getCharacterRequest(characterName) {
      const data = await this.sendRequest(APIEvent.CharacterGet, { name: characterName });
      console.log('get character', data);
      if (!data) {
        this.character = null;
        return;
      }
      this.character = data.parameters;
    }

    async enterToWorld(characterName) {
      character_enter_node.style.display = 'none';

      if (!this.character || this.character.name !== characterName) {
        await this.getCharacterRequest(characterName);
        if (!this.character) {
          this.thenEnterToWorld();
          return;
        }
      }
  
      const enter_data = await this.sendRequest(APIEvent.WorldEnter, { name: characterName });
      console.log('enter to world', enter_data);
      if (!enter_data) {
        this.thenEnterToWorld();
        return;
      }
  
      this.worldData = enter_data.world;
      this.worldIndex = enter_data.worldIndex;
      this.initWorld();

      this.initSocket();
      
      this.socket.emit(WSEvent.CharEnter, { secret: enter_data.secret });
      this.thenEnterToWorld();
    }

    thenEnterToWorld() {
      character_enter_node.style.display = '';
    }

    initSocket() {
      this.socket = io();
  
      this.socket.on(WSEvent.CharSay, data => {
        console.log('Char say', data);
        let character_name;
        if (this.worldIndex == data.worldIndex) {
          character_name = this.character.name;
        } else {
          character_name = this.worldData.characters[data.worldIndex]?.name;
        }
        if (!character_name) {
          character_name = 'unknow';
        }
        world_chat_node.value += `\n${character_name}: ${data.message}`;
        world_chat_node.scrollTo(0, world_chat_node.scrollHeight);
      });

      this.socket.on(WSEvent.CharMove, data => this.charMoveHandler(data));

      this.socket.on(WSEvent.CharUseSkill, data => {
        console.log('Char use skill', data);
      });

      this.socket.on(WSEvent.CharEnter, data => {
        console.log('Char enter to world', data);
        this.worldData.characters[data.worldIndex] = data.characterData;
        this.updateWorldCharactersList();
        this.addCharacter(data.worldIndex, data.characterData);
      });

      this.socket.on(WSEvent.CharLeave, data => {  
        if (this.worldIndex == data.worldIndex) {
          console.warn('Your char leave from world');
          this.socket.disconnect();
          this.destroyWorld();
          return;
        }
  
        this.removeCharacter(data.worldIndex);
      });
    }

    charMoveHandler(data) {
      const {
        worldIndex,
        rotation,
        position,
        direction,
        forcePercent
      } = data;

      let character;
      
      if (worldIndex === this.worldIndex) {
        character = this.character;
      } else {
        character = this.worldData.characters[worldIndex];
      }

      if (position) {
        const [x, y, z] = position;
        character.position.x = x;
        character.position.y = y;
        character.position.z = z;
      }
      
      if (rotation) {
        character.rotation = rotation;
      }

      this.updateDirection(character, direction);
      this.updateCharacterPosition(worldIndex, character);
      
      if (forcePercent || forcePercent === 0) {
        character.forcePercent = forcePercent;
        if (forcePercent > 0) {
          this.characterMoveStart(worldIndex, character);
        }
      }
    }

    updateWorldCharactersList() {
      const characters_list = [];
      for (const character of this.worldData.characters) {
        if (!character) {
          continue;
        }
        characters_list.push(character.name);
      }
      world_characters_node.value = characters_list.join(', ');
    }

    initWorld() {
      main_screen_node.style.display = 'none';
      world_screen_node.style.display = '';
      user_character_name_node.value = this.character.name;
      character_leave_node.style.display = '';
      character_cancel_leave_node.style.display = 'none';

      this.updateWorldCharactersList();
      this.initWorldScene();
    }

    initWorldScene() {
      this.sceneCharacters = [];

      this.addUserCharacter();
      this.initUserListeners();

      for (const worldIndex in this.worldData.characters) {
        const character = this.worldData.characters[worldIndex];
        if (!character) {
          continue;
        }
        this.addCharacter(worldIndex, character);
      }
    }

    addUserCharacter() {
      this.initCharacter(this.character);
      this.createSceneCharacter(this.worldIndex, this.character, '#user-character-prefab');
    }

    addCharacter(worldIndex, character) {
      this.initCharacter(character);
      this.createSceneCharacter(worldIndex, character);
    }

    initCharacter(character) {
      character.directionPoint = { x: 0, y: 0, z: 0 };
      character.forcePercent = 0;
    }

    removeCharacter(worldIndex) {
      const characterData = this.worldData.characters[worldIndex];
      console.log('Char leave from world', characterData?.name);

      delete this.worldData.characters[worldIndex];
      this.updateWorldCharactersList();

      const character_node = this.sceneCharacters[worldIndex];
      delete this.sceneCharacters[worldIndex];
      world_scene_node.removeChild(character_node);
    }

    initUserListeners() {
      this.onDestroyWorldHandlers = [];
      this.userCharacterDirections = {
        front: false,
        right: false,
        back: false,
        left: false
      };

      let lastMousePosition;
      const mouseMoveHandler = event => {
        const rotate = (event.clientX - lastMousePosition) / 100;
        this.character.rotation += rotate;
        lastMousePosition = event.clientX;
        this.updateDirection(this.character);
        this.updateCharacterPosition(this.worldIndex, this.character);

        const { x, y, z } = this.character.position;
        this.socket.emit(WSEvent.CharMove, {
          rotation: this.character.rotation,
          position: [x, y, z]
        });
      };
      const mouseUpHandler = () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
      };
      const mouseDownHandler = event => {
        lastMousePosition = event.clientX;
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
      };
      svg_node.addEventListener('mousedown', mouseDownHandler);
      this.onDestroyWorldHandlers.push(() => {
        mouseUpHandler();
        document.removeEventListener('mouseup', mouseUpHandler);
        svg_node.removeEventListener('mousedown', mouseDownHandler);
      });


      const keyDownHandler = event => {
        if (event.repeat) {
          return;
        }

        if (event.keyCode === 87) {
          this.userCharacterDirections.front = true;
        } else
        if (event.keyCode === 68) {
          this.userCharacterDirections.right = true;
        } else
        if (event.keyCode === 83) {
          this.userCharacterDirections.back = true;
        } else
        if (event.keyCode === 65) {
          this.userCharacterDirections.left = true;
        } else {
          return;
        }

        this.userCharacterMoveUpdate();
      };
      document.addEventListener('keydown', keyDownHandler);
      this.onDestroyWorldHandlers.push(() => {
        document.removeEventListener('keydown', keyDownHandler);
      });

      const keyUpHandler = event => {
        if (event.keyCode === 87) {
          this.userCharacterDirections.front = false;
        } else
        if (event.keyCode === 68) {
          this.userCharacterDirections.right = false;
        } else
        if (event.keyCode === 83) {
          this.userCharacterDirections.back = false;
        } else
        if (event.keyCode === 65) {
          this.userCharacterDirections.left = false;
        } else {
          return;
        }
        
        this.userCharacterMoveUpdate();
      };
      document.addEventListener('keyup', keyUpHandler);
      this.onDestroyWorldHandlers.push(() => {
        document.removeEventListener('keyup', keyUpHandler);
      });
    }

    userCharacterMoveUpdate() {
      const {
        front,
        right,
        back,
        left
      } = this.userCharacterDirections;
      let moveDirection;

      if (front && right) moveDirection = Math.PI * 0.25;
      else if (back && right) moveDirection = Math.PI * 0.75;
      else if (back && left) moveDirection = Math.PI * 1.25;
      else if (front && left) moveDirection = Math.PI * 1.75;
      else if (front) moveDirection = 0;
      else if (right) moveDirection = Math.PI * 0.5;
      else if (back) moveDirection = Math.PI * 1;
      else if (left) moveDirection = Math.PI * 1.5;
      else {
        return this.userCharacterMoveStop();
      }

      const { position, directionPoint } = this.character;
      this.updateDirection(this.character, moveDirection);
      
      let needStop = this.checkMoveProgress(position, directionPoint);
      
      if (needStop) {
        this.clearUserDirection();
        return;
      }

      this.character.forcePercent = 1;
      
      const { x, y, z } = position;
      this.socket.emit(WSEvent.CharMove, {
        rotation: this.character.rotation,
        position: [x, y, z],
        direction: moveDirection,
        forcePercent: this.character.forcePercent
      });

      this.characterMoveStart(this.worldIndex, this.character)
    }

    clearUserDirection() {
      this.userCharacterDirections.front = false;
      this.userCharacterDirections.right = false;
      this.userCharacterDirections.back = false;
      this.userCharacterDirections.left = false;
    }

    userCharacterMoveStop() {
      this.character.forcePercent = 0;
      const { x, y, z } = this.character.position;

      this.socket.emit(WSEvent.CharMove, {
        rotation: this.character.rotation,
        position: [x, y, z],
        direction: 0,
        forcePercent: this.character.forcePercent
      });
    }

    characterMoveStart(worldIndex, character) {
      if (character.forcePercent !== 0) {
        requestAnimationFrame(() => this.characterMoveProgress(worldIndex, character));
      }
      character.updatePositionTime = performance.now();
    }

    updateDirection(character, moveDirection) {
      if (!moveDirection && moveDirection !== 0) {
        moveDirection = character.direction;
      } else {
        character.direction = moveDirection;
      }

      let radian = character.rotation + moveDirection;
      radian = radian % (Math.PI * 2);
      if (radian < 0) {
        radian += Math.PI * 2;
      }

      character.directionPoint.x = -Math.sin(-radian);
      character.directionPoint.y = 0;
      character.directionPoint.z = Math.cos(-radian);
    }

    characterMoveProgress(worldIndex, character) {
      if (character.forcePercent === 0) {
        return;
      }

      const lastTime = character.updatePositionTime;
      const nowTime = character.updatePositionTime = performance.now();
      const character_node = this.sceneCharacters[worldIndex];
      const directionPoint = character.directionPoint;
      
      const dt = (nowTime - lastTime) / 100;
      const moveForce = character.moveForce * character.forcePercent;
      const position = {
        x: character.position.x,
        y: character.position.y,
        z: character.position.z
      };

      position.x += directionPoint.x * moveForce * dt;
      position.y += directionPoint.y * moveForce * dt;
      position.z += directionPoint.z * moveForce * dt;

      let needStop = this.checkMoveProgress(position, directionPoint);

      character.position.x = position.x;
      character.position.y = position.y;
      character.position.z = position.z;
      this.updateCharacterPosition(worldIndex, character);

      if (needStop) {
        this.clearUserDirection()
        character.forcePercent = 0;

        if (worldIndex === this.worldIndex) {
          this.userCharacterMoveStop();
        }
      }

      requestAnimationFrame(() => this.characterMoveProgress(worldIndex, character));
    }

    updateCharacterPosition(worldIndex, character) {
      let transform = '';

      const { x , y, z } = character.position;
      transform += ` translate(${x}, ${world_longitude - z})`;

      const rotate = character.rotation * 360 / (Math.PI * 2);
      transform += ` rotate(${rotate})`;

      const character_node = this.sceneCharacters[worldIndex];
      character_node.setAttribute('transform', transform);
    }

    checkMoveProgress(position, direction) {
      let needStop = false;
      
      if (direction.x > 0) {
        if (position.x > world_latitude) {
          position.x = world_latitude;
          needStop = true;
        }
      } else
      if (direction.x < 0) {
        if (position.x < 0) {
          position.x = 0;
          needStop = true;
        }
      }
      
      if (direction.y > 0) {
        if (position.y > world_height) {
          position.y = world_height;
          needStop = true;
        }
      } else
      if (direction.y < 0) {
        if (position.y < 0) {
          position.y = 0;
          needStop = true;
        }
      }
      
      if (direction.z > 0) {
        if (position.z > world_longitude) {
          position.z = world_longitude;
          needStop = true;
        }
      } else
      if (direction.z < 0) {
        if (position.z < 0) {
          position.z = 0;
          needStop = true;
        }
      }

      return needStop;
    }

    createSceneCharacter(worldIndex, character, prefab = '#character-prefab') {
      const character_node = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      character_node.setAttributeNS('http://www.w3.org/1999/xlink', 'href', prefab);
      this.sceneCharacters[worldIndex] = character_node;
      world_scene_node.appendChild(character_node);
      this.updateCharacterPosition(worldIndex, character);
    }

    leaveFromWorld() {
      character_leave_node.style.display = 'none';
      character_cancel_leave_node.style.display = '';
      this.socket.emit(WSEvent.CharLeave);
    }

    cancelLeaveFromWorld() {
      character_leave_node.style.display = '';
      character_cancel_leave_node.style.display = 'none';
      this.socket.emit(WSEvent.CharCancelLeave);
    }

    destroyWorld() {
      main_screen_node.style.display = '';
      world_screen_node.style.display = 'none';
      user_character_name_node.value = '';

      while (world_scene_node.firstChild) {
        world_scene_node.removeChild(world_scene_node.lastChild);
      }

      this.onDestroyWorldHandlers.forEach(callback => callback());
      this.onDestroyWorldHandlers = [];
    }

    characterSay() {
      const message = character_say_text_node.value;
      character_say_text_node.value = '';
      this.socket.emit(WSEvent.CharSay, { message });
    }

  }

  const game = window.game = new Game;
  game.initialize();
})();

