'use strict';
// Utility functions for db-migrator

function retry(fn, maxAttempts, delayMs) {
  maxAttempts = maxAttempts || 3;
  delayMs = delayMs || 500;
  return new Promise(function(resolve, reject) {
    var attempt = 0;
    function run() {
      attempt++;
      Promise.resolve(fn()).then(resolve).catch(function(err) {
        if (attempt >= maxAttempts) return reject(err);
        setTimeout(run, delayMs * attempt);
      });
    }
    run();
  });
}

function debounce(fn, waitMs) {
  var timer;
  return function() {
    var args = arguments;
    var ctx = this;
    clearTimeout(timer);
    timer = setTimeout(function() { fn.apply(ctx, args); }, waitMs);
  };
}

function chunk(arr, size) {
  var result = [];
  for (var i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

module.exports = { retry, debounce, chunk };
