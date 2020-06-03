import {
  CharacterParameters
} from '../character';

type CharactersParameters = { [id: string]: CharacterParameters };

const charactersParameters: CharactersParameters = {
  0: {
    name: 'hero',
    attributes: {
      health: { value: 100 },
      stamina: { value: 150 }
    },
    counters: {
      // experience: 100
    },
    effects: [],
    skills: [
      { id: 1, experience: 0 },
      { id: 4, experience: 0 }
    ],
    equips: [
      {
        id: 2,
        equip: {
          durability: 98
        }
      }
    ]
  },
  1: {
    name: 'hero2',
    attributes: {
      health: { value: 100 },
      stamina: { value: 150 }
    },
    counters: {
      // experience: 100
    },
    effects: [],
    skills: [
      { id: 1, experience: 0 },
      { id: 2, experience: 0 }
    ],
    equips: [
      {
        id: 0,
        equip: {
          durability: 98
        }
      },
      {
        id: 1,
        equip: {
          durability: 50
        }
      },
      {
        id: 5,
        inventory: [
          { id: 6 }
        ]
      }
    ]
  },
  2: {
    name: 'hero3',
    attributes: {
      health: { value: 100 },
      stamina: { value: 150 }
    },
    counters: {
      // experience: 100
    },
    effects: [],
    skills: [
      { id: 1, experience: 0 },
      { id: 5, experience: 0 }
    ],
    equips: [
      {
        id: 7,
        equip: {
          durability: 98
        }
      },
      {
        id: 8,
        equip: {
          durability: 98
        }
      }
    ]
  }
};

export {
  charactersParameters
}
