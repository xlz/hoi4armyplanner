import React, { Component } from 'react';
import { observer } from 'mobx-react';
import  { Dropdown, List } from 'semantic-ui-react';

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
            <Dropdown placeholder={l10n.ideas.army_chief} value={country.armyChief}
            selectOnBlur={false} inline onChange={(e, d) => { country.setArmyChief(d.value); }}
            options={['', ...country.armyChiefNames].map(e => (
              { key: e, text: e ? l10n.traits[e] : `No ${l10n.ideas.army_chief}`, value: e }))}/>}
          <Dropdown placeholder={l10n.ideas.high_command} value={country.highCommand}
            selectOnBlur={false} multiple inline onChange={(e, d) => { country.setHighCommand(d.value); }}
            options={(country.highCommandNames.length ? country.highCommandNames : country.highCommand).map(e => (
              { key: e, text: l10n.traits[e], value: e }))}/>
          { country.tankManufacturerNames.length > 0 &&
            <Dropdown placeholder={l10n.ideas.tank_manufacturer} value={country.tankManufacturer}
            selectOnBlur={false} inline onChange={(e, d) => { country.setTankManufacturer(d.value); }}
            options={['', ...country.tankManufacturerNames].map(e => (
              { key: e, text: e ? l10n.traits[e] : `No ${l10n.ideas.tank_manufacturer}`, value: e }))}/>}
          { country.airChiefNames.length > 0 &&
            <Dropdown placeholder={l10n.ideas.air_chief} value={country.airChief}
            selectOnBlur={false} inline onChange={(e, d) => { country.setAirChief(d.value); }}
            options={['', ...country.airChiefNames].map(e => (
              { key: e, text: e ? l10n.traits[e] : `No ${l10n.ideas.air_chief}`, value: e }))}/>}
          { country.advisorCountries !== true &&
            <Dropdown text='(Possible Countries)' selectOnBlur={false} options={
              country.advisorCountries.map(e => ({ key: e, text: db.common.country_tags[e], value: e }))}/>}
        </List.Item>
        <List.Item>
          <span>Ideas: </span>
          <Dropdown placeholder={l10n.ideas.country} value={country.ideas} scrolling={true}
            selectOnBlur={false} multiple inline onChange={(e, d) => { country.setIdeas(d.value); }}
            options={(country.ideaNames.length ? country.ideaNames : country.ideas).map((e) => {
              const countries = [...new Set(db.common.ideas.country[e].countries)];
              const countryStr = countries.map(e => db.common.country_tags[e] || e).join(', ');
              return { key: e, text: `${l10n.ideas[e]} (${countryStr})`, value: e }; })}/>
        </List.Item>
        <List.Item>
          <span>Doctrine: </span>
          <Dropdown defaultValue={country.doctrine} selectOnBlur={false} inline
            onChange={(e, d) => { country.setDoctrine(d.value); }} options={
            db.landDoctrineNames.map(e => ({ key: e, text: e, value: e }))}/>
        </List.Item>
        <List.Item>
          <span>Field Marshal: </span>

        </List.Item>
        <List.Item>General:</List.Item>
        <List.Item>Upgrades:</List.Item>
        <List.Item>Divisions / tile: {country.density}</List.Item>
        <List.Item>Factories: {country.numFactories}</List.Item>
        <List.Item>Supply:</List.Item>
      </List>;
  }
}

export default CountryEditor;
