// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/library",
    "sap/ushell/library",
    "sap/m/GenericTile",
    "sap/m/Button",
    "sap/ushell/services/_VisualizationInstantiation/VizInstance",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/Config",
    "sap/ushell/utils/WindowUtils",
    "sap/m/ActionSheet"
], function (
    mobileLibrary,
    ushellLibrary,
    GenericTile,
    Button,
    VizInstance,
    hasher,
    Config,
    WindowUtils,
    ActionSheet
) {
    "use strict";

    // shortcut for sap.m.GenericTileMode
    var GenericTileMode = mobileLibrary.GenericTileMode;

    // shortcut for sap.m.GenericTileScope
    var GenericTileScope = mobileLibrary.GenericTileScope;

    // shortcut for sap.ushell.AppType
    var AppType = ushellLibrary.AppType;

    // shortcut for sap.ushell.DisplayFormat
    var DisplayFormat = ushellLibrary.DisplayFormat;

    /**
     * Constructor for a new sap.ushell.ui.launchpad.VizInstanceLink control.
     *
     * @param {string} [sId] ID for the new managed object; generated automatically if no non-empty ID is given
     * @param {object} [mSettings] Optional map/JSON-object with initial property values, aggregated objects etc. for the new object
     *
     * @class Displays header and subheader in a compact link format.
     *
     * @extends sap.m.GenericTile
     *
     * @author SAP SE
     * @version 1.113.0
     * @since 1.84.0
     *
     * @private
     * @alias sap.ushell.ui.launchpad.VizInstanceLink
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var VizInstanceLink = GenericTile.extend("sap.ushell.ui.launchpad.VizInstanceLink", {
        metadata: {
            library: "sap.ushell",
            properties: {
                title: {
                    type: "string",
                    defaultValue: "",
                    group: "Appearance",
                    bindable: true
                },
                subtitle: {
                    type: "string",
                    defaultValue: "",
                    group: "Appearance",
                    bindable: true
                },
                editable: {
                    type: "boolean",
                    defaultValue: false,
                    group: "Behavior",
                    bindable: true
                },
                removable: { // The remove icon is visible in edit mode
                    type: "boolean",
                    defaultValue: true,
                    group: "Behavior",
                    bindable: true
                },
                active: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                targetURL: {
                    type: "string",
                    group: "Misc"
                },
                mode: {
                    type: "sap.m.GenericTileMode",
                    group: "Appearance",
                    defaultValue: GenericTileMode.LineMode
                },
                displayFormat: {
                    type: "string",
                    defaultValue: DisplayFormat.Compact
                },
                supportedDisplayFormats: {
                    type: "string[]",
                    defaultValue: [DisplayFormat.Compact]
                },
                dataHelpId: {
                    type: "string",
                    defaultValue: ""
                },
                vizRefId: {
                    type: "string",
                    defaultValue: ""
                }
            },
            defaultAggregation: "tileActions",
            aggregations: {
                tileActions: {
                    type: "sap.m.Button",
                    forwarding: {
                        getter: "_getTileActionSheet",
                        aggregation: "buttons"
                    }
                }
            },
            events: {
                beforeActionSheetOpen: {},
                afterActionSheetClose: {}
            }
        },
        renderer: GenericTile.getMetadata().getRenderer()
    });

    VizInstanceLink.prototype.init = function () {
        GenericTile.prototype.init.apply(this, arguments);
        this.attachPress(this._handlePress, this);

        this._customTileActions = [];
    };

    VizInstanceLink.prototype.exit = function () {
        if (this._oActionSheet) {
            this._oActionSheet.destroy();
        }
    };

    /**
     * Returns a new ActionSheet. If it was already created it will return the instance.
     *
     * @returns {sap.m.ActionSheet} The ActionSheet control.
     */
    VizInstanceLink.prototype._getTileActionSheet = function () {
        if (!this._oActionSheet) {
            this._oActionSheet = new ActionSheet();
            this._oActionSheet.attachAfterClose(this.fireAfterActionSheetClose.bind(this));
        }
        return this._oActionSheet;
    };

    /**
     * Destroys all custom TileActions
     * @private
     */
    VizInstanceLink.prototype._destroyCustomTileActions = function () {
        this._customTileActions.forEach(function (oButton) {
            this.removeTileAction(oButton);
            oButton.destroy();
        }.bind(this));
        this._customTileActions = [];
    };

    /**
     * Destroys existing custom TileActions and adds them back.
     * This allows TileActionsProviders to change their tileActions
     * @returns {Promise<void>} Resolves when the tileActions were added
     * @private
     */
    VizInstanceLink.prototype._addCustomTileActions = function () {
        if (this._oCustomTileActionsPromise) {
            return this._oCustomTileActionsPromise;
        }

        // destroy all existing to avoid duplicates
        this._destroyCustomTileActions();

        var oRenderer = sap.ushell.Container.getRenderer();

        this._oCustomTileActionsPromise = oRenderer.getCustomTileActions(this).then(function (aTileActions) {
            aTileActions.forEach(function (oTileAction) {
                var oButton = new Button(oTileAction);
                this._customTileActions.push(oButton);
                this.addTileAction(oButton);
            }.bind(this));

            this._oCustomTileActionsPromise = null;
        }.bind(this));

        return this._oCustomTileActionsPromise;
    };

    /**
     * Navigates to an intent or to a target URL if one is provided.
     *
     * @private
     */
    VizInstanceLink.prototype._handlePress = function () {
        if (this.getEditable()) {
            if (!this._getTileActionSheet().isOpen()) {
                this.fireBeforeActionSheetOpen();
            }
            var bEnableTileColors = Config.last("/core/extension/enableTileColors");
            if (bEnableTileColors) {
                this._addCustomTileActions();
            }
            this._getTileActionSheet().openBy(this);
            return;
        }

        var sTargetURL = this.getTargetURL();
        if (!sTargetURL) {
            return;
        }

        if (sTargetURL[0] === "#") {
            hasher.setHash(sTargetURL);
        } else {
            // add the URL to recent activity log
            var bLogRecentActivity = Config.last("/core/shell/enableRecentActivity") && Config.last("/core/shell/enableRecentActivityLogging");
            if (bLogRecentActivity) {
                var oRecentEntry = {
                    title: this.getTitle(),
                    appType: AppType.URL,
                    url: this.getTargetURL(),
                    appId: this.getTargetURL()
                };
                sap.ushell.Container.getRenderer("fiori2").logRecentActivity(oRecentEntry);
            }

            WindowUtils.openURL(sTargetURL, "_blank");
        }
    };

    VizInstanceLink.prototype.load = VizInstance.prototype.load;

    VizInstanceLink.prototype.setVizRefId = function (value) {
        if (!this.getDataHelpId()) {
            this.data("tile-id", value, true);
        }
        return this.setProperty("vizRefId", value);
    };

    VizInstanceLink.prototype.setDataHelpId = function (value) {
        this.data("help-id", value, true);
        this.data("tile-id", value, true);
        return this.setProperty("dataHelpId", value);
    };

    VizInstanceLink.prototype.setTitle = function (value) {
        this.setHeader(value);
        return this.setProperty("title", value);
    };

    VizInstanceLink.prototype.setSubtitle = function (value) {
        this.setSubheader(value);
        return this.setProperty("subtitle", value);
    };

    VizInstanceLink.prototype.setTargetURL = function (value) {
        this.setUrl(value);
        return this.setProperty("targetURL", value);
    };

    VizInstanceLink.prototype.setProperty = function (propertyName, value, suppressInvalidate) {
        if (propertyName === "title") {
            this.setProperty("header", value, suppressInvalidate);
        }

        if (propertyName === "subtitle") {
            this.setProperty("subheader", value, suppressInvalidate);
        }

        if (propertyName === "targetURL") {
            this.setProperty("url", value, suppressInvalidate);
        }

        if (propertyName === "editable") {
            if (value && this.getRemovable()) {
                this.setProperty("scope", GenericTileScope.Actions, suppressInvalidate);
            } else if (value) { // Editable but not removable
                this.setProperty("scope", GenericTileScope.ActionMore, suppressInvalidate);
            } else {
                this.setProperty("scope", GenericTileScope.Display, suppressInvalidate);
            }
        }

        if (propertyName === "removable") {
            var bEditable = this.getEditable();
            if (value && bEditable) {
                this.setProperty("scope", GenericTileScope.Actions, suppressInvalidate);
            } else if (bEditable) { // Editable but not removable
                this.setProperty("scope", GenericTileScope.ActionMore, suppressInvalidate);
            } else {
                this.setProperty("scope", GenericTileScope.Display, suppressInvalidate);
            }
        }

        return GenericTile.prototype.setProperty.apply(this, arguments);
    };

    VizInstanceLink.prototype.getAvailableDisplayFormats = VizInstance.prototype.getAvailableDisplayFormats;

    return VizInstanceLink;
});
