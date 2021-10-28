import {
  test_recreation
} from './recreation';

import {
  test_attack
} from './attack';

import {
  test_block
} from './block';

function test_skills() {
  console.group('Skill');
  test_recreation();
  test_attack();
  test_block();
  console.groupEnd();
}

export {
  test_skills
}
