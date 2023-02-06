import DocxTemplater from "docxtemplater";
import Pizzip from "pizzip";
import fs from "fs";

export function parseAttachments(fileOpt, data = {}) {
  const { name, path, fillVars } = fileOpt;

  if (fillVars) {
    const content = fs.readFileSync(path, "binary");
    const zip = new Pizzip(content);
    const doc = new DocxTemplater(zip, {
      delimiters: { start: "`", end: "`" },
    });

    doc.render(data);
    const buffer = doc
      .getZip()
      .generate({ type: "nodebuffer", compression: "DEFLATE" });

    return {
      filename: name,
      content: buffer,
    };
  }

  return {
    filename: name,
    path: path,
  };
}
