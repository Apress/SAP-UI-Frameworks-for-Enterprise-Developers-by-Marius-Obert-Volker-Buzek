/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */

sap.ui.define([
  "sap/m/FlexBox",
  "sap/m/Label",
  "sap/m/Input",
  "sap/m/MultiComboBox",
  "sap/m/DynamicDateRange",
  "sap/ui/core/ListItem"
], function (
  FlexBox,
  Label,
  Input,
  MultiComboBox,
  DynamicDateRange,
  ListItem
) {
  "use strict";

  var FilterField = FlexBox.extend(
    "sap.ushell.components.cepsearchresult.app.controls.FilterField", /** @lends sap.ushell.components.cepsearchresult.app.controls.FilterField.prototype */ {
    metadata: {
    },
    renderer: FlexBox.getMetadata().getRenderer()
  });

  FilterField.prototype.onBeforeRendering = function () {
    this.addStyleClass("sapUiCEPSRFilterField");
  };

  FilterField.create = function (oFilter, changeHandler) {
    var oFilterField = new FilterField({
      items: [
        new Label({
          text: oFilter.label
        })
      ]
    });
    if (oFilter.type === "string") {
      oFilterField.addItem(new Input({
        value: oFilter.value,
        change: changeHandler
      }));
    } else if (oFilter.type === "set") {
      var oMultiComboBox = new MultiComboBox({
        showSecondaryValues: true,
        selectionChange: changeHandler
      });
      for (var i = 0; i < oFilter.data.json.length; i++) {
        oMultiComboBox.addItem(new ListItem(oFilter.data.json[i]));
      }
      oFilterField.addItem(oMultiComboBox);
    } else if (oFilter.type === "dateRange") {
      var oDateRange = new DynamicDateRange({
        options: ["DATE", "TODAY", "YESTERDAY", "DATERANGE", "LASTDAYS", "LASTWEEKS", "LASTMONTHS", "THISWEEK", "LASTWEEK", "THISMONTH", "LASTMONTH"],
        change: changeHandler
      });
      oFilterField.addItem(oDateRange);
    }
    return oFilterField;
  };
  return FilterField;
});
