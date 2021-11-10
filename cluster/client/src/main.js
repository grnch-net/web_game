(function() {
  let socket;
  const WSEvent = {
    CharEnter: 'char:enter',
    CharLeave: 'char:leave',
    CharSay: 'char:say',
    CharMove: 'char:move',
    CharUseSkill: 'char:use-skill'
  };

  const sendRequest = async(url, data) => {
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

  const APIEvent = {
    CharacterCreate: '/character-create',
    CharacterGet: '/character-get',
    WorldEnter: '/world-enter',
    WorldLeave: '/world-leave'
  };

  const createCharacter = async (characterName) => {
    const data = await sendRequest(APIEvent.CharacterCreate, { name: characterName });
    console.log('create character', data);
    if (!data) {
      return;
    }
  };

  const getCharacter = async (characterName) => {
    const data = await sendRequest(APIEvent.CharacterGet, { name: characterName });
    console.log('get character', data);
    if (!data) {
      return;
    }
  };

  const enterToWorld = async (characterName) => {
    const data = await sendRequest(APIEvent.WorldEnter, { name: characterName });
    console.log('enter to world', data);
    if (!data) {
      return;
    }

    const {
      secret,
      worldIndex: personalWorldIndex,
      world: worldData
    } = data;

    // initWorld(worldData);

    socket = window.socket = io();

    socket.on(WSEvent.CharSay, data => {
      console.log('Char say', data);
    });
    socket.on(WSEvent.CharMove, data => {
      console.log('Char move', data);
    });
    socket.on(WSEvent.CharUseSkill, data => {
      console.log('Char use skill', data);
    });
    socket.on(WSEvent.CharEnter, data => {
      const { worldIndex, characterData } = data;
      console.log('Char enter to world', data);
      worldData.characters[worldIndex] = characterData;
    });
    socket.on(WSEvent.CharLeave, data => {
      const { worldIndex, characterData } = data;
      console.log('Char leave from world', data);
      worldData.characters[worldIndex] = characterData;
    });

    socket.emit(WSEvent.CharEnter, { secret });
  };

  const leaveFromWorld = async (worldIndex) => {
    const data = await sendRequest(APIEvent.WorldLeave, { index: worldIndex });
    console.warn('leave from world', data);
    // socket.disconnect(); // TODO;
  };

  const name = 'Hero2';
  console.warn(name);
  createCharacter(name);
  getCharacter(name);
  enterToWorld(name);
  // leaveFromWorld(0);
})();

