import h from './h';

const root = window || self || global;
const { Node } = root;
const { ELEMENT_NODE, DOCUMENT_FRAGMENT_NODE, TEXT_NODE } = Node;
const isNode = (e, t) => e.nodeType === t;
const isElement = e => isNode(e, ELEMENT_NODE);
const isFragment = e => isNode(e, DOCUMENT_FRAGMENT_NODE);
const isType = (v, t) => typeof v === t;
const isString = v => isType(v, 'string');
const fragment = function(childNodes) {
  childNodes = childNodes || [];
  childNodes = Array.isArray(childNodes) ? childNodes : [childNodes];
  return { childNodes, nodeType: 11 };
};
const nodeMap = {};
const text = function(textContent) {
  return { nodeType: 3, textContent };
};

const { NodeFilter } = root;
const { SHOW_DOCUMENT_FRAGMENT, SHOW_ELEMENT, SHOW_TEXT } = NodeFilter;
const vNodeMap = new WeakMap();

function getAttributes(node) {
  const temp = {};
  const { attributes } = node;
  const { length } = attributes;
  for (let a = 0; a < length; a++) {
    const { name, value } = attributes[a];
    temp[name] = value;
  }
  return temp;
}

function getFragmentFromString(str) {
  const div = document.createElement('div');
  const fra = document.createDocumentFragment();
  div.innerHTML = str;
  while (div.hasChildNodes()) {
    fra.appendChild(div.firstChild);
  }
  return fra;
}

function getVNode(node) {
  const { nodeType } = node;

  if (nodeType === 3) {
    console.log('textnode', node.textContent);
    return text(node.textContent);
  }

  const vNode = h(node.localName);
  vNode.attributes = getAttributes(node);
  nodeMap[vNode.__id] = node;
  vNodeMap.set(node, vNode);
  return vNode;
}

export default function(dom) {
  let vRoot;

  if (isElement(dom)) {
    vRoot = getVNode(dom);
  } else if (isFragment(dom)) {
    vRoot = fragment();
  } else if (isString(dom)) {
    dom = getFragmentFromString(dom);
    vRoot = fragment();
  }

  const walker = document.createTreeWalker(
    dom,
    SHOW_DOCUMENT_FRAGMENT | SHOW_ELEMENT | SHOW_TEXT,
    null,
    false
  );

  while (walker.nextNode()) {
    const { currentNode } = walker;
    const vNode = getVNode(currentNode);
    const vNodeParent = vNodeMap.get(currentNode.parentNode);

    if (vNodeParent) {
      vNodeParent.childNodes.push(vNode);
    } else {
      vRoot.childNodes.push(vNode);
    }
  }

  return vRoot;
}
