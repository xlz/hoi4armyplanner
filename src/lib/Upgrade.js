import assert from 'assert';
import { observable, computed, action } from 'mobx';
import EquipmentBonus from './EquipmentBonus';

class Upgrade {
  @observable levels;

  constructor(db, archetype, state = {}) {
    this.db = db;
    this.archetype = archetype;
    this.levels = { ...state };
  }

  toJSON() {
    return this.levels;
  }

  @computed get types() {
    return this.db.common.equipments[this.archetype].upgrades;
  }

  getLevels(type) {
    return [...Array(this.db.common.upgrades[type].max_level + 1).keys()];
  }

  @action setLevel(type, level) {
    const up = this.db.common.upgrades[type];
    assert(up, 'No such upgrade');
    assert(level >= 0, 'Negative level');
    assert(level <= up.max_level, 'Exceeds maximum level');
    this.levels[type] = level;
  }

  @computed get bonus() {
    const b = EquipmentBonus();
    Object.keys(this.levels).forEach((type) => {
      const up = this.db.common.upgrades[type];
      for (let i = 0; i < this.levels[type]; ++i) {
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
