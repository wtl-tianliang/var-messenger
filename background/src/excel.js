import { read, utils } from "xlsx";
import fs from "fs";

export function parseExcel(filePath) {
  const buffer = fs.readFileSync(filePath);
  const { SheetNames, Sheets } = read(buffer);
  const sheetName = SheetNames[0];
  const data = Sheets[sheetName];
  const json = utils.sheet_to_json(data, { header: 1 });
  return json;
}

// function main() {
//   const path = "C:\\Users\\wwwsz\\Desktop\\sheet.xlsx";
//   parseExcel(path);
// }

// main();

