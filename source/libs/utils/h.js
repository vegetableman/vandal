const createTextNode = function(textContent) {
  return { nodeType: 3, textContent };
};
const root = window || self || global;
const { HTMLElement } = root;
const localNameMap = new WeakMap();

function ensureNodes(arr) {
  let out = [];
  if (!Array.isArray(arr)) {
    arr = [arr];
  }
  arr.filter(Boolean).forEach(function(item) {
    if (Array.isArray(item)) {
      out = out.concat(ensureNodes(item));
    } else if (typeof item === 'object') {
      out.push(translateFromReact(item));
    } else {
      out.push(createTextNode(item));
    }
  });
  return out;
}

function ensureObject(val) {
  return val && typeof val === 'object' ? val : {};
}

function isNode(arg) {
  return (
    arg &&
    (typeof arg === 'string' ||
      Array.isArray(arg) ||
      typeof arg.nodeType === 'number' ||
      isReactNode(arg))
  );
}

function isReactNode(item) {
  return item && item.type && item.props;
}

function translateFromReact(item) {
  if (isReactNode(item)) {
    const props = item.props;
    const chren = ensureNodes(props.children);
    delete props.children;
    return {
      attributes: props,
      childNodes: chren,
      localName: item.type,
      nodeType: 1
    };
  }
  return item;
}

let count = 0;
export default function(localName, props, ...chren) {
  const isPropsNode = isNode(props);

  if (isPropsNode) {
    chren = ensureNodes([props].concat(chren));
    props = {
      attributes: {},
      events: {},
      properties: {}
    };
  } else {
    props = ensureObject(props);
    chren = ensureNodes(chren);
  }

  // If it's a function that isn't an HTMLElement constructor. We test for a
  // common property since this may be used in a worker / non browser
  // environment.
  if (localName.prototype instanceof HTMLElement) {
    const cache = localNameMap.get(localName);
    if (cache) {
      return cache;
    }
    // eslint-disable-next-line new-cap
    const tempLocalName = new localName().localName;
    localNameMap.set(localName, tempLocalName);
    localName = tempLocalName;
  } else if (typeof localName === 'function') {
    return localName(props, chren);
  }

  const node = {
    __id: ++count,
    childNodes: chren,
    localName,
    nodeType: 1
  };

  // Special props
  //
  // - aria: object that sets aria-* attributes
  // - attributes: object of attributes to set
  // - data: object that sets data-* attributes
  // - events: object of event listeners to set
  const { aria, attributes, data, events } = props;

  node.attributes = ensureObject(attributes);
  node.events = ensureObject(events);
  node.properties = ensureObject(props);

  const { attributes: nodeAttributes } = node;

  // Aria attributes
  if (typeof aria === 'object') {
    for (let name in aria) {
      nodeAttributes[`aria-${name}`] = aria[name];
    }
  }

  // Data attributes
  if (typeof data === 'object') {
    for (let name in data) {
      nodeAttributes[`data-${name}`] = data[name];
    }
  }

  // Clean up special props.
  delete props.aria;
  delete props.attributes;
  delete props.data;
  delete props.events;

  return node;
}
