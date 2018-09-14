const props = {
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

const keys = Object.keys(props);

class EquipmentBonus {
  constructor(obj) {
    Object.assign(this, props);
    this.add(obj);
  }

  add(obj) {
    if (!obj) return;
    keys.forEach((key) => {
      if (key in obj) {
        this[key] += obj[key];
      }
    });
  }

  applyTo(obj) {
    const newObj = { ...obj };
    keys.forEach((key) => {
      if (key in obj) {
        newObj[key] *= 1 + this[key];
      }
    });
    return newObj;
  }
}

export default EquipmentBonus;
