import assert from 'assert';
import { observable, computed, action } from 'mobx';
import Equipment from './Equipment';
import EquipmentBonus from './EquipmentBonus';
import UnitBonus from './UnitBonus';
import Bonus from './Bonus';
import { min, max, avg, removeFalsies } from './utils';

class Division {
  @observable country;
  @observable units;
  @observable equipmentNames;

  constructor(db, country, state = {}) {
    this.db = db;
    this.country = country;
    this.units = { ...state.units };
    this.equipmentNames = { ...state.equipmentNames };
  }

  toJSON() {
    return {
      units: removeFalsies(this.units),
      equipmentNames: removeFalsies(this.equipmentNames),
    };
  }

  @action setCountry(country) {
    this.country = country;
  }

  @action addUnit(name) {
    this.units[name] = 1 + (this.units[name] || 0);
    this.validateUnits(this.units);
  }

  @action removeUnit(name) {
    assert(this.units[name] > 0, 'No units to remove');
    this.units[name]--;
  }

  validateUnits(units) {
    const {
      MAX_DIVISION_BRIGADE_WIDTH,
      MAX_DIVISION_BRIGADE_HEIGHT,
      MAX_DIVISION_SUPPORT_HEIGHT,
    } = this.db.common.defines.NDefines.NMilitary;
    const groups = {};
    Object.keys(units).forEach((name) => {
      const group = this.db.common.sub_units[name].group;
      const count = units[name];
      assert(group, 'Unit has no group');
      assert(group !== 'support' || count <= 1, 'Duplicate support units');
      groups[group] = count + (groups[group] | 0);
    });
    assert(!groups.support || groups.support <= MAX_DIVISION_SUPPORT_HEIGHT, 'More than 5 support units');
    let numRegiments = 0;
    Object.keys(groups).forEach((name) => {
      if (name === 'support') return;
      numRegiments += Math.ceil(groups[name] / MAX_DIVISION_BRIGADE_HEIGHT);
    });
    assert(numRegiments <= MAX_DIVISION_BRIGADE_WIDTH, 'More than 5 regiments');
  }

  @computed get possibleUnits() {
    const result = {};
    this.db.unitNames.forEach((name) => {
      const { group } = this.db.common.sub_units[name];
      if (!group) return;
      try {
        this.validateUnits({ ...this.units, [name]: 1 + (this.units[name] || 0 )});
        if (!result[group]) result[group] = [];
        result[group].push(name);
      } catch (e) {
        // Ignores.
      }
    });
    return result;
  }

  @computed get neededArchetypes() {
    const archetypes = [];
    Object.keys(this.units).forEach((name) => {
      const count = this.units[name];
      if (!count) return;
      const unit = this.db.common.sub_units[name];
      archetypes.push(...Object.keys(unit.need));
    });
    return this.db.archetypeNames.filter(e => archetypes.includes(e));
  }

  @computed get possibleEquipmentNames() {
    const equipments = this.db.common.equipments;
    const equipmentNames = Object.keys(equipments);
    const names = {};
    this.neededArchetypes.forEach((arch) => {
      names[arch] = equipmentNames.filter(e => equipments[e].archetype === arch);
    });
    return names;
  }

  @computed get selectableArchetypes() {
    return this.neededArchetypes.filter(e => this.possibleEquipmentNames[e].length > 1);
  }

  @computed get defaultEquipmentNames() {
    const equipments = this.db.common.equipments;
    const defaults = {};
    this.neededArchetypes.forEach((arch) => {
      const possible = this.possibleEquipmentNames[arch].slice().reverse();
      const chosen = possible.find(e => equipments[e].year <= this.country.year) || possible.pop();
      assert(chosen, 'No equipment possible');
      defaults[arch] = chosen;
    });
    return defaults;
  }

  // Default if name is falsy.
  @action setEquipmentName(arch, name) {
    if (!name) {
      this.equipmentNames[arch] = name;
      return;
    }
    assert(this.neededArchetypes.includes(arch), 'Archetype not needed');
    assert(this.possibleEquipmentNames[arch].includes(name), 'Invalid equipment')
    this.equipmentNames[arch] = name;
  }

  @computed get equipments() {
    const result = {};
    this.neededArchetypes.forEach((arch) => {
      const name = this.equipmentNames[arch] || this.defaultEquipmentNames[arch];
      result[arch] = new Equipment(this.db, this.country, name);
    });
    return result;
  }

  @computed get types() {
    const result = {};
    let maxUnit = null;
    let max = -1;
    Object.keys(this.units).forEach((unitName) => {
      const count = this.units[unitName];
      if (!count) return;
      const unit = this.db.common.sub_units[unitName];
      const priority = unit.priority * count;
      if (priority > max) {
        max = priority;
        maxUnit = unit;
      }
    });
    if (maxUnit) {
      if (Array.isArray(maxUnit.type)) {
        maxUnit.type.forEach((type) => {
          result[type] = true;
        });
      }
      if (maxUnit.special_forces === 'yes') {
        result.special_forces = true;
      }
      if (maxUnit.cavalry === 'yes') {
        result.cavalry = true;
      }
    }
    return result;
  }

  @computed get parachutable() {
    let result = true;
    Object.keys(this.units).forEach((unitName) => {
      const count = this.units[unitName];
      if (!count) return;
      const unit = this.db.common.sub_units[unitName];
      if (unit.can_be_parachuted !== 'yes') {
        result = false;
      }
    });
    return result;
  }

  getUnitStats(unitName) {
    const unit = this.db.common.sub_units[unitName];
    const unitBonus = this.country.templateBonusByUnit[unitName];
    const eqBase = new EquipmentBonus();
    let build_cost_ic = 0;
    let maximum_speed = 0;
    Object.keys(unit.need).forEach((arch) => {
      const { stats } = this.equipments[arch];
      build_cost_ic += stats.build_cost_ic * unit.need[arch];
      if (!unit.transport || unit.transport === arch) {
        maximum_speed = stats.maximum_speed;
      }
      eqBase.add(stats);
    });
    return { ...unitBonus, ...eqBase.apply(unitBonus), build_cost_ic, maximum_speed };
  }

  @computed get templateStats() {
    const total = new UnitBonus();
    const frontlineTotal = new Bonus();
    const supportTotal = new Bonus();
    const all = [];
    const frontline = [];
    const support = [];
    Object.keys(this.units).forEach((name) => {
      const count = this.units[name];
      if (!count) return;
      const group = this.db.common.sub_units[name].group;
      const stats = this.getUnitStats(name);
      for (let i = 0; i < count; ++i) {
        total.add(stats);
        all.push(stats);
        if (group !== 'support') {
          frontlineTotal.add(stats);
          frontline.push(stats);
        } else {
          supportTotal.add(stats);
          support.push(stats);
        }
      }
    });

    const {
      PEN_VS_AVERAGE,
      ARMOR_VS_AVERAGE,
      SLOWEST_SPEED,
    } = this.db.common.defines.NDefines.NMilitary;
    total.ap_attack = PEN_VS_AVERAGE * max(all.map(e => e.ap_attack)) +
      (1 - PEN_VS_AVERAGE) * avg(all.map(e => e.ap_attack));
    total.armor_value = ARMOR_VS_AVERAGE * max(all.map(e => e.armor_value)) +
      (1 - ARMOR_VS_AVERAGE) * avg(all.map(e => e.armor_value));
    total.hardness = avg(frontline.map(e => e.hardness));
    total.maximum_speed = all.length && Math.max(min(frontline.map(e => e.maximum_speed)), SLOWEST_SPEED);

    total.default_morale = all.length && total.default_morale / all.length;
    total.max_organisation = all.length && total.max_organisation / all.length;
    total.training_time = max(all.map(e => e.training_time));

    this.db.combatModifierNames.forEach((terrain) => {
      const bonus = {};
      ['movement', 'attack', 'defence'].forEach((type) => {
        if (frontline.length && frontlineTotal[terrain] && frontlineTotal[terrain][type]) {
          bonus[type] = frontlineTotal[terrain][type] / frontline.length;
        }
        if (supportTotal[terrain] && supportTotal[terrain][type]) {
          bonus[type] = supportTotal[terrain][type] + (bonus[type] || 0);
        }
      });
      if (Object.keys(bonus).length) {
        total[terrain] = bonus;
      }
    });

    // TODO: minimum consumption
    total.add(this.country.templateBonus);
    return total;
  }

  @computed get stats() {
    const result = new Bonus();
    result.add(this.templateStats);
    result.add(this.country.countryBonus);
    result.add(this.country.commanderBonus);
    return result;
  }

  getTypeAttackBonus(bonus) {
    let result = 0;
    result += bonus.army_attack_factor || 0;
    const types = this.types;
    if (types.infantry) result += bonus.army_infantry_attack_factor || 0;
    if (types.armor) result += bonus.army_armor_attack_factor || 0;
    if (types.artillery) result += bonus.army_artillery_attack_factor || 0;
    if (types.cavalry) result += bonus.cavalry_attack_factor || 0;
    if (types.mechanized) result += bonus.mechanized_attack_factor || 0;
    if (types.motorized) result += bonus.motorized_attack_factor || 0;
    if (types.special_forces) result += bonus.special_forces_attack_factor || 0;
    return result;
  }

  getTypeDefendBonus(bonus) {
    let result = 0;
    result += bonus.army_defence_factor || 0;
    const types = this.types;
    if (types.infantry) result += bonus.army_infantry_defence_factor || 0;
    if (types.armor) result += bonus.army_armor_defence_factor || 0;
    if (types.artillery) result += bonus.army_artillery_defence_factor || 0;
    if (types.cavalry) result += bonus.cavalry_defence_factor || 0;
    if (types.mechanized) result += bonus.mechanized_defence_factor || 0;
    if (types.motorized) result += bonus.motorized_defence_factor || 0;
    if (types.special_forces) result += bonus.special_forces_defence_factor || 0;
    return result;
  }

  getCombatModifiers(isAttacker) {
    const attack = {};
    const defend = {};
    const { NMilitary } = this.db.common.defines.NDefines;

    // Commander Skill
    attack.BM_LEADER_BONUS = this.getTypeAttackBonus(this.country.commanderBonus) +
      this.country.commanderBonus.offence;
    defend.BM_LEADER_BONUS = this.getTypeDefendBonus(this.country.commanderBonus) +
      this.country.commanderBonus.defence;

    // Country
    attack.BM_COUNTRY_BONUS = this.getTypeAttackBonus(this.country.countryBonus);
    defend.BM_COUNTRY_BONUS = this.getTypeDefendBonus(this.country.countryBonus);

    // Entrenchment
    // TODO: verify
    if (!isAttacker && this.country.scenario.entrenchment) {
      const { UNIT_DIGIN_CAP, DIG_IN_FACTOR } = NMilitary;
      const level = UNIT_DIGIN_CAP + this.stats.entrenchment +
        this.stats.max_dig_in * (1 + this.stats.max_dig_in_factor);
      attack.BM_DUGIN_MODIFIER = level * DIG_IN_FACTOR;
      defend.BM_DUGIN_MODIFIER = level * DIG_IN_FACTOR;
    }

    // Experience
    const { EXPERIENCE_COMBAT_FACTOR } = NMilitary;
    const level = 1;
    attack.BM_EXPERIENCE = EXPERIENCE_COMBAT_FACTOR * level;
    defend.BM_EXPERIENCE = EXPERIENCE_COMBAT_FACTOR * level;

    // Planning Bonus
    // TODO: verify
    if (isAttacker && this.country.scenario.planning) {
      const { PLANNING_MAX } = NMilitary;
      attack.BM_PLANNING = PLANNING_MAX + this.stats.max_planning;
      defend.BM_PLANNING = PLANNING_MAX + this.stats.max_planning;
    }

    // Exceeding Combat Width
    const { BASE_COMBAT_WIDTH, COMBAT_OVER_WIDTH_PENALTY } = NMilitary;
    // TODO: ???

    // Stacking Penalty
    // TODO

    // Enemy air superiority
    // Enemy air superiority reduction
    // Night
    // Low Supply

    // Terrain
    // Fort
    // Naval Penalty
    // River crossing

    // TODO:
    // Shore Bombardment
    // Paradrop

    // Not modeled:
    // Air support
    // Attacking from multiple directions
    // Border War Organization
    // Commander Ability Bonus
    // Commitment to the War
    // Decryption Advantage
    // Encirclement Penalty
    // In multiple combat
    // Multiple attackers (BM_ENVELOPMENT_PENALTY) - Not used in game?
    // Weather
  }

  @computed get defendModifiers() {
    // Commander Skill
    // Experience
    // Decryption Advantage
    // Commander Ability Bonus
    // Entrenchment

    // Exceeding Combat Width
    // Encirclement Penalty
    // Naval Penalty
    // Fort
    // Enemy air superiority
    // Enemy air superiority reduction
    // River crossing
    // Night
    // Country
    // Terrain
    // Planning Bonus
    // Low Supply
    // Stacking Penalty

    // Multiple attackers (BM_ENVELOPMENT_PENALTY) - Not used in game?
    // Commitment to the War - not modeled
    // Weather - not modeled
    // In multiple combat - not modeled
    // Air support - not modeled
    // Shore Bombardment - not modeled
    // Paradrop - not modeled
    // Attacking from multiple directions - not modeled
    // Border War Organization - not modeled
  }

  @computed get code() {
    const unit_code = this.db.l10n.unit_code;
    const unitCodes = this.db.unitNames.filter(e => this.units[e]).map((name) => {
      const isSupport = this.db.common.sub_units[name].group === 'support';
      return `${isSupport ? '' : this.units[name]}${unit_code[name].toUpperCase()}`
    });
    const archCodes = this.neededArchetypes.filter(e => this.equipmentNames[e])
      .map(e => this.equipments[e].code);
    return `${unitCodes.join(' ') || '-'}${archCodes.length ? ' @ ' : ''}${archCodes.join(' ')}`;
  }
};

export default Division;
