import assert from 'assert';

function addFrom(dst, src, n) {
  Object.keys(src).forEach((key) => {
    if (dst.sealed && !(key in dst)) return;
    if (typeof src[key] === 'number') {
      if (!(key in dst)) dst[key] = 0;
      assert.equal(typeof dst[key], 'number');
      dst[key] += src[key] * n;
    } else if (typeof src[key] === 'object' && !Array.isArray(src[key])) {
      if (!dst[key]) dst[key] = {};
      addFrom(dst[key], src[key], n);
    }
  });
}

class Bonus {
  constructor(obj) {
    this.add(obj);
  }

  add(obj, n = 1) {
    if (!obj) return;
    addFrom(this, obj, n);
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
