import * as docx from "docx";
import imageSize from "image-size";
import { downloadImage, base64ImageToBuffer } from "./utils.js";

const ALIGNMENTTYPE = {
  left: docx.AlignmentType.LEFT,
  right: docx.AlignmentType.RIGHT,
  center: docx.AlignmentType.CENTER,
  justify: docx.AlignmentType.JUSTIFIED,
};

export async function section(node, translator) {
  const { content = [] } = node;
  return {
    children: await Promise.all(content.map(translator).filter((item) => item)),
  };
}

export async function hx(node, transform) {
  const { type, attrs = {}, content = [] } = node;
  const level = type.split(/(?=\d)/).pop();
  return new docx.Paragraph({
    heading: `Heading${level}`,
    spacing: {
      before: 200,
      after: 200,
    },
    alignment: ALIGNMENTTYPE[attrs.align] || docx.AlignmentType.LEFT,
    children: await Promise.all(content.map(transform)),
  });
}

export async function ol(node, transform) {
  const { attrs = {}, content = [] } = node;
  return new docx.Paragraph({
    style: "aside",
    numbering: {
      reference: "normal",
      level: attrs.level || 0,
    },
    spacing: {
      before: 200,
      after: 200,
    },
    children: await Promise.all(content.map(transform)),
  });
}

export async function ul(node, transform) {
  const { attrs, content = [] } = node;
  return new docx.Paragraph({
    style: "aside",
    bullet: {
      level: attrs.level || 0,
    },
    spacing: {
      before: 200,
      after: 200,
    },
    indent: {
      // A4纸中，当项目符号距离内容边界为0个字符时，左侧为6.3毫米
      left: docx.convertMillimetersToTwip(6.3 * attrs.level + 1),
    },
    children: await Promise.all(content.map(transform)),
  });
}

export async function link(node, transform) {
  const { attrs = {}, content = [] } = node;
  return new docx.ExternalHyperlink({
    link: attrs.href || "",
    children: await Promise.all(content.map(transform)),
  });
}

export async function p(node, translator) {
  const { attrs = {}, content = [] } = node;
  return new docx.Paragraph({
    style: "aside",
    spacing: {
      before: 200,
      after: 200,
    },
    alignment: ALIGNMENTTYPE[attrs.align] || docx.AlignmentType.LEFT,
    children: await Promise.all(content.map(translator).filter((item) => item)),
  });
}

export async function img({ attrs = {} }) {
  let buffer = null;
  if (/^https?/.test(attrs.src)) {
    buffer = await downloadImage(attrs.src);
  } else if (/^data:image\/(\w+);base64,/.test(attrs.src)) {
    const { buffer: imageBuffer } = base64ImageToBuffer(attrs.src);
    buffer = imageBuffer;
  }
  const { width, height } = imageSize(buffer);
  const node = new docx.ImageRun({
    data: buffer,
    transformation: {
      width: attrs.width || width,
      height: attrs.height || height,
    },
  });
  return node;
}

export async function text(node) {
  const { attrs = {}, content = [] } = node;
  return new docx.TextRun({
    ...attrs,
    text: content.join(),
  });
}

export async function table(node, translator) {
  const { attrs, content } = node;
  return new docx.Table({
    width: attrs.width ? { size: attrs.width } : undefined,
    rows: await Promise.all(content.map(translator)),
  });
}

export async function tr(node, translator) {
  const { content } = node;
  return new docx.TableRow({
    children: await Promise.all(content.map(translator)),
  });
}

export async function td(node, translator) {
  const { attrs, content } = node;
  return new docx.TableCell({
    width: attrs.width ? { size: attrs.width } : undefined,
    rowSpan: attrs.rowSpan ? Number(attrs.rowSpan) : undefined,
    columnSpan: attrs.colSpan ? Number(attrs.colSpan) : undefined,
    children: await Promise.all(content.map(translator)),
  });
}

export function drop() {
  return undefined;
}
