const specs = {
  section (node, transform) {
    const { attrs, content = [] } = node;
    return {
      tag: "section",
      attrs,
      content: content.map(transform),
    };
  },

  div(node) {
    const { attrs, content = [] } = node;
    const type = attrs['data-w-e-type']
    if (type === 'todo') {
      const [ status, title ] = content
      return {
        tag: 'p',
        subtag: 'todo',
        content: [typeof status.attrs.checked !== 'undefined' ? '√' : '×', title]
      }
    }
    return {
      tag: 'p',
      content: ['div error', JSON.stringify(node)]
    }
  },

  p(node, transform) {
    const { attrs, content = [] } = node;
    return {
      tag: "p",
      attrs,
      content: content.map(transform),
    };
  },

  span(node, transform) {
    const { attrs, content = [] } = node;
    return {
      tag: "span",
      attrs,
      content: content.map(transform),
    };
  },

  img(node) {
    console.log(node)
    const { attrs } = node;
    return {
      tag: "img",
      attrs,
    };
  },

  text(node) {
    if(typeof node === 'string') {
      return {
        tag: 'text',
        attrs: node
      }
    }
    return {
      tag: "text",
      attrs: node.attrs
    };
  },
};

function transform(node) {
  const { tag, eat = false } = node;
  if (eat) {
    return
  }
  if (typeof node === "string") {
    return specs.text(node);
  }
  const creator = specs[tag] || specs.text;
  node.eat = true
  return creator(node, transform);
}

module.exports = class Parser {
  constructor(ast) {
    this.ast = ast;
  }

  exec() {
    return this.ast.map(transform);
  }
};
