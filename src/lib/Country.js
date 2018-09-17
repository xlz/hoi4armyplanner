import assert from 'assert';
import { observable, computed, action } from 'mobx';
import Division from './Division';
import Upgrade from './Upgrade';
import { removeFalsies } from './utils';

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
    level: 1, attack: 1, defense: 1, logistics: 1, planning: 1, traits: [], terrain: [],
  },
  general: {
    level: 1, attack: 1, defense: 1, logistics: 1, planning: 1, traits: [], terrain: [],
  },
  division: {},
  upgrades: {},
  density: 1,
  factories: 10,
  supply: 100,
};

class Country {
  @observable tradeLaw;
  @observable mobilizationLaw;
  @observable armyChief;
  @observable highCommand;
  @observable tankManufacturer;
  @observable airChief;
  @observable ideas;
  @observable doctrine;
  @observable fieldMarshal;
  @observable general;
  @observable division;
  @observable upgrades;
  @observable density;
  @observable factories;
  @observable supply;

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

  @computed get highCommandNames() {
    if (this.highCommand.length >= 3) return [];
    return this.getAdvisorNames(this.db.highCommandNames, this.db.common.ideas.high_command);
  }

  @computed get tankManufacturerNames() {
    return this.getAdvisorNames(this.db.tankManufacturerNames, this.db.common.ideas.tank_manufacturer);
  }

  @computed get airChiefNames() {
    return this.getAdvisorNames(this.db.airChiefNames, this.db.common.ideas.air_chief);
  }

  @computed get ideaNames() {
    return this.getAdvisorNames(this.db.ideaNames, this.db.common.ideas.country);
  }

  @computed get variantNames() {
    return this.db.upgradeableArchetypes.filter(e => this.upgrades[e]);
  }

  @computed get possibleVariantNames() {
    return this.db.upgradeableArchetypes.filter(e => !this.upgrades[e]);
  }

  @action setDoctrine(value) {
    this.doctrine = value;
  }

  @action setTradeLaw(value) {
    this.tradeLaw = value;
  }

  @action setMobilizationLaw(value) {
    this.mobilizationLaw = value;
  }

  @action setArmyChief(value) {
    this.armyChief = value;
  }

  @action.bound setHighCommand(value) {
    this.highCommand = value;
  }

  @action setTankManufacturer(value) {
    this.tankManufacturer = value;
  }

  @action setAirChief(value) {
    this.airChief = value;
  }

  @action.bound setIdeas(value) {
    this.ideas = value;
  }

  @action setFieldMarshal(value) {
    Object.assign(this.fieldMarshal, value);
  }

  @action setGeneral(value) {
    Object.assign(this.general, value);
  }

  @action addUpgrade(archetype) {
    this.upgrades[archetype] = new Upgrade(this.db, archetype);
  }

  @action removeUpgrade(archetype) {
    this.upgrades[archetype] = undefined;
  }

  @action setDensity(value) {
    this.density = value;
  }

  @action setFactories(value) {
    this.factories = value;
  }

  @action setSupply(value) {
    this.supply = value;
  }

  @computed get year() {
    return this.scenario.year;
  }

  @computed get bonus() {
    return {};
  }
}

export default Country;
