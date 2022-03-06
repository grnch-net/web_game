(function() {
  let socket;
  const WSEvent = {
    CharEnter: 'char:enter',
    CharLeave: 'char:leave',
    CharCancelLeave: 'char:cancel-leave',
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

    document.getElementById('character-enter').style.visibility = 'hidden';
    document.getElementById('world').style.visibility = '';
    document.getElementById('character-your').value = characterName;
    document.getElementById('character-leave').style.visibility = '';
    document.getElementById('character-cancel-leave').style.visibility = 'hidden';

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
      const { worldIndex } = data;
      if (personalWorldIndex == worldIndex) {
        console.warn('Your char leave from world');
        socket.disconnect();
        document.getElementById('character-enter').style.visibility = '';
        document.getElementById('world').style.visibility = 'hidden';
        document.getElementById('character-your').value = '';
        return;
      }
      const characterData = worldData.characters[worldIndex];
      console.log('Char leave from world', characterData?.name);
      delete worldData.characters[worldIndex];
      // TODO: remove another char
    });
    
    socket.emit(WSEvent.CharEnter, { secret });
  };
  
  const leaveFromWorld = async () => {
    document.getElementById('character-leave').style.visibility = 'hidden';
    document.getElementById('character-cancel-leave').style.visibility = '';
    socket.emit(WSEvent.CharLeave);
  };
  
  const cancelLeaveFromWorld = async () => {
    document.getElementById('character-leave').style.visibility = '';
    document.getElementById('character-cancel-leave').style.visibility = 'hidden';
    socket.emit(WSEvent.CharCancelLeave);
  };

  const getName = () => {
    const name = document.getElementById('character-name').value;
    console.warn(name);
    return name;
  }

  document.getElementById('character-create').addEventListener('click' , () => {
    createCharacter(getName());
  });

  document.getElementById('character-get').addEventListener('click' , () => {
    getCharacter(getName());
  });

  document.getElementById('character-enter').addEventListener('click' , () => {
    enterToWorld(getName());
  });

  document.getElementById('character-leave').addEventListener('click' , () => {
    leaveFromWorld();
  });

  document.getElementById('character-cancel-leave').addEventListener('click' , () => {
    cancelLeaveFromWorld();
  });
})();

