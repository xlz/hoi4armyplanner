import assert from 'assert';

const blacklist = {
  XOR: true,
  ai_research_weights: true,
  ai_will_do: true,
  allow: true,
  allow_branch: true,
  allowed: true,
  allowed_civil_war: true,
  army_core_attack_factor: true,
  army_core_defence_factor: true,
  army_leader_start_level: true,
  available: true,
  cancel_if_invalid: true,
  categories: true,
  conscription: true,
  consumer_goods_factor: true,
  cost: true,
  countries: true,
  decryption: true,
  default: true,
  dependencies: true,
  desc: true,
  descryption_factor: true,
  doctrine: true,
  enable_building: true,
  enable_equipments: true,
  enable_subunits: true,
  enable_tactic: true,
  encryption: true,
  equipment_conversion_speed: true,
  experience_gain_army: true,
  experience_gain_army_factor: true,
  folder: true,
  global_building_slots_factor: true,
  industrial_capacity_dockyard: true,
  industry_air_damage_factor: true,
  industry_repair_factor: true,
  justify_war_goal_time: true,
  level: true,
  line_change_production_efficiency_factor: true,
  local_resources_factor: true,
  max_command_power: true,
  max_level: true,
  military_leader_cost_factor: true,
  min_export: true,
  modifier: true,
  naval_strike_targetting_factor: true,
  nuclear_production: true,
  on_add: true,
  on_research_complete: true,
  org_loss_when_moving: true,
  partisan_effect: true,
  path: true,
  picture: true,
  political_power_factor: true,
  production_factory_efficiency_gain_factor: true,
  production_factory_start_efficiency_factor: true,
  production_speed_buildings_factor: true,
  production_speed_coastal_bunker_factor: true,
  random: true,
  removal_cost: true,
  research_bonus: true,
  research_cost: true,
  research_time_factor: true,
  show_effect_as_desc: true,
  show_equipment_icon: true,
  sprite: true,
  stability_factor: true,
  start_year: true,
  static_anti_air_damage_factor: true,
  static_anti_air_hit_chance_factor: true,
  sub_technologies: true,
  subversive_activites_upkeep: true,
  xor: true,

  // Combat stats not handled yet
  acclimatization_hot_climate_gain_factor: true,
  acclimatization_cold_climate_gain_factor: true,
  suppression_factor: true,
  special_forces_training_time_factor: true,
  minimum_training_level: true,
  training_time_army_factor: true,
  training_time_factor: true,
  special_forces_no_supply_grace: true,
};

function addInternal(dst, src, n) {
  if (!src) return;
  Object.keys(src).forEach((key) => {
    if (key in blacklist) return;
    if (dst.sealed && !(key in dst)) return;
    if (typeof src[key] === 'number') {
      if (!(key in dst)) dst[key] = 0;
      assert.equal(typeof dst[key], 'number');
      dst[key] += src[key] * n;
    } else if (typeof src[key] === 'object' && !Array.isArray(src[key]) && typeof dst[key] !== 'number') {
      if (!dst[key]) dst[key] = {};
      assert.equal(typeof dst[key], 'object');
      addInternal(dst[key], src[key], n);
    }
  });
}
/*
function applyInternal(stats, bonus) {
  const out = { ...stats };
  Object.keys(bonus).forEach((key) => {
    if (key in out) {
      if (typeof bonus[key] === 'number') {
        assert.equal(typeof out[key], 'number');
        out[key] *= 1 + bonus[key];
      } else if (typeof bonus[key] === 'object') {
        if (key !== 'recon') {
          assert.equal(typeof out[key], 'object');
        } else {
          return;
        }
        out[key] = applyInternal(out[key], bonus[key]);
      }
    } else {
      out[key] = bonus[key];
    }
  });
  return out;
}
*/
class Bonus {
  constructor(obj) {
    this.add(obj);
  }

  add(obj, n = 1) {
    if (!obj) return;
    addInternal(this, obj, n);
  }
/*
  applyTo(obj) {
    assert(obj);
    return applyInternal(obj, this);
  }
*/
}

export default Bonus;
