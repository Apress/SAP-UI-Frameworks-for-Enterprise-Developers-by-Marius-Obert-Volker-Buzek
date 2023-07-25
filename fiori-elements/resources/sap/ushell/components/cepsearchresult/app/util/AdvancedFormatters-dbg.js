// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
  "sap/ui/core/theming/Parameters",
  "sap/ui/core/Core"
], function (ThemeParameters, Core) {

  "use strict";

  var mParams = {};
  function getThemeParameters () {
    mParams = ThemeParameters.get({
      name: ["sapUiAccent2", "sapUiAccentBackgroundColor2", "sapUiAccent10", "sapUiAccentBackgroundColor10", "sapUiFontFamily"]
    });
  }
  Core.attachThemeChanged(getThemeParameters);
  getThemeParameters();

  var sCalendarSvg = [
    '<svg xmlns="http://www.w3.org/2000/svg" aria-label="Calendar" role="img" viewBox="0 0 100 100">',
    '<rect width="100" height="39" fill="{mParams.sapUiAccent2}"/>',
    '<rect y="39" width="100" height="61" fill="{mParams.sapUiAccentBackgroundColor10}"/>',
    '<text x="50%" y="29" style=\'fill:{mParams.sapUiAccentBackgroundColor2};font-size:23px;opacity:0.8;font-family:{mParams.sapUiFontFamily};text-anchor: middle\'>{sMonth}</text>',
    '<text id="day" x="50%" y="84"',
    " style='stroke-width:1;stroke:{mParams.sapUiAccentBackgroundColor10};",
    " fill: {mParams.sapUiAccent10}; font-size: 45px; font-weight: bold; font-family:{mParams.sapUiFontFamily};text-anchor: middle'>{sDay}</text>",
    '<text id="weekday" x="20" y="70" style=\'display:none;fill:{mParams.sapUiAccent10};font-size:20px;font-family:{mParams.sapUiFontFamily};text-anchor: middle\'>{sWeekday}</text>',
    "</svg >"].join("");

  function createCalendarSvg (sWeekday, sMonth, sDay, sYear) {
    var sResultSvg = sCalendarSvg.replace("{sMonth}", sMonth.substring(0, 3))
      .replace("{sDay}", sDay)
      .replace("{sWeekday}", sWeekday.substring(0, 2))
      .replace(/\{mParams.sapUiAccentBackgroundColor2\}/g, mParams.sapUiAccentBackgroundColor2)
      .replace(/\{mParams.sapUiAccentBackgroundColor10\}/g, mParams.sapUiAccentBackgroundColor10)
      .replace(/\{mParams.sapUiAccent2\}/g, mParams.sapUiAccent2)
      .replace(/\{mParams.sapUiAccent10\}/g, mParams.sapUiAccent10)
      .replace(/\{mParams.sapUiFontFamily\}/g, mParams.sapUiFontFamily);
    return "data:image/svg+xml;base64," + btoa(sResultSvg);
  }
  var mEventAccents = {
    event: {
      Past: "10",
      Birthday: "7",
      Workshop: "6",
      Team: "3",
      Customer: "5"
    }
  };
  function getEventTagAccentColors (aData, sCategory) {
    if (Array.isArray(aData) && sCategory) {
      var aResult = [];
      aData.forEach(function (s, i) {
        aResult.push({
          text: s,
          accent: mEventAccents[sCategory] ? mEventAccents[sCategory][s] : "10"
        });
      });
      return aResult;
    }
  }

  return {
    svg: {
      calendar: createCalendarSvg
    },
    map: {
      tagEventAccents: getEventTagAccentColors
    }
  };
});
