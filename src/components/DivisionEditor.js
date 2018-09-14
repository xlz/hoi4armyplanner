import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { sprintf } from 'sprintf-js';
import { Label, Dropdown, Icon, Accordion } from 'semantic-ui-react';
import UnitBonus from '../lib/UnitBonus';

function stringify(obj, root = true) {
  return Object.keys(obj).map((key) => {
    const content = typeof obj[key] === 'object' ? '\n  ' + stringify(obj[key], false) :
      typeof obj[key] === 'number' ? obj[key] && sprintf('%.3f', obj[key]).replace(/\.?0+$/, '') :
      obj[key];
    return content && /\S/.test(content) && sprintf('%s  %s', key, content);
  }).filter(e => e).join(root ? '\n' : '\n  ');
}

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
      <Accordion panels={[{
        key: 0,
        title: 'Full Stats',
        content: {
          content: (
            <pre className='stats'>
              {stringify(extra)}
            </pre>
          )
        }
      }]}/>
      <Accordion panels={[{
        key: 0,
        title: 'Edit',
        content: {
          content: <React.Fragment>
            <Label.Group>
            { Object.keys(units).filter(e => units[e]).map(unit =>
              <Label key={unit} basic size='small'>
                  { possibleUnits[db.groupByUnit[unit]] && possibleUnits[db.groupByUnit[unit]].includes(unit) &&
                    <Icon name='plus' link onClick={() => { division.addUnit(unit); }} /> }
                  <Icon name='minus' link onClick={() => { division.removeUnit(unit); }} />
                {l10n.unit[unit]}
                { units[unit] > 1 && <Label.Detail>x{units[unit]}</Label.Detail> }
              </Label>)}
            </Label.Group>
            <Label.Group>
              { Object.keys(possibleUnits).length > 1 &&
                <span>New unit: </span>
              }
              { Object.keys(possibleUnits).map((group) => {
                  if (!possibleUnits[group]) return null;
                  const options = possibleUnits[group].filter(e => !units[e])
                    .map(e => ({ key: e, text: l10n.unit[e].replace(/^Support | Company$/, ''), value: e}));
                  return <Label key={group} size='medium' basic>
                    <Dropdown text={group} options={options} selectOnBlur={false} basic scrolling={options.length > 10}
                      onChange={(e, d) => { division.addUnit(d.value); }}/>
                  </Label>;
              })}
            </Label.Group>
            <Label.Group>
              { division.neededArchetypes.filter(e => division.possibleEquipmentNames[e].length > 1).length > 0 &&
                <span>Equipment options: </span>
              }
              { division.neededArchetypes.map((arch) => {
                  if (division.possibleEquipmentNames[arch].length === 1) return false;
                  const possible = division.possibleEquipmentNames[arch];
                  const options = possible.map(e => ({ key: e, text: l10n.equipment[e], value: e }));
                  const archName = (l10n.equipment[`${arch}_1`] || l10n.equipment[arch]).replace(/ I$/, '');
                  options.unshift({ key: false, text: `(Current)`, value: false});
                  return <Label key={arch} size='medium' basic>
                    <Dropdown arch={arch} text={archName} selectOnBlur={false}
                      defaultValue={division.equipmentNames[arch] || false}
                      options={options} onChange={(e, d) => { division.setEquipmentName(arch, d.value); }}/>
                  </Label>
              })}
            </Label.Group>
          </React.Fragment>,
        },
      }]}/>
    </React.Fragment>;
  }
};

export default DivisionEditor;
