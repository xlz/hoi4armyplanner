import assert from 'assert';
import { observable, computed, action } from 'mobx';
import Division from './Division';
import Upgrade from './Upgrade';
import Bonus from './Bonus';
import EquipmentBonus from './EquipmentBonus';
import { sum, removeFalsies } from './utils';

const defaultProps = {
  tradeLaw: 'export_focus',
  mobilizationLaw: 'limited_conscription',
  armyChief: '',
  highCommand: [],
  tankManufacturer: '',
  airChief: '',
  ideas: [],
  doctrine: 'SFRR',
  fieldMarshal: {
    level: 4, attack: 3, defense: 3, logistics: 3, planning: 3, traits: [],
  },
  general: {
    level: 4, attack: 3, defense: 3, logistics: 3, planning: 3, traits: [],
  },
  division: {},
  upgrades: {},
  density: 1,
  factories: 10,
  supply: 100,
};

class Country {
  // Country is tied to Scenario.
  constructor(db, scenario, state = {}) {
    this.db = db;
    this.scenario = scenario;
    Object.assign(this, { ...defaultProps, ...state });
    this.division = new Division(db, this, this.division);
    Object.keys(this.upgrades).forEach((arch) => {
      this.upgrades[arch] = new Upgrade(db, arch, this.upgrades[arch]);
    });
  }

  toJSON() {
    const { db, scenario, upgrades, ...state } = this;
    return { ...state, upgrades: removeFalsies(this.upgrades) };
  }

  @observable tradeLaw;
  @observable mobilizationLaw;
  @action setTradeLaw(value) {
    this.tradeLaw = value;
  }
  @action setMobilizationLaw(value) {
    this.mobilizationLaw = value;
  }

  @observable armyChief;
  @observable tankManufacturer;
  @observable airChief;
  @observable highCommand;
  @observable ideas;
  @computed get advisorCountries() {
    const sets = [];
    const addCountries = (obj, value) => {
      const values = Array.isArray(value) ? value : [value];
      values.forEach((value) => {
        if (!value) return;
        const { countries } = obj[value];
        assert(Array.isArray(countries) && countries.length > 0);
        sets.push(countries);
      });
    }
    addCountries(this.db.common.ideas.army_chief, this.armyChief);
    addCountries(this.db.common.ideas.high_command, this.highCommand);
    addCountries(this.db.common.ideas.tank_manufacturer, this.tankManufacturer);
    addCountries(this.db.common.ideas.air_chief, this.airChief);
    addCountries(this.db.common.ideas.country, this.ideas);
    if (sets.length === 0) return true;
    let current = sets[0];
    sets.slice(1).forEach((set) => {
      current = current.filter(e => set.includes(e));
    });
    return [...new Set(current)];
  }
  getAdvisorNames(names, dbObj) {
    const countries = this.advisorCountries;
    if (countries === true) return names;
    return names.filter((e) => {
      return dbObj[e].countries.some(f => countries.includes(f));
    });
  }
  @computed get armyChiefNames() {
    return this.getAdvisorNames(this.db.armyChiefNames, this.db.common.ideas.army_chief);
  }
  @computed get tankManufacturerNames() {
    return this.getAdvisorNames(this.db.tankManufacturerNames, this.db.common.ideas.tank_manufacturer);
  }
  @computed get airChiefNames() {
    return this.getAdvisorNames(this.db.airChiefNames, this.db.common.ideas.air_chief);
  }
  @computed get highCommandNames() {
    if (this.highCommand.length >= 3) return [];
    return this.getAdvisorNames(this.db.highCommandNames, this.db.common.ideas.high_command);
  }
  @computed get ideaNames() {
    return this.getAdvisorNames(this.db.ideaNames, this.db.common.ideas.country);
  }
  @action setArmyChief(value) {
    this.armyChief = value;
  }
  @action setTankManufacturer(value) {
    this.tankManufacturer = value;
  }
  @action setAirChief(value) {
    this.airChief = value;
  }
  @action.bound setHighCommand(value) {
    this.highCommand = value;
  }
  @action.bound setIdeas(value) {
    this.ideas = value;
  }

  @observable doctrine;
  @action setDoctrine(value) {
    this.doctrine = value;
  }

  @observable fieldMarshal;
  @observable general;
  isTraitAvailable(newName, names) {
    if (names.includes(newName)) return false;
    let num_terrain_traits = 0;
    let num_parents = 0;
    let has_xor = false;
    const { leader_traits } = this.db.common.unit_leader;
    const newTrait = leader_traits[newName];
    const has = (a, b) => (a === b || (Array.isArray(a) && a.includes(b)));
    names.forEach((name) => {
      if (has(newTrait.parent, name)) {
        num_parents++;
      }
      const trait = leader_traits[name];
      if (trait.trait_type && trait.trait_type.includes('terrain')) {
        num_terrain_traits++;
      }
      if (!has_xor && has(newTrait.mutually_exclusive, name)) {
        has_xor = true;
      }
    });
    if (newTrait.num_parents_needed && newTrait.num_parents_needed > num_parents) return false;
    if (newTrait.parent && num_parents === 0) return false;
    if (newTrait.mutually_exclusve && has_xor) return false;
    if (newTrait.prerequisites) {
      if (newTrait.prerequisites.has_trait) {
        if (!names.includes(newTrait.prerequisites.has_trait)) return false;
      }
      if (newTrait.check_variable && newTrait.check_variable.num_terrain_traits === '>0') {
        if (num_terrain_traits === 0) return false;
      }
    }
    return true;
  }
  getSelectableTraits(traits, existingTraits) {
    const result = { personality: [], traits: [], terrain: []};
    const { leader_traits } = this.db.common.unit_leader;
    traits.filter(e => this.isTraitAvailable(e, existingTraits)).forEach((name) => {
      const trait = leader_traits[name];
      if (trait.trait_type === 'personality_trait') {
        result.personality.push(name);
      } else if (trait.trait_type && trait.trait_type.includes('terrain')) {
        result.terrain.push(name);
      } else {
        result.traits.push(name);
      }
    });
    return result;
  }
  @computed get selectableFieldMarshalTraits() {
    return this.getSelectableTraits(this.db.skills.field_marshal.traits, this.fieldMarshal.traits);
  }
  @computed get selectableGeneralTraits() {
    return this.getSelectableTraits(this.db.skills.general.traits, this.general.traits);
  }
  @action setFieldMarshal(value) {
    Object.assign(this.fieldMarshal, value);
  }
  @action setGeneral(value) {
    Object.assign(this.general, value);
  }

  @observable density;
  @action setDensity(value) {
    this.density = value;
  }

  @observable upgrades;
  @computed get variantNames() {
    return this.db.upgradeableArchetypes.filter(e => this.upgrades[e]);
  }
  @computed get possibleVariantNames() {
    return this.db.upgradeableArchetypes.filter(e => !this.upgrades[e]);
  }
  @action addUpgrade(archetype) {
    this.upgrades[archetype] = new Upgrade(this.db, archetype);
  }
  @action removeUpgrade(archetype) {
    this.upgrades[archetype] = undefined;
  }

  @observable factories;
  @action setFactories(value) {
    this.factories = value;
  }

  @observable supply;
  @action setSupply(value) {
    this.supply = value;
  }

  @observable division;

  @computed get upgradeCost() {
    const usedUpgrades = this.division.neededArchetypes.filter(e => this.upgrades[e]);
    const n = sum(usedUpgrades.map((arch => sum(Object.values(this.upgrades[arch].levels)))));
    const { LAND_EQUIPMENT_BASE_COST, LAND_EQUIPMENT_RAMP_COST } = this.db.common.defines.NDefines.NMilitary;
    return LAND_EQUIPMENT_BASE_COST * n + LAND_EQUIPMENT_RAMP_COST * n * (n - 1) / 2;
  }

  @computed get countryBonus() {
    const bonus = new Bonus();
    const { ideas } = this.db.common;
    bonus.add(ideas.trade_laws[this.tradeLaw].modifier);
    bonus.add(ideas.mobilization_laws[this.mobilizationLaw].modifier);
    bonus.add(ideas.army_chief[this.armyChief]);
    bonus.add(ideas.air_chief[this.airChief]);
    bonus.add(ideas.tank_manufacturer[this.tankManufacturer]);
    this.highCommand.forEach((key) => { bonus.add(ideas.high_command[key]); });
    this.ideas.forEach((key) => { bonus.add(ideas.country[key].modifier); });
    Object.keys(this.upgrades).filter(e => this.upgrades[e]).forEach((arch) => {
      const { levels } = this.upgrades[arch];
      Object.keys(levels).forEach((type) => {
        bonus.add({ equipment_bonus: { [arch]: this.db.common.upgrades[type] } }, levels[type]);
      });
    });

    return bonus;
  }

  // bonus by archetype
  @computed get equipmentBonus() {
    const result = {};
    const bonuses = this.countryBonus.equipment_bonus || {};
    this.db.archetypeNames.forEach((archetype) => {
      const b = new EquipmentBonus(bonuses[archetype]);
      const { type } = this.db.common.equipments[archetype];
      const types = (Array.isArray(type) ? type : [type]);
      types.forEach((t) => {
        b.add(bonuses[t]);
      });
      result[archetype] = b;
    });
    return result;
  }

  @computed get technologyBonus() {
    return this.scenario.technologyBonus;
  }

  @computed get doctrineBonus() {
    const doctrineList = this.db.landDoctrines[this.doctrine];
    const { BASE_TECH_COST } = this.db.common.defines.NDefines.NTechnology;
    const freeStartProgress = 150;
    const currentDay = (this.year - this.scenario.startYear + 0.5) * 365 + freeStartProgress;
    const doctrine = doctrineList.slice().reverse().find(e => e.research_cost * BASE_TECH_COST <= currentDay);
    assert(doctrine);
    const { research_cost, ...filtered } = doctrine;
    return filtered;
  }

  @computed get templateBonus() {
    const b = new Bonus();
    b.add(this.technologyBonus);
    b.add(this.doctrineBonus);
    return b;
  }

  // bonus by unit name
  @computed get templateBonusByUnit() {
    const result = {};
    const bonuses = this.templateBonus;
    this.db.unitNames.forEach((unitName) => {
      const unit = this.db.common.sub_units[unitName];
      const bonus = new Bonus(unit);
      if (unitName in bonuses) {
        bonus.add(bonuses[unitName]);
      }
      unit.categories.forEach((category) => {
        if (category in bonuses) {
          bonus.add(bonuses[category]);
        }
      });
      result[unitName] = Object.freeze(bonus);
    });
    return result;
  }

  getCommanderBonus(props, commanderType) {
    const bonus = new Bonus();
    const { FIELD_MARSHAL_ARMY_BONUS_RATIO } = this.db.common.defines.NDefines.NMilitary;
    const factor = (commanderType === 'field_marshal' ? FIELD_MARSHAL_ARMY_BONUS_RATIO : 1);
    ['attack', 'defense', 'logistics', 'planning'].forEach((type) => {
      const skills = this.db.common.unit_leader[`leader_${type}_skills`][props[type]];
      const skill = skills.filter(e => e.type === commanderType)[0];
      bonus.add(skill.modifier, factor);
    });
    props.traits.forEach((traitName) => {
      const trait = this.db.common.unit_leader.leader_traits[traitName];
      bonus.add(trait.modifier, factor);
      if (commanderType === 'field_marshal') {
        bonus.add(trait.field_marshal_modifier);
      }
    });
    return bonus;
  }
  @computed get commanderBonus() {
    const bonus = new Bonus();
    bonus.add(this.getCommanderBonus(this.fieldMarshal, 'field_marshal'));
    bonus.add(this.getCommanderBonus(this.general, 'corps_commander'));
    return bonus;
  }

  @computed get year() {
    return this.scenario.year;
  }

}

export default Country;
