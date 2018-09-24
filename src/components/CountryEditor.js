import React from 'react';
import { observer } from 'mobx-react';
import  { Dropdown, List, Label, Input } from 'semantic-ui-react';
import { capitalize, formatJson } from '../lib/utils';
import LabelDropdown from './LabelDropdown';
import LabelTray from './LabelTray';
import Drawer from './Drawer';

const MyDropdown = ({ value, options, onChange }) =>
  <LabelDropdown placeholder='true' value={value} inline
    text={options.filter(e => e.value === value)[0].text}>
    <Dropdown.Menu>
      { options.map(e => <Dropdown.Item key={e.value} {...e} onClick={onChange}
          active={value === e.value} selected={value === e.value}/>) }
    </Dropdown.Menu>
  </LabelDropdown>;

const Laws = observer(({ country, db, l10n }) =>
  <React.Fragment>
    <LabelDropdown defaultValue={country.tradeLaw}
      onChange={(e, d) => { country.setTradeLaw(d.value); }} options={
        db.tradeLawNames.map(e => ({ key: e, text: l10n.ideas[e], value: e }))}/>
    <LabelDropdown defaultValue={country.mobilizationLaw}
      onChange={(e, d) => { country.setMobilizationLaw(d.value); }} options={
        db.mobilizationLawNames.map(e => ({ key: e, text: l10n.ideas[e], value: e }))}/>
  </React.Fragment>
);

const HighCommand = observer(({ country, db, l10n }) =>
  <LabelTray selected={country.highCommand} addLabel='High Command' l10n={l10n.traits}
    onChange={country.setHighCommand} options={
      country.highCommandNames.map(e => ({ key: e, text: l10n.traits[e], value: e }))}/>
);

const Advisors = observer(({ country, db, l10n }) =>
  <React.Fragment>
    { country.armyChiefNames.length > 0 &&
      <MyDropdown value={country.armyChief} onChange={(e, d) => { country.setArmyChief(d.value); }}
        options={['', ...country.armyChiefNames].map(e => (
        { key: e, text: e ? l10n.traits[e] : `No ${l10n.ideas.army_chief}`, value: e }))}/>}
    { country.tankManufacturerNames.length > 0 &&
      <MyDropdown value={country.tankManufacturer} onChange={(e, d) => { country.setTankManufacturer(d.value); }}
      options={['', ...country.tankManufacturerNames].map(e => (
        { key: e, text: e ? l10n.traits[e] : `No ${l10n.ideas.tank_manufacturer}`, value: e }))}/>}
    { country.airChiefNames.length > 0 &&
      <MyDropdown value={country.airChief} onChange={(e, d) => { country.setAirChief(d.value); }}
      options={['', ...country.airChiefNames].map(e => (
        { key: e, text: e ? l10n.traits[e] : `No ${l10n.ideas.air_chief}`, value: e }))}/>}
    <HighCommand country={country} db={db} l10n={l10n}/>
    { country.advisorCountries !== true &&
      <Dropdown text='(Possible Countries)' selectOnBlur={false} scrolling={true} options={
        country.advisorCountries.map(e => ({ key: e, text: db.common.country_tags[e], value: e }))}/>}
  </React.Fragment>
);

const Ideas = observer(({ country, db, l10n }) =>
  <LabelTray selected={country.ideas} addLabel={l10n.ideas.country} l10n={l10n.ideas}
    onChange={country.setIdeas} options={
    country.ideaNames.map((e) => {
      const countries = [...new Set(db.common.ideas.country[e].countries)];
      const countryStr = countries.map(e => db.common.country_tags[e] || e).join(', ');
      return { key: e, text: `${l10n.ideas[e]} (${countryStr})`, value: e };
    })}/>
);

const Doctrine = observer(({ country, db }) =>
  <LabelDropdown defaultValue={country.doctrine} upward={false}
    onChange={(e, d) => { country.setDoctrine(d.value); }} options={
      db.landDoctrineNames.map(e => ({ key: e, text: e, value: e }))}/>
);

const FieldMarshal = observer(({ country, db, l10n }) =>
  <React.Fragment>
    { ['level', 'attack', 'defense', 'logistics', 'planning'].map(type =>
      <LabelDropdown key={type} defaultValue={country.fieldMarshal[type] + ''}
        onChange={(e, d) => { country.setFieldMarshal({ [type]: d.value }); }} options={
          Object.keys(db.skills.field_marshal[type]).map(e => (
            { key: e, text: `${capitalize(type)} ${e}`, value: e }))}/>)}
    <Label.Group>
      { ['personality', 'traits', 'terrain'].map(type =>
        country.selectableFieldMarshalTraits[type].length > 0 &&
        <LabelDropdown key={type} add text={capitalize(type)}
          onChange={(e, d) => { country.setFieldMarshal({ traits: [...country.fieldMarshal.traits, d.value] }); }}
          options={country.selectableFieldMarshalTraits[type].map(e =>
            ({ key: e, text: l10n.traits[e], value: e }))}/>)}
      { country.fieldMarshal.traits.length > 0 && country.fieldMarshal.traits.map(e =>
        <Label key={e} size='medium' basic as='a'
          onClick={() => {
            country.setFieldMarshal({ traits: country.fieldMarshal.traits.filter(f => f !== e) });}}>
          {l10n.traits[e]}
        </Label>)}
    </Label.Group>
  </React.Fragment>
);

const General = observer(({ country, db, l10n }) =>
  <React.Fragment>
    { ['level', 'attack', 'defense', 'logistics', 'planning'].map(type =>
      <LabelDropdown key={type} defaultValue={country.general[type] + ''}
        onChange={(e, d) => { country.setGeneral({ [type]: d.value }); }} options={
          Object.keys(db.skills.general[type]).map(e => (
            { key: e, text: `${capitalize(type)} ${e}`, value: e }))}/>)}
    <Label.Group>
      { ['personality', 'traits', 'terrain'].map(type =>
        country.selectableGeneralTraits[type].length > 0 &&
        <LabelDropdown key={type} add text={capitalize(type)}
          onChange={(e, d) => { country.setGeneral({ traits: [...country.general.traits, d.value] }); }}
          options={country.selectableGeneralTraits[type].map(e =>
            ({ key: e, text: l10n.traits[e], value: e }))}/>)}
      { country.general.traits.length > 0 && country.general.traits.map(e =>
        <Label key={e} size='medium' basic as='a'
          onClick={() => {
            country.setGeneral({ traits: country.general.traits.filter(f => f !== e) });}}>
          {l10n.traits[e]}
        </Label>)}
    </Label.Group>
  </React.Fragment>
);

const TroopDensity = observer(({ country }) =>
  <LabelDropdown defaultValue={country.density} onChange={(e, d) => { country.setDensity(d.value); }}
    options={Array.from({ length: 8 }, (x, i) => i + 1).map(e => ({ key: e, text: e, value: e}))}/>
);

const Factories = observer(({ country }) =>
  <Input value={country.factories} size='mini' style={{ width: '4em' }}
    onChange={(e, d) => { country.setFactories(parseInt(d.value, 10) || 10); }}/>
);

const Supply = observer(({ country }) =>
  <Input value={country.supply} size='mini' style={{ width: '4em' }}
    onChange={(e, d) => { country.setSupply(parseInt(d.value, 10) || 100); }}/>
);

const Upgrades = observer(({ country, db }) =>
  <React.Fragment>
    { country.possibleVariantNames.length > 0 &&
      <Label className='add' size='medium' basic>
        <Dropdown text='Variant' selectOnBlur={false} scrolling={true}
          onChange={(e, d) => { country.addUpgrade(d.value); }}
          options={country.possibleVariantNames.map(e => ({
            key: e, text: db.equipmentShortName(e), value: e,
           }))}/>
      </Label>}
    { country.variantNames.map(arch =>
      <Label.Group key={arch}>
        <Label size='medium' basic as='a'
          onClick={() => { country.removeUpgrade(arch); }}>
          {db.equipmentShortName(arch)}
        </Label>
        { country.upgrades[arch].types.map(type =>
          <LabelDropdown key={type}
            placeholder={db.upgradeCode(type)} value={country.upgrades[arch].levels[type] || ''}
            onChange={(e, d) => { country.upgrades[arch].setLevel(type, d.value); }}
            options={country.upgrades[arch].getLevels(type).map(e => ({
              key: e, text: `${db.upgradeCode(type)} +${e}`, value: e,
             }))}/>)}
      </Label.Group>)}
  </React.Fragment>
);

function filterJson(obj) {
  const {
    allowed, allowed_civil_war, removal_cost, picture, countries, modifier,
    available, research_bonus, cost, cancel_if_invalid, ai_will_do,
    on_add, level, sprite, random, xor, path, doctrine, research_cost, categories,
    folder, ai_research_weights, XOR, enable_equipments, sub_technologies,
    dependencies, allow, on_research_complete, enable_building, show_equipment_icon,
    desc, allow_branch, show_effect_as_desc, enable_subunits, start_year,
    training_time_army_factor, experience_gain_army_factor, political_power_factor,
    industry_air_damage_factor, static_anti_air_damage_factor,
    static_anti_air_hit_chance_factor, encryption, decryption,
    nuclear_production, line_change_production_efficiency_factor,
    production_factory_efficiency_gain_factor, equipment_conversion_speed,
    industrial_capacity_dockyard, global_building_slots_factor,
    production_factory_start_efficiency_factor, production_speed_buildings_factor,
    industry_repair_factor, local_resources_factor, org_loss_when_moving,
    conscription, partisan_effect, minimum_training_level, research_time_factor,
    max_command_power, experience_gain_army, military_leader_cost_factor,
    army_leader_start_level, consumer_goods_factor, justify_war_goal_time,
    stability_factor, subversive_activites_upkeep, descryption_factor,
    min_export, training_time_factor, naval_strike_targetting_factor,
    production_speed_coastal_bunker_factor,
    army_core_defence_factor, army_core_attack_factor,
    ...rest
  } = obj;
  delete rest.default;
  return obj;
}

const CountryBonuses = observer(({ country, db }) =>
  <Drawer title='Country Bonuses'>
    <pre className='stats'>
      {formatJson(filterJson(country.countryBonus))}
    </pre>
  </Drawer>
);

const DoctrineBonuses = observer(({ country, db }) =>
  <Drawer title='Doctrine Bonuses'>
    <pre className='stats'>
      {formatJson(filterJson(country.doctrineBonus))}
    </pre>
  </Drawer>
);

const CommanderBonuses = observer(({ country, db }) =>
  <Drawer title='Commander Bonuses'>
    <pre className='stats'>
      {formatJson(filterJson(country.commanderBonus))}
    </pre>
  </Drawer>
);

const tips = {
  laws: 'Affect production output.',
  ideas: 'No validity checking. Make sure your country can actually have it.',
  doctrine: 'The first two letters are doctrine acronyms. The rest are branches.',
  general: 'Allocate 3 skill points per level.',
  density: 'Number of divisions per province',
  factories: 'Decide if able to sustain losses.',
  supply: 'Available / needed %. Affects attrition.',
  upgrades: 'Apply only if the variants are used.'
};

const CountryEditor = observer(props =>
  <React.Fragment>
    <Drawer title='Edit'>
      <List>
        <List.Item>
          <span><abbr title={tips.laws}>Laws</abbr>: </span>
          <Laws {...props}/>
        </List.Item>
        <List.Item>
          <span>Advisors: </span>
          <Advisors {...props}/>
        </List.Item>
        <List.Item>
          <span><abbr title={tips.ideas}>Ideas</abbr>: </span>
          <Ideas {...props}/>
        </List.Item>
        <List.Item>
          <span><abbr title={tips.doctrine}>Doctrine</abbr>: </span>
          <Doctrine {...props}/>
        </List.Item>
        <List.Item>
          <span><abbr title={tips.general}>Field Marshal</abbr>: </span>
          <FieldMarshal {...props}/>
        </List.Item>
        <List.Item>
          <span><abbr title={tips.general}>General</abbr>: </span>
          <General {...props}/>
        </List.Item>
        <List.Item>
          <span><abbr title={tips.density}>Troop Density</abbr>: </span>
          <TroopDensity {...props}/>
        </List.Item>
        <List.Item>
          <span><abbr title={tips.factories}>Factories</abbr>: </span>
          <Factories {...props}/>
        </List.Item>
        <List.Item>
          <span><abbr title={tips.supply}>Supply%</abbr>: </span>
          <Supply {...props}/>
        </List.Item>
        <List.Item>
          <span><abbr title={tips.upgrades}>Upgrades</abbr>: </span>
          <Upgrades {...props}/>
        </List.Item>
      </List>
    </Drawer>
    <CountryBonuses {...props}/>
    <DoctrineBonuses {...props}/>
    <CommanderBonuses {...props}/>
  </React.Fragment>
);

export default CountryEditor;
