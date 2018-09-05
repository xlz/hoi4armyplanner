import Bonus from './Bonus';

const properties = {
  maximum_speed: 0,
  max_strength: 0,
  max_organisation: 0,
  default_morale: 0,
  recon: 0,
  suppression: 0,
  suppression_factor: 0,
  weight: 0,
  supply_consumption: 0,
  supply_consumption_factor: 0,
  reliability: 0,
  reliability_factor: 0,
  casualty_trickleback: 0,
  experience_loss_factor: 0,

  soft_attack: 0,
  hard_attack: 0,
  air_attack: 0,
  defense: 0,
  breakthrough: 0,
  armor_value: 0,
  ap_attack: 0,
  initiative: 0,
  entrenchment: 0,
  equipment_capture_factor: 0,
  combat_width: 0,

  manpower: 0,
  training_time: 0,
  build_cost_ic: 0,
  hardness: 0,

  desert: {},
  forest: {},
  hills: {},
  mountain: {},
  plains: {},
  urban: {},
  jungle: {},
  marsh: {},
  fort: {},
  river: {},
  amphibious: {},
};

class UnitBonus extends Bonus {
  constructor(obj) {
    super();
    Object.assign(this, { ...properties, ...this });
    Object.seal(this);
    this.add(obj);
  }
}

export default UnitBonus;
