import Bonus from './Bonus';

const properties = {
  air_attack: 0,
  ap_attack: 0,
  armor_value: 0,
  breakthrough: 0,
  build_cost_ic: 0,
  defense: 0,
  hard_attack: 0,
  hardness: 0,
  maximum_speed: 0,
  reliability: 0,
  soft_attack: 0,
};

class EquipmentBonus extends Bonus {
  constructor(obj) {
    super(obj);
    Object.assign(this, { ...properties, ...this });
    Object.seal(this);
  }
}

export default EquipmentBonus;
