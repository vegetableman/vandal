function forEachDay(data, callback) {
  _.forEach(data, month => _.forEach(month, day => callback(day)));
}

function normalizeHistogram(bins) {
  const maxWeight = bins.reduce((acc, b) => Math.max(acc, b.weight), 0);
  return bins.map(b => ({
    ...b,
    weight: b.weight / maxWeight
  }));
}

function findBinByValue({ bins, value, clamp = false }) {
  const res = bins.find(b => b.begin <= value && value < b.end);
  if (res !== undefined || bins.length === 0 || !clamp) {
    return res;
  }

  if (value < bins[0].begin) {
    return bins[0];
  }
  const last = bins.length - 1;
  if (value >= bins[last].end) {
    return bins[last];
  }

  throw new Error('Hm, it seems we have holes in bins');
}

function normalizeHistogram(bins) {
  const maxWeight = bins.reduce((acc, b) => Math.max(acc, b.weight), 0);
  return bins.map(b => ({
    ...b,
    weight: b.weight / maxWeight
  }));
}

export function putToHistogramBins({ data, bins }) {
  forEachDay(data, day => {
    const { value } = day;
    const bin = findBinByValue({ bins, value, clamp: true });
    if (bin) {
      const weight = bin.weight || 0;
      bin.weight = weight + 1;
    }
  });

  return bins;
}

function createBins({ min, max, size, zero = false }) {
  const delta = max - min;
  const res = _.range(size).map(idx => ({
    begin: min + (delta * idx) / size,
    end: min + (delta * (idx + 1)) / size,
    weight: 0.0
  }));

  if (zero) {
    res[0].begin += 0.1;
    res.unshift({
      begin: min,
      end: min + 0.1,
      weight: 0.0
    });
  }
  return res;
}

export function processHistogram({ data, maxValue, size = 10 }) {
  let histogram = createBins({ zero: true, min: 0, max: maxValue, size });
  histogram = putToHistogramBins({
    data,
    bins: histogram
  });
  return normalizeHistogram(histogram);
}
