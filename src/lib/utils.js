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

function format(obj, indent) {
  return indent + Object.keys(obj).map((key) => {
    const value = obj[key];
    const type = typeof value;
    if (!value || (type === 'object' && !Object.keys(value).length)) return false;
    const str = type === 'object' ? format(obj[key], indent + '  ') :
      type === 'number' ? obj[key].toFixed(6).replace(/\.?0+$/, '') :
      obj[key];
    return str && /\S/.test(str) && `${key}: ${str}`;
  }).filter(e => e).join(indent);
}

export function formatJson(obj) {
  if (typeof obj !== 'object') return `${obj}`;
  return format(obj, '\n').slice(1);
}
