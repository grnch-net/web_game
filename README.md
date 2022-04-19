# web_game

## Installation
```shell
node 12.13.0
npm 6.12.0
gulp-cli 2.2.0
```

## Init
```shell
npm run cluster_init
npm run client_init
```

## Run
```shell
npm run cluster_start
npm run client_start
```

## Test
```shell
npm run test_mechanics
```

## Client connect
#### Step 1
Install socket.io-client
```shell
npm i -D socket.io-client
```
### Step 2
Create/Get character (POST)
url: "/character-create", "/character-get"
````typescript
interface Response {
  name: string
}
````
````typescript
enum Attribute {
  health,
  stamina
}

interface Character {
  name: string,
  position: number[], // [x, y, z]
  attributes: {
    [key: Attribute]: { value: number }
  },
  effects: Effect[],
  skills: Skill[],
  equips: Equip[]
}

interface Request {
  data: {
    parameters: Character
  }
}
````
### Step 3
Enter the world (POST)
url: "/world-enter"
````typescript
interface Response {
  name: string
}
````
````typescript
interface Request {
  data: {
    secret: string,
    id: number,
    world: {
      characters: Character[]
    }
  }
}
````
### Step 4
Connect to world (Socket)
````typescript
import { io } from 'socket.io-client';

const socket = io(socketUrl);
socket.emit('char:enter', { secret });
````
### Events
#### Enter
Character enter to the world
event: "char:enter"
````typescript
interface OutData {
  secret: string;
}

socket.emit('char:enter', { secret });

interface InData {
  id: number;
  characterData: Character;
}

socket.on('char:enter', data => {});
````
#### Leave
Character leave from the world
event: "char:leave"
````typescript
interface OutData {}

interface InData {
  id: number;
}
````
#### Cancel Leave
Character cance leave from the world
event: "char:cancel-leave"
````typescript
interface OutData {}
````
#### Say
Character say
event: "char:say"
````typescript
interface OutData {
  message: string;
}

interface InData {
  id: number;
  message: string;
}
````
#### Move
Character move
event: "char:move"
````typescript
interface OutData {
  position: number[]; // [x, y, z]
}

interface InData {
  id: number;
  position: number[]; // [x, y, z]
}
````
#### Use Skill
Character use skill
event: "char:use-skill"
````typescript
interface OutData {
  skillId: number;
}

interface InData {
  id: number;
  skillId: number;
}
````
#### Cancel Use Skill
Character use skill
event: "char:cancel-use-skill"
````typescript
interface OutData {}

interface InData {
  id: number;
  code?: number;
}
````
