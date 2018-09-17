export const min = array => array.length && Math.min(...array);
export const max = array => array.length && Math.max(...array);
export const sum = array => array.length && array.reduce((a, b) => a + b, 0);
export const avg = array => array.length && array.reduce((a, b) => a + b, 0) / array.length;

export function removeFalsies(obj) {
  const result = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key]) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}
