/* eslint-disable no-unused-vars */
const docx = require("docx");
const fs = require("fs");
const Parser = require("./parser");
const specs = require('./specs')

function transfrom(astNode) {
  // console.log(astNode)
  if (typeof astNode === 'string') {
    return specs.text(astNode)
  }
  const { tag, attrs, content } = astNode;
  const creator = specs[tag] || specs.text;
  return creator(attrs, content, transfrom);
}

async function createDocument(ast, options = {}) {
  const parser = new Parser(ast)
  const docTree = parser.exec()
  const sections = await Promise.all(docTree.map(transfrom))

  const { title = 'My Document' } = options
  const doc = new docx.Document({
    creator: 'Var Messenger',
    title,
    sections
  })
  return docx.Packer.toBuffer(doc);
}

module.exports = {
  createDocument,
};
