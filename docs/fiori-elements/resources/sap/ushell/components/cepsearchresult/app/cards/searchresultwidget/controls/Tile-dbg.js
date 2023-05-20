/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */

sap.ui.define([
  "sap/ui/core/Control",
  "sap/ushell/services/VisualizationInstantiation"
], function (
  Control,
  VisualizationInstantiation
) {
  "use strict";

  var oInstanceFactory = new VisualizationInstantiation();
  var iTileActivationTime = 1200;

  var Tile = Control.extend(
    "sap.ushell.components.cepsearchresult.app.cards.searchresultwidget.controls.Tile", /** @lends sap.ushell.components.cepsearchresult.app.cards.serchresult.controls.Tile.prototype */ {
    metadata: {
      properties: {
        viz: {
          type: "object",
          bindable: true
        }
      },
      aggregations: {
        _vizInstance: {
          type: "sap.ui.core.Control",
          multiple: false,
          hidden: true
        }
      }
    },
    renderer: function (rm, oControl) {
      rm.openStart("div", oControl);
      rm.openEnd();
      rm.renderControl(oControl.getAggregation("_vizInstance"));
      rm.close("div");
    }
  });
  Tile.prototype.setViz = function (oViz) {
    if (oViz) {
      if (this.getAggregation("_vizInstance")) {
        this.getAggregation("_vizInstance").destroy();
      }
      this.addStyleClass("sapUiCEPCatListTileSize" + oViz.displayFormatHint);
      //oViz.displayFormatHint = "standard";
      var oTile = oInstanceFactory.instantiateVisualization(oViz);
      this.setAggregation("_vizInstance", oTile);
      setTimeout(function () {
        if (sap.ushell.Container) {
          sap.ushell.Container.getServiceAsync("ReferenceResolver").then(function () {
            oTile.setActive(true, false);
          });
        }
      }, iTileActivationTime);
    }
    return this;
  };
  return Tile;
});
