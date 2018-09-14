import React, { Component } from 'react';
import { observer } from 'mobx-react';
import  { Dropdown, List } from 'semantic-ui-react';

const MyDropdown = (props) => {
  const { value, onChange, options } = props;
  return <Dropdown placeholder='true' value={value} inline
      text={options.filter(e => e.value === value)[0].text}>
      <Dropdown.Menu>
        { options.map(e => <Dropdown.Item key={e.value} {...e} onClick={onChange}
            active={value === e.value} selected={value === e.value}/>) }
      </Dropdown.Menu>
    </Dropdown>;
};

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

@observer class CountryEditor extends Component {
  render() {
    const { country } = this.props;
    const { db } = country;
    const { l10n } = db;
    return <List>
        <List.Item>
          <span>Laws: </span>
          <Dropdown defaultValue={country.tradeLaw} selectOnBlur={false} inline
            onChange={(e, d) => { country.setTradeLaw(d.value); }} options={
              db.tradeLawNames.map(e => ({ key: e, text: l10n.ideas[e], value: e }))}/>
          <Dropdown defaultValue={country.mobilizationLaw} selectOnBlur={false} inline
            onChange={(e, d) => { country.setMobilizationLaw(d.value); }} options={
              db.mobilizationLawNames.map(e => ({ key: e, text: l10n.ideas[e], value: e }))}/>
        </List.Item>
        <List.Item>
          <span>Advisors: </span>
          { country.armyChiefNames.length > 0 &&
            <MyDropdown value={country.armyChief} onChange={(e, d) => { country.setArmyChief(d.value); }}
              options={['', ...country.armyChiefNames].map(e => (
              { key: e, text: e ? l10n.traits[e] : `No ${l10n.ideas.army_chief}`, value: e }))}/>}
          <Dropdown placeholder={l10n.ideas.high_command} value={country.highCommand} closeOnChange={true}
            renderLabel={label => ({ content: label.text, basic: true })}
            selectOnBlur={false} multiple inline onChange={(e, d) => { country.setHighCommand(d.value); }}
            options={(country.highCommandNames.length ? country.highCommandNames : country.highCommand).map(e => (
              { key: e, text: l10n.traits[e], value: e }))}/>
          { country.tankManufacturerNames.length > 0 &&
            <MyDropdown value={country.tankManufacturer} onChange={(e, d) => { country.setTankManufacturer(d.value); }}
            options={['', ...country.tankManufacturerNames].map(e => (
              { key: e, text: e ? l10n.traits[e] : `No ${l10n.ideas.tank_manufacturer}`, value: e }))}/>}
          { country.airChiefNames.length > 0 &&
            <MyDropdown value={country.airChief} onChange={(e, d) => { country.setAirChief(d.value); }}
            options={['', ...country.airChiefNames].map(e => (
              { key: e, text: e ? l10n.traits[e] : `No ${l10n.ideas.air_chief}`, value: e }))}/>}
          { country.advisorCountries !== true &&
            <Dropdown text='(Possible Countries)' selectOnBlur={false} scrolling={true} options={
              country.advisorCountries.map(e => ({ key: e, text: db.common.country_tags[e], value: e }))}/>}
        </List.Item>
        <List.Item>
          <span>Ideas: </span>
          <Dropdown placeholder={l10n.ideas.country} value={country.ideas} scrolling={true}
            renderLabel={label => ({ content: label.text, basic: true })}
            selectOnBlur={false} multiple inline onChange={(e, d) => { country.setIdeas(d.value); }}
            options={(country.ideaNames.length ? country.ideaNames : country.ideas).map((e) => {
              const countries = [...new Set(db.common.ideas.country[e].countries)];
              const countryStr = countries.map(e => db.common.country_tags[e] || e).join(', ');
              return { key: e, text: `${l10n.ideas[e]} (${countryStr})`, value: e }; })}/>
        </List.Item>
        <List.Item>
          <span>Doctrine: </span>
          <Dropdown defaultValue={country.doctrine} selectOnBlur={false} inline upward={false}
            onChange={(e, d) => { country.setDoctrine(d.value); }} options={
              db.landDoctrineNames.map(e => ({ key: e, text: e, value: e }))}/>
        </List.Item>
        <List.Item>
          <span>Field Marshal: </span>
          { ['level', 'attack', 'defense', 'logistics', 'planning'].map(type =>
            <Dropdown key={type} defaultValue={country.fieldMarshal[type] + ''} selectOnBlur={false} inline
              onChange={(e, d) => { country.setFieldMarshal({ [type]: d.value }); }} options={
                Object.keys(db.skills.field_marshal[type]).map(e => (
                  { key: e, text: `${capitalize(type)} +${e}`, value: e }))}/>)}
          <Dropdown placeholder='Traits' value={country.fieldMarshal.traits}
            selectOnBlur={false} multiple inline scrolling={true} closeOnChange={true}
            renderLabel={label => ({ content: label.text, basic: true })}
            onChange={(e, d) => { country.setFieldMarshal({ traits: d.value }); }} options={
              Object.keys(db.skills.field_marshal.traits).map(e => ({ key: e, text: e, value: e }))}/>
          <Dropdown placeholder='Terrain' value={country.fieldMarshal.terrain}
            selectOnBlur={false} multiple inline scrolling={true} closeOnChange={true}
            renderLabel={label => ({ content: label.text, basic: true })}
            onChange={(e, d) => { country.setFieldMarshal({ terrain: d.value }); }} options={
              Object.keys(db.skills.field_marshal.terrain).map(e => ({ key: e, text: e, value: e }))}/>
        </List.Item>
        <List.Item>
          <span>General: </span>
          { ['level', 'attack', 'defense', 'logistics', 'planning'].map(type =>
            <Dropdown key={type} defaultValue={country.general[type] + ''} selectOnBlur={false} inline
              onChange={(e, d) => { country.setGeneral({ [type]: d.value }); }} options={
                Object.keys(db.skills.field_marshal[type]).map(e => (
                  { key: e, text: `${capitalize(type)} +${e}`, value: e }))}/>)}
          <Dropdown placeholder='Traits' value={country.general.traits}
            selectOnBlur={false} multiple inline scrolling={true} closeOnChange={true}
            renderLabel={label => ({ content: label.text, basic: true })}
            onChange={(e, d) => { country.setGeneral({ traits: d.value }); }} options={
              Object.keys(db.skills.general.traits).map(e => ({ key: e, text: e, value: e }))}/>
          <Dropdown placeholder='Terrain' value={country.general.terrain}
            selectOnBlur={false} multiple inline scrolling={true} closeOnChange={true}
            renderLabel={label => ({ content: label.text, basic: true })}
            onChange={(e, d) => { country.setGeneral({ terrain: d.value }); }} options={
              Object.keys(db.skills.general.terrain).map(e => ({ key: e, text: e, value: e }))}/>
        </List.Item>
        <List.Item>Upgrades:</List.Item>
        <List.Item>Divisions / tile: {country.density}</List.Item>
        <List.Item>Factories: {country.numFactories}</List.Item>
        <List.Item>Supply:</List.Item>
      </List>;
  }
}

export default CountryEditor;
