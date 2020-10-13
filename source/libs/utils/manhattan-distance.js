const sizeOfChunk = 8;

/**
 * Manhattan distance between arrays
 *
 * @param arrayA
 * @param arrayB
 * @returns {number}
 */
export default function manhattanDistanceOfHash(arrayA, arrayB) {
  const size = lengthOf(arrayA);
  if (size !== lengthOf(arrayB)) {
    throw new Error(
      'We can not calculate Manhattan distance for arrays with in different dimension'
    );
  }

  let distance = 0;

  const valueA = valueAt(arrayA);
  const valueB = valueAt(arrayB);

  for (let i = 0; i < size; i++) {
    distance += Math.abs(valueA(i) - valueB(i));
  }

  return distance;
}

/**
 * length of hash
 *
 * @param a
 * @returns {*}
 */
function lengthOf(a) {
  if (Array.isArray(a)) {
    return a.length;
  }

  if (a instanceof Uint8Array) {
    return a.length * sizeOfChunk;
  }

  throw new Error(
    'manhattanDistanceOfHash supports Arrays and Uint8Array types only'
  );
}

/**
 * single dimension value of hash
 *
 * @param a
 * @returns {*}
 */
function valueAt(a) {
  if (Array.isArray(a)) {
    return idx => a[idx];
  } else {
    return idx => (a[idx >> 3] >> [(7 - idx) & 7]) & 1;
  }
}
