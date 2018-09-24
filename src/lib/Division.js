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

  @computed get year() {
    return this.country.year;
  }

  @computed get bonus() {
    return this.country.bonus;
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
      const chosen = possible.find(e => equipments[e].year <= this.year) || possible.pop();
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

  // seems redundant
  @computed get equipmentStats() {
    const stats = {};
    this.neededArchetypes.forEach((arch) => {
      stats[arch] = this.equipments[arch].stats;
    });
    return stats;
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

  @computed get stats() {
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

    this.db.terrainNames.forEach((terrain) => {
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

    // TODO: type
    // TODO: minimum consumption
    total.add(this.country.templateBonus);
    return total;
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
