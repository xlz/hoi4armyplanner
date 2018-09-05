import assert from 'assert';
import { observable, computed } from 'mobx';
import EquipmentBonus from './EquipmentBonus';

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

  @computed get bonus() {
    const b = new EquipmentBonus();
    b.add(this.country.bonus.equipment_bonus);
    b.add(this.country.upgrades[this.archetype]);
    return b;
  }

  getUpgradeCost() {
    assert(Object.values(this.upgradeObjects).every(e => e.cost === 'land'), 'Upgrade type not implemented');
    const base = this.db.common.defines.Ndefines.NMilitary.LAND_EQUIPMENT_BASE_COST;
    const ramp = this.db.common.defines.Ndefines.NMilitary.LAND_EQUIPMENT_RAMP_COST;
    const n = Object.values(this.upgradeObjects).reduce((a, b) => a.level + b.level, 0);
    return base * n + ramp * n * (n - 1) / 2;
  }

  @computed get stats() {
    const b = new EquipmentBonus(this.bonus);
    if (this.archetype in this.bonus) {
      b.add(this.bonus[this.archetype]);
    }
    return b.applyTo(this);
  }

  //toString() {
  //  const l10n = this.db.l10n.equipment;
  //  const upgradeStrings = Object.values(this.upgradeObjects).map(e => e.toString()).filter(e => e);
  //  const hasUpgrades = upgradeStrings.length;
  //  return `${l10n[this.name]}${hasUpgrades ? ' (' : ''}${upgradeStrings.join(', ')}${hasUpgrades ? ')' : ''}`;
  //}

  @computed get code() {
    const arch_code = this.db.l10n.archetype_code;
    const yearCode = this.year % 100;
    return `${arch_code[this.archetype]}${yearCode}`;
  }
}

export default Equipment;
