import axios from "axios";

export function base64ImageToBuffer(base64) {
  const [header, format] = base64.match(/^data:image\/(\w+);base64,/);
  const data = base64.replace(header, "");
  const buffer = Buffer.from(data, "base64");
  return { buffer, format };
}

export async function downloadImage(url) {
  const { data } = await axios.get(url, { responseType: "arraybuffer" });
  return data;
}

/**
 * px转pt
 * 磅 = px / ppi * 72
 * ppi：一英寸内的像素数量, 浏览器默认为 96ppi
 * @param { number } px
 * @returns
 */
export function px2pt(px) {
  return (px / 96) * 72;
}

export function rgb2Hex(rgb) {
  const list = rgb.match(/\d+/g) || [];
  return list
    .map((d) => Number(d).toString(16).toUpperCase().padStart(2, "0"))
    .join("");
}

export const styleConvert = {
  "text-align": (value) => {
    return { align: value };
  },
  "font-family": (value) => {
    return { font: value };
  },
  "font-size": (value) => {
    value = parseInt(value);
    return {
      size: px2pt(value) * 2,
    };
  },
  width: (value) => {
    return { width: value.replace("px", "") };
  },
  height: (value) => {
    return { height: value.replace("px", "") };
  },
  default: (key, value) => {
    if (/^rgb/.test(value)) {
      value = rgb2Hex(value);
    }
    return {
      [key]: value,
    };
  },
};

export function parseStyle(styleStr) {
  if (!styleStr) {
    return {};
  }
  const list = styleStr
    .split(";")
    .map((item) => item.trim())
    .filter((item) => item);

  const style = list.reduce((result, decl) => {
    let [key, value] = decl.split(/\s*?:\s*?/);
    key = key.trim();
    value = value.trim();
    let convert = styleConvert[key];
    if (convert) {
      Object.assign(result, convert(value));
    } else {
      Object.assign(result, styleConvert.default(key, value));
    }
    return result;
  }, {});
  return style;
}

export function parseAttrs(data = {}) {
  const { style = "", ...attrs } = data;
  return {
    ...parseStyle(style),
    ...attrs,
  };
}

export function traverse(tree, cb) {
  if (Array.isArray(tree)) {
    for (let i = 0; i < tree.length; i++) {
      traverse(cb(tree[i]), cb);
    }
  } else if (
    tree &&
    typeof tree === "object" &&
    Object.prototype.hasOwnProperty.call(tree, "content")
  ) {
    traverse(tree.content, cb);
  }

  return tree;
}

/**
 * 标签转属性
 * @param {*} node 节点
 * @param {*} target 目标对象
 */
export function tagToStyle(node, target) {
  if (node.tag === "s") {
    target.strike = true;
  }
  if (node.tag === "strong") {
    target.bold = true;
  }
  if (node.tag === "u") {
    target.underline = "single";
  }
  if (node.tag === "em") {
    target.italics = true;
  }
}

/**
 * 合并两个对象
 * @param {*} target 目标对象
 * @param {*} source 源对象
 * @param {*} isCoverage 是否覆盖目标对象存在的属性
 */
export function mergeProperties(target, source, isCoverage = false) {
  Object.keys(source).forEach((key) => {
    const value = source[key];
    const isHasTarget = Object.prototype.hasOwnProperty.call(target, key);

    // 如果目标对象不存在该属性，则直接赋值
    if (!isHasTarget) {
      target[key] = value;
      return;
    }

    // 目标对象存在该属性且不强制覆盖，则放弃赋值
    if (isHasTarget && !isCoverage) {
      return;
    }

    // 目标对象存在该属性且强制覆盖
    target[key] = value;
  });
}
