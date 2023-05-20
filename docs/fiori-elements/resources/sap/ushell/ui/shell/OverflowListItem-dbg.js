// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/StandardListItem",
    "sap/ui/core/CustomData",
    "sap/ushell/library", // css style dependency
    "sap/ushell/ui/shell/ShellHeadItem"
], function (
    StandardListItem,
    CustomData,
    ushellLibrary,
    ShellHeadItem
) {
    "use strict";

    // OverflowListItem own properties should be a subset and behave identically to "sap.ushell.ui.shell.ShellHeadItem"
    var oShellHeadItemProperties = ShellHeadItem.getMetadata().getProperties();

    /**
     * Constructor for a new OverflowListItem.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     */
    var OverflowListItem = StandardListItem.extend("sap.ushell.ui.shell.OverflowListItem", /** @lends sap.ushell.ui.shell.OverflowListItem.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                floatingNumber: {
                    type: oShellHeadItemProperties.floatingNumber.type,
                    group: oShellHeadItemProperties.floatingNumber.group,
                    defaultValue: oShellHeadItemProperties.floatingNumber.defaultValue
                },
                floatingNumberMaxValue: {
                    type: oShellHeadItemProperties.floatingNumberMaxValue.type,
                    group: oShellHeadItemProperties.floatingNumberMaxValue.group,
                    defaultValue: oShellHeadItemProperties.floatingNumberMaxValue.defaultValue
                },
                floatingNumberType: {
                    type: oShellHeadItemProperties.floatingNumberType.type,
                    group: oShellHeadItemProperties.floatingNumberType.group,
                    defaultValue: oShellHeadItemProperties.floatingNumberType.defaultValue
                }
            }
        },
        renderer: {
            apiVersion: 2
        }
    });

    // should behave identically to "sap.ushell.ui.shell.ShellHeadItem"
    OverflowListItem.prototype.init = ShellHeadItem.prototype.init;

    // should behave identically to "sap.ushell.ui.shell.ShellHeadItem"
    OverflowListItem.prototype.onBeforeRendering = ShellHeadItem.prototype.onBeforeRendering;

    // should behave identically to "sap.ushell.ui.shell.ShellHeadItem"
    OverflowListItem.prototype.tooltipFormatter = ShellHeadItem.prototype.tooltipFormatter;

    // should behave identically to "sap.ushell.ui.shell.ShellHeadItem"
    OverflowListItem.prototype.floatingNumberFormatter = ShellHeadItem.prototype.floatingNumberFormatter;

    OverflowListItem.prototype._getImage = function () {
        var oImage = this._oImage;

        if (!oImage) {
            oImage = StandardListItem.prototype._getImage.call(this);
        }

        if (this.getFloatingNumber() > 0) {
            oImage.addStyleClass("sapUshellShellHeadItmCounter");
            oImage.addCustomData(new CustomData({
                key: "counter-content",
                value: this.floatingNumberFormatter(),
                writeToDom: true
            }));
        } else {
            oImage.removeStyleClass("sapUshellShellHeadItmCounter");
        }

        this._oImage = oImage;
        return this._oImage;
    };

    return OverflowListItem;
}, true /* bExport */);
