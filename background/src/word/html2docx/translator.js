/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import fs from "fs";
import path from "path";
import * as docx from "docx";
import * as specs from "./specs.js";
import Parser from "./parser.js";
import defaultStyle from "./defaultStyle.js";
import { px2pt } from "./utils.js";

const isDevelopment = process.env.NODE_ENV !== "production";

export async function createDocument(ast, options = {}) {
  async function transfrom(astNode) {
    const { type } = astNode;
    if (/h[12345]/.test(type)) {
      return specs.hx(astNode, transfrom);
    }
    if (["th", "td"].includes(type)) {
      return specs.td(astNode, transfrom);
    }
    const creator = specs[type] || specs.drop;
    return creator(astNode, transfrom);
  }

  const parser = new Parser(ast);
  const docTree = parser.exec();

  const file = isDevelopment
    ? path.join(__dirname, "doc.json")
    : path.join(__dirname, "../doc.json");

  console.log("Write tree:", file);
  fs.writeFileSync(file, JSON.stringify(docTree, null, 2));

  const sections = await Promise.all(
    docTree.map(transfrom).filter((item) => item)
  );

  const { title = "My Document" } = options;
  const doc = new docx.Document({
    numbering: {
      config: [
        {
          reference: "normal",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1.",
              alignment: docx.AlignmentType.LEFT,
            },
          ],
        },
      ],
    },
    styles: {
      default: defaultStyle(),
      paragraphStyles: [
        {
          id: "aside",
          name: "Aside",
          basedOn: "Normal",
          quickFormat: true,
          run: {
            size: px2pt(16) * 2,
            font: "Microsoft YaHei",
          },
        },
      ],
    },
    creator: "Var Messenger",
    title,
    sections: sections,
  });
  const buffer = await docx.Packer.toBuffer(doc);

  return {
    ast: docTree,
    buffer,
  };
}
