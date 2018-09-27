const fs = require('fs');

const unit_code = {
  infantry: "inf",
  artillery_brigade: "art",
  rocket_artillery_brigade: "rkt",
  anti_air_brigade: "aa",
  anti_tank_brigade: "at",
  marine: "mar",
  mountaineers: "mnt",
  paratrooper: "para",
  bicycle_battalion: "bike",

  cavalry: "cav",
  motorized: "mot",
  mechanized: "mech",
  motorized_rocket_brigade: "mrkt",

  light_armor: "lt",
  light_sp_artillery_brigade: "lspg",
  light_sp_anti_air_brigade: "lspaa",
  light_tank_destroyer_brigade: "ltd",

  medium_armor: "mt",
  medium_sp_artillery_brigade: "mspg",
  medium_sp_anti_air_brigade: "mspaa",
  medium_tank_destroyer_brigade: "mtd",

  heavy_armor: "ht",
  heavy_sp_artillery_brigade: "hspg",
  heavy_sp_anti_air_brigade: "hspaa",
  heavy_tank_destroyer_brigade: "htd",

  super_heavy_armor: "sht",
  super_heavy_sp_artillery_brigade: "shspg",
  super_heavy_sp_anti_air_brigade: "shspaa",
  super_heavy_tank_destroyer_brigade: "shtd",

  modern_armor: "modt",
  modern_sp_artillery_brigade: "modspg",
  modern_sp_anti_air_brigade: "modspaa",
  modern_tank_destroyer_brigade: "modtd",

  artillery: "art+",
  engineer: "eng",
  recon: "rec",
  logistics_company: "log",
  maintenance_company: "maint",
  anti_tank: "at+",
  anti_air: "aa+",
  rocket_artillery: "rkt+",
  field_hospital: "med",
  military_police: "mp",
  signal_company: "sig",
};

const archetype_code = {
  infantry_equipment: "inf",
  artillery_equipment: "art",
  motorized_equipment: "mot",
  mechanized_equipment: "mech",
  anti_air_equipment: "aa",
  anti_tank_equipment: "at",
  motorized_rocket_equipment: "mrkt",
  rocket_artillery_equipment: "rkt",
  support_equipment: "sup",

  light_tank_equipment: "lt",
  light_tank_artillery_equipment: "lspg",
  light_tank_destroyer_equipment: "ltd",
  light_tank_aa_equipment: "lspaa",

  medium_tank_equipment: "mt",
  medium_tank_artillery_equipment: "mspg",
  medium_tank_destroyer_equipment: "mtd",
  medium_tank_aa_equipment: "mspaa",

  heavy_tank_equipment: "ht",
  heavy_tank_artillery_equipment: "hspg",
  heavy_tank_destroyer_equipment: "htd",
  heavy_tank_aa_equipment: "hspaa",

  super_heavy_tank_equipment: "sht",
  super_heavy_tank_artillery_equipment: "shspg",
  super_heavy_tank_destroyer_equipment: "shtd",
  super_heavy_tank_aa_equipment: "shspaa",

  modern_tank_equipment: "modt",
  modern_tank_artillery_equipment: "modspg",
  modern_tank_destroyer_equipment: "modtd",
  modern_tank_aa_equipment: "modspaa",
};

const relevant_modifiers = [
  'army_org_regain',
  'planning_speed',
  'army_org_Factor',
  'land_reinforce_factor',
  'max_planning',
  'attrition',
  'army_org',
  'army_defence_factor',
  'army_attack_factor',
  'heat_attrition_factor',
  'army_org_factor',
  'amphibious_invasion',
];

function parseArray(tokens) {
  if (isNaN(parseFloat(tokens[0]))) {
    return tokens.map(t => t.replace(/^"([^"]*)"$/, '$1'));
  } else {
    const values = tokens.map(e => parseFloat(e));
    if (values.some(e => isNaN(e))) {
      throw new Error(`Numeric array contains invalid values: ${tokens}`);
    }
    return values;
  }
}

function putValue(key, relation, value, object) {
  let valueParsed = value;
  if (typeof value === 'object' && relation !== '=') {
    throw new Error('Non-equal relation for object value');
  }
  if (typeof value !== 'object') {
    valueParsed = parseFloat(value);
    if (isNaN(valueParsed)) {
      valueParsed = value.replace(/^"([^"]*)"$/, '$1');
    }
    if (relation !== '=') {
      valueParsed = `${relation}${valueParsed}`;
    }
  }
  if (key in object) {
    if (!Array.isArray(object[key])) {
      object[key] = [object[key]];
    }
    if (Array.isArray(valueParsed)) {
      object[key].push(...valueParsed);
    } else {
      object[key].push(valueParsed);
    }
  } else {
    object[key] = valueParsed;
  }
}

function parseObject(tokens) {
  const result = {};
  for (let i = 0; i < tokens.length - 1;) {
    if (i + 2 >= tokens.length) {
      throw new Error(`Invalid syntax: ${tokens} ${tokens.length} ${i} ${tokens[i]}`);
    }
    const key = tokens[i];
    const relation = tokens[i + 1];
    const value = tokens[i + 2];
    i += 3;
    if (value != '{') {
      putValue(key, relation, value, result);
    } else {
      let depth = 1;
      let j = i;
      for (; j < tokens.length; j++) {
        if (tokens[j] === '{') depth++;
        if (tokens[j] === '}') depth--;
        if (depth === 0) break;
      }
      if (depth !== 0) {
        throw new Error(`Unenclosed ${depth} ${tokens.length} ${i} ${j}`);
      }
      putValue(key, relation, parseObjectOrArray(tokens.slice(i, j)), result);
      i = j + 1;
    }
  }
  return result;
}

function parseObjectOrArray(tokens) {
  if (tokens.length === 0) {
    return {};
  }
  if (tokens.length <= 1) {
    return parseArray(tokens);
  }
  if (tokens[1] === '=' || tokens[1] === '<' || tokens[1] === '>') {
    return parseObject(tokens);
  } else {
    return parseArray(tokens);
  }
}

function parseFile(path, filename, output) {
  const data = fs.readFileSync(path, 'utf8');
  const noComments = data.replace(/(#|--).*$/gm, '');
  const tokenized = noComments.match(/"(\\"|[^"])*"|=|<|>|{|}|[^=<>{},\s]+/g);
  const parsed = tokenized && parseObjectOrArray(tokenized);
  if (!parsed) return;
  if (/^00_/.test(filename)) {
    Object.keys(parsed).forEach((key) => {
      putValue(key, '=', parsed[key], output);
    });
  } else {
    putValue(path.split('/').pop().replace('.txt', ''), '=', parsed, output);
  }
}

function getL10N(name) {
  const l10n = fs.readFileSync(`localisation/${name}_l_english.yml`, 'utf8');
  const lines = l10n.match(/^.*$/mg).slice(1).map(e => e.replace(/^ /, ''));
  const tokens = lines.map(e => [e.split(' ')[0].split(':')[0], e.split(' ').slice(1).join(' ')]);
  const result = {};
  for (let i = 0; i < tokens.length; i++) {
    result[tokens[i][0]] = tokens[i][1].replace(/^"|"$/g, '').replace(/\\n/g, ' ');
  }
  return result;
}

function sortKeys(obj) {
  const newObj = {};
  Object.keys(obj).sort().forEach((key) => {
    newObj[key] = obj[key];
    delete obj[key];
  });
  return newObj;
}

const db = { l10n: {} };
const paths = [
  'common/combat_tactics.txt',
  'common/country_leader/',
  'common/country_tags/',
  'common/defines/00_defines.lua',
  'common/ideas/',
  'common/national_focus/',
  'common/technologies/',
  'common/terrain/',
  'common/unit_leader/',
  'common/units/',
  'common/units/equipment/',
  'common/units/equipment/upgrades/',
  'history/countries/',
  'history/states/',
  'map/continent.txt',
  'map/strategicregions/',
];

const oldcwd = process.cwd();
process.chdir(process.argv[2]);

paths.forEach((path) => {
  const components = path.split('/');
  const dir = components.slice(0, -1);
  const file = components[components.length - 1];
  let output = db;
  dir.forEach((e) => {
    if (!(e in output)) {
      output[e] = {};
    }
    output = output[e];
  });
  if (file) {
    parseFile(path, file, output);
  } else {
    fs.readdirSync(path).filter(e => /\.txt$/.test(e)).forEach((filename) => {
      parseFile(`${path}${filename}`, filename, output);
    });
  }
});

// common/combat_tactics.txt

// common/country_leader/
const trait_names = getL10N('traits');
db.l10n.traits = {};
Object.keys(db.common.country_leader.leader_traits).forEach((trait) => {
  if (!/^army_|^air_chief_ground_|_manufacturer$/.test(trait)) {
    delete db.common.country_leader.leader_traits[trait];
    return;
  }
  db.l10n.traits[trait] = trait_names[trait];
});

// common/country_tags/
Object.keys(db.common.country_tags).forEach((tag) => {
  if (tag === 'zz_dynamic_countries') {
    delete db.common.country_tags[tag];
    return;
  }
  db.common.country_tags[tag] = db.common.country_tags[tag].replace(/countries\/(.*)\.txt$/, '$1');
});

// common/defines/00_defines.lua

// common/ideas/
const newIdeas = { country: {} };
Object.keys(db.common.ideas).forEach((country) => {
  const ideas = db.common.ideas[country].ideas;
  if (/^_/.test(country)) {
    if (country !== '_event') {
      Object.assign(newIdeas, ideas);
    }
    return;
  }
  if (ideas.country) {
    Object.keys(ideas.country).forEach((ideaName) => {
      const idea = ideas.country[ideaName];
      if (idea.modifier && Object.keys(idea.modifier).some(e => relevant_modifiers.includes(e))) {
        newIdeas.country[ideaName] = idea;
      }
      const regex = /tank|artillery|infantry|motorized|mechanized/;
      if (idea.equipment_bonus && Object.keys(idea.equipment_bonus).some(e => regex.test(e))) {
        newIdeas.country[ideaName] = idea;
      }
    });
  }
  const addIdea = (ideaName) => {
    const country_leader = db.common.country_leader;
    if (!(ideaName in newIdeas)) newIdeas[ideaName] = {};
    Object.keys(ideas[ideaName] || {}).forEach((leaderName) => {
      (ideas[ideaName][leaderName].traits || []).forEach((traitName) => {
        const trait = db.common.country_leader.leader_traits[traitName];
        if (!trait) return;
        if (!newIdeas[ideaName][traitName]) {
          newIdeas[ideaName][traitName] = Object.assign({}, trait);
        }
        const leader_trait = newIdeas[ideaName][traitName];
        if (!leader_trait.countries) leader_trait.countries = [];
        const allowed = ideas[ideaName][leaderName].allowed;
        if (allowed.original_tag) {
          leader_trait.countries.push(ideas[ideaName][leaderName].allowed.original_tag);
        }
        if (allowed.original_TAG) {
          leader_trait.countries.push(ideas[ideaName][leaderName].allowed.original_TAG);
        }
        if (allowed.OR && Array.isArray(allowed.OR.original_tag)) {
          leader_trait.countries.push(...allowed.OR.original_tag);
        }
      });
    });
    newIdeas[ideaName] = sortKeys(newIdeas[ideaName]);
  }
  addIdea('army_chief');
  addIdea('air_chief');
  addIdea('high_command');
  addIdea('tank_manufacturer');
});
delete db.common.country_leader;
const ideaNames = Object.assign({}, getL10N('politics'), getL10N('traits'), getL10N('ideas'), getL10N('focus'), getL10N('dod_ideas'), getL10N('dod_focus'), getL10N('wtt_focus'), getL10N('wtt_ideas'));
db.l10n.ideas = {};
Object.keys(newIdeas).forEach((type) => {
  const ideas = newIdeas[type];
  db.l10n.ideas[type] = ideaNames[type];
  Object.keys(ideas).forEach((ideaCode) => {
    if (ideaCode === 'law') {
      delete ideas[ideaCode];
      return;
    }
    if (ideaCode in ideaNames) {
      db.l10n.ideas[ideaCode] = ideaNames[ideaCode];
    }
  });
});
delete newIdeas.economy;
db.common.ideas = newIdeas;

// common/national_focus/
Object.keys(db.common.national_focus).forEach((country) => {
  const focus_tree = db.common.national_focus[country].focus_tree;
  if (!focus_tree) return;
  const tags = [];
  if (!focus_tree.country.modifier) {
    tags.push('generic');
  } else if (focus_tree.country.modifier.tag) {
    tags.push(focus_tree.country.modifier.tag);
  } else if (focus_tree.country.modifier.OR) {
    tags.push(...focus_tree.country.modifier.OR.tag);
  } else if (focus_tree.country.modifier[0] && focus_tree.country.modifier[0].tag) {
    tags.push(focus_tree.country.modifier[0].tag);
  }
  focus_tree.focus.forEach((focus) => {
    if (focus.completion_reward && focus.completion_reward.add_ideas) {
      const ideaName = focus.completion_reward.add_ideas;
      if (ideaName in db.common.ideas.country) {
        const idea = db.common.ideas.country[ideaName];
        if (!idea.countries) idea.countries = [];
        idea.countries.push(...tags);
      }
    }
    if (focus.completion_reward && focus.completion_reward.swap_ideas &&
        focus.completion_reward.swap_ideas.add_idea) {
      const ideaName = focus.completion_reward.swap_ideas.add_idea;
      if (ideaName in db.common.ideas.country) {
        const idea = db.common.ideas.country[ideaName];
        if (!idea.countries) idea.countries = [];
        idea.countries.push(...tags);
      }
    }
    if (focus.completion_reward && focus.completion_reward.if &&
        Array.isArray(focus.completion_reward.if)) {
      focus.completion_reward.if.forEach((branch) => {
        if (branch.swap_ideas && branch.swap_ideas.add_idea) {
          const ideaName = branch.swap_ideas.add_idea;
          if (ideaName in db.common.ideas.country) {
            const idea = db.common.ideas.country[ideaName];
            if (!idea.countries) idea.countries = [];
            idea.countries.push(...tags);
          }
        }
      });
    }
  });
});
delete db.common.national_focus;

// common/technologies/
// common/terrain/
const terrain_l10n = getL10N('terrain');
db.l10n.terrain = {}
Object.keys(db.common.terrain.categories).forEach((terrain) => {
  db.l10n.terrain[terrain] = terrain_l10n[terrain];
});

// common/unit_leader/
const unit_l10n = getL10N('unit');
Object.keys(db.common.unit_leader.leader_traits).forEach((trait) => {
  db.l10n.traits[trait] = trait_names[trait] || unit_l10n[trait];
});

// common/units/
const getSubkeys = (obj, subkey) => {
  const result = {};
  Object.keys(obj).forEach((key) => {
    Object.assign(result, obj[key][subkey]);
  });
  return result;
};
db.common.sub_units = getSubkeys(db.common.units, 'sub_units');
db.l10n.unit = {};
Object.keys(db.common.sub_units).forEach((name) => {
  const unit = db.common.sub_units[name];
  db.l10n.unit[name] = unit_l10n[name];
});

// common/units/equipment/
db.common.equipments = getSubkeys(db.common.units.equipment, 'equipments');
const equipment_l10n = getL10N('equipment');
db.l10n.equipment = {};
Object.keys(db.common.equipments).forEach((name) => {
  const l10n_name = equipment_l10n[`${name}_short`] || equipment_l10n[name];
  if (l10n_name) {
    db.l10n.equipment[name] = l10n_name;
  }
});

// common/units/equipment/upgrades/
db.common.upgrades = getSubkeys(db.common.units.equipment.upgrades, 'upgrades');
delete db.common.units;

// history/states/
const stateByProvince = {};
const buildingsByState = {};
Object.keys(db.history.states).forEach((key) => {
  const state = db.history.states[key].state;
  if (Array.isArray(state)) throw new Error('is array');
  buildingsByState[state.id] = state.history.buildings;
  state.provinces.forEach((province) => {
    stateByProvince[province] = state.id;
  });
});

// history/countries/
Object.keys(db.history.countries).forEach((path) => {
  const tag = path.split(' ')[0];
  const history = db.history.countries[path];
  if (Array.isArray(history.add_ideas)) {
    history.add_ideas.forEach((ideaName) => {
      if (ideaName in db.common.ideas.country) {
        const idea = db.common.ideas.country[ideaName];
        if (!idea.countries) idea.countries = [];
        idea.countries.push(tag);
      }
    });
  }
});
Object.keys(db.common.ideas.country).forEach((ideaName) => {
  const idea = db.common.ideas.country[ideaName];
  if (!idea.countries) {
    delete db.common.ideas.country[ideaName];
    delete db.l10n.ideas[ideaName];
  }
});
delete db.history;

// map/continent.txt
const continents = db.map.continent.continents;
delete db.map.continent;

// map/strategicregions/
const provinces = fs.readFileSync('map/definition.csv', 'utf8').match(/\S+/g).map(e => e.split(';'));
// id, r, g, b, type, coastal, terrain, continent

const strategic_regions_l10n = getL10N('strategic_region_names');
const continent_l10n = getL10N('province_names');
const strategic_regions = {};
const regionByState = {};
Object.keys(db.map.strategicregions).forEach((key) => {
  const entry = db.map.strategicregions[key].strategic_region;
  if (!Array.isArray(entry.provinces)) return;
  const name = strategic_regions_l10n[entry.name];
  const terrainCount = {};
  const continentCount = {};
  const states = {};
  entry.provinces.forEach((id) => {
    const province = provinces[id];
    const terrain = province[6];
    const continent = province[7];
    terrainCount[terrain] = (terrainCount[terrain] || 0) + 1;
    continentCount[continent] = (continentCount[continent] || 0) + 1;
    // Some provinces have no state.
    if (id in stateByProvince) {
      const state = stateByProvince[id];
      if (!(state in states)) states[state] = { buildings: buildingsByState[state] };
      states[state].provinces = (states[state].provinces || 0) + 1;
      if (state in regionByState && regionByState[state] !== entry.id) {
        throw new Error(`state in two regions ${state} ${regionByState[state]} ${entry.id}`);
      }
      regionByState[state] = entry.id;
    }
  });
  let arms_factory = 0;
  let industrial_complex = 0;
  Object.keys(states).forEach((key) => {
    const buildings = states[key].buildings;
    if (!buildings) return;
    arms_factory += buildings.arms_factory | 0;
    industrial_complex += buildings.industrial_complex | 0;
  });

  // Remove ocean region
  let maxContinent;
  let maxContinentCount = 0;
  Object.keys(continentCount).forEach((c) => {
    if (continentCount[c] > maxContinentCount) {
      maxContinentCount = continentCount[c];
      maxContinent = c;
    }
  });
  if (!maxContinent || maxContinent === '0') return;

  const continentName = continent_l10n[continents[maxContinent - 1]];
  delete terrainCount.lakes;
  if (!(continentName in strategic_regions)) {
    strategic_regions[continentName] = {};
  }
  strategic_regions[continentName][name] = {
    terrain: terrainCount,
    arms_factory,
    industrial_complex,
  };
});
const sortNames = (a, b) => {
  const regex = /^(((north|south|west|east)(ern)*|new|central|great|arctic|sub-\S+)[- ])+/i;
  const a2 = a.replace(regex, '');
  const b2 = b.replace(regex, '');
  if (a2 < b2) return -1;
  if (a2 > b2) return 1;
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};
const strategic_regions_sorted = {};
Object.keys(strategic_regions).sort(sortNames).forEach((key) => {
  strategic_regions_sorted[key] = {};
  Object.keys(strategic_regions[key]).sort(sortNames).forEach((key2) => {
    strategic_regions_sorted[key][key2] = strategic_regions[key][key2];
  });
});
db.map.strategic_regions = strategic_regions_sorted;
delete db.map.strategicregions;

db.l10n.unit_code = unit_code;
db.l10n.archetype_code = archetype_code;

process.chdir(oldcwd);
fs.writeFileSync('db.json', JSON.stringify(db));
