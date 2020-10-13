import _ from 'lodash';

/**
 * Hamming distance between ints
 *
 * @param x {number}
 * @param y {number}
 * @returns {number}
 */
function distanceOfInts(x, y) {
  return weightOfInt(x ^ y);
}

/**
 * Hamming distance between Uint8Array
 *
 * @param x {number}
 * @param y {number}
 * @returns {number}
 */
function distanceOfUint8Array(x, y) {
  return _.zip(x, y)
    .map(([i, j]) => weightOfInt(i ^ j))
    .reduce((acc, w) => acc + w, 0);
}

/**
 * Hamming Distance
 * https://en.wikipedia.org/wiki/Hamming_distance
 *
 * @param x
 * @param y
 * @returns {number}
 */
function distance(x, y) {
  if (Number.isInteger(x) && Number.isInteger(y)) {
    return distanceOfInts(x, y);
  }

  if (x instanceof Uint8Array && y instanceof Uint8Array) {
    return distanceOfUint8Array(x, y);
  }

  throw new Error(`Unsupported types: ${typeof x} ${typeof y}`);
}

/**
 * Hamming weight of number
 *
 * @private
 * @param x {number}
 * @returns {number}
 */
function weightOfInt(x) {
  let sum = 0;
  while (x !== 0) {
    sum++;
    x &= x - 1;
  }
  return sum;
}

/**
 * Hamming weight of uint8array
 *
 * @private
 * @param x
 * @returns {number}
 */
function weightOfUint8Array(x) {
  return x.reduce((acc, i) => weightOfInt(i) + acc, 0);
}

/**
 * Hamming Weight
 * https://en.wikipedia.org/wiki/Hamming_weight
 *
 * @param x
 * @returns {number}
 */
function weight(x) {
  if (Number.isInteger(x)) {
    return weightOfInt(x);
  }

  if (x instanceof Uint8Array) {
    return weightOfUint8Array(x);
  }

  throw new Error('Unsupported type');
}

export default {
  weight,
  distance
};
