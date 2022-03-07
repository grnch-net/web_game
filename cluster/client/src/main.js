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
  const character_your_node = document.querySelector('#character-your');
  const world_chat_node = document.querySelector('#world-chat');
  const character_say_node = document.querySelector('#character-say');
  const character_say_text_node = document.querySelector('#character-say-text');

  class Game {

    constructor() {
      this.character = null;
      this.worldData = null;
      this.worldIndex = null;
      this.socket = null;
    }

    initialize() {
      this.initialize_view();
    }

    initialize_view() {
      character_create_node.addEventListener('click' , () => this.createCharacter(this.getInputName()));
      character_get_node.addEventListener('click' , () => this.getCharacter(this.getInputName()));
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

    async createCharacter(characterName) {
      const data = await this.sendRequest(APIEvent.CharacterCreate, { name: characterName });
      console.log('create character', data);
      if (!data) {
        this.character = null;
        return;
      }
      this.character = data.parameters;
    }

    async getCharacter(characterName) {
      const data = await this.sendRequest(APIEvent.CharacterGet, { name: characterName });
      console.log('get character', data);
      if (!data) {
        this.character = null;
        return;
      }
      this.character = data.parameters;
    }

    updateWorldCharacters() {
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
      character_your_node.value = this.character.name;
      character_leave_node.style.display = '';
      character_cancel_leave_node.style.display = 'none';
      this.updateWorldCharacters();
    }

    async enterToWorld(characterName) {
      if (!this.character || this.character.name !== characterName) {
        await this.getCharacter(characterName);
        if (!this.character) {
          return;
        }
      }
  
      const enter_data = await this.sendRequest(APIEvent.WorldEnter, { name: characterName });
      console.log('enter to world', enter_data);
      if (!enter_data) {
        return;
      }
  
      this.worldData = enter_data.world;
      this.worldIndex = enter_data.worldIndex;
      this.initWorld(characterName);
  
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

      this.socket.on(WSEvent.CharMove, data => {
        console.log('Char move', data);
      });

      this.socket.on(WSEvent.CharUseSkill, data => {
        console.log('Char use skill', data);
      });

      this.socket.on(WSEvent.CharEnter, data => {
        console.log('Char enter to world', data);
        this.worldData.characters[data.worldIndex] = data.characterData;
        this.updateWorldCharacters();
      });

      this.socket.on(WSEvent.CharLeave, data => {  
        if (this.worldIndex == data.worldIndex) {
          console.warn('Your char leave from world');
          this.socket.disconnect();
          main_screen_node.style.display = '';
          world_screen_node.style.display = 'none';
          character_your_node.value = '';
          return;
        }
  
        const characterData = this.worldData.characters[data.worldIndex];
        console.log('Char leave from world', characterData?.name);
        delete this.worldData.characters[data.worldIndex];
        this.updateWorldCharacters();
      });
      
      this.socket.emit(WSEvent.CharEnter, { secret: enter_data.secret });
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

    characterSay() {
      const message = character_say_text_node.value;
      character_say_text_node.value = '';
      this.socket.emit(WSEvent.CharSay, { message });
    }

  }

  const game = window.game = new Game;
  game.initialize();
})();

