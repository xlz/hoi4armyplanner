import { observable, computed, action } from 'mobx';
import Country from './Country';
import Bonus from './Bonus';

const defaultProps = {
  startYear: 1936,
  year: 1936,
  theater: {},
  terrain: 'plains',
  terrainParameter: undefined,
  air: { winner: null, buffed: false },
  planning: false,
  entrenchment: true,
};

class Scenario {
  @observable year;
  @observable theater;
  @observable terrain;
  @observable terrainParameter;
  @observable air;
  @observable planning;
  @observable entrenchment;
  @observable attacker;
  @observable defender;

  constructor(db, state = {}) {
    this.db = db;
    Object.assign(this, { ...defaultProps, ...state });
    this.attacker = new Country(db, this, this.attacker);
    this.defender = new Country(db, this, this.defender);
  }

  toJSON() {
    const { db, ...state } = this;
    return state;
  }

  @computed get averageTerrain() {
    if (!this.theater.continent) return this.terrain;
    const count = {};
    (this.theater.regions || []).forEach((name) => {
      const region = this.db.map.strategic_regions[this.theater.continent][name];
      if (!region) return;
      Object.keys(region.terrain).forEach((terrain) => {
        count[terrain] = region.terrain[terrain] + (count[terrain] | 0);
      });
    });
    let sum = 0;
    const normalized = {};
    this.db.terrainNames.forEach((terrain) => {
      if (count[terrain]) {
        normalized[terrain] = count[terrain];
        sum += count[terrain];
      }
    });
    this.db.terrainNames.forEach((terrain) => {
      if (normalized[terrain]) {
        normalized[terrain] /= sum;
      }
    });
    return normalized;
  }

  @computed get technologyBonus() {
    const bonus = new Bonus();
    Object.keys(this.db.technologies).forEach((year) => {
      if (year > this.year) return;
      const techs = this.db.technologies[year];
      bonus.add(techs);
    });
    return bonus;
  }

  @action setYear(value) {
    this.year = value;
  }

  @action setTheater(value) {
    Object.assign(this.theater, value);
  }

  @action setTerrain(value) {
    if (value !== this.terrain) {
      this.terrainParameter = undefined;
    }
    this.terrain = value;
  }

  @action setTerrainParameter(value) {
    this.terrainParameter = value;
  }

  @computed get possibleTerrainParameter() {
    if (this.terrain === 'fort') {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(e => '' + e);
    }
    if (this.terrain === 'river') {
      return ['small', 'large'];
    }
    return false;
  }

  @action setAir(value) {
    Object.assign(this.air, value);
  }

  @action setPlanning(value) {
    this.planning = value;
  }

  @action setEntrenchment(value) {
    this.entrenchment = value;
  }
}

export default Scenario;
