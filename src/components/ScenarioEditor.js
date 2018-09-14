import React, { Component } from 'react';
import { observer } from 'mobx-react';
import Checkbox from 'semantic-ui-react/dist/es/modules/Checkbox';
import Container from 'semantic-ui-react/dist/es/elements/Container';
import Dropdown from 'semantic-ui-react/dist/es/modules/Dropdown';
import Grid from 'semantic-ui-react/dist/es/collections/Grid';
import Header from 'semantic-ui-react/dist/es/elements/Header';
import Label from 'semantic-ui-react/dist/es/elements/Label';
import List from 'semantic-ui-react/dist/es/elements/List';
import CountryEditor from './CountryEditor';
import DivisionEditor from './DivisionEditor';

@observer class ScenarioEditor extends Component {
  render() {
    const s = this.props.scenario;
    const { db } = s;
    return <Container>
      <Header size='medium' dividing>
        Scenario
        <Label size='medium' as='a' basic onClick={this.props.onReset}>Reset</Label>
        <Label basic>
          <Dropdown text='Load Presets' selectOnBlur={false} options={[
            { key: 1, text: 'GER vs SOV 1940', value: 1 },
            { key: 2, text: 'GER vs USA 1942', value: 2 },
          ]} onChange={(e, d) => { console.log(d); }}/>
        </Label>
      </Header>
      <List>
        <List.Item>
          <span>Year: </span>
          <Dropdown defaultValue={s.year} selectOnBlur={false} scrolling={true} inline
            onChange={(e, d) => { s.setYear(d.value) }} options={
              Array(db.maxYear - s.startYear + 1).fill().map((e, i) => ({
                key: i + s.startYear,
                text: i + s.startYear,
                value: i + s.startYear,
              }))}/>
          <span> (starting from {s.startYear})</span>
        </List.Item>
        <List.Item>
          <span>Terrain: </span>
        </List.Item>
        <List.Item>
          <span>Air Superiority: </span>
          <Dropdown placeholder='Neither' defaultValue={s.air.winner} selectOnBlur={false} inline
            onChange={(e, d) => { s.setAir(d.value, s.air.buffed); }} options={[
              { key: 'null', text: 'Neither', value: null },
              { key: 'attacker', text: '100% Attacker', value: 'attacker' },
              { key: 'defender', text: '100% Defender', value: 'defender' },
          ]}/>
          { s.air.winner && <Checkbox checked={s.air.buffed} label='With Air Doctrine'
            onChange={(e, d) => { s.setAir(s.air.winner, d.checked); }}/> }
        </List.Item>
        <List.Item>
          <span>Planning: </span>
          <Checkbox checked={s.usePlanning} label='Use'
            onChange={(e, d) => { s.setUsePlanning(d.checked); }} />
        </List.Item>
      </List>
      <Grid columns={2}>
        <Grid.Column>
          <Header size='small' dividing>Attacking Country</Header>
          <CountryEditor country={s.attacker}/>
          <Header size='small' dividing>Attacking Division</Header>
          <DivisionEditor division={s.attacker.division}/>
        </Grid.Column>
        <Grid.Column>
          <Header size='small' dividing>Defending Country</Header>
          <CountryEditor country={s.defender}/>
          <Header size='small' dividing>Defending Division</Header>
          <DivisionEditor division={s.defender.division}/>
        </Grid.Column>
      </Grid>
    </Container>;
  }
}

export default ScenarioEditor;
