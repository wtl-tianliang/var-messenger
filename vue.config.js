const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  css: {
    loaderOptions: {
      sass: {
        implementation: require("sass"),
      },
    },
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: "Var Messenger",
        win: {
          artifactName: "Var-Messenger-Setup-${version}.${ext}"
        },
      },
      chainWebpackMainProcess: (config) => {
        config.output.filename("background.js");
      },
    },
  },
});
