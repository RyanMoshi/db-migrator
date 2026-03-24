'use strict';
// Input validation helpers for db-migrator

function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

function isPositiveInteger(val) {
  return Number.isInteger(val) && val > 0;
}

function isPlainObject(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

function assertRequired(obj, keys) {
  const missing = keys.filter((k) => obj[k] === undefined || obj[k] === null);
  if (missing.length > 0) throw new Error('Missing required fields: ' + missing.join(', '));
}

module.exports = { isNonEmptyString, isPositiveInteger, isPlainObject, assertRequired };
