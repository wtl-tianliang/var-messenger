import { parser } from "posthtml-parser"
import { createDocument } from "./translator.js"

function html2Ast(html) {
  return parser(html, { lowerCaseTags: true });
}

export async function genDocx(html) {
  html = `<section>${html}</section>`
  const ast = html2Ast(html);
  return await createDocument(ast);
}
