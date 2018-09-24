import React from 'react';
import { observer } from 'mobx-react';
import Checkbox from 'semantic-ui-react/dist/es/modules/Checkbox';
import Container from 'semantic-ui-react/dist/es/elements/Container';
import Grid from 'semantic-ui-react/dist/es/collections/Grid';
import Header from 'semantic-ui-react/dist/es/elements/Header';
import Label from 'semantic-ui-react/dist/es/elements/Label';
import List from 'semantic-ui-react/dist/es/elements/List';
import CountryEditor from './CountryEditor';
import DivisionEditor from './DivisionEditor';
import LabelDropdown from './LabelDropdown';
import LabelTray from './LabelTray';
import Drawer from './Drawer';
import { capitalize, formatJson } from '../lib/utils';

const tips = {
  year: 'Simplifies research progress and the default "Current" equipment by the year. ' +
    'Ahead-of-time equipment can still be used (ahead-of-time mechanized yields wrong research bonuses though).',
  theater: 'Decides the number of battles (provinces) and terrain. ' +
    'Please use in-game Air View to locate the regions as needed.',
  air: 'Reduces defense stats. Air chief and doctrine buff the effect.',
  airWithDoctrine: 'army_bonus_air_superiority_factor +0.3',
  planning: 'Attacks from full to no planning bonus. One-time use at the start.',
  entrenchment: 'Defends with full entrenchment bonus.',
};

const Presets = observer(() =>
  <LabelDropdown text='Load Presets' options={[
    { key: 1, text: 'GER vs SOV 1940', value: 1 },
    { key: 2, text: 'GER vs USA 1942', value: 2 },
  ]} onChange={(e, d) => { console.log(d); }}/>);

const Year = observer(({ scenario, db }) =>
  <LabelDropdown defaultValue={scenario.year}
    onChange={(e, d) => { scenario.setYear(d.value) }} options={
      Array.from({ length: db.maxYear - scenario.startYear + 1 }, (x, i) => i + scenario.startYear)
        .map(e => ({ key: e, text: e, value: e }))}/>);

const defaultTheater = 'Single Province';
const Theater = observer(({ scenario, db }) =>
  <React.Fragment>
    <LabelDropdown placeholder={defaultTheater} value={scenario.theater.continent}
      onChange={(e, d) => {
        if (scenario.theater.continent !== d.value) {
          scenario.setTheater({ continent: d.value, regions: [] });
        }
      }}
      options={['', ...db.continentNames].map(e => ({ key: e, text: e || defaultTheater, value: e }))}/>
    { scenario.theater.continent &&
      <LabelTray selected={scenario.theater.regions || []} addLabel='Strategic Region'
      onChange={(regions) => { scenario.setTheater({ regions }); }}
      options={Object.keys(db.map.strategic_regions[scenario.theater.continent])
        .map(e => ({ key: e, text: e, value: e }))}/>}
  </React.Fragment>
);

const Terrain = observer(({ scenario, db, l10n }) =>
  <React.Fragment>
    { !scenario.theater.continent &&
      <LabelDropdown defaultValue={scenario.terrain}
        onChange={(e, d) => { scenario.setTerrain(d.value); }}
        options={db.terrainNames.map(e => ({ key: e, text: l10n.terrain[e] || capitalize(e), value: e }))}/>}
    { scenario.theater.continent &&
      <Label size='medium' basic>
        <abbr title={Object.keys(scenario.averageTerrain)
          .map(e => `${l10n.terrain[e]} ${(scenario.averageTerrain[e] * 100).toFixed(0)}%`)
          .join('\n') || 'No Region Selected'}>Theater Average</abbr>
      </Label> }
  </React.Fragment>
);

const AirSuperiority = observer(({ scenario }) =>
  <React.Fragment>
    <LabelDropdown placeholder='Neither' defaultValue={scenario.air.winner}
      onChange={(e, d) => { scenario.setAir({ winner: d.value }); }} options={[
        { key: 'null', text: 'Neither', value: null },
        { key: 'attacker', text: '100% Attacker', value: 'attacker' },
        { key: 'defender', text: '100% Defender', value: 'defender' },
    ]}/>
    { scenario.air.winner &&
      <Checkbox checked={scenario.air.buffed}
        label={{ children: <abbr title={tips.airWithDoctrine}>With Air Doctrine</abbr> }}
        onChange={(e, d) => { scenario.setAir({ buffed: d.checked }); }}/> }
  </React.Fragment>);

const Preparation = observer(({ scenario }) =>
  <React.Fragment>
    <Checkbox checked={scenario.planning}
      label={{ children: <abbr title={tips.planning}>Planning</abbr> }}
      onChange={(e, d) => { scenario.setPlanning(d.checked); }} />
    <Checkbox checked={scenario.entrenchment}
      label={{ children: <abbr title={tips.entrenchment}>Entrenchment</abbr> }}
      onChange={(e, d) => { scenario.setEntrenchment(d.checked); }} />
  </React.Fragment>);

const TechnologyBonuses = observer(({ scenario }) =>
  <Drawer title='Technology Bonuses'>
    <pre className='stats'>
      {formatJson(scenario.technologyBonus)}
    </pre>
  </Drawer>
);

const ScenarioEditor = observer(props =>
  <Container>
    <Header size='medium' dividing>
      Scenario
      <Label size='medium' as='a' basic onClick={props.onReset}>Reset</Label>
      <Presets/>
    </Header>
    <List>
      <List.Item>
        <span><abbr title={tips.year}>Year</abbr>: </span>
        <Year {...props}/>
        <span> (starting from {props.scenario.startYear})</span>
      </List.Item>
      <List.Item>
        <span><abbr title={tips.theater}>Theater</abbr>: </span>
        <Theater {...props}/>
      </List.Item>
      <List.Item><span>Terrain: </span><Terrain {...props}/></List.Item>
      <List.Item>
        <span><abbr title={tips.air}>Air Superiority</abbr>: </span>
        <AirSuperiority {...props}/>
      </List.Item>
      <List.Item>
        <span><abbr title={tips.preparation}>Preparation</abbr>: </span>
        <Preparation {...props}/>
      </List.Item>
      <List.Item>
        <TechnologyBonuses {...props}/>
      </List.Item>
    </List>
    <Grid columns={2}>
      <Grid.Column>
        <Header size='small' dividing>Attacking Country</Header>
        <CountryEditor country={props.scenario.attacker} {...props}/>
        <Header size='small' dividing>Attacking Division</Header>
        <DivisionEditor division={props.scenario.attacker.division} {...props}/>
      </Grid.Column>
      <Grid.Column>
        <Header size='small' dividing>Defending Country</Header>
        <CountryEditor country={props.scenario.defender} {...props}/>
        <Header size='small' dividing>Defending Division</Header>
        <DivisionEditor division={props.scenario.defender.division} {...props}/>
      </Grid.Column>
    </Grid>
  </Container>);

export default ScenarioEditor;
