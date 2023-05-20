// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
  "sap/ui/core/theming/Parameters",
  "sap/ui/core/Core"
], function (ThemeParameters, Core) {

  "use strict";

  // track added parameters
  var aAllParams = [];

  function appendThemeVars (aParams, bReset) {
    var mParams = ThemeParameters.get({
      name: aParams
    });
    // if there is only one param in aParams, a string is returned, normalize mParams to object
    if (typeof mParams === "string") {
      var sValue = mParams;
      mParams = {};
      mParams[aParams[0]] = sValue;
    }
    if (bReset) {
      aAllParams = [];
    }
    for (var n in mParams) {
      // add only new css vars
      if (aAllParams.indexOf(n) === -1) {
        aAllParams.push(n);
        document.body.style.setProperty("--" + n, mParams[n]);
      }
    }
  }

  Core.attachThemeChanged(function () {
    // remove old css vars
    for (var i = 0; i < aAllParams.length; i++) {
      document.body.style.removeProperty("--" + aAllParams[i]);
    }
    // add css vars with new theme values
    appendThemeVars(aAllParams, true);
  });

  return appendThemeVars;
});
