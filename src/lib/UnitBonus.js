import Bonus from './Bonus';

const props = {
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

  //special_forces
  //marines
  //cavalry
  //type
  //can_be_parachuted

  forest: undefined,
  hills: undefined,
  mountain: undefined,
  plains: undefined,
  urban: undefined,
  jungle: undefined,
  marsh: undefined,
  desert: undefined,
  fort: undefined,
  river: undefined,
  amphibious: undefined,
};

class UnitBonus extends Bonus {
  constructor(obj) {
    super();
    Object.assign(this, props);
    Object.defineProperty(this, 'sealed', { value: true });
    this.add(obj);
  }
}

export default UnitBonus;
