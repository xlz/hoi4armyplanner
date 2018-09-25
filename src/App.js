import React, { Component } from 'react';
import './App.css';
import { observable, autorun } from 'mobx';
import ScenarioEditor from './components/ScenarioEditor';
import Scenario from './lib/Scenario';
import Database from './lib/Database';

class App extends Component {
  @observable scenario;
  constructor() {
    super();
    this.db = new Database();
    const state = {};
    try {
      Object.assign(state, JSON.parse(localStorage.getItem('state')));
    } catch (e) {
      // Ignores.
    }
    this.scenario = new Scenario(this.db, state);
    let first = true;
    autorun(() => {
      const data = JSON.stringify(this.scenario);
      if (first) {
        first = false;
        return;
      }
      try {
        //console.log('autorun', JSON.parse(data));
        localStorage.setItem('state', data);
      } catch (e) {
        // Ignores.
      }
    }, { delay: 1000 });
    this.state = { key: 0 };
  }

  onReset = () => {
    this.scenario = new Scenario(this.db);
    this.setState({ key: this.state.key + 1 });
  }

  onLoad = (state) => {
    this.scenario = new Scenario(this.db, state);
    this.setState({ key: this.state.key + 1 });
  }

  render() {
    return (
      <div className="App">
        <ScenarioEditor key={this.state.key} onReset={this.onReset} onLoad={this.onLoad}
          scenario={this.scenario} db={this.db} l10n={this.db.l10n}/>
      </div>
    );
  }
}

export default App;
