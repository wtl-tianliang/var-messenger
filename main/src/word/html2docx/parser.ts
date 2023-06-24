/* eslint-disable no-unused-vars */
import {
  parseAttrs,
  px2pt,
  traverse,
  tagToStyle,
  mergeProperties,
} from "./utils.js";

const specs = {
  section(node, transform) {
    const { attrs, content = [] } = node;
    return {
      type: "section",
      attrs: parseAttrs(attrs),
      content: transform(content),
    };
  },

  div(node, transform) {
    return specs.span(node, transform);
  },

  span(node, transform) {
    let { attrs, content = [] } = node;
    content = content.map((item) => {
      if (typeof item === "string") {
        return {
          tag: "text",
          attrs,
          content: [item],
        };
      }

      // 将父节点的属性继承到子节点上
      if (!item.attrs) {
        item.attrs = {};
      }
      tagToStyle(item, item.attrs);
      mergeProperties(item.attrs, attrs);
      return item;
    });
    return transform(content);
  },

  hx(node, transform) {
    const { tag, content = [] } = node;

    return {
      type: tag,
      attrs: parseAttrs(node.attrs),
      content: transform(content),
    };
  },

  p(node, transform) {
    const { content = [] } = node;
    return {
      type: "p",
      attrs: parseAttrs(node.attrs),
      content: transform(content),
    };
  },

  table(node, transform) {
    const { attrs = {}, content } = node;
    const [tbody] = content;
    if (!tbody.attrs) {
      tbody.attrs = {};
    }
    Object.assign(tbody.attrs, attrs);
    return specs.tbody(tbody, transform);
  },

  tbody(node) {
    const { attrs, content = [] } = node;

    // 表格宽度需要使用 twip 单位
    const computedAttrs = parseAttrs(attrs);
    if (computedAttrs.width && computedAttrs.width.indexOf("%") === -1) {
      computedAttrs.width = px2pt(computedAttrs.width);
    }

    return {
      type: "table",
      attrs: computedAttrs,
      content: transform(content),
    };
  },

  tr(node, transform) {
    const { attrs, content = [] } = node;
    return {
      type: "tr",
      attrs: parseAttrs(attrs),
      content: transform(content),
    };
  },

  th(node, transform) {
    const td = specs.td(node, transform);
    const { attrs, content } = td;
    return { type: "th", attrs, content };
  },

  td(node, transform) {
    let { attrs, content = [] } = node;

    // 表格组件直接处理，非表格组件需要包裹一层 P 元素
    // https://docx.js.org/#/usage/tables
    content = content.map((child) => {
      if (child.tag === "table") {
        return child;
      } else {
        return {
          tag: "p",
          content: [child],
        };
      }
    });

    // 表格宽度需要使用 twip 单位
    const computedAttrs = parseAttrs(attrs);
    if (computedAttrs.width === "auto") {
      computedAttrs.width = "";
    }
    if (computedAttrs.width && computedAttrs.width.indexOf("%") === -1) {
      computedAttrs.width = `${px2pt(computedAttrs.width)}pt`;
    }

    return {
      type: "td",
      attrs: computedAttrs,
      content: transform(content),
    };
  },

  a(node, transform) {
    const { attrs, content } = node;
    const children = [];
    const [child] = content;
    if (typeof child === "string") {
      const _node = {
        attrs: {
          underline: true,
          color: "0000FF",
        },
        content: [child],
      };
      children.push(specs.text(_node));
    } else {
      children.push(...transform(content));
    }
    return {
      type: "link",
      attrs: parseAttrs(attrs),
      content: children,
    };
  },

  ul(node, transform) {
    const { content = [], level = 0 } = node;
    const list = content.map((item) => {
      const { tag, content } = item;
      if (tag === "li") {
        return {
          type: "ul",
          attrs: { level },
          content: transform(content),
        };
      } else if (tag === "ul") {
        item.level = level + 1;
        return specs.ul(item, transform);
      }
    });
    return list;
  },

  ol(node, transform) {
    const { content = [], level = 0 } = node;
    const list = content.map((item) => {
      const { tag, content } = item;
      if (tag === "li") {
        return {
          type: "ol",
          attrs: { level },
          content: transform(content),
        };
      } else if (tag === "ol") {
        item.level = level + 1;
        return specs.ol(item, transform);
      }
    });
    return list;
  },

  img(node) {
    const { attrs } = node;
    return {
      type: "img",
      attrs: parseAttrs(attrs),
    };
  },

  variable(node, transform) {
    return specs.text(node, transform);
  },

  s(node, transform) {
    return specs.text(node);
  },

  u(node, transform) {
    return specs.text(node);
  },

  em(node, transform) {
    return specs.text(node);
  },

  strong(node, transform) {
    return specs.text(node);
  },

  text(node) {
    if (typeof node === "string") {
      return { type: "text", content: [node] };
    }

    const [child] = node.content || [];
    if (typeof child === "string") {
      return {
        type: "text",
        attrs: parseAttrs(node.attrs),
        content: [child],
      };
    }

    const attrs = {};
    const content = [];

    // 处理当前节点
    tagToStyle(node, attrs);
    mergeProperties(attrs, parseAttrs(node.attrs));

    // 处理子节点
    traverse(node, (item) => {
      tagToStyle(item, attrs);
      mergeProperties(attrs, parseAttrs(item.attrs));
      if (!item.content || item.content.length < 1) {
        content.push(item);
      }
      return item;
    });

    if (content.length < 1) {
      content.push("");
    }

    return { type: "text", attrs, content };
  },

  br(node) {
    return specs.text("");
  },

  drop(node) {
    console.log("drop", JSON.stringify(node, null, 2));
    return {
      type: "p",
      content: [
        {
          type: "text",
          contnet: [`[lost-data]`],
        },
      ],
    };
  },
};

function getCreator(node) {
  const { tag, attrs = {} } = node;
  const customTag = attrs["data-w-e-type"];

  switch (true) {
    case /h[12345]/.test(tag):
      return specs.hx;
    case !!specs[customTag]:
      return specs[customTag];
    case !!specs[tag]:
      return specs[tag];
    default:
      return specs.drop;
  }
}

function transform(list, from) {
  if (from === "ul") {
    console.log("transform", JSON.stringify(list, null, 2));
  }
  return list
    .map((node) => {
      if (typeof node === "string") {
        return specs.text(node);
      }
      const creator = getCreator(node);
      return creator(node, transform);
    })
    .flat(Infinity);
}

export default class Parser {
  constructor(ast) {
    this.ast = ast;
  }

  exec() {
    return transform(this.ast);
  }
}
