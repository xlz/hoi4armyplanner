import { computed } from 'mobx'
import hoi4 from '../data/db.json';
import Bonus from './Bonus';

class Database {
  constructor(db = hoi4) {
    Object.assign(this, db);
  }

  @computed get groupByUnit() {
    const result = {};
    Object.keys(this.common.sub_units).forEach((name) => {
      result[name] = this.common.sub_units[name].group;
    });
    return result;
  }

  @computed get groupNames() {
    return Array.from(new Set(Object.values(this.groupByUnit))).filter(e => e);
  }

  @computed get unitNames() {
    return Object.keys(this.l10n.unit_code);
  }

  @computed get archetypeNames() {
    return Object.keys(this.l10n.archetype_code);
  }

  @computed get equipmentNames() {
    return Object.keys(this.common.equipments);
  }

  @computed get terrainNames() {
    return [...Object.keys(this.common.terrain.categories), 'fort', 'river', 'amphibious'];
  }

  @computed get upgradeNames() {
    return Object.keys(this.common.upgrades);
  }

  @computed get landDoctrines() {
    const doctrines = this.common.technologies.land_doctrine.technologies;
    const children = {};
    const isChildren = new Set();
    Object.keys(doctrines).forEach((name) => {
      const doctrine = doctrines[name];
      if (!(name in children)) children[name] = [];
      if (Array.isArray(doctrine.path)) {
        doctrine.path.forEach((path) => {
          children[name].push(path.leads_to_tech);
          isChildren.add(path.leads_to_tech);
        });
        children[name].sort((a, b) => {
          return doctrines[a].folder.position.x - doctrines[b].folder.position.x;
        });
      } else if (doctrine.path && doctrine.path.leads_to_tech) {
        children[name].push(doctrine.path.leads_to_tech);
        isChildren.add(doctrine.path.leads_to_tech);
      }
    });
    const roots = [];
    Object.keys(doctrines).forEach((name) => {
      if (!isChildren.has(name)) {
        roots.push(name);
      }
    });
    const getPath = (path, branchings, paths) => {
      const node = path[path.length - 1];
      if (children[node].length === 0) {
        paths.push({ path, branchings });
      } else if (children[node].length === 1) {
        getPath([...path, children[node][0]], branchings, paths);
      } else if (children[node].length === 2) {
        children[node].forEach((child, i) => {
          getPath([...path, child], [...branchings, i], paths);
        });
      } else {
        throw new Error('More than 2 branches');
      }
    };
    const doctrinePathIndex = [];
    roots.forEach((root) => {
      getPath([root], [], doctrinePathIndex);
    });
    const doctrineSteps = {};
    doctrinePathIndex.forEach((pathIndex) => {
      const firstCategory = doctrines[pathIndex.path[0]].categories.filter(e => e !== 'land_doctrine')[0];
      const categoryShort = firstCategory.split('_').slice(1).map(e => e[0].toUpperCase()).join('');
      const branchingsName = pathIndex.branchings.map(e => ['L', 'R'][e]).join('');
      const pathName = categoryShort + branchingsName;
      const bonus = new Bonus();
      const steps = [];
      pathIndex.path.forEach((name) => {
        const doctrine = Object.assign({}, doctrines[name]);
        ['xor', 'path', 'doctrine', 'categories', 'folder', 'ai_will_do', 'ai_research_weights'].forEach((key) => {
          delete doctrine[key];
        });
        bonus.add(doctrine);
        steps.push(JSON.parse(JSON.stringify(bonus)));
      });
      doctrineSteps[pathName] = steps;
    });
    return doctrineSteps;
  }

  @computed get landDoctrineNames() {
    return Object.keys(this.landDoctrines);
  }

  @computed get tradeLawNames() {
    return Object.keys(this.common.ideas.trade_laws);
  }

  @computed get mobilizationLawNames() {
    return Object.keys(this.common.ideas.mobilization_laws);
  }

  @computed get armyChiefNames() {
    return Object.keys(this.common.ideas.army_chief);
  }

  @computed get highCommandNames() {
    return Object.keys(this.common.ideas.high_command);
  }

  @computed get tankManufacturerNames() {
    return Object.keys(this.common.ideas.tank_manufacturer);
  }

  @computed get airChiefNames() {
    return Object.keys(this.common.ideas.air_chief);
  }

  @computed get ideaNames() {
    return Object.keys(this.common.ideas.country);
  }

  @computed get maxYear() {
    let max = 0;
    Object.keys(this.common.technologies).forEach((category) => {
      if (/^air|^naval/.test(category)) return;
      const techs = this.common.technologies[category].technologies;
      Object.keys(techs).forEach((name) => {
        const { start_year } = techs[name];
        if (start_year && start_year > max) {
          max = start_year;
        }
      });
    });
    return max;
  }
}

export default Database;
