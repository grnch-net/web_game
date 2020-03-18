import { SkillConfig } from '../skills/index';
import { EquipSlot } from '../equips/index';

type SkillsConfig = { [id: string]: SkillConfig };
export const skillsConfig: SkillsConfig = {
  0: {
    name: 'Recreation',
    usageTime: Infinity,
    innerGradualInfluences: [
      {
        attribute: 'health',
        value: 0.83
      }
    ]
  },
  1: {
    name: 'Attack',
    specialClass: 'attack',
    reusable: true,
    castTime: 1,
    usageTime: 1,
    cost: [
      {
        attribute: 'stamina',
        value: 25
      }
    ],
    outerStaticInfluences: [
      {
        attribute: 'health',
        value: 10,
        negative: true
      }
    ],
    needs: {
      equips: [EquipSlot.MainHand, EquipSlot.SecondHand]
    }
  },
  2: {
    name: 'Block',
    specialClass: 'block',
    castTime: 0.5,
    usageTime: Infinity,
    stock: [
      {
        attribute: 'stamina',
        value: 25
      }
    ],
    needs: {
      equips: [EquipSlot.SecondHand]
    }
  }
};