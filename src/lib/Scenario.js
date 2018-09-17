import { observable, computed, action } from 'mobx';
import Country from './Country';

const defaultProps = {
  startYear: 1936,
  year: 1940,
  theater: {},
  terrain: 'plains',
  air: { winner: null, buffed: false },
  planning: false,
  entrenchment: true,
};

class Scenario {
  @observable year;
  @observable theater;
  @observable terrain;
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

  @action setYear(value) {
    this.year = value;
  }

  @action setTheater(value) {
    Object.assign(this.theater, value);
  }

  @action setTerrain(value) {
    this.terrain = value;
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
