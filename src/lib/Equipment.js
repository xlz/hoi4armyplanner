import assert from 'assert';
import { observable, computed } from 'mobx';

class Equipment {
  @observable country;

  constructor(db, country, name) {
    assert(name in db.common.equipments, 'No such equipment');
    this.db = db;
    this.country = country;
    this.name = name;
    const eq = db.common.equipments[name];
    assert(eq.archetype, 'Equipment has no archetype');
    const archetype = db.common.equipments[eq.archetype];
    Object.assign(this, archetype, eq);
  }

  @computed get stats() {
    return this.country.equipmentBonus[this.archetype].applyTo(this);
  }

  @computed get code() {
    const arch_code = this.db.l10n.archetype_code;
    const yearCode = this.year % 100;
    return `${arch_code[this.archetype]}${yearCode}`;
  }
}

export default Equipment;
