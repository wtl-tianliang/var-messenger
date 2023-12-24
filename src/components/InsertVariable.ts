import type { Editor } from "@typings/tinymce";

type VariablePosition = {
  start: number;
  end: number;
  content: string;
};
type VariablePositionResult = {
  positions: VariablePosition[];
  isContainIndex: (index: number) => boolean;
  getVariableByIndex: (index: number) => undefined | VariablePosition;
};

function getVariablePositions(rng: Range): VariablePositionResult {
  const variableRegx = /`.*?`/g;
  const { startContainer, endContainer } = rng;
  const map = new Map<string, VariablePosition>();

  let startMatch;
  while ((startMatch = variableRegx.exec(startContainer.textContent || ""))) {
    const start = startMatch.index;
    const end = startMatch.index + startMatch[0].length;
    const key = `${start}:${end}`;
    const variable: VariablePosition = { content: startMatch[0], start, end };
    map.set(key, variable);
  }

  let endMatch;
  while ((endMatch = variableRegx.exec(endContainer.textContent || ""))) {
    const start = endMatch.index;
    const end = endMatch.index + endMatch[0].length;
    const key = `${start}:${end}`;
    const variable: VariablePosition = { content: endMatch[0], start, end };
    map.set(key, variable);
  }
  // 获取所有变量
  const positions = Array.from(map.values());

  const isContainIndex = (index: number) =>
    Boolean(positions.find((p) => p.start <= index && p.end >= index));
  const getVariableByIndex = (index: number) =>
    positions.find((p) => p.start <= index && p.end >= index);

  return {
    positions,
    isContainIndex,
    getVariableByIndex,
  };
}

export default function InsertVariablePlugin(editor: Editor, url: string) {
  editor.on("keydown", (e) => {
    const keys = ["Backspace", "Delete"];
    if (!keys.includes(e.key)) {
      return;
    }
    const rng = editor.selection.getRng();
    const { startOffset, startContainer, endOffset, endContainer } = rng;
    const { getVariableByIndex } = getVariablePositions(rng);

    if (e.key === "Backspace") {
      const variable = getVariableByIndex(endOffset);
      if (variable && variable.end === endOffset) {
        rng.setStart(endContainer, Math.min(variable.start, startOffset));
        rng.setEnd(endContainer, Math.max(variable.end, endOffset));
        editor.selection.setRng(rng);
        editor.execCommand("delete");
        e.preventDefault();
      }
    }

    if (e.key === "Delete") {
      const variable = getVariableByIndex(startOffset);
      if (variable && variable.start === startOffset) {
        rng.setStart(startContainer, Math.min(variable.start, startOffset));
        rng.setEnd(startContainer, Math.max(variable.end, endOffset));
        editor.selection.setRng(rng);
        editor.execCommand("delete");
        e.preventDefault();
      }
    }
  });

  editor.on("mouseup", (e) => {
    const rng = editor.selection.getRng();
    const { startOffset, startContainer, endOffset, endContainer } = rng;
    const { positions } = getVariablePositions(rng);
    // 如果选取的开始或结束位置落在 positions里则重新扩展选取
    positions.forEach(({ start, end }) => {
      if (startOffset >= start && startOffset <= end) {
        rng.setStart(startContainer, start);
      }
      if (endOffset >= start && endOffset <= end) {
        rng.setEnd(endContainer, end);
      }
    });
    editor.selection.setRng(rng);
  });

  editor.ui.registry.addSplitButton("variable", {
    text: "插入变量",
    onAction: () => {},
    onItemAction(api, value) {
      editor.insertContent(`\`${value}\``);
    },
    fetch(callback) {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "varm://variables");
      xhr.onload = () => {
        const response = JSON.parse(xhr.responseText) || [];
        const data = response.map((item: any) => ({
          type: "choiceitem",
          text: item.label,
          value: item.label,
        }));
        callback(data);
      };
      xhr.send();
    },
  });

  // Either return plugin metadata or do not return
  return {
    name: "VariablePlugin",
    url: "",
  };
}
