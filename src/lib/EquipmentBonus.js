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

  apply(bonus) {
    keys.forEach((key) => {
      if (key in bonus) {
        this[key] *= 1 + bonus[key];
      }
    });
    return this;
  }

  applyTo(obj) {
    const out = { ...obj };
    keys.forEach((key) => {
      if (key in obj) {
        out[key] *= 1 + this[key];
      }
    });
    return out;
  }
}

export default EquipmentBonus;
