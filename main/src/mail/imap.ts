import type { FetchMessageObject, MessageStructureObject } from "imapflow";
import type { ParsedMail } from "mailparser";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import fs from "fs";

const config = {
  host: "imap.qq.com",
  port: 993,
  secure: true,
  auth: {
    user: "964817166@qq.com",
    pass: "ppfixfgdzxiebdhe",
  },
};

const dir = "./mails";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

let imap: ImapFlow | null = null;

export function logInImap() {
  imap && imap.close();
  imap = new ImapFlow(config);
  return imap.connect();
}

export function getBoxes() {
  return imap.listTree();
}

export async function getMails(
  boxName: string,
  start: number = 1,
  end: number = 100
) {
  await imap.mailboxOpen(boxName);
  const list = await imap.fetchAll(start + ":" + end, {
    uid: true,
    envelope: true,
    bodyStructure: true,
  });

  fs.writeFileSync(`${dir}/mail.json`, JSON.stringify(list, null, 2));
  return list;
}

function getParts(structure: MessageStructureObject) {
  const children = structure.childNodes;
  const result: MessageStructureObject[] = [];
  if (structure.type.toLowerCase() === "text/plain") {
    result.push(structure);
  }
  if (structure.type.toLowerCase() === "text/html") {
    result.push(structure);
  }
  if (children && children.length > 0) {
    for (const child of children) {
      result.push(...getParts(child));
    }
  }
  return result;
}

export async function downloadMail(
  mail: FetchMessageObject
): Promise<ParsedMail> {
  const { seq } = mail;
  const { content } = await imap.download(seq.toString());
  let text = "";
  content.on("data", (chunk) => {
    text += chunk.toString();
  });
  content.on("end", () => {
    fs.writeFileSync(`${dir}/mail.chunk.txt`, text, { encoding: "utf-8" });
  });
  return new Promise((resolve, reject) => {
    simpleParser(content, (err, parsed) => {
      if (err) {
        return reject(err);
      }
      resolve(parsed);
    });
  });
}

export async function test() {
  try {
    await logInImap();
    const boxes = await getBoxes();
    fs.writeFileSync(`${dir}/boxes.json`, JSON.stringify(boxes, null, 2));

    const mails = await getMails("INBOX");
    fs.writeFileSync(`${dir}/inbox.json`, JSON.stringify(mails, null, 2));

    // const mail = await getMails("INBOX", 3, 3);
    const mail = await getMails("INBOX", 21, 21);
    mail.forEach(async (mail) => {
      const content = await downloadMail(mail);
      const html = content.html || "";
      const text = content.text;
      const attachments = content.attachments;
      attachments.forEach((attachment) => {
        fs.writeFileSync(`${dir}/${attachment.filename}`, attachment.content);
      });
      fs.writeFileSync(`${dir}/mail.html`, html);
      fs.writeFileSync(`${dir}/mail.txt`, text);
    });
  } catch (error) {
    console.log(error);
  }
}
