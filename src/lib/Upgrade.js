import assert from 'assert';
import { observable, computed, action } from 'mobx';
import EquipmentBonus from './EquipmentBonus';

class Upgrade {
  @observable levels;

  constructor(db, state = {}) {
    this.db = db;
    this.levels = { ...state };
  }

  toJSON() {
    return this.levels;
  }

  @action setLevel(name, level) {
    const up = this.db.common.upgrades[name];
    assert(up, 'No such upgrade');
    assert(level >= 0, 'Negative level');
    assert(level <= up.max_level, 'Exceeds maximum level');
    this.levels[name] = level;
  }

  @computed get bonus() {
    const b = EquipmentBonus();
    Object.keys(this.levels).forEach((name) => {
      const up = this.db.common.upgrades[name];
      for (let i = 0; i < this.levels[name]; ++i) {
        b.add(up);
      }
    });
    return b;
  }

  @computed get code() {
    return this.db.upgradeNames.filter(e => e in this.levels).map((name) => {
      const c = name.split('_').slice(-2)[0].slice(0, 3);
      return this.levels[name] && `${c}+${this.levels[name]}`;
    }).filter(e => e).join(',');
  }
}

export default Upgrade;
