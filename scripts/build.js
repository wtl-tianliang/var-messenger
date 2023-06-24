"use strict";

const builder = require("electron-builder");
const Platform = builder.Platform;

// Promise is returned
builder
  .build({
    targets: Platform.WINDOWS.createTarget(),
    config: {
      files: ["dist/**"],
      directories: {
        output: "dist_electron",
      },
      productName: "Var Messenger",
      win: {
        target: "nsis",
        artifactName: "Var-Messenger-Setup-${version}.${ext}",
      },
    },
  })
  .then(() => {
    // handle result
  })
  .catch((error) => {
    // handle error
    console.log(error);
  });
