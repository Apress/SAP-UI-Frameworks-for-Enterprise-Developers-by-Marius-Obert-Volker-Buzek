// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview This file contains miscellaneous utility functions.
 *
 */
sap.ui.define([
    "sap/ushell/services/_ClientSideTargetResolution/PrelaunchOperations",
    "sap/ushell/resources",
    "sap/ui/thirdparty/datajs",
    "sap/ui/core/Core",
    "sap/ui/core/mvc/View",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/library",
    "sap/m/library",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/IconPool",
    "sap/ui/core/Icon",
    "sap/m/SelectDialog",
    "sap/m/StandardListItem",
    "sap/m/Text",
    "sap/m/TableSelectDialog",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/ui/core/CustomData",
    "sap/ui/core/Item",
    "sap/m/Label",
    "sap/ui/model/Sorter",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/ui/core/format/NumberFormat"
], function (
    PrelaunchOperations,
    resources,
    OData,
    Core,
    View,
    JSONModel,
    coreLibrary,
    mLibrary,
    Filter,
    FilterOperator,
    IconPool,
    Icon,
    SelectDialog,
    StandardListItem,
    Text,
    TableSelectDialog,
    Column,
    ColumnListItem,
    CustomData,
    Item,
    Label,
    Sorter,
    jQuery,
    Log,
    NumberFormat
) {
    "use strict";

    // shortcut for sap.ui.core.MessageType
    var MessageType = coreLibrary.MessageType;

    // shortcut for sap.ui.core.ValueState
    var ValueState = coreLibrary.ValueState;

    // shortcut for sap.ui.core.mvc.ViewType
    var ViewType = coreLibrary.mvc.ViewType;

    // shortcut for sap.m.ButtonType
    var ButtonType = mLibrary.ButtonType;


    var oUtils = {};

    /**
     * Checks whether the translated chip title is in initial state.
     *
     * @param {string} sTitle The chip title.
     * @returns {boolean} True, if the title is in initial state.
     */
    oUtils.isInitial = function (sTitle) {
        return sTitle === "App Launcher – Static" || sTitle === "App Launcher – Dynamic" || sTitle === "Target Mapping";
    };

    /**
     * Get shared resource bundle model for applauncher and action tiles.
     *
     * @returns {sap.ui.model.resource.ResourceModel} Shared resource bundle model for applauncher and action tiles.
     */
    oUtils.getResourceBundleModel = function () {
        return resources.i18nModel;
    };

    // Create a row template for adding new empty row to the params table (mapping signature)
    oUtils.getEmptyRowObj = function (bEdit) {
        return {
            name: "",
            mandatory: false,
            value: "",
            isRegularExpression: false,
            defaultValue: "",
            valEnabled: false || !bEdit,
            defValEnabled: true,
            editable: bEdit
        };
    };

    // Create a row template for adding new empty row to the Tile Actions table
    oUtils.getEmptyTileActionsRowObj = function (bEdit) {
        var oResourceBundle = oUtils.getResourceBundleModel().getResourceBundle();
        return {
            menu_title: "",
            target_type: oResourceBundle.getText("configuration.tile_actions.table.target_type.url"),
            navigation_target: "",
            action: "",
            icon: "",
            isTargetTypeIntent: false,
            editable: bEdit
        };
    };

    /**
     * This function will be called during init operation Returns tile navigation actions array for design time. Returns empty row if there are not
     * navigation actions maintained.
     *
     * @param {object} oTileApi The instance-specific chip API.
     * @param {boolean} bEdit Edit flag
     * @returns {array} atileActionsRows Returns tile navigation actions array. Example: [{action: "" icon: "sap-icon://Fiori2/F0101"
     *          isTargetTypeIntent: false menu_title: "action1" navigation_target: "http://google.co.in" target_type: "URL"} {action: "action" icon:
     *          "sap-icon://Fiori2/F0212" isTargetTypeIntent: true menu_title: "action2" navigation_target: "AccessControlRole" target_type:
     *          "Intent"}] Empty row Example: [{menu_title: "" , target_type: "URL", navigation_target: "", action: "", icon: "", isTargetTypeIntent:
     *          false}]
     */
    oUtils.getTileNavigationActionsRows = function (oTileApi, bEdit) {
        var atileActionsRows = [], aTileNavigationActions = [];

        aTileNavigationActions = this.getTileNavigationActions(oTileApi);
        if (aTileNavigationActions.length) {
            for (var i = 0; i < aTileNavigationActions.length; i++) {
                atileActionsRows.push(tileAction2TileActionsRow(aTileNavigationActions[i], bEdit));
            }
        } else {
            atileActionsRows = [
                this.getEmptyTileActionsRowObj(bEdit)
            ];
        }

        return atileActionsRows;
    };

    /**
     * This function will be called by runtime Returns tile navigation actions array
     *
     * @param {object} oTileApi The instance-specific chip API.
     * @returns {array} aTileNavigationActions Returns tile navigation actions array. Actions title text will be translated text Example: [{icon:
     *          "sap-icon://Fiori2/F0211", targetURL: "https://www.google.co.in", text: "action1"}, {icon: "sap-icon://Fiori2/F0210", targetURL:
     *          "#AccessControlRole-action", text: "action2"}]
     */
    oUtils.getTileNavigationActions = function (oTileApi) {
        var aTileNavigationActions = [], sTileActionTitle = "";
        var bag = oTileApi.bag.getBag("tileNavigationActions");
        if (bag.getPropertyNames().indexOf("tile_navigation_actions") >= 0) {
            aTileNavigationActions = JSON.parse(bag.getProperty("tile_navigation_actions")); // Bag will return tile navigation actions as a
            // string.JSON.parse will parse the string to an array
            for (var i = 0; i < aTileNavigationActions.length; i++) {
                if (aTileNavigationActions[i].text) {
                    if (bag.getTextNames().indexOf("action_tile_" + (i + 1)) >= 0) {
                        sTileActionTitle = bag.getText("action_tile_" + (i + 1)); // Get translated action title text from bag
                    }
                    aTileNavigationActions[i].text = sTileActionTitle; // Update the action title text with the translated text fetched from bag
                }
            }
        }

        return aTileNavigationActions;
    };

    /**
     * Retruns tile actions table row object
     *
     * @param {object} oTileActionsRow Tile Navigation Actions row object
     * @returns {object} tileActionsRowObject Returns tile navigation actions row object Example: {action: "" icon: "sap-icon://Fiori2/F0101"
     *          isTargetTypeIntent: false menu_title: "action1" navigation_target: "http://google.co.in" target_type: "URL"}
     */
    var tileAction2TileActionsRow = function (oTileActionsRow, bEdit) {
        var tileActionsRowObject = {}, oResourceBundle = oUtils.getResourceBundleModel().getResourceBundle();

        tileActionsRowObject.menu_title = oTileActionsRow.text;
        tileActionsRowObject.icon = oTileActionsRow.icon;
        if ((oTileActionsRow.targetURL).charAt(0) === "#") {
            // Target Type is Intent
            tileActionsRowObject.target_type = oResourceBundle.getText("configuration.tile_actions.table.target_type.intent");
            var aNavigationTarget = oTileActionsRow.targetURL.split("-");
            tileActionsRowObject.navigation_target = aNavigationTarget[0].substring(1, aNavigationTarget[0].length); // removes # for the semantic
            // object
            tileActionsRowObject.action = aNavigationTarget[1];
            tileActionsRowObject.isTargetTypeIntent = true;
        } else {
            // Target Type is URL
            tileActionsRowObject.target_type = oResourceBundle.getText("configuration.tile_actions.table.target_type.url");
            tileActionsRowObject.navigation_target = oTileActionsRow.targetURL;
            tileActionsRowObject.action = "";
            tileActionsRowObject.isTargetTypeIntent = false;
        }
        tileActionsRowObject.editable = bEdit;

        return tileActionsRowObject;
    };

    /**
     * This function will be called during save operation. Build the tile actions array according to the entries of the table.
     *
     * @param {array} aTableContent Tile Navigation Actions array
     * @returns {array} aTileNavigationActions Returns tile navigation actions array Example for two rows data. First row:Target_Type: URL, second row
     *          Target_Type: Intent: [{icon: "sap-icon://Fiori2/F0211", targetURL: "https://www.google.co.in", text: "action1"}, {icon:
     *          "sap-icon://Fiori2/F0210", targetURL: "#AccessControlRole-action", text: "action2"}]
     */
    oUtils.tileActionsRows2TileActionsArray = function (aTableContent) {
        var aTileNavigationActions = [];
        for (var i = 0; i < aTableContent.length; i++) {
            if (aTableContent[i].menu_title) {
                aTileNavigationActions.push(tileActionRow2TileActionObject(aTableContent[i]));
            }
        }
        return aTileNavigationActions; // might be empty
    };

    /**
     * Build tile actions row object. If Target Type is Intent, then taregtURL will be prefixed with '#'.
     *
     * @param {object} oTileActionRow Tile Navigation Actions row object
     * @returns {object} oTileAction Returns tile navigation actions row object with semantic object and action combined Example for Target Type URL:
     *          {icon: "sap-icon://Fiori2/F0211", targetURL: "https://www.google.co.in", text: "action1"} Example for target type Intent: {icon:
     *          "sap-icon://Fiori2/F0210", targetURL: "#AccessControlRole-action", text: "action2"}
     */
    var tileActionRow2TileActionObject = function (oTileActionRow) {
        var oTileAction = {};
        oTileAction.text = oTileActionRow.menu_title;
        oTileAction.icon = oTileActionRow.icon;
        if (oTileActionRow.action) {
            oTileAction.targetURL = "#" + oTileActionRow.navigation_target + "-" + oTileActionRow.action;
        } else {
            oTileAction.targetURL = oTileActionRow.navigation_target;
        }

        return oTileAction;
    };

    /**
     * Saves the tile navigation actions in to the bag.
     *
     * @param {Object} tileNavigationActionsBag Bag into which the tile navigation actions has to be saved
     * @param {Array} aNavigationProperties Array of tile navigation actions
     */
    oUtils.populateTileNavigationActionsBag = function (tileNavigationActionsBag, aNavigationProperties) {
        // Stringify the array and populate it to the bag as a property, tile_navigation_actions
        tileNavigationActionsBag.setProperty("tile_navigation_actions", JSON.stringify(aNavigationProperties));
        for (var i = 0; i < aNavigationProperties.length; i++) {
            var sActionTitle = aNavigationProperties[i].text;
            tileNavigationActionsBag.setText("action_tile_" + (i + 1), sActionTitle);
        }
    };

    // The default values for the form factor is to let the application decide what devices are supported (i.e. form factors). The admin can override
    // the defaults.
    oUtils.getDefaultFormFactors = function () {
        return {
            appDefault: false,
            manual: {
                desktop: true,
                tablet: true,
                phone: true
            },
            defaultParam: true
        };
    };

    // Build form factors list as populated by the user. This format is expected by the nav target resolution service.
    // When the appDefault is true, the form factor check-boxes are disabled and their value should be ignored.
    // otherwise, they are used to determine on what form factors this nav target can be used.
    // The values "desktop"/"tablet"/"phone" are sync with the sap.ui.Device.system values which are used in the resolving.
    oUtils.buildFormFactorsObject = function (oModel) {
        return {
            appDefault: oModel.getProperty("/config/appFormFactor"),
            manual: {
                desktop: oModel.getProperty("/config/desktopChecked"),
                tablet: oModel.getProperty("/config/tabletChecked"),
                phone: oModel.getProperty("/config/phoneChecked")
            }
        };
    };

    // Check if the parameters table has duplicate parameter names, return true if it does, false otherwise
    oUtils.tableHasDuplicateParameterNames = function (aTableContent) {
        var parametersMap = {};
        for (var i = 0; i < aTableContent.length; i++) {
            var paramName = aTableContent[i].name;
            if (paramName !== "") {
                if (parametersMap[paramName]) {
                    return true;
                }
                parametersMap[paramName] = true;

            }
        }
        return false;
    };
    /**
     * Returns a boolean which indicates if there are invalid sap-prelaunch-operations parameters or not.
     *
     * @param {array} aTableContent The array of all parameters
     * @returns {boolean} Returns true when there are no invalid sap-prelaunch-operations parameters, otherwise returns false
     *
     * @since 1.69.0
     * @private
     */
    oUtils.tableHasInvalidSapPrelaunchOperationValue = function (aTableContent) {
        for (var i = 0; i < aTableContent.length; i++) {
            if (aTableContent[i].name === "sap-prelaunch-operations") {
                if (PrelaunchOperations.parseAndValidateOperations(aTableContent[i].defaultValue) === null) {
                    return false;
                }
                break;
            }
        }
        return true;
    };

    // Build the mapping signature string according to the entries of the table and the value of the allowed undefined checkbox.
    // This function will be called during save operation
    oUtils.getMappingSignatureString = function (tableContent, allowUnknownParameters) {
        var mappingSignature = "";
        for (var i = 0; i < tableContent.length; i++) {
            if (tableContent[i].name) {
                mappingSignature += (getOneParamSignature(tableContent[i]) + "&");
            }
        }
        return allowUnknownParameters ? mappingSignature + "*=*" : mappingSignature.substring(0, mappingSignature.length - 1); // might be empty
    };

    // build a string representation of the provided row object
    var getOneParamSignature = function (tableRow) {
        var paramSignature = "";

        if (tableRow.mandatory) {
            if (tableRow.isRegularExpression) {
                paramSignature = "{" + tableRow.name + "=" + encodeURIComponent(tableRow.value) + "}";
            } else {
                paramSignature = tableRow.name + "=" + encodeURIComponent(tableRow.value);
            }
        } else {
            paramSignature = "[" + tableRow.name + "=" + encodeURIComponent(tableRow.defaultValue) + "]";
        }
        return paramSignature;
    };

    // var mappingSignatureStringExample = "par1=B%3C%3E&{par2=D*}&[par3=F%40%40]";

    // Build the table data according to the mapping signature string
    // This function will be called during init operation
    oUtils.getMappingSignatureTableData = function (mappingSignatureString, bEdit) {
        var paramsArray = [];
        var paramStringsArray = mappingSignatureString.split("&");

        for (var i = 0; i < paramStringsArray.length; i++) {
            var currentParam = paramStringsArray[i];
            if (currentParam !== "*=*") {
                // For each parameter string (except from the "allow unknown parameters" sign),
                // get the parameter object and add to the array
                paramsArray.push(getOneParamObject(paramStringsArray[i], bEdit));
            }
        }
        return paramsArray;
    };

    var getOneParamObject = function (paramString, bEdit) {
        var paramObject = {};

        if (paramString.charAt(0) === "[") {
            // If there are [] brackets, this parameter is optional
            paramObject.mandatory = false;
            paramObject.isRegularExpression = false; // Optional params can't be regular expressions
            paramObject.value = ""; // No value for optional params (only default value)
            paramString = paramString.substring(1, paramString.length - 1); // Remove [] brackets
            paramObject.name = paramString.substring(0, paramString.indexOf("=")); // Get name
            paramObject.defaultValue = decodeURIComponent(paramString.substring(paramString.indexOf("=") + 1)); // Get default value
        } else {
            // No [] brackets so this parameter is mandatory
            paramObject.mandatory = true;
            paramObject.defaultValue = ""; // No default value for mandatory params (only value is allowed)
            if (paramString.charAt(0) === "{") {
                // If there are {} brackets, this parameter is a regular expression
                paramObject.isRegularExpression = true;
                paramString = paramString.substring(1, paramString.length - 1); // Remove {} brackets
            } else {
                // No {} brackets, so this parameter is not a regular expression
                paramObject.isRegularExpression = false;
            }
            paramObject.name = paramString.substring(0, paramString.indexOf("=")); // Get name
            paramObject.value = decodeURIComponent(paramString.substring(paramString.indexOf("=") + 1)); // Get value
        }
        paramObject.editable = bEdit;

        if (bEdit) {
            paramObject.valEnabled = paramObject.mandatory;
            paramObject.defValEnabled = !paramObject.mandatory;
        } else {
            paramObject.valEnabled = true;
            paramObject.defValEnabled = true;
        }

        return paramObject;
    };

    // Get the allowUnknownParameters check-box value from the mapping signature string (Will be called during init operation)
    oUtils.getAllowUnknownParametersValue = function (mappingSignatureString) {
        // Check if the last parameter is *=* then "allow unknown parameters" should be true
        if (mappingSignatureString && (mappingSignatureString.substring(mappingSignatureString.length - 3, mappingSignatureString.length) === "*=*")) {
            return true;
        }
        return false;
    };

    oUtils.getMappingSignature = function (aRows, bAdditionalParameters) {
        var sAdditionalParameters = bAdditionalParameters ? "allowed" : "ignored";
        var oUserDefParser = new RegExp("%%UserDefault[.].+%%");
        var aMatch = [];
        var oMappingSignature = {
            parameters: {},
            additional_parameters: sAdditionalParameters
        };
        aRows.forEach(function (oRow) {
            oMappingSignature.parameters[oRow.name] = {
                required: oRow.mandatory,
                rename_to: oRow.rename_to
            };
            if (oRow.defaultValue) {
                aMatch = oUserDefParser.exec(oRow.defaultValue);
                if (aMatch) {
                    oRow.defaultValue = aMatch[0];
                }
                oMappingSignature.parameters[oRow.name].defaultValue = {
                    value: oRow.defaultValue
                };
            }
            if (oRow.value) {
                aMatch = oUserDefParser.exec(oRow.value);
                if (aMatch) {
                    oRow.value = aMatch[0];
                }

                oMappingSignature.parameters[oRow.name].filter = {
                    value: oRow.value
                };
                if (oRow.isRegularExpression) {
                    oMappingSignature.parameters[oRow.name].filter.format = "regexp";
                }
            }
        });
        return oMappingSignature;
    };

    oUtils.getSignatureTableData = function (oSignature, bEdit) {
        var paramsArray = [];
        var oRow = {};
        var oParameter = {};
        var oParameters = oSignature.parameters;

        for (var key in oParameters) {
            oParameter = oParameters[key];

            oRow = {};
            oRow.editable = bEdit;
            oRow.name = key;
            oRow.mandatory = oParameter.required;
            if (oParameter.rename_to) {
                oRow.rename_to = oParameter.rename_to;
            } else {
                oRow.rename_to = oParameter.renameTo;
            }

            if (bEdit) {
                oRow.valEnabled = oRow.mandatory;
                oRow.defValEnabled = !oRow.mandatory;
            } else {
                oRow.valEnabled = true;
                oRow.defValEnabled = true;
            }

            if (oParameter.filter) {
                oRow.value = oParameter.filter.value;
                if (oParameter.filter.format && oParameter.filter.format === "regexp") {
                    oRow.isRegularExpression = true;
                }
            }

            if (oParameter.defaultValue) {
                oRow.defaultValue = oParameter.defaultValue.value;
            }

            paramsArray.push(oRow);
        }
        return paramsArray;
    };

    /**
     * Returns the translated title string.
     *
     * @param {object} oTileApi The instance-specific chip API.
     * @returns {string} The translated chip title.
     */
    oUtils.getTranslatedTitle = function (oTileApi) {
        // Note: "oTileApi.title" is no genuine contract, but is injected by the launchpad designer.
        // As such, "title" is only available in design time and not during runtime.
        // At runtime. oTileApi.preview.getTitle() can be used to fetch the translatable title.

        // first try to get title from bag
        if (oTileApi.bag) {
            var bag = oTileApi.bag.getBag("tileProperties");
            if (bag.getTextNames().indexOf("display_title_text") >= 0) {
                return bag.getText("display_title_text");
            }
        }

        // design time
        if (oTileApi.title) {
            return oTileApi.title.getTitle();
        }
        // runtime
        if (oTileApi.preview) {
            return oTileApi.preview.getTitle();
        }
        return "";
    };

    /**
     * Returns the translated subtitle string.
     *
     * @param {object} oTileApi The instance-specific chip API.
     * @param {object} oConfig The instance-specific tile configuration.
     * @returns {string} The translated chip subtitle.
     */
    oUtils.getTranslatedSubtitle = function (oTileApi, oConfig) {
        // first try to get subtitle from bag
        if (oTileApi.bag) {
            var bag = oTileApi.bag.getBag("tileProperties");
            if (bag.getTextNames().indexOf("display_subtitle_text") >= 0) {
                return bag.getText("display_subtitle_text");
            }
        }

        // try to get it from configuration
        if (typeof oConfig.display_subtitle_text === "string") {
            return oConfig.display_subtitle_text;
        }

        // then try to get it from the preview
        if (oTileApi.preview && oTileApi.preview.getDescription && oTileApi.preview.getDescription()) {
            return oTileApi.preview.getDescription();
        }

        // last get it from the configuration
        // return oConfig['display_subtitle_text'];

        return "";
    };

    /**
     * Returns the translated property string from .
     *
     * @param {object} oTileApi The instance-specific chip API.
     * @param {string} sPropertyKey The property key
     * @returns {string} The translated chip property.
     */
    oUtils.getTranslatedProperty = function (oTileApi, oTileConfig, sPropertyKey) {
        // Try to read data from the property bag. If there are properties for description etc. > use them
        if (oTileApi.bag) {
            var bag = oTileApi.bag.getBag("tileProperties");
            if (bag.getTextNames().indexOf(sPropertyKey) >= 0) {
                return bag.getText(sPropertyKey);
            }
        }

        // If there is no data in the property bag, use the config bag to read the data
        return oTileConfig[sPropertyKey];
    };

    /**
     * Read and initialize configuration object from given JSON string. Used by the action chip (aka target mapping).
     *
     * @param {string} sConfig Configuration string in JSON format
     * @param {string} bAdmin A flag that indicates, whether the configuration shall be shown in the Admin UI
     * @returns {object} Returns parsed and initialized configuration object
     */
    oUtils.getActionConfiguration = function (oTileApi, bAdmin) {
        var sConfig = oTileApi.configuration.getParameterValueAsString("tileConfiguration");
        var oConfig = JSON.parse(sConfig || "{}"), oResourceBundle;
        if (typeof bAdmin === "undefined") {
            bAdmin = oTileApi.configurationUi.isEnabled();
        }

        if (bAdmin) {
            oResourceBundle = oUtils.getResourceBundleModel().getResourceBundle();
        }
        oConfig.semantic_object = oConfig.semantic_object || (bAdmin ? "[" + oResourceBundle.getText("configuration.semantic_object") + "]" : "");
        oConfig.semantic_action = oConfig.semantic_action || (bAdmin ? "[" + oResourceBundle.getText("configuration.semantic_action") + "]" : "");
        oConfig.navigation_provider = oConfig.navigation_provider || "";
        oConfig.navigation_provider_role = oConfig.navigation_provider_role || "";
        oConfig.navigation_provider_instance = oConfig.navigation_provider_instance || "";
        oConfig.target_application_id = oConfig.target_application_id || "";
        oConfig.target_application_alias = oConfig.target_application_alias || "";
        oConfig.display_info_text = oConfig.display_info_text || "";

        oConfig.editable = true;
        if (oTileApi.configurationUi && oTileApi.configurationUi.isReadOnly) {
            if (oTileApi.configurationUi.isReadOnly()) {
                oConfig.editable = false;
            }
        }
        return oConfig;
    };

    /**
     * Returns the current configuration initially passed to the view
     *
     * @param {object} oView The view for which the configuration UI shall be initialized.
     * @returns {object} The configuration.
     */
    oUtils.getViewConfiguration = function (oView) {
        var oViewData = oView.getViewData();
        var oTileApi = oViewData.chip;
        var oCurrentConfig = oUtils.getAppLauncherConfig(oTileApi, true, true);

        return oCurrentConfig;
    };

    /**
     * Takes an existing view (<code>ActionTile</code>, <code>StaticTile</code>, <code>DynamicTile</code>) and initializes the configuration
     * UI.
     *
     * @param {object} oView The view for which the configuration UI shall be initialized
     * @param {string} sViewName The name of the view to initialize
     * @returns {object} The configuration view to be shown in the Admin UI, e.g., {@link components.tiles.action.Configuration},
     *          {@link components.tiles.applauncher.Configuration}, or {@link components.tiles.applauncherdynamic.Configuration}
     */
    oUtils.getConfigurationUi = function (oView, sViewName) {
        var oSemanticObjectSelector,
            oRoleSelector,
            oInstanceSelector,
            oAliasSelector,
            oApplicationType;

        var oViewData = oView.getViewData();
        var oCurrentConfig = oUtils.getViewConfiguration(oView);

        // verify user allow to edit (user locale = original Locate

        var oConfigurationModel = new JSONModel({
            config: oCurrentConfig,
            // keep reference to the model in this model
            // (to be able to update it directly on configuration changes)
            tileModel: oView.getModel()
        });

        return View.create({
            type: ViewType.XML,
            viewData: oViewData,
            viewName: sViewName
        }).then(function (oConfigurationView) {
            oConfigurationView.setModel(oConfigurationModel);

            // initialize state of input fields depending on navigation_use_semantic_object
            // navigation_semantic_objectInput</code> used in static and dynamic tiles
            // semantic_objectInput used in action tile
            oSemanticObjectSelector = oConfigurationView.byId("navigation_semantic_objectInput") || oConfigurationView.byId("semantic_objectInput");
            if (oSemanticObjectSelector) {
                oSemanticObjectSelector.getModel().setProperty("/enabled", oCurrentConfig.navigation_use_semantic_object);
                oSemanticObjectSelector.getModel().setProperty("/value", oCurrentConfig.semantic_object || oCurrentConfig.navigation_semantic_object);
            }
            oRoleSelector = oConfigurationView.byId("navigation_provider_roleInput");
            if (oRoleSelector) {
                oRoleSelector.getModel().setProperty("/value", oCurrentConfig.navigation_provider_role);
            }
            oInstanceSelector = oConfigurationView.byId("navigation_provider_instanceInput");
            if (oInstanceSelector) {
                oInstanceSelector.getModel().setProperty("/value", oCurrentConfig.navigation_provider_instance);
            }
            oAliasSelector = oConfigurationView.byId("target_application_aliasInput");
            if (oAliasSelector) {
                oAliasSelector.getModel().setProperty("/value", oCurrentConfig.target_application_alias);
            }

            // Enable Application type radio button LPD_CUST/SAPUI5 depending on navigation_provider
            // Application type is used in action tile configuration
            oApplicationType = oConfigurationView.byId("targetTypeInput");
            if (oApplicationType) {

                if (!oConfigurationView.getModel().getProperty("/config/transaction")) {
                    oConfigurationView.getModel().setProperty("/config/transaction", {});
                }
                if (!oConfigurationView.getModel().getProperty("/config/web_dynpro")) {
                    oConfigurationView.getModel().setProperty("/config/web_dynpro", {});
                }

                if (oView.getModel().getProperty("/config/navigation_provider") === "LPD") {
                    oUtils.displayLpdCustApplicationTypeFields(oConfigurationView);
                } else if (oView.getModel().getProperty("/config/navigation_provider") === "WCF") {
                    oApplicationType.setSelectedKey("WCF");
                    oUtils.displayWCFApplicationTypeFields(oConfigurationView);
                } else if (oView.getModel().getProperty("/config/navigation_provider") === "SAPUI5" || oView.getModel().getProperty("/config/navigation_provider") === "") {
                    oApplicationType.setSelectedKey("SAPUI5");
                    oUtils.displaySapui5ApplicationTypeFields(oConfigurationView);
                } else if (oView.getModel().getProperty("/config/navigation_provider") === "TR") {
                    oUtils.displayTransactionApplicationTypeFields(oConfigurationView);
                } else if (oView.getModel().getProperty("/config/navigation_provider") === "WDA") {
                    oUtils.displayWebDynproApplicationTypeFields(oConfigurationView);
                } else if (oView.getModel().getProperty("/config/navigation_provider") === "URL") {
                    oUtils.displayURLApplicationTypeFields(oConfigurationView);
                } else if (oView.getModel().getProperty("/config/navigation_provider") === "URLT") {
                    oUtils.displayURLTApplicationTypeFields(oConfigurationView);
                    oConfigurationModel.setProperty("/config/editable", false);
                    oConfigurationModel.setProperty("/config/manualFormFactor", false);
                }
            }
            return oConfigurationView;
        });
    };

    oUtils._updateTilePropertiesTexts = function (oView, oTilePropertiesBag) {
        var aTilePropertiesTextNames = oTilePropertiesBag.getTextNames(),
            oModel = oView.getModel();

        aTilePropertiesTextNames.forEach(function (sPropertyText) {
            oModel.setProperty("/data/" + sPropertyText, oTilePropertiesBag.getText(sPropertyText));
            oModel.setProperty("/config/" + sPropertyText, oTilePropertiesBag.getText(sPropertyText));
        });
    };

    oUtils._updateTileConfiguration = function (oView, sTileConfigurationBag) {
        var oModel = oView.getModel(),
            oTileConfig = JSON.parse(sTileConfigurationBag),
            sPropertyValue;

        Object.keys(oTileConfig).forEach(function (sPropertyName) {
            sPropertyValue = oTileConfig[sPropertyName];
            oModel.setProperty("/data/" + sPropertyName, sPropertyValue);
            oModel.setProperty("/config/" + sPropertyName, sPropertyValue);
            if (sPropertyName === "navigation_target_url") {
                oModel.setProperty("/nav/" + sPropertyName, sPropertyValue);
            }
        });
    };

    /**
     * Captures/caches the names of semantic objects configured in the backend.
     */
    oUtils.aData = [];
    oUtils.aActionData = [];
    oUtils.aRoleData = [];
    oUtils.aAliasData = [];

    /**
     * Search function for the object selector dialog.
     */
    oUtils.objectSelectDoSearch = function (oEvent) {
        var filter = [], sVal = oEvent.getParameter("value"), itemsBinding, selectNameFilter, selectObjFilter;
        if (sVal !== undefined) {
            itemsBinding = oEvent.getParameter("itemsBinding");
            selectNameFilter = new Filter("name", FilterOperator.Contains, sVal);
            selectObjFilter = new Filter("obj", FilterOperator.Contains, sVal);
            filter.push(selectObjFilter);
            filter.push(selectNameFilter);
            itemsBinding.filter(new Filter(filter, false));
        }
    };

    /**
     * Search function for the action selector dialog.
     */
    oUtils.actionSelectDoSearch = function (oEvent) {
        var filter = [], sVal = oEvent.getParameter("value"), itemsBinding, selectActionFilter;
        if (sVal !== undefined) {
            itemsBinding = oEvent.getParameter("itemsBinding");
            selectActionFilter = new Filter("text", FilterOperator.Contains, sVal);
            filter.push(selectActionFilter);
            itemsBinding.filter(new Filter(filter, false));
        }
    };

    /**
     * Search function for the role selector dialog.
     */
    oUtils.roleSelectDoSearch = function (oEvent) {
        var filter = [], sVal = oEvent.getParameter("value"), itemsBinding, selectRoleFilter, selectInstanceFilter;
        if (sVal !== undefined) {
            itemsBinding = oEvent.getParameter("itemsBinding");
            selectRoleFilter = new Filter("role", FilterOperator.Contains, sVal);
            selectInstanceFilter = new Filter("instance", FilterOperator.Contains, sVal);
            filter.push(selectRoleFilter);
            filter.push(selectInstanceFilter);
            itemsBinding.filter(new Filter(filter, false));
        }
    };

    /**
     * Search function for the instance selector dialog.
     */
    oUtils.instanceSelectDoSearch = function (oEvent) {
        var filter = [], sVal = oEvent.getParameter("value"), customData, sRole, itemsBinding, selectRoleFilter, selectObjFilter;

        customData = oEvent.getSource().getCustomData();
        sRole = customData[0].getValue();

        if (sVal !== undefined) {
            itemsBinding = oEvent.getParameter("itemsBinding");
            if (sVal !== "") {
                selectObjFilter = new Filter("instance", FilterOperator.Contains, sVal);
                filter.push(selectObjFilter);
            }
            if (sRole !== "") {
                selectRoleFilter = new Filter("role", FilterOperator.EQ, sRole);
                filter.push(selectRoleFilter);
            }
            if (filter.length > 0) {
                itemsBinding.filter(new Filter(filter, true));
            }
        }
    };

    /**
     * Suggest function for the instance.
     */
    oUtils.instanceSuggest = function (oController, oEvent) {
        var oView = oController.getView(), filter = [], sVal = oEvent.getParameter("value"), oRoleSelector, sRole, suggestionsItemBinding, selectRoleFilter, selectObjFilter;

        oRoleSelector = oView.byId("navigation_provider_roleInput");
        sRole = oRoleSelector.getValue();
        sVal = oEvent.getParameter("suggestValue");

        if (sVal !== "") {
            selectObjFilter = new Filter("instance", FilterOperator.Contains, sVal);
            filter.push(selectObjFilter);
        }
        if (sRole !== "") {
            selectRoleFilter = new Filter("role", FilterOperator.EQ, sRole);
            filter.push(selectRoleFilter);
        }
        if (filter.length > 0) {
            suggestionsItemBinding = oEvent.oSource.getBinding("suggestionItems");
            suggestionsItemBinding.filter(new Filter(filter, true));
        }
    };

    /**
     * Suggest function for the alias.
     */
    oUtils.aliasSuggest = function (oController, oEvent) {
        var oView = oController.getView(), filter = [], sVal = oEvent.getParameter("value"), oInstanceSelector, sInstance, suggestionsItemBinding, selectInstanceFilter, selectAliasFilter;

        oInstanceSelector = oView.byId("navigation_provider_instanceInput");
        sInstance = oInstanceSelector.getValue();
        sVal = oEvent.getParameter("suggestValue");

        if (sVal !== "") {
            selectAliasFilter = new Filter("alias", FilterOperator.Contains, sVal);
            filter.push(selectAliasFilter);
        }
        if (sInstance !== "") {
            selectInstanceFilter = new Filter("instance", FilterOperator.EQ, sInstance);
            filter.push(selectInstanceFilter);
        }
        if (filter.length > 0) {
            suggestionsItemBinding = oEvent.oSource.getBinding("suggestionItems");
            suggestionsItemBinding.filter(new Filter(filter, true));
        }
    };

    /**
     * Search function for the alias selector dialog.
     */
    oUtils.aliasSelectDoSearch = function (oEvent) {
        var filter = [], sVal = oEvent.getParameter("value"), customData, sInstance, itemsBinding, selectNameFilter, selectObjFilter;

        customData = oEvent.getSource().getCustomData();
        sInstance = customData[0].getValue();

        if (sVal !== undefined) {
            itemsBinding = oEvent.getParameter("itemsBinding");
            selectNameFilter = new Filter("instance", FilterOperator.EQ, sInstance);
            if (sVal !== "") {
                selectObjFilter = new Filter("alias", FilterOperator.Contains, sVal);
                filter.push(selectObjFilter);
            }
            filter.push(selectNameFilter);
            itemsBinding.filter(new Filter(filter, true));
        }
    };

    /**
     * Update function of the object selector dialog.
     */
    oUtils.objectSelectUpdateDialog = function (oSelectDialog, sVal) {
        var filter = [], itemsBinding = oSelectDialog.getBinding("items"), selectFilter;
        if (sVal !== undefined) {
            selectFilter = new Filter("name", FilterOperator.Contains, sVal);
            filter.push(selectFilter);
            itemsBinding.filter(filter);
        }
    };

    /**
     * Update function of the action selector dialog.
     */
    oUtils.actionSelectUpdateDialog = function (oSelectDialog, sVal) {
        var filter = [], itemsBinding = oSelectDialog.getBinding("items"), selectFilter;
        if (sVal !== undefined) {
            selectFilter = new Filter("text", FilterOperator.Contains, sVal);
            filter.push(selectFilter);
            itemsBinding.filter(filter);
        }
    };

    /**
     * Update function of the role selector dialog.
     */
    oUtils.roleSelectUpdateDialog = function (oSelectDialog, sVal) {
        var filter = [], itemsBinding = oSelectDialog.getBinding("items"), selectFilter;
        if (sVal !== undefined) {
            selectFilter = new Filter("role", FilterOperator.Contains, sVal);
            filter.push(selectFilter);
            itemsBinding.filter(filter);
        }
    };

    /**
     * Update function of the instance selector dialog.
     */
    oUtils.instanceSelectUpdateDialog = function (oSelectDialog, sVal) {
        var filter = [], customData, itemsBinding = oSelectDialog.getBinding("items"), selectFilter, sRole, selectNameFilter;

        customData = oSelectDialog.getCustomData();
        sRole = customData[0].getValue();

        if (sVal !== undefined) {
            selectFilter = new Filter("instance", FilterOperator.Contains, sVal);
            filter.push(selectFilter);
        }
        if (sRole !== "") {
            selectNameFilter = new Filter("role", FilterOperator.EQ, sRole);
            filter.push(selectNameFilter);
        }
        if (filter.length > 0) {
            itemsBinding.filter(filter, true);
        }
    };

    /**
     * Update function of the alias selector dialog.
     */
    oUtils.aliasSelectUpdateDialog = function (oSelectDialog, sVal) {
        var filter = [], customData, sInstance, itemsBinding = oSelectDialog.getBinding("items"), selectNameFilter, selectFilter;

        customData = oSelectDialog.getCustomData();
        sInstance = customData[0].getValue();

        if (sVal !== undefined) {
            selectFilter = new Filter("alias", FilterOperator.Contains, sVal);
            filter.push(selectFilter);
        }
        if (sInstance !== "") {
            selectNameFilter = new Filter("instance", FilterOperator.EQ, sInstance);
            filter.push(selectNameFilter);
        }
        if (filter.length > 0) {
            itemsBinding.filter(filter, true);
        }
    };

    // select/deselect colors for icon select dialog
    oUtils.sSelectedColor = (jQuery(".sapMStdTileIconDiv").css("color") || "#007cc0").split(" ").join("");
    oUtils.sDeselectedColor = (jQuery(".sapMLabel:not(.sapFioriDropZoneText )").css("color") || "#666666").split(" ").join("");

    /**
     * Visually select the given icon as indicated.
     *
     * @see sapMStdTileIconDiv
     */
    oUtils.iconSelect = function (oIcon, bSelected) {
        oIcon.setColor(bSelected ? oUtils.sSelectedColor : oUtils.sDeselectedColor);
        oIcon.setActiveColor(bSelected ? oUtils.sDeselectedColor : oUtils.sSelectedColor);
    };

    /**
     * Event handler for icon's "press" event in selection dialog.
     */
    oUtils.onSelectIcon = function (oController, isTileActions, oTileActionsIcon, oControlEvent) {
        var oModel = oController.getView().getModel(), oSelectedIcon;
        if (isTileActions) {
            oSelectedIcon = oModel.getProperty("/config/tile_actions_selected_icon");
        } else {
            oSelectedIcon = oModel.getProperty("/config/selected_icon");
        }

        if (oSelectedIcon) {
            oUtils.iconSelect(oSelectedIcon, false);
        }

        oSelectedIcon = oControlEvent.getSource();
        oUtils.iconSelect(oSelectedIcon, true);
        oModel.setProperty("/config/ok.enabled", true);
        if (isTileActions) {
            oModel.setProperty("/config/tile_actions_selected_icon", oSelectedIcon);
        } else {
            oModel.setProperty("/config/selected_icon", oSelectedIcon);
        }
        oController.byId("selectIconDialog").setTitle(oSelectedIcon.getSrc());
    };

    /**
     * Close handler for icon select dialog.
     */
    oUtils.onSelectIconClose = function (oView) {
        oView.byId("selectIconDialog").close();
    };

    /**
     * Confirm handler for icon select dialog.
     */
    oUtils.onSelectIconOk = function (oView, oTileActionsIcon) {
        var oSelectedIcon = oView.getModel().getProperty("/config/selected_icon");
        if (!oTileActionsIcon) {
            oView.getModel().setProperty("/config/display_icon_url", oSelectedIcon.getSrc());
            oView.byId("iconInput").setValueState(ValueState.None);
        } else {
            oSelectedIcon = oView.getModel().getProperty("/config/tile_actions_selected_icon");
            if (oSelectedIcon) {
                oTileActionsIcon.setValue(oSelectedIcon.getSrc());
                oTileActionsIcon.setValueState(ValueState.None);
            }
        }

        oUtils.onSelectIconClose(oView);
    };

    /**
     * Value help request for icon selection. Opens the icon selection dialog.
     */
    oUtils.iconSelectOnValueHelpRequest = function (oController, oEvent, isTileActions) {
        var oModel = oController.getView().getModel();
        var oResponsiveFlowLayout = oController.getView().byId("icons");
        var aCollectionNames = IconPool.getIconCollectionNames();
        var oDialog = oController.getView().byId("selectIconDialog");
        var oOK = oController.getView().byId("ok");

        var aContent, sIcon, oTileActionsIcon, aIconNames, i, j, sUri, bBusinessSuiteInAppSymbolsContained = false;
        // Clear the content of icon layout, so that the content will be reloded everytime, with different press events for tile actions icon and
        // general icon.
        oResponsiveFlowLayout.destroyContent();

        // If the flag isTileActions is true, then it's tile actions icon field. read the value from event.
        if (isTileActions) {
            oTileActionsIcon = Core.byId(oEvent.getParameter("id"));
            sIcon = oTileActionsIcon.getValue();
        } else {
            sIcon = oModel.getProperty("/config/display_icon_url");
        }

        oOK.attachEventOnce("press", function () {
            oUtils.onSelectIconOk(oController.getView(), oTileActionsIcon);
        });

        // commenting this beacuse press event has to be binded different for general icon and tile actions icon.
        // if (aContent.length === 0) {
        aCollectionNames.sort();
        // remove in-app symbols
        aCollectionNames = aCollectionNames.filter(function (value) {
            if (value === "BusinessSuiteInAppSymbols") {
                bBusinessSuiteInAppSymbolsContained = true;
                return false;
            }
            return true;
        });
        // append at end of array, if available
        // Note: this could be removed if the launchpad icons are not to be used for apps
        if (bBusinessSuiteInAppSymbolsContained) {
            aCollectionNames.push("BusinessSuiteInAppSymbols");
        }
        for (i = 0; i < aCollectionNames.length; i += 1) {
            aIconNames = IconPool.getIconNames(aCollectionNames[i]);
            aIconNames.sort();
            for (j = 0; j < aIconNames.length; j += 1) {
                sUri = IconPool.getIconURI(aIconNames[j], aCollectionNames[i]);
                oResponsiveFlowLayout.addContent(new Icon({
                    height: "38px",
                    press: oUtils.onSelectIcon.bind(null, oController, isTileActions, oTileActionsIcon),
                    size: "2rem",
                    src: sUri,
                    tooltip: sUri,
                    width: "38px"
                }));
            }
        }
        aContent = oResponsiveFlowLayout.getContent();

        // initial state
        oModel.setProperty("/config/ok.enabled", false);
        oDialog.bindProperty("title", {
            model: "i18n",
            path: "configuration.select_icon"
        });

        // initial selection
        for (i = 0; i < aContent.length; i += 1) {
            if (aContent[i].getSrc() === sIcon) {
                if (isTileActions) {
                    oModel.setProperty("/config/tile_actions_selected_icon", aContent[i]);
                } else {
                    oModel.setProperty("/config/selected_icon", aContent[i]);
                }
                oUtils.iconSelect(aContent[i], true);
                oModel.setProperty("/config/ok.enabled", true);
                oDialog.setTitle(sIcon);
            } else {
                oUtils.iconSelect(aContent[i], false);
            }
        }

        oDialog.open();
    };

    /**
     * Value help request for semantic object input. Opens the semantic object input dialog.
     */
    oUtils.objectSelectOnValueHelpRequest = function (oController, oEvent, isTileActions) {
        var oView = oController.getView();
        var sTitle = oUtils.getResourceBundleModel().getResourceBundle().getText("configuration.semantic_object");
        var oSemanticObjectSelector;
        var sValue;
        var oSelectorModel = new JSONModel();
        var oSelectDialog = new SelectDialog("semantic_object_select_dialog", {

            title: sTitle,
            search: oUtils.objectSelectDoSearch,
            liveChange: oUtils.objectSelectDoSearch
        }), itemTemplate = new StandardListItem({
            title: "{obj}"
        });

        if (isTileActions) {
            oSemanticObjectSelector = Core.byId(oEvent.getParameter("id"));
        } else {
            // action tile uses 'semantic_objectInput', dynamic/static tile use 'navigation_semantic_objectInput'
            oSemanticObjectSelector = oView.byId("semantic_objectInput") || oView.byId("navigation_semantic_objectInput");
        }
        sValue = oSemanticObjectSelector.getValue();

        oSelectDialog.open(sValue);
        // controllers can have different default objects
        oSelectorModel.setData(oController.aDefaultObjects.concat(oUtils.aData));

        oSelectDialog.bindAggregation("items", "/", itemTemplate);
        oSelectDialog.setModel(oSelectorModel);

        oUtils.objectSelectUpdateDialog(oSelectDialog, sValue);

        // cancel handler
        oSelectDialog.attachCancel(function (evt) {
            oSemanticObjectSelector.setValue(sValue);
            if (!isTileActions) {
                oSemanticObjectSelector.fireChange();
            }
            oSelectDialog.destroy();
            oSelectDialog = null;
        });

        // confirm handler
        oSelectDialog.attachConfirm(function (evt) {
            var selectedItem = evt.getParameter("selectedItem");
            if (selectedItem) {
                oSemanticObjectSelector.setValue(selectedItem.getTitle());
                if (!isTileActions) {
                    oSemanticObjectSelector.fireChange();
                }
            }
            oSelectDialog.destroy();
            oSelectDialog = null;
        });
    };

    /**
     * Value help request for role input. Opens the role input dialog.
     */
    oUtils.actionSelectOnValueHelpRequest = function (oController, oEvent, isTileActions) {
        var oView = oController.getView();
        var sTitle = oUtils.getResourceBundleModel().getResourceBundle().getText("configuration.semantic_action");
        var oActionSelector;
        var sValue;
        var oSelectorModel = new JSONModel();
        var oSelectDialog = new SelectDialog("semantic_action_select_dialog", {
            title: sTitle,
            search: oUtils.actionSelectDoSearch,
            liveChange: oUtils.actionSelectDoSearch
        }), itemTemplate = new StandardListItem({
            title: "{text}"
        });

        if (isTileActions) {
            oActionSelector = Core.byId(oEvent.getParameter("id"));
        } else {
            // action tile uses 'semantic_objectInput', dynamic/static tile use 'navigation_semantic_objectInput'
            oActionSelector = oView.byId("semantic_actionInput") || oView.byId("navigation_semantic_actionInput");
        }
        sValue = oActionSelector.getValue();

        oSelectDialog.open(sValue);
        // controllers can have different default objects
        oSelectorModel.setData(oUtils.aActionData);

        oSelectDialog.bindAggregation("items", "/items", itemTemplate);
        oSelectDialog.setModel(oSelectorModel);

        oUtils.actionSelectUpdateDialog(oSelectDialog, sValue);

        // cancel handler
        oSelectDialog.attachCancel(function (evt) {
            oActionSelector.setValue(sValue);
            if (!isTileActions) {
                oActionSelector.fireChange();
            }
            oSelectDialog.destroy();
            oSelectDialog = null;
        });

        // confirm handler
        oSelectDialog.attachConfirm(function (evt) {
            var selectedItem = evt.getParameter("selectedItem");
            if (selectedItem) {
                oActionSelector.setValue(selectedItem.getTitle());
                if (!isTileActions) {
                    oActionSelector.fireChange();
                    oActionSelector.fireLiveChange({
                        newValue: selectedItem.getTitle()
                    });
                }
            }
            oSelectDialog.destroy();
            oSelectDialog = null;
        });
    };

    /**
     * Value help request for role input. Opens the role input dialog.
     */
    oUtils.roleSelectOnValueHelpRequest = function (oController/*, oEvent*/) {
        var oView = oController.getView(),
            sTitle = oUtils.getResourceBundleModel().getResourceBundle().getText("configuration.navigation_provider_role"),
            oRoleSelector,
            oInstanceSelector,
            sValue,
            oSelectorModel = new JSONModel(),
            //TableSelectDialog is loaded in core-ext-light.
            //Should be load async with sap.ui.require, but not clear where it is used and how to test it.
            oSelectDialog = new TableSelectDialog("role_select_dialog", {
                title: sTitle,
                search: oUtils.roleSelectDoSearch,
                liveChange: oUtils.roleSelectDoSearch,
                columns: [
                    new Column({
                        header: [
                            new Text({
                                text: oUtils.getResourceBundleModel().getResourceBundle().getText("configuration.navigation_provider_role")
                            })
                        ]
                    }), new Column({
                        header: [
                            new Text({
                                text: oUtils.getResourceBundleModel().getResourceBundle().getText("configuration.navigation_provider_instance")
                            })
                        ]
                    })
                ]
            }), itemTemplate = new ColumnListItem({
                cells: [
                    new Text({
                        text: "{role}"
                    }), new Text({
                        text: "{instance}"
                    })
                ]
            });

        oRoleSelector = oView.byId("navigation_provider_roleInput");
        oInstanceSelector = oView.byId("navigation_provider_instanceInput");

        sValue = oRoleSelector.getValue();

        oSelectDialog.open(sValue);
        // controllers can have different default objects
        oSelectorModel.setData(oController.aDefaultObjects.concat(oUtils.aRoleData));

        oSelectDialog.bindAggregation("items", "/", itemTemplate);
        oSelectDialog.setModel(oSelectorModel);

        oUtils.roleSelectUpdateDialog(oSelectDialog, sValue);

        // cancel handler
        oSelectDialog.attachCancel(function (evt) {
            oRoleSelector.setValue(sValue);
            oRoleSelector.fireChange();
            oSelectDialog.destroy();
            oSelectDialog = null;
        });

        // confirm handler
        oSelectDialog.attachConfirm(function (evt) {
            var selectedItem = evt.getParameter("selectedItem");
            if (selectedItem) {
                oRoleSelector.setValue(selectedItem.getCells()[0].getText());
                oInstanceSelector.setValue(selectedItem.getCells()[1].getText());
                oRoleSelector.fireChange();
                oInstanceSelector.fireChange();
            }
            oSelectDialog.destroy();
            oSelectDialog = null;
        });
    };

    /**
     * Value help request for instance input. Opens the instance input dialog.
     */
    oUtils.instanceSelectOnValueHelpRequest = function (oController/*, oEvent*/) {
        var oView = oController.getView();
        var sRole;
        var sTitle = oUtils.getResourceBundleModel().getResourceBundle().getText("configuration.navigation_provider_instance");
        var oInstanceSelector;
        var sValue;
        var oSelectorModel = new JSONModel();
        var oSelectDialog = new SelectDialog("instance_select_dialog", {
            title: sTitle,
            search: oUtils.instanceSelectDoSearch,
            liveChange: oUtils.instanceSelectDoSearch
        }), itemTemplate = new StandardListItem({
            title: "{instance}"
        });

        oInstanceSelector = oView.byId("navigation_provider_instanceInput");

        sValue = oInstanceSelector.getValue();

        sRole = oView.byId("navigation_provider_roleInput").getValue();
        oSelectDialog.addCustomData(new CustomData({
            key: "role",
            value: sRole
        }));

        oSelectDialog.open(sValue);
        // controllers can have different default objects
        oSelectorModel.setData(oController.aDefaultObjects.concat(oUtils.aRoleData));

        oSelectDialog.bindAggregation("items", "/", itemTemplate);
        oSelectDialog.setModel(oSelectorModel);

        oUtils.instanceSelectUpdateDialog(oSelectDialog, sValue);

        // cancel handler
        oSelectDialog.attachCancel(function (evt) {
            oInstanceSelector.setValue(sValue);
            oInstanceSelector.fireChange();
            oSelectDialog.destroy();
            oSelectDialog = null;
        });

        // confirm handler
        oSelectDialog.attachConfirm(function (evt) {
            var selectedItem = evt.getParameter("selectedItem");
            if (selectedItem) {
                oInstanceSelector.setValue(selectedItem.getTitle());
                oInstanceSelector.fireChange();
            }
            oSelectDialog.destroy();
            oSelectDialog = null;
        });
    };

    oUtils.applicationAliasSelectOnValueHelpRequest = function (oController/*, oEvent*/) {
        var oView = oController.getView();
        var sTitle = oUtils.getResourceBundleModel().getResourceBundle().getText("configuration.target_application_alias");
        var oAliasSelector;
        var sValue;
        var sInstance;
        var oSelectorModel = new JSONModel();
        var oSelectDialog = new SelectDialog("alias_select_dialog", {
            title: sTitle,
            search: oUtils.aliasSelectDoSearch,
            liveChange: oUtils.aliasSelectDoSearch
        }), itemTemplate = new StandardListItem({
            title: "{alias}"
        });

        oAliasSelector = oView.byId("target_application_aliasInput");

        sValue = oAliasSelector.getValue();

        sInstance = oView.byId("navigation_provider_instanceInput").getValue();
        oSelectDialog.addCustomData(new CustomData({
            key: "instance",
            value: sInstance
        }));

        oSelectDialog.open(sValue);
        // controllers can have different default objects
        oSelectorModel.setData(oController.aDefaultObjects.concat(oUtils.aAliasData));

        oSelectDialog.bindAggregation("items", "/", itemTemplate);
        oSelectDialog.setModel(oSelectorModel);

        oUtils.aliasSelectUpdateDialog(oSelectDialog, sValue);

        // cancel handler
        oSelectDialog.attachCancel(function (evt) {
            oAliasSelector.setValue(sValue);
            oAliasSelector.fireChange();
            oSelectDialog.destroy();
            oSelectDialog = null;
        });

        // confirm handler
        oSelectDialog.attachConfirm(function (evt) {
            var selectedItem = evt.getParameter("selectedItem");
            if (selectedItem) {
                oAliasSelector.setValue(selectedItem.getTitle());
                oAliasSelector.fireChange();
            }
            oSelectDialog.destroy();
            oSelectDialog = null;
        });
    };

    /**
     * This function applies table logic for the Action according to the Target Type. if Taregt Type is URL, then Action field should be disabled else
     * if it's Intent, then the Action field should be enabled.
     *
     * @param {object} oTargetTypeComboBox The target type field
     */
    oUtils.onTargetTypeChange = function (oTargetTypeComboBox) {
        var sId = oTargetTypeComboBox.getParameter("id");
        var aParentCells = Core.byId(sId).getParent().getCells();

        var sTargetType = oTargetTypeComboBox.getSource().getSelectedKey(); // ('newValue');
        if (sTargetType === "INT") {
            aParentCells[3].setEnabled(true); // Action field
            aParentCells[2].setShowValueHelp(true); // shows value Help for the Navigation Target field.
            aParentCells[2].setValue("");
        } else {
            aParentCells[2].setShowValueHelp(false); // Hides value Help for the Navigation Target field.
            aParentCells[2].setValue("");
            aParentCells[3].setEnabled(false); // Action field
            aParentCells[3].setValue("");
        }
    };

    /**
     * This function adds new row in the tile actions table.
     *
     * @param {object} oConfigurationView The configuration view to add new row in the tile actions table.
     */
    oUtils.addTileActionsRow = function (oConfigurationView) {
        var oModel = oConfigurationView.getModel();
        var rows = oModel.getProperty("/config/tile_actions_rows");

        // Init a row template for adding new empty row to the tile actions table
        var newParamRow = this.getEmptyTileActionsRowObj();
        rows.push(newParamRow);
        oModel.setProperty("/config/tile_actions_rows", rows);
    };

    /**
     * This function delete rows in the tile actions table.
     *
     * @param {object} oConfigurationView The configuration view to delete rows from the tile actions table.
     */
    oUtils.deleteTileActionsRow = function (oConfigurationView) {
        var oModel = oConfigurationView.getModel();
        var rows = oModel.getProperty("/config/tile_actions_rows");

        var table = oConfigurationView.byId("tileActions");
        var aSelectedItemsIndexes = table.getSelectedIndices();
        var aSortedDescending = aSelectedItemsIndexes.sort(function (a, b) {
            return b - a;
        }).slice();

        for (var i = 0; i < aSortedDescending.length; i++) {
            table.removeSelectionInterval(aSortedDescending[i], aSortedDescending[i]);// Make sure to turn off the selection or it will pass to the
            // next row.
            rows.splice(aSortedDescending[i], 1); // There is a major assumption here that the index in the model is identical to the index in the
            // table !!!
        }
        oModel.setProperty("/config/tile_actions_rows", rows);
    };

    /**
     * Checks the input of given configuration View.
     *
     * @param {object} oConfigurationView The configuration view to check the input for.
     * @param {oControlEvent} The event that triggered the call to this function.
     */
    oUtils.checkInput = function (oConfigurationView, oControlEvent) {
        var oTranslationBundle = oUtils.getResourceBundleModel().getResourceBundle(),
            oIconURLInput = oConfigurationView.byId("iconInput"),
            oUseSemObjNav = oConfigurationView.byId("useLpdCheckbox"),
            oSemObjectInput = oConfigurationView.byId("navigation_semantic_objectInput") || oConfigurationView.byId("semantic_objectInput"),
            oSemActionInput = oConfigurationView.byId("navigation_semantic_actionInput") || oConfigurationView.byId("semantic_actionInput"),
            oValueState = ValueState.None,
            oValueStateText = null,
            sNewValue = String(oControlEvent.getParameter("newValue") || "").trim();

        switch (oControlEvent.getSource()) {
            case oIconURLInput:
                if (sNewValue !== "" && sNewValue.substring(0, 11) !== "sap-icon://") {
                    oValueState = ValueState.Error;
                    oValueStateText = oTranslationBundle.getText("configuration.display_icon_url.warning");
                }
                break;
            case oUseSemObjNav:
                if (!oUseSemObjNav.getSelected()) {
                    oSemActionInput.setValueState(ValueState.None);
                    oSemObjectInput.setValueState(ValueState.None);
                }
                break;
            case oSemObjectInput:
                if (/[-#&? ]/.test(sNewValue)) {
                    oValueState = ValueState.Error;
                    oValueStateText = oTranslationBundle.getText("configuration.semantic_object.error_invalid_chars");
                } else if (sNewValue === "") {
                    oValueState = ValueState.Error;
                }
                break;
            case oSemActionInput:
                if (/[-#&? ]/.test(sNewValue)) {
                    oValueState = ValueState.Error;
                    oValueStateText = oTranslationBundle.getText("configuration.semantic_action.error_invalid_chars");
                } else if (sNewValue === "") {
                    oValueState = ValueState.Error;
                }
                break;
            default:
                break;
        }

        if (oValueState) {
            oControlEvent.getSource().setValueState(oValueState);
            if (oValueStateText !== null) {
                oControlEvent.getSource().setValueStateText(oValueStateText || "");
            }
        }
    };

    /**
     * Checks the input of given configuration View.
     *
     * @param {object} oConfigurationView The configuration view to check the input for.
     */
    oUtils.checkInputOnSaveConfig = function (oConfigurationView) {
        var oIconURLInput = oConfigurationView.byId("iconInput");
        var oSemObjectInput = oConfigurationView.byId("navigation_semantic_objectInput");
        var oSemActionInput = oConfigurationView.byId("navigation_semantic_actionInput");
        var oUseSemObjNav = oConfigurationView.byId("useLpdCheckbox");
        var oTranslationBundle = oUtils.getResourceBundleModel().getResourceBundle();
        var bReject = false;
        // Icon input check
        if (oIconURLInput.getValue() !== "" && !oUtils.isIconURIValid(oIconURLInput.getValue())) {
            oIconURLInput.setValueState(ValueState.Error);
            oIconURLInput.setValueStateText(oTranslationBundle.getText("configuration.display_icon_url.warning"));
            bReject = true;
        }
        // Semantic object input check
        if (oUseSemObjNav.getSelected() && /[-#&? ]/.test(oSemObjectInput.getValue())) {
            oSemObjectInput.setValueState(ValueState.Error);
            oSemObjectInput.setValueStateText(oTranslationBundle.getText("configuration.semantic_object.error_invalid_chars"));
            bReject = true;
        } else if (oUseSemObjNav.getSelected() && oSemObjectInput.getValue() === "") {
            oSemObjectInput.setValueState(ValueState.Error);
            bReject = true;
        }
        // Semantic action input check
        if (/[-#&? ]/.test(oSemActionInput.getValue())) {
            oSemActionInput.setValueState(ValueState.Error);
            oSemActionInput.setValueStateText(oTranslationBundle.getText("configuration.semantic_action.error_invalid_chars"));
            bReject = true;
        } else if (oUseSemObjNav.getSelected() && oSemActionInput.getValue() === "") {
            oSemActionInput.setValueState(ValueState.Error);
            bReject = true;
        }
        return bReject;
    };

    oUtils.checkTileActions = function (oConfigurationView) {
        var aTableContent = oConfigurationView.getModel().getProperty("/config/tile_actions_rows");
        var oTranslationBundle = oUtils.getResourceBundleModel().getResourceBundle();
        var bReject = false;
        for (var i = 0; i < aTableContent.length; i++) {
            if (!aTableContent[i].menu_title && (aTableContent[i].navigation_target || aTableContent.length > 1)) {
                aTableContent[i].valueState = ValueState.Error;
                bReject = true;
            } else {
                aTableContent[i].valueState = ValueState.None;
            }
            // check icon
            if (aTableContent[i].icon) {
                if (!oUtils.isIconURIValid(aTableContent[i].icon)) {
                    aTableContent[i].iconValueState = ValueState.Error;
                    aTableContent[i].iconValueStateText = oTranslationBundle.getText("configuration.display_icon_url.warning");
                    bReject = true;
                }
            }
        }
        oConfigurationView.getModel().setProperty("/config/tile_actions_rows", aTableContent);

        return bReject;
    };

    /**
     * Checks if the given icon URI is valid and idenifies an icon from the IconPool.
     *
     * @param {string} sIconURI The icon URI to check
     */
    oUtils.isIconURIValid = function (sIconURI) {
        var aResult = [];
        var sCollection = "";
        var sIcon = "";
        var sValidIconURI = "";

        aResult = /sap-icon:\/\/(.+)\//.exec(sIconURI);
        if (aResult) {
            sCollection = aResult[1];

            aResult = /\/\/.+\/(.+)/.exec(sIconURI);
            if (aResult) {
                sIcon = aResult[1];
            } else {
                sIcon = "";
            }

            sValidIconURI = IconPool.getIconURI(sIcon, sCollection);
            if (sValidIconURI !== sIconURI) {
                return false;
            }
        } else {
            aResult = /sap-icon:\/\/(.+)/.exec(sIconURI);
            if (aResult) {
                sIcon = aResult[1];
                if (!IconPool.getIconInfo(sIcon)) {
                    return false;
                }
            } else {
                return false;
            }
        }

        return true;
    };

    /**
     * Checks the input of given Target mapping configuration View.
     *
     * @param {object} oConfigurationView The configuration view to check the input for.
     * @param {oControlEvent} The event that triggered the call to this function.
     */
    oUtils.checkTMInput = function (oConfigurationView, oControlEvent) {
        var oTranslationBundle = oUtils.getResourceBundleModel().getResourceBundle(),
            oSemObjectInput = oConfigurationView.byId("semantic_objectInput"),
            oSemActionInput = oConfigurationView.byId("semantic_actionInput"),
            oTargetAppTitleInput = oConfigurationView.byId("target_application_descriptionInput"),
            oTargetAppURLInput = oConfigurationView.byId("target_application_urlInput"),
            oTargetAppCompInput = oConfigurationView.byId("target_application_componentInput"),
            oNavProviderRoleInput = oConfigurationView.byId("navigation_provider_roleInput"),
            oNavProviderInstanceInput = oConfigurationView.byId("navigation_provider_instanceInput"),
            oTargetAppAliasInput = oConfigurationView.byId("target_application_aliasInput"),
            oTargetAppIdInput = oConfigurationView.byId("target_application_idInput"),
            sNewValue = String(oControlEvent.getParameter("newValue") || "").trim(),
            oValueState = ValueState.None,
            oValueStateText = null;

        switch (oControlEvent.getSource()) {
            case oSemObjectInput:
                if (/[-#&? ]/.test(sNewValue)) {
                    oValueState = ValueState.Error;
                    oValueStateText = oTranslationBundle.getText("configuration.semantic_object.error_invalid_chars");
                }
                if (oSemActionInput.getValue() === "") {
                    oSemActionInput.setValueState(ValueState.Error);
                }
                break;
            case oSemActionInput:
                if (/[-#&? ]/.test(sNewValue)) {
                    oValueState = ValueState.Error;
                    oValueStateText = oTranslationBundle.getText("configuration.semantic_action.error_invalid_chars");
                } else if (sNewValue === "") {
                    oValueState = ValueState.Error;
                }
                break;
            case oTargetAppTitleInput:
                if (sNewValue === "") {
                    oValueState = ValueState.Error;
                }
                break;
            case oTargetAppURLInput:
                if (sNewValue !== "" && !(/^[-~+,;:?%&#=/.\w]+$/.test(sNewValue))) {
                    oValueState = ValueState.Error;
                    oValueStateText = oTranslationBundle.getText("configuration.target_application.url.error_invalid_chars");
                }
                break;
            case oTargetAppCompInput:
                if (sNewValue === "") {
                    oValueState = ValueState.Error;
                } else if (sNewValue.substring(0, 17) === "SAPUI5.Component=") {
                    oValueState = ValueState.Error;
                    oValueStateText = oTranslationBundle.getText("configuration.target_application.component.error_invalid_input");
                }
                break;
            case oNavProviderRoleInput:
                if (sNewValue === "") {
                    oValueState = ValueState.Error;
                } else if (!(/^[\w/]+$/.test(sNewValue))) {
                    oValueState = ValueState.Error;
                    oValueStateText = oTranslationBundle.getText("configuration.target_application.role.error_invalid_chars");
                }
                break;
            case oNavProviderInstanceInput:
                if (sNewValue === "") {
                    oValueState = ValueState.Error;
                } else if (!(/^[\w/]+$/.test(sNewValue))) {
                    oValueState = ValueState.Error;
                    oValueStateText = oTranslationBundle.getText("configuration.target_application.instance.error_invalid_chars");
                }
                break;
            case oTargetAppAliasInput:
                if (sNewValue === "" && oTargetAppIdInput.getValue() === "") {
                    oValueState = ValueState.Error;
                    oValueStateText = oTranslationBundle.getText("configuration.target_application.alias_id.warning");
                } else if (sNewValue !== "" && oTargetAppIdInput.getValue() !== "") {
                    oValueState = ValueState.Error;
                    oValueStateText = oTranslationBundle.getText("configuration.target_application.alias_id.warning");
                    oTargetAppIdInput.setValueState(oValueState);
                    oTargetAppIdInput.setValueStateText(oValueStateText);
                } else {
                    oTargetAppIdInput.setValueState(ValueState.None);
                }
                break;
            case oTargetAppIdInput:
                if (sNewValue === "" && oTargetAppAliasInput.getValue() === "") {
                    oValueState = ValueState.Error;
                    oValueStateText = oTranslationBundle.getText("configuration.target_application.alias_id.warning");
                } else if (sNewValue !== "" && oTargetAppAliasInput.getValue() !== "") {
                    oValueState = ValueState.Error;
                    oValueStateText = oTranslationBundle.getText("configuration.target_application.alias_id.warning");
                    oTargetAppAliasInput.setValueState(oValueState);
                    oTargetAppAliasInput.setValueStateText(oValueStateText);
                } else if (sNewValue !== "" && !(/^[A-Fa-f0-9]+$/.test(sNewValue))) {
                    oValueState = ValueState.Error;
                    oValueStateText = oTranslationBundle.getText("configuration.target_application.alias_id.error_invalid_chars");
                } else {
                    oTargetAppAliasInput.setValueState(ValueState.None);
                }
                break;
            default:
                break;
        }

        if (oValueState) {
            oControlEvent.getSource().setValueState(oValueState);
            if (oValueStateText !== null) {
                oControlEvent.getSource().setValueStateText(oValueStateText || "");
            }
        }
    };

    /**
     * Checks the input of given configuration View.
     *
     * @param {object} oConfigurationView The configuration view to check the input for.
     */
    oUtils.checkTMInputOnSaveConfig = function (oConfigurationView) {
        var oTranslationBundle = oUtils.getResourceBundleModel().getResourceBundle();
        var oSemObjectInput = oConfigurationView.byId("semantic_objectInput");
        var oSemActionInput = oConfigurationView.byId("semantic_actionInput");
        var oTargetAppTitleInput = oConfigurationView.byId("target_application_descriptionInput");
        var oTargetAppURLInput = oConfigurationView.byId("target_application_urlInput");
        var oTargetAppCompInput = oConfigurationView.byId("target_application_componentInput");
        var oNavProviderRoleInput = oConfigurationView.byId("navigation_provider_roleInput");
        var oNavProviderInstanceInput = oConfigurationView.byId("navigation_provider_instanceInput");
        var oTargetAppAliasInput = oConfigurationView.byId("target_application_aliasInput");
        var oTargetAppIdInput = oConfigurationView.byId("target_application_idInput");
        var oNavigationProvider = oConfigurationView.byId("targetTypeInput");
        var oTransaction = oConfigurationView.byId("target_transactionInput");
        var oWDApplication = oConfigurationView.byId("target_web_dynpro_applicationInput");
        var oWCFApplication = oConfigurationView.byId("target_wcf_application_idInput");
        var oFormFactorDesktopInput = oConfigurationView.byId("desktopCB");
        var oFormFactorTabletInput = oConfigurationView.byId("tabletCB");
        var oFormFactorPhoneInput = oConfigurationView.byId("phoneCB");
        var bReject = false;

        // Semantic object input check
        oSemObjectInput.setValue(oSemObjectInput.getValue().trim());
        if (/[-#&? ]/.test(oSemObjectInput.getValue())) {
            oSemObjectInput.setValueState(ValueState.Error);
            oSemObjectInput.setValueStateText(oTranslationBundle.getText("configuration.semantic_object.error_invalid_chars"));
            bReject = true;
        }
        // Semantic Action input check
        oSemActionInput.setValue(oSemActionInput.getValue().trim());
        if (/[-#&? ]/.test(oSemActionInput.getValue())) {
            oSemActionInput.setValueState(ValueState.Error);
            oSemActionInput.setValueStateText(oTranslationBundle.getText("configuration.semantic_action.error_invalid_chars"));
            bReject = true;
        } else if (oSemActionInput.getValue() === "") {
            oSemActionInput.setValueState(ValueState.Error);
            bReject = true;
        }

        var sNavProvider = oConfigurationView.getModel().getProperty("/config/navigation_provider"),
            oValStateText;
        // SAPUI5 Fiori App radio is selected
        if (sNavProvider === "SAPUI5") {
            // Application title
            if (oTargetAppTitleInput.getValue() === "") {
                oTargetAppTitleInput.setValueState(ValueState.Error);
                bReject = true;
            }
            // Application URL
            if (oTargetAppURLInput.getValue() !== "" && !(/^[-~+,;:?%&#=/.\w]+$/.test(oTargetAppURLInput.getValue()))) {
                oTargetAppURLInput.setValueState(ValueState.Error);
                oTargetAppURLInput.setValueStateText(oTranslationBundle.getText("configuration.target_application.url.error_invalid_chars"));
                bReject = true;
            }
            // Application component
            if (oTargetAppCompInput.getValue() === "") {
                oTargetAppCompInput.setValueState(ValueState.Error);
                bReject = true;
            } else if (oTargetAppCompInput.getValue().substring(0, 17) === "SAPUI5.Component=") {
                oTargetAppCompInput.setValueState(ValueState.Error);
                oTargetAppCompInput.setValueStateText(oTranslationBundle.getText("configuration.target_application.component.error_invalid_input"));
                bReject = true;
            }
        } else if (sNavProvider === "LPD") {
            // Launchpad Role
            if (oNavProviderRoleInput.getValue() === "") {
                oNavProviderRoleInput.setValueState(ValueState.Error);
                bReject = true;
            }
            if (!(/^[\w]+$/.test(oNavProviderRoleInput.getValue()))) {
                oNavProviderRoleInput.setValueState(ValueState.Error);
                oValStateText = oTranslationBundle.getText("configuration.target_application.role.error_invalid_chars");
                oNavProviderRoleInput.setValueStateText(oValStateText);
                bReject = true;
            }
            // Launchpad instance
            if (oNavProviderInstanceInput.getValue() === "") {
                oNavProviderInstanceInput.setValueState(ValueState.Error);
                bReject = true;
            }
            if (!(/^[\w]+$/.test(oNavProviderInstanceInput.getValue()))) {
                oNavProviderInstanceInput.setValueState(ValueState.Error);
                oValStateText = oTranslationBundle.getText("configuration.target_application.instance.error_invalid_chars");
                oNavProviderInstanceInput.setValueStateText(oValStateText);
                bReject = true;
            }
            // Application Alias and Application id
            if (oTargetAppAliasInput.getValue() === "" && oTargetAppIdInput.getValue() === "") {
                oValStateText = oTranslationBundle.getText("configuration.target_application.alias_id.warning");
                oTargetAppAliasInput.setValueState(ValueState.Error);
                oTargetAppAliasInput.setValueStateText(oValStateText);
                oTargetAppIdInput.setValueState(ValueState.Error);
                oTargetAppIdInput.setValueStateText(oValStateText);
                bReject = true;
            }
            if (oTargetAppAliasInput.getValue() !== "" && oTargetAppIdInput.getValue() !== "") {
                oValStateText = oTranslationBundle.getText("configuration.target_application.alias_id.warning");
                oTargetAppAliasInput.setValueState(ValueState.Error);
                oTargetAppAliasInput.setValueStateText(oValStateText);
                oTargetAppIdInput.setValueState(ValueState.Error);
                oTargetAppIdInput.setValueStateText(oValStateText);
                bReject = true;
            }
            // Application id
            if (oTargetAppIdInput.getValue() !== "" && !(/^[A-Fa-f0-9]+$/.test(oTargetAppIdInput.getValue()))) {
                oTargetAppIdInput.setValueState(ValueState.Error);
                oTargetAppIdInput.setValueStateText(oTranslationBundle.getText("configuration.target_application.alias_id.error_invalid_chars"));
                bReject = true;
            }
        } else if (sNavProvider === "TR") {
            if (oTransaction.getValue() === "") {
                oTransaction.setValueState(ValueState.Error);
                bReject = true;
            }
        } else if (sNavProvider === "WDA") {
            if (oWDApplication.getValue() === "") {
                oWDApplication.setValueState(ValueState.Error);
                bReject = true;
            }
        } else if (sNavProvider === "WCF") {
            if (oWCFApplication.getValue() === "") {
                oWCFApplication.setValueState(ValueState.Error);
                bReject = true;
            }
        } else if (sNavProvider === "URL") {
            if (oTargetAppURLInput.getValue() === "") {
                oTargetAppURLInput.setValueState(ValueState.Error);
                bReject = true;
            } else if (!(/^[-~+,;:?%&#=/.\w]+$/.test(oTargetAppURLInput.getValue()))) {
                oTargetAppURLInput.setValueState(ValueState.Error);
                oTargetAppURLInput.setValueStateText(oTranslationBundle.getText("configuration.target_application.url.error_invalid_chars"));
                bReject = true;
            }
        } else {
            oNavigationProvider.setValueState(ValueState.Error);
            oNavigationProvider.setValueStateText(oTranslationBundle.getText("configuration.navigation_provider.error_invalid_provider"));
            bReject = true;
        }

        if (!oFormFactorDesktopInput.getSelected() && !oFormFactorTabletInput.getSelected() && !oFormFactorPhoneInput.getSelected()) {
            oValStateText = oTranslationBundle.getText("configuration.form_factor.warning");
            oFormFactorDesktopInput.setValueState(ValueState.Error);
            oFormFactorDesktopInput.setValueStateText(oValStateText);
            oFormFactorTabletInput.setValueState(ValueState.Error);
            oFormFactorTabletInput.setValueStateText(oValStateText);
            oFormFactorPhoneInput.setValueState(ValueState.Error);
            oFormFactorPhoneInput.setValueStateText(oValStateText);
            bReject = true;
        }
        return bReject;
    };

    oUtils.updateTooltipForDisabledProperties = function (oConfigurationView) {
        // change tooltip for all translatable properties in case userlocale !== original Locale
        var oModel = oConfigurationView.getModel();
        var isLocaleSuitable = oModel.getProperty("/config/isLocaleSuitable");
        if (!isLocaleSuitable) {
            var rb = oUtils.getResourceBundleModel().getResourceBundle();
            var message = rb.getText("edit_configuration.original_locale_not_fit_tooltip", [
                oModel.getProperty("/config/userLocale"), oModel.getProperty("/config/orgLocale")
            ]);
            oConfigurationView.byId("titleInput").setTooltip(message);
            oConfigurationView.byId("subtitleInput").setTooltip(message);
            oConfigurationView.byId("keywordsInput").setTooltip(message);
            oConfigurationView.byId("infoInput").setTooltip(message);
        }
    };

    oUtils.updateMessageStripForOriginalLanguage = function (oConfigurationView) {
        var oModel = oConfigurationView.getModel();
        if (oModel.getProperty("/config/isLocaleSuitable") === false) {
            var sMessageText = oUtils.getResourceBundleModel().getResourceBundle().getText("edit_configuration.original_locale_not_fit_message", [
                oModel.getProperty("/config/orgLocale").toUpperCase(), oModel.getProperty("/config/userLocale").toUpperCase()
            ]);
            var oMessageStrip = oConfigurationView.byId("messageStrip");
            oMessageStrip.setVisible(true);
            oMessageStrip.setText(sMessageText);
            oMessageStrip.setType(MessageType.Warning);
        }
    };

    /**
     * Creates a model for the object selection list control. Loads all semantic objects and puts them into the cache as well as into the list of
     * suggested items.
     *
     * @param {object} oConfigController the configuration controller
     * @param {object} oSemanticObjectSelector the view of the selection control
     * @param {array} aDefaultValuesOverride if given, the default values that are in any case selectable ("*" and "") are overwritten. Must be in
     *        form <code>[{targetObject: "{semantic object id}", targetName: "{textual representation}"}]</code>
     * @private
     */
    oUtils.createSemanticObjectModel = function (oConfigController, oSemanticObjectSelector, aDefaultValuesOverride) {
        var oView = oConfigController.getView(),
            // the URI of the semantic objects OData Servicw
            sUri = "/sap/opu/odata/UI2/INTEROP/SemanticObjects",
            // default selections that are prepended to the results of the OData call.
            // Options: "" (no sem obj) or "*" (all sem objects)
            aDefaultValues = [
                { obj: "", name: "" },
                { obj: "*", name: "*" }
            ],
            // Note: copy the arrays!
            aDefaultObjects = (aDefaultValuesOverride || aDefaultValues).slice(0),
            // set model first only to default values
            oSelectorModel = new JSONModel();
        // required to make the suggestion list show all entries
        // the default value for the size limit is 100!
        oSelectorModel.setSizeLimit(999999);

        oSelectorModel.setProperty("/value", "");
        oSelectorModel.setProperty("/enabled", true);

        oSemanticObjectSelector.bindAggregation("suggestionItems", "suggest>/items", new Item({
            text: "{suggest>obj}"
        }));
        oSemanticObjectSelector.setModel(oSelectorModel, "suggest");
        if (oUtils.aData.length > 0) {
            //update async, otherwise block the creation of view
            setTimeout(function () {
                oSelectorModel.setData({
                    items: aDefaultObjects.concat(oUtils.aData)
                }, true); // merge
            }, 0);
            return;
        }

        // read semantic objects from interop service
        OData.read({
            requestUri: sUri,
            headers: {
                Accept: "application/json"
            }
        },
            // sucess
            function (oData/*, oResponse*/) {
                var sId, sText, i;
                for (i = 0; i < oData.results.length; i = i + 1) {
                    sId = oData.results[i].id;
                    sText = oData.results[i].text;
                    oUtils.aData.push({
                        obj: sId,
                        name: sText || sId
                    });
                }
                oSelectorModel.setData({
                    items: aDefaultObjects.concat(oUtils.aData)
                }, true); // merge
            },
            // fail
            function (oError) {
                var sMessage = oError && oError.message ? oError.message : oError;
                if (oError.response) {
                    sMessage += " - " + oError.response.statusCode + " " + oError.response.statusText;
                }
                Log.error("Could not fetch data: " + sUri + ": " + sMessage, null,
                    // the source component of the error - needs to be set within the parent controller control
                    (oView.getViewName() || "sap.ushell.components.tiles.utils"));
            });
    };

    oUtils.createRoleModel = function (oConfigController, oRoleSelector, oInstanceSelector) {
        var oView = oConfigController.getView(),
            // the URI of the semantic objects OData Servicw
            sUri = "/sap/opu/odata/UI2/INTEROP/GetLPDInstances",
            // set model first only to default values
            oSelectorModel = new JSONModel(), oInstanceSelectorModel = new JSONModel();
        // required to make the suggestion list show all entries
        // the default value for the size limit is 100!
        oSelectorModel.setSizeLimit(999999);
        oInstanceSelectorModel.setSizeLimit(999999);

        oSelectorModel.setProperty("/value", "");
        oSelectorModel.setProperty("/enabled", true);
        oInstanceSelectorModel.setProperty("/value", "");
        oInstanceSelectorModel.setProperty("/enabled", true);

        var itemTemplate = new ColumnListItem({
            cells: [
                new Label({ text: "{role}" }),
                new Label({ text: "{instance}" })
            ]
        });

        oRoleSelector.bindAggregation("suggestionRows", "/items", itemTemplate);
        oInstanceSelector.bindAggregation("suggestionItems", "/items", new Item({
            text: "{instance}"
        }));
        oInstanceSelector.setModel(oInstanceSelectorModel);

        oRoleSelector.setModel(oSelectorModel);
        oRoleSelector.attachSuggestionItemSelected(function (evt) {
            oInstanceSelector.setValue(evt.getParameter("selectedRow").getCells()[1].getText());
            oInstanceSelector.fireChange();
        });

        if (oUtils.aRoleData.length > 0) {
            oSelectorModel.setData({
                items: oUtils.aRoleData
            }, false);
            oInstanceSelectorModel.setData({
                items: oUtils.aRoleData
            }, false);
            return;
        }

        // read semantic objects from interop service
        OData.read({
            requestUri: sUri,
            headers: {
                Accept: "application/json"
            }
        },
            // sucess
            function (oData/*, oResponse*/) {
                var sRole, sInstance, i;
                for (i = 0; i < oData.results.length; i = i + 1) {
                    sRole = oData.results[i].lpdRole;
                    sInstance = oData.results[i].instance;
                    oUtils.aRoleData.push({
                        role: sRole,
                        instance: sInstance
                    });
                }
                oSelectorModel.setData({
                    items: oUtils.aRoleData
                }, true); // merge
                oInstanceSelectorModel.setData({
                    items: oUtils.aRoleData
                }, true); // merge
            },
            // fail
            function (oError) {
                var sMessage = oError && oError.message ? oError.message : oError;
                if (oError.response) {
                    sMessage += " - " + oError.response.statusCode + " " + oError.response.statusText;
                }
                Log.error("Could not fetch data: " + sUri + ": " + sMessage, null,
                    // the source component of the error - needs to be set within the parent controller control
                    (oView.getViewName() || "sap.ushell.components.tiles.utils"));
            });
    };

    oUtils.createAliasModel = function (oConfigController, oAliasSelector) {
        var oView = oConfigController.getView(), oConfiguration,
            // the URI of the semantic objects OData Servicw
            sUri = "/sap/opu/odata/UI2/INTEROP/GetLPDAppAlias",
            // set model first only to default values
            oSelectorModel = new JSONModel();

        // required to make the suggestion list show all entries
        // the default value for the size limit is 100!
        oSelectorModel.setSizeLimit(999999);

        oSelectorModel.setProperty("/value", "");
        oSelectorModel.setProperty("/enabled", true);

        oAliasSelector.bindAggregation("suggestionItems", "/items", new Item({
            text: "{alias}"
        }));
        oAliasSelector.setModel(oSelectorModel);

        oConfiguration = oUtils.getAppLauncherConfig(oView.oViewData.chip, true, true);
        if (oConfiguration && oConfiguration.navigation_provider_role && oConfiguration.navigation_provider_instance) {
            if (oConfiguration.navigation_provider_role !== "" && oConfiguration.navigation_provider_instance !== "") {
                sUri = sUri + "?role='" + oConfiguration.navigation_provider_role + "'&instance='" + oConfiguration.navigation_provider_instance + "'";
            }
        }

        // read semantic objects from interop service
        OData.read({
            requestUri: sUri,
            headers: {
                Accept: "application/json"
            }
        },
            // sucess
            function (oData/*, oResponse*/) {
                var sAlias, sRole, sInstance, i, oModelData;
                oUtils.aAliasData = [];
                for (i = 0; i < oData.results.length; i = i + 1) {
                    sAlias = oData.results[i].lpdApplicationAlias;
                    sRole = oData.results[i].lpdRole;
                    sInstance = oData.results[i].lpdInstance;
                    oUtils.aAliasData.push({
                        role: sRole,
                        instance: sInstance,
                        alias: sAlias
                    });
                }
                oModelData = oSelectorModel.getData();
                if (oModelData) {
                    oModelData.items = oUtils.aAliasData;
                } else {
                    oModelData = {
                        items: oUtils.aAliasData
                    };
                }
                oSelectorModel.setData(oModelData, false);
            },
            // fail
            function (oError) {
                var sMessage = oError && oError.message ? oError.message : oError;
                if (oError.response) {
                    sMessage += " - " + oError.response.statusCode + " " + oError.response.statusText;
                }
                Log.error("Could not fetch data: " + sUri + ": " + sMessage, null,
                    // the source component of the error - needs to be set within the parent controller control
                    (oView.getViewName() || "sap.ushell.components.tiles.utils"));
            });
    };

    oUtils.updateAliasModel = function (oView, oAliasSelector) {
        var sUri, sInstance, sRole, oSelectorModel = oAliasSelector.getModel();

        sInstance = oView.byId("navigation_provider_instanceInput").getValue();
        sRole = oView.byId("navigation_provider_roleInput").getValue();

        sUri = "/sap/opu/odata/UI2/INTEROP/GetLPDAppAlias?role='" + sRole + "'&instance='" + sInstance + "'";

        // read semantic objects from interop service
        OData.read({
            requestUri: sUri,
            headers: {
                Accept: "application/json"
            }
        },
            // sucess
            function (oData/*, oResponse*/) {
                var sAlias, sRole, sInstance, i, oModelData;
                oUtils.aAliasData = [];
                for (i = 0; i < oData.results.length; i = i + 1) {
                    sAlias = oData.results[i].lpdApplicationAlias;
                    sRole = oData.results[i].lpdRole;
                    sInstance = oData.results[i].lpdInstance;
                    oUtils.aAliasData.push({
                        role: sRole,
                        instance: sInstance,
                        alias: sAlias
                    });
                }
                oModelData = oSelectorModel.getData();
                if (oModelData) {
                    oModelData.items = oUtils.aAliasData;
                } else {
                    oModelData = {
                        items: oUtils.aAliasData
                    };
                }
                oSelectorModel.setData(oModelData, false);
            },
            // fail
            function (oError) {
                var sMessage = oError && oError.message ? oError.message : oError;
                if (oError.response) {
                    sMessage += " - " + oError.response.statusCode + " " + oError.response.statusText;
                }
                Log.error("Could not fetch data: " + sUri + ": " + sMessage, null,
                    // the source component of the error - needs to be set within the parent controller control
                    (oView.getViewName() || "sap.ushell.components.tiles.utils"));
            });
    };

    oUtils.createActionModel = function (oConfigController, oActionSelector) {
        var oItemModel = new JSONModel();
        var oView = oConfigController.getView(), oConfiguration, sAction;

        oItemModel.setData({
            items: [
                { text: "display" },
                { text: "approve" },
                { text: "displayFactSheet" },
                { text: "manage" },
                { text: "create" },
                { text: "monitor" },
                { text: "track" },
                { text: "change" },
                { text: "register" },
                { text: "release" },
                { text: "analyzeKPIDetails" },
                { text: "lookup" },
                { text: "manageLineItems" }
            ]
        });

        oUtils.aActionData = oItemModel.getData();

        oConfiguration = oUtils.getAppLauncherConfig(oView.oViewData.chip, true, true);
        sAction = oConfiguration.navigation_semantic_action || oConfiguration.semantic_action;
        if (sAction) {
            if (!oItemModel.getData().items.some(function (oItem) {
                return oItem.text === sAction;
            })) {
                oItemModel.getData().items.push({
                    text: sAction
                });
            }
        }

        oActionSelector.bindAggregation("suggestionItems", "items>/items", new Item({
            text: "{items>text}"
        }));

        oActionSelector.setModel(oItemModel, "items");
        oActionSelector.getBinding("suggestionItems").sort(new Sorter("text", false));
    };

    oUtils.createNavigationProviderModel = function (oConfigController, oTargetTypeSelector) {
        var oItemModel = new JSONModel();
        var oResourcesBundle = oUtils.getResourceBundleModel().getResourceBundle();

        var aItems = [
            {
                key: "SAPUI5",
                text: oResourcesBundle.getText("configuration.target_application.sapui5")
            }, {
                key: "LPD",
                text: oResourcesBundle.getText("configuration.target_application.lpd_cust")
            }, {
                key: "TR",
                text: oResourcesBundle.getText("configuration.target_application.transaction")
            }, {
                key: "WDA",
                text: oResourcesBundle.getText("configuration.target_application.web_dynpro")
            }, {
                key: "URL",
                text: oResourcesBundle.getText("configuration.target_application.url")
            }
        ];

        // For some application type we must show in the dropdown only if it's currently selected
        var oNavigationProvider = oUtils.getViewConfiguration(oConfigController.getView()).navigation_provider;

        if (oNavigationProvider === "WCF") {
            aItems.push({
                key: "WCF",
                text: oResourcesBundle.getText("configuration.target_application.wcf")
            });
        } else if (oNavigationProvider === "URLT") {
            aItems.push({
                key: "URLT",
                text: oResourcesBundle.getText("configuration.target_application.urlt")
            });
        }

        oItemModel.setData({
            items: aItems
        });

        oTargetTypeSelector.bindItems("items>/items", new Item({
            key: "{items>key}",
            text: "{items>text}"
        }));
        oTargetTypeSelector.setModel(oItemModel, "items");
        oTargetTypeSelector.getBinding("items").sort(new Sorter("text", false));
    };

    /**
     * Displays the input fields relavent based on application type SAPUI5/LPD_CUST.
     *
     * @param {object} oConfigurationView The configuration view to check the input for.
     */
    oUtils.displayApplicationTypeFields = function (sApplicationType, oConfigurationView) {
        switch (sApplicationType) {
            case "LPD":
                oUtils.displayLpdCustApplicationTypeFields(oConfigurationView);
                break;
            case "SAPUI5":
                oUtils.displaySapui5ApplicationTypeFields(oConfigurationView);
                break;
            case "TR":
                oUtils.displayTransactionApplicationTypeFields(oConfigurationView);
                break;
            case "WDA":
                oUtils.displayWebDynproApplicationTypeFields(oConfigurationView);
                break;
            case "URL":
                oUtils.displayURLApplicationTypeFields(oConfigurationView);
                break;
            case "WCF":
                oUtils.displayWCFApplicationTypeFields(oConfigurationView);
                break;
            case "URLT":
                oUtils.displayURLTApplicationTypeFields(oConfigurationView);
                break;
        }
    };

    /**
     * Displays the input fields relavent for application type WCF.
     *
     * @param {object} oConfigurationView The configuration view to check the input for.
     */
    oUtils.displayWCFApplicationTypeFields = function (oConfigurationView) {
        oConfigurationView.byId("navigation_provider_role").setVisible(false);
        oConfigurationView.byId("navigation_provider_roleInput").setVisible(false);

        oConfigurationView.byId("navigation_provider_instance").setVisible(false);
        oConfigurationView.byId("navigation_provider_instanceInput").setVisible(false);

        oConfigurationView.byId("target_application_alias").setVisible(false);
        oConfigurationView.byId("target_application_aliasInput").setVisible(false);

        oConfigurationView.byId("target_application_id").setVisible(false);
        oConfigurationView.byId("target_application_idInput").setVisible(false);

        oConfigurationView.byId("application_description").setVisible(true);
        oConfigurationView.byId("target_application_descriptionInput").setVisible(true);

        oConfigurationView.byId("application_url").setVisible(false);
        oConfigurationView.byId("target_application_urlInput").setVisible(false);

        oConfigurationView.byId("application_component").setVisible(false);
        oConfigurationView.byId("target_application_componentInput").setVisible(false);

        oConfigurationView.byId("target_transaction").setVisible(false);
        oConfigurationView.byId("target_transactionInput").setVisible(false);

        oConfigurationView.byId("target_wcf_application_id").setVisible(true);
        oConfigurationView.byId("target_wcf_application_idInput").setVisible(true);

        oConfigurationView.byId("target_web_dynpro_application").setVisible(false);
        oConfigurationView.byId("target_web_dynpro_applicationInput").setVisible(false);

        oConfigurationView.byId("target_web_dynpro_configuration").setVisible(false);
        oConfigurationView.byId("target_web_dynpro_configurationInput").setVisible(false);

        oConfigurationView.byId("target_system_alias").setVisible(true);
        oConfigurationView.byId("target_system_aliasInput").setVisible(true);

        oConfigurationView.byId("urlt_application_component").setVisible(false);
        oConfigurationView.byId("urlt_application_componentInput").setVisible(false);

        oConfigurationView.byId("target_urlt_system_alias").setVisible(false);
        oConfigurationView.byId("target_urlt_system_aliasInput").setVisible(false);

        oConfigurationView.byId("application_type_deprecated").setVisible(false);
    };

    /**
     * Displays the input fields relavent for application type SAPUI5.
     *
     * @param {object} oConfigurationView The configuration view to check the input for.
     */
    oUtils.displaySapui5ApplicationTypeFields = function (oConfigurationView) {
        oConfigurationView.byId("navigation_provider_role").setVisible(false);
        oConfigurationView.byId("navigation_provider_roleInput").setVisible(false);

        oConfigurationView.byId("navigation_provider_instance").setVisible(false);
        oConfigurationView.byId("navigation_provider_instanceInput").setVisible(false);

        oConfigurationView.byId("target_application_alias").setVisible(false);
        oConfigurationView.byId("target_application_aliasInput").setVisible(false);

        oConfigurationView.byId("target_application_id").setVisible(false);
        oConfigurationView.byId("target_application_idInput").setVisible(false);

        oConfigurationView.byId("application_description").setVisible(true);
        oConfigurationView.byId("target_application_descriptionInput").setVisible(true);

        oConfigurationView.byId("application_url").setVisible(true);
        oConfigurationView.byId("target_application_urlInput").setVisible(true);

        oConfigurationView.byId("application_component").setVisible(true);
        oConfigurationView.byId("target_application_componentInput").setVisible(true);

        oConfigurationView.byId("target_transaction").setVisible(false);
        oConfigurationView.byId("target_transactionInput").setVisible(false);

        oConfigurationView.byId("target_wcf_application_id").setVisible(false);
        oConfigurationView.byId("target_wcf_application_idInput").setVisible(false);

        oConfigurationView.byId("target_web_dynpro_application").setVisible(false);
        oConfigurationView.byId("target_web_dynpro_applicationInput").setVisible(false);

        oConfigurationView.byId("target_web_dynpro_configuration").setVisible(false);
        oConfigurationView.byId("target_web_dynpro_configurationInput").setVisible(false);

        oConfigurationView.byId("target_system_alias").setVisible(false);
        oConfigurationView.byId("target_system_aliasInput").setVisible(false);

        oConfigurationView.byId("urlt_application_component").setVisible(false);
        oConfigurationView.byId("urlt_application_componentInput").setVisible(false);

        oConfigurationView.byId("target_urlt_system_alias").setVisible(false);
        oConfigurationView.byId("target_urlt_system_aliasInput").setVisible(false);

        oConfigurationView.byId("application_type_deprecated").setVisible(false);
    };

    /**
     * Displays the input fields relavent for application type LPD_CUST.
     *
     * @param {object} oConfigurationView The configuration view to check the input for.
     */
    oUtils.displayLpdCustApplicationTypeFields = function (oConfigurationView) {
        oConfigurationView.byId("application_description").setVisible(false);
        oConfigurationView.byId("target_application_descriptionInput").setVisible(false);

        oConfigurationView.byId("application_url").setVisible(false);
        oConfigurationView.byId("target_application_urlInput").setVisible(false);

        oConfigurationView.byId("application_component").setVisible(false);
        oConfigurationView.byId("target_application_componentInput").setVisible(false);

        oConfigurationView.byId("navigation_provider_role").setVisible(true);
        oConfigurationView.byId("navigation_provider_roleInput").setVisible(true);

        oConfigurationView.byId("navigation_provider_instance").setVisible(true);
        oConfigurationView.byId("navigation_provider_instanceInput").setVisible(true);

        oConfigurationView.byId("target_application_alias").setVisible(true);
        oConfigurationView.byId("target_application_aliasInput").setVisible(true);

        oConfigurationView.byId("target_application_id").setVisible(true);
        oConfigurationView.byId("target_application_idInput").setVisible(true);

        oConfigurationView.byId("target_transaction").setVisible(false);
        oConfigurationView.byId("target_transactionInput").setVisible(false);

        oConfigurationView.byId("target_wcf_application_id").setVisible(false);
        oConfigurationView.byId("target_wcf_application_idInput").setVisible(false);

        oConfigurationView.byId("target_web_dynpro_application").setVisible(false);
        oConfigurationView.byId("target_web_dynpro_applicationInput").setVisible(false);

        oConfigurationView.byId("target_web_dynpro_configuration").setVisible(false);
        oConfigurationView.byId("target_web_dynpro_configurationInput").setVisible(false);

        oConfigurationView.byId("target_system_alias").setVisible(false);
        oConfigurationView.byId("target_system_aliasInput").setVisible(false);

        oConfigurationView.byId("urlt_application_component").setVisible(false);
        oConfigurationView.byId("urlt_application_componentInput").setVisible(false);

        oConfigurationView.byId("target_urlt_system_alias").setVisible(false);
        oConfigurationView.byId("target_urlt_system_aliasInput").setVisible(false);

        oConfigurationView.byId("application_type_deprecated").setVisible(true);
    };

    oUtils.displayTransactionApplicationTypeFields = function (oConfigurationView) {
        oConfigurationView.byId("application_description").setVisible(true);
        oConfigurationView.byId("target_application_descriptionInput").setVisible(true);

        oConfigurationView.byId("application_url").setVisible(false);
        oConfigurationView.byId("target_application_urlInput").setVisible(false);

        oConfigurationView.byId("application_component").setVisible(false);
        oConfigurationView.byId("target_application_componentInput").setVisible(false);

        oConfigurationView.byId("navigation_provider_role").setVisible(false);
        oConfigurationView.byId("navigation_provider_roleInput").setVisible(false);

        oConfigurationView.byId("navigation_provider_instance").setVisible(false);
        oConfigurationView.byId("navigation_provider_instanceInput").setVisible(false);

        oConfigurationView.byId("target_application_alias").setVisible(false);
        oConfigurationView.byId("target_application_aliasInput").setVisible(false);

        oConfigurationView.byId("target_application_id").setVisible(false);
        oConfigurationView.byId("target_application_idInput").setVisible(false);

        oConfigurationView.byId("target_transaction").setVisible(true);
        oConfigurationView.byId("target_transactionInput").setVisible(true);

        oConfigurationView.byId("target_wcf_application_id").setVisible(false);
        oConfigurationView.byId("target_wcf_application_idInput").setVisible(false);

        oConfigurationView.byId("target_web_dynpro_application").setVisible(false);
        oConfigurationView.byId("target_web_dynpro_applicationInput").setVisible(false);

        oConfigurationView.byId("target_web_dynpro_configuration").setVisible(false);
        oConfigurationView.byId("target_web_dynpro_configurationInput").setVisible(false);

        oConfigurationView.byId("target_system_alias").setVisible(true);
        oConfigurationView.byId("target_system_aliasInput").setVisible(true);

        oConfigurationView.byId("urlt_application_component").setVisible(false);
        oConfigurationView.byId("urlt_application_componentInput").setVisible(false);

        oConfigurationView.byId("target_urlt_system_alias").setVisible(false);
        oConfigurationView.byId("target_urlt_system_aliasInput").setVisible(false);

        oConfigurationView.byId("application_type_deprecated").setVisible(false);
    };

    oUtils.displayWebDynproApplicationTypeFields = function (oConfigurationView) {
        oConfigurationView.byId("application_description").setVisible(true);
        oConfigurationView.byId("target_application_descriptionInput").setVisible(true);

        oConfigurationView.byId("application_url").setVisible(false);
        oConfigurationView.byId("target_application_urlInput").setVisible(false);

        oConfigurationView.byId("application_component").setVisible(false);
        oConfigurationView.byId("target_application_componentInput").setVisible(false);

        oConfigurationView.byId("navigation_provider_role").setVisible(false);
        oConfigurationView.byId("navigation_provider_roleInput").setVisible(false);

        oConfigurationView.byId("navigation_provider_instance").setVisible(false);
        oConfigurationView.byId("navigation_provider_instanceInput").setVisible(false);

        oConfigurationView.byId("target_application_alias").setVisible(false);
        oConfigurationView.byId("target_application_aliasInput").setVisible(false);

        oConfigurationView.byId("target_application_id").setVisible(false);
        oConfigurationView.byId("target_application_idInput").setVisible(false);

        oConfigurationView.byId("target_transaction").setVisible(false);
        oConfigurationView.byId("target_transactionInput").setVisible(false);

        oConfigurationView.byId("target_wcf_application_id").setVisible(false);
        oConfigurationView.byId("target_wcf_application_idInput").setVisible(false);

        oConfigurationView.byId("target_web_dynpro_application").setVisible(true);
        oConfigurationView.byId("target_web_dynpro_applicationInput").setVisible(true);

        oConfigurationView.byId("target_web_dynpro_configuration").setVisible(true);
        oConfigurationView.byId("target_web_dynpro_configurationInput").setVisible(true);

        oConfigurationView.byId("target_system_alias").setVisible(true);
        oConfigurationView.byId("target_system_aliasInput").setVisible(true);

        oConfigurationView.byId("urlt_application_component").setVisible(false);
        oConfigurationView.byId("urlt_application_componentInput").setVisible(false);

        oConfigurationView.byId("target_urlt_system_alias").setVisible(false);
        oConfigurationView.byId("target_urlt_system_aliasInput").setVisible(false);

        oConfigurationView.byId("application_type_deprecated").setVisible(false);
    };

    /**
     * Displays the input fields relavent for application type URL.
     *
     * @param {object} oConfigurationView The configuration view to check the input for.
     */
    oUtils.displayURLApplicationTypeFields = function (oConfigurationView) {
        oConfigurationView.byId("navigation_provider_role").setVisible(false);
        oConfigurationView.byId("navigation_provider_roleInput").setVisible(false);

        oConfigurationView.byId("navigation_provider_instance").setVisible(false);
        oConfigurationView.byId("navigation_provider_instanceInput").setVisible(false);

        oConfigurationView.byId("target_application_alias").setVisible(false);
        oConfigurationView.byId("target_application_aliasInput").setVisible(false);

        oConfigurationView.byId("target_application_id").setVisible(false);
        oConfigurationView.byId("target_application_idInput").setVisible(false);

        oConfigurationView.byId("application_description").setVisible(true);
        oConfigurationView.byId("target_application_descriptionInput").setVisible(true);

        oConfigurationView.byId("application_url").setVisible(true);
        oConfigurationView.byId("target_application_urlInput").setVisible(true);

        oConfigurationView.byId("application_component").setVisible(false);
        oConfigurationView.byId("target_application_componentInput").setVisible(false);

        oConfigurationView.byId("target_transaction").setVisible(false);
        oConfigurationView.byId("target_transactionInput").setVisible(false);

        oConfigurationView.byId("target_wcf_application_id").setVisible(false);
        oConfigurationView.byId("target_wcf_application_idInput").setVisible(false);

        oConfigurationView.byId("target_web_dynpro_application").setVisible(false);
        oConfigurationView.byId("target_web_dynpro_applicationInput").setVisible(false);

        oConfigurationView.byId("target_web_dynpro_configuration").setVisible(false);
        oConfigurationView.byId("target_web_dynpro_configurationInput").setVisible(false);

        oConfigurationView.byId("target_system_alias").setVisible(true);
        oConfigurationView.byId("target_system_aliasInput").setVisible(true);

        oConfigurationView.byId("urlt_application_component").setVisible(false);
        oConfigurationView.byId("urlt_application_componentInput").setVisible(false);

        oConfigurationView.byId("target_urlt_system_alias").setVisible(false);
        oConfigurationView.byId("target_urlt_system_aliasInput").setVisible(false);

        oConfigurationView.byId("application_type_deprecated").setVisible(false);
    };

    /**
     * Displays the input fields relavent for application type URLT.
     *
     * @param {object} oConfigurationView The configuration view to check the input for.
     */
    oUtils.displayURLTApplicationTypeFields = function (oConfigurationView) {
        oConfigurationView.byId("navigation_provider_role").setVisible(false);
        oConfigurationView.byId("navigation_provider_roleInput").setVisible(false);

        oConfigurationView.byId("navigation_provider_instance").setVisible(false);
        oConfigurationView.byId("navigation_provider_instanceInput").setVisible(false);

        oConfigurationView.byId("target_application_alias").setVisible(false);
        oConfigurationView.byId("target_application_aliasInput").setVisible(false);

        oConfigurationView.byId("target_application_id").setVisible(false);
        oConfigurationView.byId("target_application_idInput").setVisible(false);

        oConfigurationView.byId("application_description").setVisible(true);
        oConfigurationView.byId("target_application_descriptionInput").setVisible(true);

        oConfigurationView.byId("application_url").setVisible(false);
        oConfigurationView.byId("target_application_urlInput").setVisible(false);

        oConfigurationView.byId("application_component").setVisible(false);
        oConfigurationView.byId("target_application_componentInput").setVisible(false);

        oConfigurationView.byId("target_transaction").setVisible(false);
        oConfigurationView.byId("target_transactionInput").setVisible(false);

        oConfigurationView.byId("target_wcf_application_id").setVisible(false);
        oConfigurationView.byId("target_wcf_application_idInput").setVisible(false);

        oConfigurationView.byId("target_web_dynpro_application").setVisible(false);
        oConfigurationView.byId("target_web_dynpro_applicationInput").setVisible(false);

        oConfigurationView.byId("target_web_dynpro_configuration").setVisible(false);
        oConfigurationView.byId("target_web_dynpro_configurationInput").setVisible(false);

        oConfigurationView.byId("target_system_alias").setVisible(false);
        oConfigurationView.byId("target_system_aliasInput").setVisible(false);

        oConfigurationView.byId("urlt_application_component").setVisible(true);
        oConfigurationView.byId("urlt_application_componentInput").setVisible(true);

        oConfigurationView.byId("target_urlt_system_alias").setVisible(true);
        oConfigurationView.byId("target_urlt_system_aliasInput").setVisible(true);

        oConfigurationView.byId("application_type_deprecated").setVisible(false);


    };


    /**
     * Read and initialize configuration object from given JSON string. Used by static and dynamic applaunchers.
     *
     * @param {string} oTileApi Tile API object containing configuration details.
     * @param {boolean} bAdmin A flag that indicates, whether the configuration shall be shown in the Admin UI
     * @param {boolean} bEdit A flag that indicates, whether the configuration shall be shown in the Admin UI in edit mode
     *                  (i.e., not on a tile)
     * @returns {object} Returns parsed and initialized configuration object
     */
    // eslint-disable-next-line complexity
    oUtils.getAppLauncherConfig = function (oTileApi, bAdmin, bEdit) {
        var oResourceBundle;
        var sConfig = oTileApi.configuration.getParameterValueAsString("tileConfiguration");
        var oConfig;
        try {
            oConfig = JSON.parse(sConfig || "{}");
        } catch (e) {
            Log.error(
                "Error while trying to parse tile configuration",
                e,
                "sap.ushell.components.tiles.utils"
            );
            return {};
        }

        oConfig.editable = true;
        if (oTileApi.configurationUi && oTileApi.configurationUi.isReadOnly) {
            if (oTileApi.configurationUi.isReadOnly()) {
                oConfig.editable = false;
            }
        }

        // first try to get properties from bag

        var sTitle = oUtils.getTranslatedTitle(oTileApi);
        var sSubtitle = oUtils.getTranslatedSubtitle(oTileApi, oConfig);
        var sInfo = oUtils.getTranslatedProperty(oTileApi, oConfig, "display_info_text");
        var sKeywords = oUtils.getTranslatedProperty(oTileApi, oConfig, "display_search_keywords");

        if (bAdmin) {
            // resource bundle is only used in admin mode
            oResourceBundle = oUtils.getResourceBundleModel().getResourceBundle();

            if (bEdit && oTileApi.bag) {
                var orgLocale = oTileApi.bag.getOriginalLanguage();
                var localeLogonLanguage = Core.getConfiguration().getLocale().getSAPLogonLanguage();
                var language = Core.getConfiguration().getLanguage();
                oConfig.isLocaleSuitable =
                    orgLocale === "" || orgLocale.toLowerCase() === localeLogonLanguage.toLowerCase() || orgLocale.toLowerCase() === language.toLowerCase();
                oConfig.orgLocale = orgLocale;
                oConfig.userLocale = localeLogonLanguage;

            }
        }
        // in Admin UI, we display sample values for info/title/subtitle if not defined in the configuration
        oConfig.display_icon_url = oConfig.display_icon_url || "";

        if (sInfo !== undefined) {
            oConfig.display_info_text = sInfo;
        } else if (oConfig.display_info_text === undefined) {
            if (bAdmin && !bEdit) {
                oConfig.display_info_text = "[" + oResourceBundle.getText("configuration.display_info_text") + "]";
            } else {
                oConfig.display_info_text = "";
            }
        }

        oConfig.navigation_semantic_object = oConfig.navigation_semantic_object || "";
        oConfig.navigation_semantic_action = oConfig.navigation_semantic_action || "";
        oConfig.navigation_semantic_parameters = oConfig.navigation_semantic_parameters || "";
        oConfig.display_number_unit = oConfig.display_number_unit || "";
        oConfig.display_number_factor = oConfig.display_number_factor || "";
        oConfig.service_refresh_interval = oConfig.service_refresh_interval ? parseInt(oConfig.service_refresh_interval, 10) : 0;
        oConfig.service_url = oConfig.service_url || "";
        oConfig.navigation_target_url = oConfig.navigation_target_url || "";
        if (bAdmin && oUtils.isInitial(sTitle)) {
            oConfig.display_title_text = bEdit ? "" : "[" + oResourceBundle.getText("configuration.display_title_text") + "]";
            oConfig.display_subtitle_text = bEdit ? "" : "[" + oResourceBundle.getText("configuration.display_subtitle_text") + "]";
        } else {
            oConfig.display_title_text = sTitle || oConfig.display_title_text || "";
            if (sSubtitle !== undefined) {
                oConfig.display_subtitle_text = sSubtitle;
            } else if (oConfig.display_subtitle_text === undefined) {
                oConfig.display_subtitle_text = "";
            }
        }
        oConfig.navigation_use_semantic_object = (oConfig.navigation_use_semantic_object !== false);
        oConfig.display_search_keywords = sKeywords || oConfig.display_search_keywords || "";

        // display sample value '1234' in Admin UI
        if (bAdmin) {
            oConfig.display_number_value = oConfig.display_number_value || 1234;
        }

        // If form factors were not configured yet, use default values
        oConfig.form_factors = oConfig.form_factors ? oConfig.form_factors : oUtils.getDefaultFormFactors();

        oConfig.desktopChecked = oConfig.form_factors.manual.desktop;
        oConfig.tabletChecked = oConfig.form_factors.manual.tablet;
        oConfig.phoneChecked = oConfig.form_factors.manual.phone;
        oConfig.manualFormFactor = !(oConfig.form_factors.appDefault) && oConfig.editable;
        oConfig.appFormFactor = oConfig.form_factors.appDefault;

        // The following line is workaround for the case that the form factor parameters were set by default
        // We don't want to save this unless the user specifically changed the form factor (uncheck and immediately recheck is considered a change)
        oConfig.formFactorConfigDefault = !!oConfig.form_factors.defaultParam;
        if (oConfig.signature) {
            oConfig.rows = oUtils.getSignatureTableData(oConfig.signature, bEdit && oConfig.editable);
        } else {
            oConfig.rows = (oConfig.mapping_signature && oConfig.mapping_signature !== "*=*")
                ? oUtils.getMappingSignatureTableData(oConfig.mapping_signature, bEdit && oConfig.editable)
                : [oUtils.getEmptyRowObj(oConfig.editable)];
        }
        if (oConfig.signature) {
            oConfig.isUnknownAllowed = (oConfig.signature.additional_parameters === "allowed" || oConfig.signature.additionalParameters === "allowed");
        } else {
            oConfig.isUnknownAllowed = (oConfig.mapping_signature !== undefined)
                ? oUtils.getAllowUnknownParametersValue(oConfig.mapping_signature)
                : true;
        }

        // Tile Action table data

        if (bAdmin) {
            // for designer
            oConfig.tile_actions_rows = oUtils.getTileNavigationActionsRows(oTileApi, oConfig.editable);
        } else if (!oConfig.actions) {
            // for runtime - if actions are already in the configuration we keep them (HANA), otherwise try to construct them from bag (on ABAP)
            oConfig.actions = oUtils.getTileNavigationActions(oTileApi);
        }

        //Deprecation message for tile/tm
        if (bAdmin) {
            var oDeprecationBag = oTileApi.bag.getBag("deprecationProperties"),
                sDeprecationType = oDeprecationBag.getProperty("deprecation"),
                sDeprecationText = null;
            if (sDeprecationType) {
                sDeprecationText = oResourceBundle.getText(
                    sDeprecationType === "D" ? "configuration.app_deprecated" : "configuration.app_archived",
                    [oDeprecationBag.getProperty("successor")]
                );
            }
            oConfig.deprecation_text = sDeprecationText;
        }

        return oConfig;
    };

    /*
     * Mapping of API fields to internal config string fields and to UI5 view properties: OData API INTERNAL UI5 VIEW property [wave1]
     * icon -> /config/display_icon_url -> icon
     * title -> /config/display_title_text -> title
     * number -> /data/display_number_value -> number
     * numberUnit -> /config/display_number_unit -> numberUnit
     * info -> /config/display_info_text -> info
     * infoState -> /data/display_info_state -> infoState (Negative, Neutral, Positive, Critical)
     * infoStatus* -> /data/display_info_state -> infoState (None, Success, Warning, Error) (is there for compatibility)
     * targetParams -> /data/target_params -> append to targetURL [new in wave2]
     * subtitle -> /config/display_subtitle_text -> subtitle
     * stateArrow -> /data/display_state_arrow -> stateArrow (None, Up, Down)
     * numberState -> /data/display_number_state -> numberState (Negative, Neutral, Positive, Critical, None)
     * numberDigits -> /data/display_number_digits -> numberDigits (Digits after comma/period)
     * numberFactor -> /data/display_number_factor -> numberFactor scaling factor of number (e.g. "%", "M", "k")
     * keywords -> /config/display_search_keyword -> not displayed string of (comma or space delimited) keywords
     */
    /**
     * Get an object with attributes used by <code>DynamicTile</code>.
     * Use values from static configuration as base and override by fields returned in dynamic data.
     *
     * @param {string} oConfig Static configuration. Expects <code>display_icon_url</code>, <code>display_info_text</code>,
     *        <code>display_info_state</code>, <code>display_number</code>, <code>display_number_unit</code> and
     *        <code>display_title_text</code> in given object.
     * @param {string} oDynamicData Dynamic data to be mixed in. Updates all static configuration data by data contained in that object.
     *        If the object contains a <code>results</code> array. The <code>number</code> fields will be accumulated.
     * @returns {object} An object containing the fields from the tile configuration mixed with the fields from dynamic data
     */
    oUtils.getDataToDisplay = function (oConfig, oDynamicData) {
        var nSum = 0, i, n, oCurrentNumber, sCurrentTargetParams, oData = {
            display_icon_url: oDynamicData.icon || oConfig.display_icon_url || "",
            display_title_text: oDynamicData.title || oConfig.display_title_text || "",
            display_number_value: !isNaN(oDynamicData.number) ? oDynamicData.number : "...",
            display_number_unit: oDynamicData.numberUnit || oConfig.display_number_unit || "",
            display_info_text: oDynamicData.info || oConfig.display_info_text || "",
            display_info_state: oDynamicData.infoState || "Neutral",
            display_subtitle_text: oDynamicData.subtitle || oConfig.display_subtitle_text || "",
            display_state_arrow: oDynamicData.stateArrow || "None",
            display_number_state: oDynamicData.numberState || "None",
            display_number_digits: oDynamicData.numberDigits >= 0 ? oDynamicData.numberDigits : 4,
            display_number_factor: oDynamicData.numberFactor || "",
            display_search_keyword: oDynamicData.keywords || oConfig.display_search_keyword || "",
            targetParams: []
        };
        if (oDynamicData.infoStatus) {
            // wave 1 compatability with "infoStatus" field
            oData.display_info_state = oDynamicData.infoStatus;
        }
        if (oDynamicData.targetParams) {
            oData.targetParams.push(oDynamicData.targetParams);
        }
        // accumulate results field
        if (oDynamicData.results) {
            for (i = 0, n = oDynamicData.results.length; i < n; i = i + 1) {
                oCurrentNumber = oDynamicData.results[i].number || 0;
                if (typeof oCurrentNumber === "string") {
                    oCurrentNumber = parseFloat(oCurrentNumber);
                }
                nSum = nSum + oCurrentNumber;
                sCurrentTargetParams = oDynamicData.results[i].targetParams;
                if (sCurrentTargetParams) {
                    oData.targetParams.push(sCurrentTargetParams);
                }
            }
            oData.display_number_value = nSum;
        }
        if (!isNaN(oDynamicData.number)) {

            // in case number is string isNaN returns true, but we need either to trim() it as the redundant " "
            // such as in case of "579 " as a value (Bug), parsing it to float causes redundant '.' even where it should not
            if (typeof oDynamicData.number === "string") {
                oDynamicData.number = oDynamicData.number.trim();
            }
            //in case the number is "" we set value to "..." (due to internal #: 1780198502)
            if (oDynamicData.number === "") {
                oData.display_number_value = "...";
            } else {
                var bShouldProcessDigits = this._shouldProcessDigits(oDynamicData.number, oDynamicData.numberDigits),
                    maxCharactersInDisplayNumber = oData.display_icon_url ? 4 : 5;

                if (oDynamicData.number && oDynamicData.number.toString().length >= maxCharactersInDisplayNumber || bShouldProcessDigits) {
                    var oNormalizedNumberData = this._normalizeNumber(oDynamicData.number, maxCharactersInDisplayNumber, oDynamicData.numberFactor, oDynamicData.numberDigits);
                    oData.display_number_factor = oNormalizedNumberData.numberFactor;
                    oData.display_number_value = oNormalizedNumberData.displayNumber;
                } else {
                    var oNForm = NumberFormat.getFloatInstance({ maxFractionDigits: maxCharactersInDisplayNumber });
                    oData.display_number_value = oNForm.format(oDynamicData.number);
                }
            }
        }

        //Added as part of bug fix. Incident ID: 1670054463
        if (oData && oData.display_number_state) {
            switch (oData.display_number_state) {
                case "Positive":
                    oData.display_number_state = "Good";
                    break;
                case "Negative":
                    oData.display_number_state = "Error";
                    break;
            }
        }

        return oData;
    };

    oUtils._normalizeNumber = function (numValue, maxCharactersInDisplayNumber, numberFactor, iNumberDigits) {
        var number;

        if (isNaN(numValue)) {
            number = numValue;
        } else {
            var oNForm = NumberFormat.getFloatInstance({ maxFractionDigits: iNumberDigits });

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
        //we have to crop numbers to prevent overflow
        var cLastAllowedChar = displayNumber[maxCharactersInDisplayNumber - 1];
        //if last character is '.' or ',', we need to crop it also
        maxCharactersInDisplayNumber -= (cLastAllowedChar === "." || cLastAllowedChar === ",") ? 1 : 0;
        displayNumber = displayNumber.substring(0, maxCharactersInDisplayNumber);

        return {
            displayNumber: displayNumber,
            numberFactor: numberFactor
        };
    };

    oUtils._shouldProcessDigits = function (sDisplayNumber, iDigitsToDisplay) {
        var nNumberOfDigits;

        sDisplayNumber = typeof (sDisplayNumber) !== "string" ? sDisplayNumber.toString() : sDisplayNumber;
        if (sDisplayNumber.indexOf(".") !== -1) {
            nNumberOfDigits = sDisplayNumber.split(".")[1].length;
            if (nNumberOfDigits > iDigitsToDisplay) {
                return true;
            }
        }

        return false;
    };

    oUtils.getTileSettingsAction = function (oModel, saveSettingsCallback, sType) {
        var oResourcesBundle = oUtils.getResourceBundleModel().getResourceBundle();
        var sKey = ((!sType || (sType === "tile")) ? "tileSettingsBtn" : "linkSettingsBtn");
        return {
            id: sKey,
            text: oResourcesBundle.getText(sKey),
            press: function () {
                return new Promise(function (resolve) {
                    sap.ui.require([
                        "sap/m/Button",
                        "sap/m/Dialog",
                        "sap/ui/core/mvc/View",
                        "sap/ui/layout/form/SimpleForm",
                        "sap/ui/layout/form/SimpleFormLayout"
                    ], function (Button, Dialog, View, SimpleForm, SimpleFormLayout) {
                        var oAppData = {
                            showGroupSelection: false,
                            title: oModel.getProperty("/config/display_title_text"),
                            subtitle: oModel.getProperty("/config/display_subtitle_text")
                        };
                        //links and tiles settings view has different properties
                        if (!sType || sType === "tile") {
                            oAppData.info = oModel.getProperty("/config/display_info_text");
                            oAppData.icon = oModel.getProperty("/config/display_icon_url");
                            oAppData.keywords = oModel.getProperty("/config/display_search_keywords");
                        } else if (sType === "link") {
                            oAppData.showInfo = false;
                            oAppData.showIcon = false;
                            oAppData.showPreview = false;
                        }

                        View.create({
                            viewName: "module:sap/ushell/ui/footerbar/SaveAsTile.view"
                        }).then(function (oSettingsView) {
                            var oSettingsModel = new JSONModel(oAppData);
                            oSettingsView.setModel(oSettingsModel);

                            var oSimpleForm = new SimpleForm({
                                id: "tileSettings",
                                layout: SimpleFormLayout.GridLayout,
                                content: [oSettingsView]
                            }).addStyleClass("sapUshellAddBookmarkForm");

                            var okButton = new Button("bookmarkOkBtn", {
                                text: oResourcesBundle.getText("okBtn"),
                                type: ButtonType.Emphasized,
                                press: function () {
                                    saveSettingsCallback(oSettingsView);
                                    oDialog.close();
                                },
                                enabled: true
                            });

                            var cancelButton = new Button("bookmarkCancelBtn", {
                                text: oResourcesBundle.getText("cancelBtn"),
                                press: function () {
                                    oDialog.close();
                                }
                            });

                            // enforce the title input as a mandatory field
                            var enableOKButton = function (title) {
                                okButton.setEnabled(!!title.trim());
                            };
                            oSettingsView.getTitleInput().attachLiveChange(function () {
                                enableOKButton(this.getValue());
                            });

                            var oDialog = new Dialog({
                                id: "settingsDialog",
                                title: (!sType || sType === "tile")
                                    ? oResourcesBundle.getText("tileSettingsDialogTitle")
                                    : oResourcesBundle.getText("linkSettingsDialogTitle"),
                                contentWidth: "400px",
                                content: oSimpleForm,
                                beginButton: okButton,
                                endButton: cancelButton,
                                horizontalScrolling: false,
                                afterClose: function () {
                                    oDialog.destroy();
                                }
                            }).addStyleClass("sapContrastPlus");

                            oDialog.open();
                            resolve(oDialog);
                        });
                    });
                });
            }
        };
    };


    /**
     * @param {object} oConfig The configuration object (as returned by <code>getConfiguration</code>)
     * @returns {string} The relative navigation URL: '#', semantic object, '-', action, '?' parameters
     */
    oUtils.getSemanticNavigationUrl = function (oConfig) {
        // note: empty semantic objects and actions (?) are perfectly possible
        var sUrl = "#" + String(oConfig.navigation_semantic_object || "").trim();
        sUrl += "-" + String(oConfig.navigation_semantic_action || "").trim();
        // parameters are optional
        if (oConfig.navigation_semantic_parameters && String(oConfig.navigation_semantic_parameters || "").trim() > 0) {
            sUrl += "?" + String(oConfig.navigation_semantic_parameters || "").trim();
        }
        return sUrl;
    };

    /**
     * Rewrites the given URL by appending target parameters.
     *
     * @param {string} sUrl The target URL to be rewritten
     * @param {object} oData The dynamic tile configuration as returned by <code>getDataToDisplay</code>
     * @returns {string} The rewritten URL containing teh target parameters
     */
    oUtils.addParamsToUrl = function (sUrl, oData) {
        var sParams = "", bUrlHasParams = sUrl.indexOf("?") !== -1, aTargetParams = oData.targetParams, i;

        if (aTargetParams && aTargetParams.length > 0) {
            for (i = 0; i < aTargetParams.length; i = i + 1) {
                sParams += aTargetParams[i];
                if (i < aTargetParams.length - 1) {
                    sParams += "&";
                }
            }
        }
        if (sParams.length > 0) {
            if (!bUrlHasParams) {
                sUrl += "?";
            } else {
                sUrl += "&";
            }
            sUrl += sParams;
        }
        return sUrl;
    };


    return oUtils;
}, true /* bExport */);
