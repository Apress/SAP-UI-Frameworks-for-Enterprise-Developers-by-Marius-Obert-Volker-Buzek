module.exports = function (config) {
  "use strict"

  config.set({
    frameworks: ["ui5"],
    ui5: {
      type: "application",
      configPath: "ui5-mock.yaml"
    },
    browsers: ["Chrome"]
  })
}
