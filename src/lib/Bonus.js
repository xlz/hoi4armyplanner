import assert from 'assert';

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
        assert.equal(typeof obj[key], 'number');
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

  applyTo(originalObj = {}) {
    const obj = JSON.parse(JSON.stringify(originalObj));
    Object.keys(this).forEach((key) => {
      if (key in obj) {
        if (typeof this[key] === 'number') {
          assert(typeof obj[key], 'number');
          obj[key] *= 1 + this[key];
        } else if (typeof this[key] === 'object') {
          assert(typeof obj[key], 'object');
          if (!(this[key] instanceof Bonus)) {
            this[key] = new Bonus(this[key]);
          }
          obj[key] = this[key].applyTo(obj[key]);
        }
      } else {
        obj[key] = this[key];
      }
    });
    return obj;
  }
}

export default Bonus;
