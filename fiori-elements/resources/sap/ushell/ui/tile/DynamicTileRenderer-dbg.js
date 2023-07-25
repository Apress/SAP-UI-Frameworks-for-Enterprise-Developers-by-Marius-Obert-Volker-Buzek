// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Renderer",
    "sap/ui/core/format/NumberFormat",
    "../../library",
    "./TileBaseRenderer",
    "sap/ushell/resources"
], function (
    Renderer,
    NumberFormat,
    ushellLibrary,
    TileBaseRenderer,
    resources
) {
    "use strict";

    var State = ushellLibrary.ui.tile.State;
    var StateArrow = ushellLibrary.ui.tile.StateArrow;
    var translationBundle = resources.i18n;

    /**
     * @name sap.ushell.ui.tile.DynamicTileRenderer.
     * @static
     * @private
     */
    var DynamicTileRenderer = Renderer.extend(TileBaseRenderer);

    // apiVersion needs to be set explicitly (it is not inherited)
    DynamicTileRenderer.apiVersion = 2;


    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
     */
    DynamicTileRenderer.renderPart = function (oRm, oControl) {
        var numValue = oControl.getNumberValue(),
            numberFactor = oControl.getNumberFactor(),
            displayNumber = numValue.toString(),
            // we have to crop numbers to prevent overflow.
            // max characters without icon is 5, with icon 4.
            maxCharactersInDisplayNumber = oControl.getIcon() ? 4 : 5,
            // check if we need to process the number of digits in case of a decimal value
            bShouldProcessDigits = this._shouldProcessDigits(displayNumber, oControl);
        if (displayNumber.length > maxCharactersInDisplayNumber || bShouldProcessDigits) {
            var oNormalizedNumberData = this._normalizeNumber(numValue, maxCharactersInDisplayNumber, numberFactor, oControl);
            numberFactor = oNormalizedNumberData.numberFactor;
            displayNumber = oNormalizedNumberData.displayNumber;
        } else if (displayNumber !== "") {
            var oNForm = NumberFormat.getFloatInstance({ maxFractionDigits: maxCharactersInDisplayNumber });
            displayNumber = oNForm.format(numValue);
        }
        // write the HTML into the render manager
        oRm.openStart("div");
        oRm.class("sapUshellDynamicTile");
        oRm.openEnd();

        // dynamic data
        oRm.openStart("div");
        oRm.class("sapUshellDynamicTileData");
        oRm.class(State[oControl.getNumberState()] ? "sapUshellDynamicTileData" + oControl.getNumberState() :
            "sapUshellDynamicTileData" + State.Neutral);
        oRm.openEnd();

        // sapUshellDynamicTileIndication that includes Arrow and number factor
        oRm.openStart("div");
        oRm.class("sapUshellDynamicTileIndication");
        oRm.openEnd();

        // state arrow
        if (StateArrow[oControl.getStateArrow()]) {
            oRm.openStart("div");
            oRm.class("sapUshellDynamicTileStateArrow");
            oRm.class("sapUshellDynamicTileData" + StateArrow[oControl.getStateArrow()]);
            oRm.openEnd();
            oRm.close("div");
        }

        // unit
        oRm.voidStart("br");
        oRm.voidEnd(); // br was added in order to solve the issue of all the combination of presentation options between Number - Arrow - Unit
        oRm.openStart("div");
        oRm.class("sapUshellDynamicTileNumberFactor");
        oRm.accessibilityState(oControl, { label: translationBundle.getText("TileUnits_lable") + numberFactor });
        oRm.openEnd();
        oRm.text(numberFactor);
        oRm.close("div");

        // closeing the sapUshellDynamicTileIndication scope
        oRm.close("div");

        oRm.openStart("div");
        oRm.class("sapUshellDynamicTileNumber");
        if (displayNumber && displayNumber !== "") {
            oRm.accessibilityState(oControl, {
                label: translationBundle.getText("TileValue_lable") + displayNumber
            });
            oRm.openEnd();
            oRm.text(displayNumber);
        } else {
            // in case numberValue is a String
            oRm.openEnd();
            oRm.text(oControl.getNumberValue());
        }
        oRm.close("div");

        // end of dynamic data
        oRm.close("div");

        // span element
        oRm.close("div");
    };

    DynamicTileRenderer._normalizeNumber = function (numValue, maxCharactersInDisplayNumber, numberFactor, oControl) {
        var number;
        if (isNaN(numValue)) {
            number = numValue;
        } else {
            var oNForm = NumberFormat.getFloatInstance({ maxFractionDigits: oControl.getNumberDigits() });

            if (!numberFactor) {
                var absNumValue = Math.abs(numValue);
                if (absNumValue >= 1000000000) {
                    numberFactor = "B";
                    numValue /= 1000000000;
                } else if (absNumValue >= 1000000) {
                    numberFactor = "M";
                    numValue /= 1000000;
                } else if (absNumValue >= 1000) {
                    numberFactor = "K";
                    numValue /= 1000;
                }
            }
            number = oNForm.format(numValue);
        }

        var displayNumber = number;
        // we have to crop numbers to prevent overflow
        var cLastAllowedChar = displayNumber[maxCharactersInDisplayNumber - 1];
        // if last character is '.' or ',', we need to crop it also
        maxCharactersInDisplayNumber -= (cLastAllowedChar === "." || cLastAllowedChar === ",") ? 1 : 0;
        displayNumber = displayNumber.substring(0, maxCharactersInDisplayNumber);

        return {
            displayNumber: displayNumber,
            numberFactor: numberFactor
        };
    };

    DynamicTileRenderer._shouldProcessDigits = function (sDisplayNumber, oControl) {
        var nDigitsToDisplay = oControl.getNumberDigits(), nNumberOfDigits;
        if (sDisplayNumber.indexOf(".") !== -1) {
            nNumberOfDigits = sDisplayNumber.split(".")[1].length;
            if (nNumberOfDigits > nDigitsToDisplay) {
                return true;
            }
        }
        return false;
    };

    DynamicTileRenderer.getInfoPrefix = function (oControl) {
        return oControl.getNumberUnit();
    };

    return DynamicTileRenderer;
});
