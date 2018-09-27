import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Label, Icon } from 'semantic-ui-react';
import UnitBonus from '../lib/UnitBonus';
import { capitalize, formatJson } from '../lib/utils';
import LabelDropdown from './LabelDropdown';
import Drawer from './Drawer';

function pad(str, width) {
  return ' '.repeat(str.length < width ? width - str.length : 0) + str;
}

function round51(num) {
  let str = num.toFixed(1);
  if (str.length > 5) {
    str = num.toFixed(0);
  }
  return pad(str, 5);
}

@observer class DivisionEditor extends Component {
  render() {
    const { division } = this.props;
    const { db } = division;
    const { l10n } = db;
    const units = division.units;
    const possibleUnits = division.possibleUnits;
    const s = division.templateStats;
    const extra = new UnitBonus(s);

    return <React.Fragment>
      <p className='stats'><code>{division.code}</code></p>
      <pre className='stats'>
        { [
            ` SA|${round51(s.soft_attack)}  HA|${round51(s.hard_attack)}`,
            `Def|${round51(s.defense)} Brk|${round51(s.breakthrough)}`,
            `Org|${round51(s.max_organisation)}  HP|${round51(s.max_strength)}`,
            `Arm|${round51(s.armor_value)} Hrd|${pad((s.hardness * 100).toFixed(0), 3)}%`,
            ` AP|${round51(s.ap_attack)}  AA|${round51(s.air_attack)}`,
            ` IC|${pad(s.build_cost_ic.toFixed(0), 5)}   W|${round51(s.combat_width)}`,
            ].join('\n')}
      </pre>
      <Drawer title='Full Stats'>
        <pre className='stats'>
          {formatJson(extra)}
        </pre>
      </Drawer>
      <Drawer title='Edit'>
        <Label.Group>
          { Object.keys(possibleUnits).map(group =>
            <LabelDropdown key={group} add text={capitalize(group)} scrolling={possibleUnits[group].length > 10}
              onChange={(e, d) => { division.addUnit(d.value); }} options={
                possibleUnits[group].filter(e => !units[e]).map(e => (
                  {  key: e, text: l10n.unit[e].replace(/^Support | Company$/, ''), value: e }))}/>)}
        </Label.Group>
        <Label.Group>
          { db.unitNames.filter(e => units[e]).map(unit =>
            <Label key={unit} basic size='small'>
                { possibleUnits[db.groupByUnit[unit]] && possibleUnits[db.groupByUnit[unit]].includes(unit) &&
                  <Icon name='plus' size='small' link onClick={() => { division.addUnit(unit); }} /> }
                <Icon name='minus' size='small' link onClick={() => { division.removeUnit(unit); }} />
              {l10n.unit[unit]}
              { db.groupByUnit[unit] !== 'support' && <Label.Detail> ×{units[unit]}</Label.Detail> }
            </Label>)}
        </Label.Group>
        <Label.Group>
          { division.selectableArchetypes.length > 0 &&
            <span>Equipment options: </span>
          }
          { division.selectableArchetypes.map(arch =>
            <LabelDropdown key={arch} arch={arch}
              placeholder={db.equipmentShortName(arch)} value={division.equipmentNames[arch] || ''}
              onChange={(e, d) => { division.setEquipmentName(arch, d.value); }} options={
                ['', ...division.possibleEquipmentNames[arch]].map(e => (
                  { key: e, text: l10n.equipment[e] || '(Current)', value: e }))}/>)}
        </Label.Group>
      </Drawer>
    </React.Fragment>;
  }
};

export default DivisionEditor;
