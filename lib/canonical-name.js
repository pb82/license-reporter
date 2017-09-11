'use strict';

const namesMap = new Map();

function map (name) {
  return get(name);
}

function get (name) {
  const mapped = namesMap.get(name);
  if (mapped === undefined) {
    return 'UNKNOWN';
  }
  if (Array.isArray(mapped)) {
    return mapped.join(', ');
  }
  return mapped;
}

module.exports = function (list) {
  if (!list) {
    return { 'map': (name) => name };
  }
  for (const key in list) {
    list[key].forEach((name) => {
      namesMap.set(name, key);
    });
  }
  return { 'map': map };
};
