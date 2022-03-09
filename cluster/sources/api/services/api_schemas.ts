import type { ObjectProperties, ObjectSchema } from 'fast-json-stringify';

const characterParameters_SchemaObject: ObjectSchema = {
  type: 'object',
  additionalProperties: true // TODO:
};

const characterWorldData_SchemaProperties: ObjectProperties = {
  name: { type: 'string' },
  position: {
    type: 'object',
    properties: {
      x: { type: 'number' },
      y: { type: 'number' },
      z: { type: 'number' },
    }
  },
  rotation: { type: 'number' },
  moveForce: { type: 'number' },
  attributes: {
    type: 'object',
    additionalProperties: {
      type: 'number'
    }
  },
  effects: {
    type: 'array',
    items: { type: ['number', 'null'] }
  },
  equips: {
    type: 'array',
    items: { type: ['number', 'null'] }
  }
};

export {
  characterParameters_SchemaObject,
  characterWorldData_SchemaProperties
};