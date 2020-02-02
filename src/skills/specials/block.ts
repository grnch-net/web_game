import { Skill } from '../skill';
import { attributes } from '../../influences';

export class Block extends Skill {
   onOuterImpact(
     impact: any
   ) {
     super.onOuterImpact(impact);
     if (!this.usageTime) return;
     if (!impact[attributes.health]) return;
     if (impact[attributes.health] < 0) {
       delete impact[attributes.health];
       for (const influence of this.stock) {
         influence.apply(impact);
       }
       this.usageTime = 0;
     }
   }
}
