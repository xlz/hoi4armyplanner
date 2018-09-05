import React, { Component } from 'react';
import { observer } from 'mobx-react';
import  { Container, Grid, Header, Label, Dropdown, List } from 'semantic-ui-react';
import CountryEditor from './CountryEditor';
import DivisionEditor from './DivisionEditor';

@observer class ScenarioEditor extends Component {
  render() {
    const s = this.props.scenario;
    const { db } = s;
    return <Container>
      <Header size='medium' dividing>
        Scenario
        <Label size='small' as='a' basic onClick={this.props.onReset}>Reset</Label>
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
              }))
          }/>
          <span> (starting from {s.startYear})</span>
        </List.Item>
        <List.Item>
          <span>Terrain: </span>
        </List.Item>
        <List.Item>
          <span>Air Superiority: </span>
        </List.Item>
        <List.Item>
          <span>Use Planning: </span>
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
