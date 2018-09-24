import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { sprintf } from 'sprintf-js';
import { Label, Icon } from 'semantic-ui-react';
import UnitBonus from '../lib/UnitBonus';
import { capitalize, formatJson } from '../lib/utils';
import LabelDropdown from './LabelDropdown';
import Drawer from './Drawer';

@observer class DivisionEditor extends Component {
  render() {
    const { division } = this.props;
    const { db } = division;
    const { l10n } = db;
    const units = division.units;
    const possibleUnits = division.possibleUnits;
    const s = { ...division.stats };
    s.hardness *= 100;
    const extra = new UnitBonus(s);

    return <React.Fragment>
      <p className='stats'><code>{division.code}</code></p>
      <pre className='stats'>
        { sprintf([
            ' SA|%(soft_attack)5.1f  HA|%(hard_attack)5.1f',
            'Def|%(defense)5.1f Brk|%(breakthrough)5.1f',
            'Org|%(max_organisation)5.1f  HP|%(max_strength)5.1f',
            'Arm|%(armor_value)5.1f Hrd|%(hardness)3.0f%%',
            ' AP|%(ap_attack)5.1f  AA|%(air_attack)5.1f',
            ' IC|%(build_cost_ic)5.0f   W|%(combat_width)5.1f',
            ].join('\n'), s)}
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
