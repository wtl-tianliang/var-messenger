const { parser } = require("posthtml-parser");
const { createDocument } = require("./translator");
const fs = require("fs");

function html2Ast(html) {
  return parser(html, { lowerCaseTags: true });
}

async function genDocx(html) {
  const ast = html2Ast(html);
  const docx = await createDocument(ast);
  fs.writeFileSync("./out.docx", docx);
}

module.exports = {
  genDocx,
};
