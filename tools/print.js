const db = require('./db.json');
const units = db.common.sub_units;
const assert = require('assert');

class Bonus {
  constructor(obj = {}) {
    this.add(obj);
  }

  add(originalObj = {}) {
    const obj = JSON.parse(JSON.stringify(originalObj));
    Object.keys(obj).forEach((key) => {
      if (!(key in this)) {
        if (!Object.isSealed(this)) {
          this[key] = obj[key];
        }
      } else if (typeof this[key] === 'number') {
        if (obj[key][0] === '@') return;
        assert.equal(typeof obj[key], 'number', `${key} ${JSON.stringify(this)} ${JSON.stringify(obj)}`);
        this[key] += obj[key];
      } else if (typeof this[key] === 'string') {
        if (Array.isArray(obj[key])) {
          this[key] = [this[key], ...obj[key]];
        } else {
          assert.equal(typeof obj[key], 'string');
          this[key] = [this[key], obj[key]];
          this[key].push(obj[key]);
        }
      } else if (Array.isArray(this[key])) {
        if (Array.isArray(obj[key])) {
          this[key].push(...obj[key]);
        } else {
          assert.equal(typeof obj[key], typeof this[key][0]);
          this[key].push(obj[key]);
        }
      } else if (typeof this[key] === 'object') {
        if (typeof obj[key] !== 'object') {
          // Overwrites if objType !== 'object'
          this[key] = obj[key];
        } else {
          if (!(this[key] instanceof Bonus)) {
            this[key] = new Bonus(this[key]);
          }
          this[key].add(obj[key]);
        }
      }
    });
  }
}
function print(obj, indent = '') {
  if (obj.modifier) {
    print(obj.modifier);
  }
//  if (obj.equipment_bonus) {
//    forKeys(obj.equipment_bonus, '  ')
//  }
  Object.keys(obj).forEach((key) => {
    if (key in units || key.startsWith('category_') || key.endsWith('_modifier')) {
      print(obj[key], '  ');
    } else {
      console.log(indent + key);
    }
  });
}
const b = new Bonus();
function forKeys(obj, indent = '') {
  Object.keys(obj).forEach((key) => {
    const node = obj[key];
    //print(node, indent);
    ///const { modifier, ...other } = node;
    b.add(node);
  });
}

//Object.keys(db.common.ideas).forEach((key) => {
//  forKeys(db.common.ideas[key])
//});
//Object.keys(db.common.technologies).forEach((key) => {
//  forKeys(db.common.technologies[key].technologies)
//});
//Object.keys(db.common.unit_leader).forEach((key) => {
//  forKeys(db.common.unit_leader[key]);
//});
forKeys(db.common.sub_units);

console.log(JSON.stringify(b, null, 2));
