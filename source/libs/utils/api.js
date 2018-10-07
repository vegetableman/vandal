const cache = new Map();

export default async endpoint => {
  if (cache.has(endpoint)) {
    return cache.get(endpoint);
  }

  const response = await fetch(endpoint);
  const json = await response.json();

  if (response.ok) {
    cache.set(endpoint, json);
  } 

  return json;
};
