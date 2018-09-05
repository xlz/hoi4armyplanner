import { observable, action } from 'mobx';
import Country from './Country';

class Scenario {
  @observable year;
  @observable attacker;
  @observable defender;
  @observable terrain;
  @observable air;

  constructor(db, state = {}) {
    this.db = db;
    this.startYear = 1936;
    this.year = state.year || 1940;
    this.attacker = new Country(db, this, state.attacker);
    this.defender = new Country(db, this, state.defender);
    this.terrain = { ...state.terrain };
    this.air = { winner: null, buffed: false, ...state.air };
    // attrition
    // am attacker
  }

  toJSON() {
    const { db, ...state } = this;
    return state;
  }

  @action setYear(year) {
    this.year = year;
  }

  @action setTerrain(terrain) {
    this.terrain = terrain;
  }

  @action setAir(winner, buffed) {
    this.air = { winner, buffed };
  }
}

export default Scenario;
