import assert from 'assert';
import { observable, computed, action } from 'mobx';
import Division from './Division';
import Upgrade from './Upgrade';

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
  @observable numFactories;

  // Country is tied to Scenario.
  constructor(db, scenario, state = {}) {
    this.db = db;
    this.scenario = scenario;
    this.tradeLaw = state.tradeLaw || 'export_focus';
    this.mobilizationLaw = state.mobilizationLaw || 'limited_conscription';
    this.armyChief = state.armyChief || '';
    this.highCommand = state.highCommand || [];
    this.tankManufacturer = state.tankManufacturer || '';
    this.airChief = state.airChief || '';
    this.ideas = state.ideas || [];
    this.doctrine = state.doctrine || 'SFRR';
    this.fieldMarshal = { ...state.fieldMarshal };
    this.general = { ...state.general };
    this.division = new Division(db, this, state.division);
    this.upgrades = {};
    Object.keys(state.upgrades || {}).forEach((arch) => {
      this.upgrades[arch] = new Upgrade(db, state.upgrades[arch]);
    });
    this.density = state.density || 1;
    this.numFactories = state.numFactories || 10;
  }

  toJSON() {
    const { db, scenario, ...state } = this;
    return state;
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

  @action setHighCommand(value) {
    this.highCommand = value;
  }

  @action setTankManufacturer(value) {
    this.tankManufacturer = value;
  }

  @action setAirChief(value) {
    this.airChief = value;
  }

  @action setIdeas(value) {
    this.ideas = value;
  }

  @computed get year() {
    return this.scenario.year;
  }

  @computed get bonus() {
    return {};
  }
}

export default Country;
