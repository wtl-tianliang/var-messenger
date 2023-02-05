import { px2pt } from "./utils";

export const defaultFont = "Microsoft YaHei"

export default function () {
  return {
    heading1: {
      run: {
        size: px2pt(32) * 2,
        font: defaultFont,
        bold: true,
      },
    },
    heading2: {
      run: {
        size: px2pt(24) * 2,
        font: defaultFont,
        bold: true,
      },
    },
    heading3: {
      run: {
        size: px2pt(18.72) * 2,
        font: defaultFont,
        bold: true,
      },
    },
    heading4: {
      run: {
        size: px2pt(16) * 2,
        font: defaultFont,
        bold: true,
      },
    },
    heading5: {
      run: {
        size: px2pt(13.28) * 2,
        font: defaultFont,
        bold: true,
      },
    }
  };
}
