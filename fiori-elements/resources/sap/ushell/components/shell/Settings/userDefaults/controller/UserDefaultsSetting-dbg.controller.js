// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/base/util/deepEqual",
    "sap/m/Button",
    "sap/m/FlexBox",
    "sap/m/FlexItemData",
    "sap/m/Input",
    "sap/m/library",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Configuration",
    "sap/ui/comp/smartfield/SmartField",
    "sap/ui/comp/smartfield/SmartLabel",
    "sap/ui/comp/smartform/Group",
    "sap/ui/comp/smartform/GroupElement",
    "sap/ui/comp/smartvariants/PersonalizableInfo",
    "sap/ui/Device",
    "sap/ui/layout/GridData",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ushell/resources",
    "sap/m/MessageBox",
    "./ExtendedValueDialog.controller"
], function (
    Log,
    fnDeepExtend,
    fnDeepEqual,
    Button,
    FlexBox,
    FlexItemData,
    Input,
    mobileLibrary,
    Controller,
    Configuration,
    SmartField,
    SmartLabel,
    Group,
    GroupElement,
    PersonalizableInfo,
    Device,
    GridData,
    JSONModel,
    ODataModel,
    resources,
    MessageBox,
    ExtendedValueDialog
) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    // compare parameters by groupId
    function compareByGroupId (oDefault1, oDefault2) {
        // handle default without metadata
        if (!(oDefault2.editorMetadata && oDefault2.editorMetadata.groupId)) {
            return -1; // keep order
        }
        if (!(oDefault1.editorMetadata && oDefault1.editorMetadata.groupId)) {
            return 1; // move oDefault1 to the end
        }

        if (oDefault1.editorMetadata.groupId < oDefault2.editorMetadata.groupId) {
            return -1;
        }
        if (oDefault1.editorMetadata.groupId > oDefault2.editorMetadata.groupId) {
            return 1;
        }

        return 0;
    }

    // compare parameters by parameterIndex
    function compareByParameterIndex (oDefault1, oDefault2) {
        // handle default without metadata
        if (!(oDefault2.editorMetadata && oDefault2.editorMetadata.parameterIndex)) {
            return -1; // keep order
        }
        if (!(oDefault1.editorMetadata && oDefault1.editorMetadata.parameterIndex)) {
            return 1; // move oDefault1 to the end
        }
        return oDefault1.editorMetadata.parameterIndex - oDefault2.editorMetadata.parameterIndex;
    }

    //compare parameters by groupId and then by parameterIndex
    function compareParameters (oDefault1, oDefault2) {
        // first by groupId
        var iComparisonResult = compareByGroupId(oDefault1, oDefault2);
        if (iComparisonResult === 0) {
            // then by parameterIdx
            return compareByParameterIndex(oDefault1, oDefault2);
        }
        return iComparisonResult;
    }

    return Controller.extend("sap.ushell.components.shell.Settings.userDefaults.controller.UserDefaultsSetting", {
        onInit: function () {
            this.oModelRecords = {}; // a map of oData models
            this.aChangedParamsNames = []; // An array of all parameters changed by the control
            this.oBlockedParameters = {}; // parameters of odata models which are not yet filled with "our" value
            this.aDisplayedUserDefaults = []; // array of displayed parameters, in order
            this.oDirtyStateModel = new JSONModel({
                isDirty: false,
                selectedVariant: null
            });
            this.getView().setModel(this.oDirtyStateModel, "DirtyState");

            this.oOriginalParameters = {}; //the original parameters which was loaded from service

            var oView = this.getView();
            oView.setBusy(true);
            oView.setModel(resources.getTranslationModel(), "i18n");

            this.getSystemContextsModel().then(function (oSystemContextModel) {
                oView.setModel(oSystemContextModel, "systemContexts");
                return this._fillGroups();
            }.bind(this))
                .then(this._saveIsSupportedPlatform.bind(this))
                .then(this._initializeSmartVariantManagement.bind(this))
                .then(function () {
                    oView.setBusy(false);
                })
                .catch(function (err) {
                    Log.error(
                        "Error during UserDefaultsSetting controller initialization",
                        err,
                        "sap.ushell.components.shell.Settings.userDefaults.UserDefaultsSetting"
                    );
                    oView.setBusy(false);
                });
        },

        /**
         * Initializes the systemContexts model
         * The systemContexts and the selectedKey will be written into the model
         *
         * @returns {Promise<sap.ui.model.json.JSONModel>} A Promise which resolves systemContexts model
         *
         * @private
         */
        getSystemContextsModel: function () {
            var oSystemContextModel = new JSONModel({ systemContexts: [], selectedKey: "" });

            var oGetContentProviderIdsPromise = this._getContentProviderIds();
            var oClientSideTargetResolutionPromise = sap.ushell.Container.getServiceAsync("ClientSideTargetResolution");
            var oUserDefaultParametersServicePromise = sap.ushell.Container.getServiceAsync("UserDefaultParameters");

            return Promise.all([
                oGetContentProviderIdsPromise,
                oClientSideTargetResolutionPromise,
                oUserDefaultParametersServicePromise
            ])
                .then(function (aResults) {
                    var aContentProviderIds = aResults[0];
                    var oCSTRService = aResults[1];
                    var oUserDefaultParametersService = aResults[2];

                    // If there are no content providers we use the local systemContext
                    if (aContentProviderIds.length === 0) {
                        aContentProviderIds.push("");
                    }

                    return Promise.all(aContentProviderIds.map(function (sContentProvider) {
                        return oCSTRService.getSystemContext(sContentProvider).then(function (oSystemContext) {
                            var aSystemContexts = oSystemContextModel.getProperty("/systemContexts");
                            return oUserDefaultParametersService.hasRelevantMaintainableParameters(oSystemContext).then(function (bRelevant) {
                                if (bRelevant) {
                                    aSystemContexts.push(oSystemContext);
                                }
                            });
                        });
                    })).then(function () {
                        var aSystemContexts = oSystemContextModel.getProperty("/systemContexts");
                        if (aSystemContexts.length > 0) {
                            oSystemContextModel.setProperty("/selectedKey", aSystemContexts[0].id);
                        }
                        return oSystemContextModel;
                    });
                });
        },

        /**
         * Gets all contentProvider ids.
         * If spaces mode is active the content Providers will be received from the CDM service,
         * else only the default contentProvider id will be returned
         *
         * @returns {Promise<string[]>} A promise which resolves to a list of content provider ids
         *
         * @private
         *
         * @since 1.80.0
         */
        _getContentProviderIds: function () {
            return sap.ushell.Container.getServiceAsync("CommonDataModel")
                .then(function (oCdmService) {
                    return oCdmService.getContentProviderIds();
                })
                .catch(function () {
                    return [""];
                });
        },

        /**
         * Checks if the view is dirty and creates a messageBox to ask the user if they want to discard the changes.
         * Calls _fillGroups if the user wants to discard the changes or the view is not dirty
         *
         * @private
         *
         * @since 1.81.0
         */
        handleSystemContextChanged: function () {
            if (this.oDirtyStateModel.getProperty("/isDirty")) {
                var sUserDefaultSaveText = resources.i18n.getText("userDefaultsSave");
                var sUserDefaultDiscardText = resources.i18n.getText("userDefaultsDiscard");
                MessageBox.show(resources.i18n.getText("userDefaultsUnsavedChangesMessage"), {
                    title: resources.i18n.getText("userDefaultsUnsavedChangesTitle"),
                    actions: [sUserDefaultSaveText, sUserDefaultDiscardText, MessageBox.Action.CANCEL],
                    emphasizedAction: sUserDefaultSaveText,
                    icon: MessageBox.Icon.QUESTION,
                    onClose: function (sAction) {
                        if (sAction === sUserDefaultDiscardText) {
                            this._fillGroups();
                            this._setDirtyState(false);
                        } else if (sAction === sUserDefaultSaveText) {
                            this.onSave();
                            this._fillGroups();
                            this._setDirtyState(false);
                        } else {
                            this.getView().getModel("systemContexts").setProperty("/selectedKey", this.sLastSelectedKey);
                        }
                    }.bind(this)
                });
            } else {
                this._fillGroups();
            }
        },

        /**
         * Creates the groups containing the user defaults of the selected system,
         * and adds them to the form
         *
         * @returns {Promise<object>} A promise which resolves to the current view
         *
         * @private
         *
         * @since 1.80.0
         */
        _fillGroups: function () {
            var oUserDefaultsForm = this.getView().byId("userDefaultsForm");
            oUserDefaultsForm.removeAllGroups();

            var sKey = this.getView().getModel("systemContexts").getProperty("/selectedKey");
            var oSystemContext = this.getView().getModel("systemContexts").getProperty("/systemContexts").find(function (oContext) {
                return oContext.id === sKey;
            });

            return new Promise(function (resolve) {
                sap.ushell.Container.getServiceAsync("UserDefaultParameters").then(function (UserDefaultParameters) {
                    UserDefaultParameters.editorGetParameters(oSystemContext).done(function (oParameters) {
                        // take a deep copy of the original parameters
                        this.oOriginalParameters = fnDeepExtend({}, oParameters);

                        //Used to save extendedValues and value of the plain inputs
                        this.oModel = new JSONModel(oParameters);
                        this.oModel.setDefaultBindingMode("TwoWay");
                        this.getView().setModel(this.oModel, "MdlParameter");

                        return this._getFormattedParameters(this.oModel)
                            .then(function (aModelInfoObjects) {
                                var aGroups = this._createContent(aModelInfoObjects);
                                aGroups.forEach(function (oGroup) {
                                    oUserDefaultsForm.addGroup(oGroup);
                                });
                            }.bind(this))
                            .then(resolve);
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        },

        /**
         * @typedef {object} ParameterValue A value object of the parameter.
         * @property {string|undefined} value the value of the parameter which is shown in the input field
         * @property {object} extendedValue the extended values of the parameter which is shown in the extended dialog
         * @property {object[]} extendedValue.Range array of the SelectOption
         */

        /**
         * @typedef {object} ParameterModelBind Model binding data which used to bind the control.
         * @property {boolean} isOdata Odata model binding or binding to the JSON model
         * @property {string} sPropertyName the property binding statement , e.g. {xxxx} to attach to the control
         * @property {string} sFullPropertyPath path into the model to the property value which is used in the input
         * @property {sap.ui.model.json.JSONModel|sap.ui.model.odata.ODataModel} model the model which used to bind the input
         * @property {sap.ui.model.json.JSONModel} extendedModel the model which used to bind to the extended dialog
         */

        /**
         * @typedef {object} ParameterMetadata Metadata of the parameter
         * @property {string} groupId The id of the group which parameter is located
         * @property {string} groupTitle The group title
         * @property {string} displayText The display text. Used for the label when Odata can not be loaded
         * @property {string} description The description text. Used for the label tooltip when Odata can not be loaded
         * @property {boolean} extendedUsage if extended dialog should be used
         * @property {object} editorInfo Odata information
         * @property {string} editorInfo.odataURL Odata URL
         * @property {string} editorInfo.propertyName name of the parameter
         * @property {string} editorInfo.bindingPath Odata binding path
         *
         */

        /**
         * @typedef {object} FormattedParameter A prepared parameter.
         * @property {string} parameterName The name of the parameter
         * @property {ParameterValue} valueObject A value object of the parameter
         * @property {ParameterModelBind} modelBind A model binding of the parameter
         * @property {ParameterMetadata} editorMetadata A metadata of the parameter
         */

        /**
         * Format original parameters to have the same structure. Also create modelBind.
         *
         * @param {sap.ui.model.json.JSONModel} oJsonModel json model for extended dialog and not Odata fields
         *
         * @returns {Promise<FormattedParameter[]>} The list of sorted formatted parameters.
         */
        _getFormattedParameters: function (oJsonModel) {
            var oParameters = oJsonModel.getData("/");
            var aParametersPromises = Object.keys(oParameters).map(function (sParameter) {
                var oParameter = fnDeepExtend({}, oParameters[sParameter]);

                oParameter.parameterName = sParameter;
                oParameter.editorMetadata = oParameter.editorMetadata || {};
                // normalize the value, in the editor, undefined is represented as ""
                oParameter.valueObject = fnDeepExtend({ value: "" }, oParameter.valueObject);

                if (oParameter.editorMetadata.editorInfo && oParameter.editorMetadata.editorInfo.propertyName) {
                    return this._createOdataModelBinding(oParameter, oJsonModel)
                        .then(function (oModelBind) {
                            oParameter.modelBind = oModelBind;
                            return oParameter;
                        })
                        .catch(function () {
                            Log.error("Metadata loading for parameter " + oParameter.parameterName + " failed" + JSON.stringify(oParameter.editorMetadata));
                            //When odata loading fails, switch to the normal (not smart) control.
                            oParameter.modelBind = this._createPlainModelBinding(oParameter, oJsonModel);
                            this.oBlockedParameters[oParameter.parameterName] = false;
                            return Promise.resolve(oParameter);
                        }.bind(this));
                }

                oParameter.modelBind = this._createPlainModelBinding(oParameter, oJsonModel);
                return Promise.resolve(oParameter);
            }.bind(this));

            return Promise.all(aParametersPromises).then(function (aParameters) {
                aParameters.sort(compareParameters);
                this.aDisplayedUserDefaults = aParameters;
                aParameters.forEach(function (oParameter) {
                    oParameter.modelBind.model.setProperty(oParameter.modelBind.sFullPropertyPath, oParameter.valueObject.value);
                    oParameter.modelBind.model.bindTree(oParameter.modelBind.sFullPropertyPath).attachChange(this.storeChangedData.bind(this));
                }.bind(this));
                return aParameters;
            }.bind(this));
        },

        /**
         * Create model binding for the plain control
         * @param {object} oParameter default parameter
         * @param {sap.ui.model.json.JSONModel} oJsonModel json model for extendedModel and model
         *
         * @returns {ParameterModelBind} The modal binding for the parameter
         */
        _createPlainModelBinding: function (oParameter, oJsonModel) {
            var sModelPath = "/" + oParameter.parameterName + "/valueObject/value";
            //create object if not exist
            if (!oJsonModel.getProperty("/" + oParameter.parameterName + "/valueObject")) {
                oJsonModel.setProperty("/" + oParameter.parameterName + "/valueObject", {});
            }
            var oBindingInfo = {
                isOdata: false,
                model: oJsonModel,
                extendedModel: oJsonModel, // same model!
                sFullPropertyPath: sModelPath,
                sPropertyName: "{" + sModelPath + "}"
            };
            return oBindingInfo;
        },

        /**
         * Create model binding for the smart control
         * @param {object} oParameter Parameter
         * @param {sap.ui.model.json.JSONModel} oJsonModel json model for extendedModel
         *
         * @returns {Promise<BindingInfo>} A modal binding info object for the parameter
         */
        _createOdataModelBinding: function (oParameter, oJsonModel) {
            var oEditorInfo = oParameter.editorMetadata.editorInfo;
            var oODataServiceData = this._getODataServiceData(oEditorInfo.odataURL, oParameter);

            return oODataServiceData.metadataLoaded.then(function () {
                var oBindingInfo = {
                    isOdata: true,
                    model: oODataServiceData.model,
                    extendedModel: oJsonModel,
                    sPropertyName: "{" + oEditorInfo.propertyName + "}",
                    sFullPropertyPath: oEditorInfo.bindingPath + "/" + oEditorInfo.propertyName
                };
                return oBindingInfo;
            });
        },

        /**
         * @typedef {object} ModelRecord A model record.
         * @property {object} model The model used for the OData request.
         * @property {Promise<void>} metadata A promise which resolves if the model is loaded or rejects if the loading failed.
         */

        /**
         * Returns a model record for the OData service.
         *
         * @param {string} sUrl The url for which the model should be created.
         * @param {FormattedParameter} oFormattedParameter default parameter
         * @returns {ModelRecord} The model record for the OData Service.
         */
        _getODataServiceData: function (sUrl, oFormattedParameter) {
            if (!this.oModelRecords[sUrl]) {
                // In order to reduce the volume of the metadata response
                // We pass only relevant parameters to oDataModel constructor
                var oModel = new ODataModel(sUrl, {
                    metadataUrlParams: {
                        "sap-documentation": "heading,quickinfo",
                        "sap-value-list": "none",
                        "sap-language": Configuration.getLanguageTag()
                    },
                    json: true
                });
                oModel.setDefaultCountMode("None");
                oModel.setDefaultBindingMode("TwoWay");

                this.oModelRecords[sUrl] = {
                    attachedListeners: [],
                    model: oModel,
                    metadataLoaded: new Promise(function (resolve, reject) {
                        oModel.attachMetadataLoaded(resolve);
                        oModel.attachMetadataFailed(reject);
                    })
                };
            }

            if (this.oModelRecords[sUrl].attachedListeners.indexOf(oFormattedParameter.parameterName) === -1) {
                this.oModelRecords[sUrl].attachedListeners.push(oFormattedParameter.parameterName);
                this.oModelRecords[sUrl].model.attachRequestCompleted(this._overrideOdataModelValue.bind(this, oFormattedParameter));
                // because Odata model is used, block input before request is completed
                this.oBlockedParameters[oFormattedParameter.parameterName] = true;
            }
            return this.oModelRecords[sUrl];
        },

        _overrideOdataModelValue: function (oParameter, oEvent) {
            var oModel = oEvent.getSource();
            var sUrlSegment = "/" + oEvent.getParameter("url").replace(/\?.*/, "");

            if (oParameter.editorMetadata.editorInfo.bindingPath === sUrlSegment) {
                // if the property value in the model is not the same as the one we got from the service,
                // change the property value accordingly
                var sFullPath = oParameter.editorMetadata.editorInfo.bindingPath + "/" + oParameter.editorMetadata.editorInfo.propertyName;
                if (oModel.getProperty(sFullPath) !== oParameter.valueObject.value) {
                    oModel.setProperty(sFullPath, oParameter.valueObject.value);
                }
                this.oBlockedParameters[oParameter.parameterName] = false;
            }
        },

        /**
         * Create smart form content
         * @param {FormattedParameter[]} aFormattedParameters list of the formatted parameters
         * @returns {sap.ui.comp.smartform.Group[]} the list of the groups
         */
        _createContent: function (aFormattedParameters) {
            var sLastGroupId = "nevermore";
            var oGroup; // the current group;
            var oBindingContexts = {};
            var aGroups = [];

            for (var i = 0; i < aFormattedParameters.length; ++i) {
                var oProperty = aFormattedParameters[i];
                var oModelBinding = oProperty.modelBind;

                if (sLastGroupId !== oProperty.editorMetadata.groupId) {
                    // generate a group on group change
                    oGroup = new Group({
                        label: oProperty.editorMetadata.groupTitle || undefined,
                        layoutData: new GridData({ linebreak: false }) // for a proper form-field alignment across groups
                    });
                    sLastGroupId = oProperty.editorMetadata.groupId;
                    aGroups.push(oGroup);
                }

                var oGroupElement = new GroupElement({});
                oGroupElement.setModel(oModelBinding.model);
                if (oModelBinding.isOdata) {
                    var sUrl = oProperty.editorMetadata.editorInfo.odataURL;
                    // in order to avoid OData requests to the same URL
                    // we try to reuse the BindingContext that was previously created for the same URL
                    // the call to bindElement creates a new BindingContext, and triggers an OData request
                    if (!oBindingContexts[sUrl]) {
                        var sBindingPath = oProperty.editorMetadata.editorInfo.bindingPath;
                        oGroupElement.bindElement(sBindingPath);
                        oBindingContexts[sUrl] = oProperty.modelBind.model.getContext(sBindingPath);
                    } else {
                        oGroupElement.setBindingContext(oBindingContexts[sUrl]);
                    }
                }
                oGroupElement.addElement(this._createControl(oProperty));
                oGroup.addGroupElement(oGroupElement);
            }
            return aGroups;
        },

        /**
         * Create GroupElement content
         *
         * @param {FormattedParameter} oFormattedParameters default parameter
         * @returns {sap.m.FlexBox} FlexBox which contains a label, an input and the extendedUsage button
         */
        _createControl: function (oFormattedParameters) {
            var oField;
            var oExtendedParametersButton;
            // If oRecord supports extended values (ranges), we want to add an additional button to it
            // The style of the button depends on whether there are any ranges in the extendedValues object
            if (oFormattedParameters.editorMetadata.extendedUsage) {
                oExtendedParametersButton = new Button({
                    text: resources.i18n.getText("userDefaultsExtendedParametersTitle"),
                    tooltip: resources.i18n.getText("userDefaultsExtendedParametersTooltip"),
                    type: {
                        parts: ["MdlParameter>/" + oFormattedParameters.parameterName + "/valueObject/extendedValue/Ranges"],
                        formatter: function (aRanges) {
                            return aRanges && aRanges.length ? ButtonType.Emphasized : ButtonType.Transparent;
                        }
                    },
                    press: function (oEvent) {
                        ExtendedValueDialog.openDialog(oFormattedParameters, this.saveExtendedValue.bind(this));
                    }.bind(this)
                }).addStyleClass("sapUshellExtendedDefaultParamsButton");
            }

            var oLabel = new SmartLabel({
                width: Device.system.phone ? "auto" : "12rem",
                textAlign: Device.system.phone ? "Left" : "Right"
            });
            if (oFormattedParameters.modelBind.isOdata && oFormattedParameters.editorMetadata.editorInfo) {
                oField = new SmartField({
                    value: oFormattedParameters.modelBind.sPropertyName,
                    name: oFormattedParameters.parameterName,
                    fieldGroupIds: ["UserDefaults"]
                });
                oLabel.setLabelFor(oField);
            } else {
                oField = new Input({
                    name: oFormattedParameters.parameterName,
                    value: oFormattedParameters.modelBind.sPropertyName,
                    fieldGroupIds: ["UserDefaults"],
                    type: "Text"
                });
                oField.addAriaLabelledBy(oLabel);
                oLabel.setText((oFormattedParameters.editorMetadata.displayText || oFormattedParameters.parameterName) + ":");
                oLabel.setTooltip(oFormattedParameters.editorMetadata.description || oFormattedParameters.parameterName);
            }

            oField.attachChange(this.storeChangedData.bind(this));
            oField.attachChange(this._setDirtyState.bind(this, true), this);
            oField.addStyleClass("sapUshellDefaultValuesSmartField");
            oField.setLayoutData(new FlexItemData({ shrinkFactor: 0 }));

            var oBox = new FlexBox({
                width: Device.system.phone ? "100%" : "auto",
                alignItems: Device.system.phone ? "Start" : "Center",
                direction: (Device.system.phone && !oExtendedParametersButton) ? "Column" : "Row",
                items: [oLabel, oField, oExtendedParametersButton],
                wrap: "Wrap"
            });

            return oBox;
        },

        saveExtendedValue: function (oControlEvent) {
            var sParameterName = oControlEvent.getSource().getModel().getProperty("/parameterName");
            // JSONModel is used for the extend values
            var oExtendedModel = this.oModel;
            var aTokens = oControlEvent.getParameters().tokens || [];
            var sPathToTokens = "/" + sParameterName + "/valueObject/extendedValue/Ranges";

            // convert the Ranges that are coming from the dialog to the format that should be persisted in the service and that applications can read
            var aFormattedTokensData = aTokens.map(function (oToken) {
                var oTokenData = oToken.data("range");
                return {
                    Sign: oTokenData.exclude ? "E" : "I",
                    Option: oTokenData.operation !== "Contains" ? oTokenData.operation : "CP",
                    Low: oTokenData.value1,
                    High: oTokenData.value2 || null
                };
            });

            if (!oExtendedModel.getProperty("/" + sParameterName + "/valueObject/extendedValue")) {
                oExtendedModel.setProperty("/" + sParameterName + "/valueObject/extendedValue", {});
            }
            oExtendedModel.setProperty(sPathToTokens, aFormattedTokensData);
            this.aChangedParamsNames.push(sParameterName);
            if (oControlEvent.getParameter("_tokensHaveChanged")) {
                this._setDirtyState(true);
            }
        },

        /**
         * Sets the dirty state and saves the current selectedKey.
         * This is needed for resetting the selectedKey if the user doesn't want to discard their changes.
         *
         * @param {boolean} isDirty True if the state should be changed to dirty.
         *
         * @private
         *
         * @since 1.81.0
         */
        _setDirtyState: function (isDirty) {
            this.oDirtyStateModel.setProperty("/isDirty", isDirty);
            this._setSmartVariantModified(isDirty);

            if (isDirty) {
                this.sLastSelectedKey = this.getView().getModel("systemContexts").getProperty("/selectedKey");
            }
        },

        /**
         * Sets the key of the selected variant.
         * @param {string} sSelectionKey The key of the selected variant.
         * @private
         */
        _setSelectedVariant: function (sSelectionKey) {
            this.oDirtyStateModel.setProperty("/selectedVariant", sSelectionKey);
            this.storeChangedData();
        },

        /**
         * This function is invoked on any model data change in the plain JSON fallback model.
         * As this does not work an odata model, it is called during save
         * and it is called during resetting the smart variant, too.
         * We always run over all parameters and record the ones with a delta.
         * We change *relevant* deltas compared to the data when calling up the dialogue.
         * Note:
         *  the valueObject may contain other relevant metadata,
         *  which is *not* altered by the Editor Control!
         *  Thus it is important not to overwrite or recreate the valueObject, but only set the value property.
         */
        storeChangedData: function () {
            var aDisplayedUserDefaults = this.aDisplayedUserDefaults || [];

            // check for all changed parameters...
            for (var i = 0; i < aDisplayedUserDefaults.length; ++i) {
                var sParameterName = aDisplayedUserDefaults[i].parameterName;
                var oValueObject = this.oModel.getProperty("/" + sParameterName + "/valueObject/");
                var oModelBinding = aDisplayedUserDefaults[i].modelBind;

                if (!this.oBlockedParameters[sParameterName]) {
                    var oldValues = {
                        value: oValueObject && oValueObject.value,
                        extendedValue: oValueObject && oValueObject.extendedValue
                    };
                    if (oModelBinding && oModelBinding.model) {
                        var oModel = oModelBinding.model;
                        var oModelExtended = oModelBinding.extendedModel;
                        var sPropValuePath = oModelBinding.sFullPropertyPath;

                        var oCurrentValues = {
                            value: oModel.getProperty(sPropValuePath) !== "" ? oModel.getProperty(sPropValuePath) : undefined,
                            extendedValue: oModelExtended.getProperty("/" + sParameterName + "/valueObject/extendedValue") || undefined
                        };
                        if (!fnDeepEqual(oCurrentValues, oldValues)) {
                            oValueObject.value = oCurrentValues.value;
                            if (oCurrentValues.extendedValue) {
                                oValueObject.extendedValue = {};
                                fnDeepExtend(oValueObject.extendedValue, oCurrentValues.extendedValue);
                            }
                            // Update also JSON Model's value
                            this.oModel.setProperty("/" + sParameterName + "/valueObject", oValueObject);

                            this.aChangedParamsNames.push(sParameterName);
                        }
                    }
                }
            }
        },

        onCancel: function () {
            this._setDirtyState(false);

            var aDisplayedParameters = this.aDisplayedUserDefaults;

            if (this.aChangedParamsNames.length > 0) {
                for (var i = 0; i < aDisplayedParameters.length && this.aChangedParamsNames.length > 0; i++) {
                    var sParameterName = aDisplayedParameters[i].parameterName;
                    if (this.aChangedParamsNames.indexOf(sParameterName) > -1) {
                        var oOriginalParameter = this.oOriginalParameters[sParameterName];
                        var oBoundModel = aDisplayedParameters[i].modelBind;
                        oBoundModel.model.setProperty(oBoundModel.sFullPropertyPath, oOriginalParameter.valueObject.value || "");
                        if (oOriginalParameter.editorMetadata && oOriginalParameter.editorMetadata.extendedUsage) {
                            oBoundModel.extendedModel.setProperty("/" + sParameterName + "/valueObject/extendedValue",
                                oOriginalParameter.valueObject.extendedValue || {});
                        }
                    }
                }
                this.aChangedParamsNames = [];
            }
            this._setDefaultVariant();
        },

        onSave: function () {
            this.storeChangedData();
            this._setDirtyState(false);

            var pSave;

            if (this.aChangedParamsNames.length === 0) {
                pSave = Promise.resolve();
            } else {
                pSave = sap.ushell.Container.getServiceAsync("ClientSideTargetResolution")
                    .then(function (oClientSideTargetResolution) {
                        return oClientSideTargetResolution.getSystemContext(this.sLastSelectedKey);
                    }.bind(this))
                    .then(function (oSystemContext) {
                        var aChangedParameterNames = this.aChangedParamsNames.sort();
                        this.aChangedParamsNames = [];
                        return this._saveParameterValues(aChangedParameterNames, oSystemContext);
                    }.bind(this));
            }

            return pSave.then(this._resetSmartVariantManagement.bind(this))
                .then(this._setDefaultVariant.bind(this));
        },

        _saveParameterValues: function (aChangedParameterNames, oSystemContext) {
            var aPromises = [];

            // we change the effectively changed parameters, once, in alphabetic order
            for (var i = 0; i < aChangedParameterNames.length; i++) {
                var sParameterName = aChangedParameterNames[i];
                var oValueObject = this.oModel.getProperty("/" + sParameterName + "/valueObject/");
                var oOriginalValueObject = this.oOriginalParameters[sParameterName].valueObject;

                if (!fnDeepEqual(oOriginalValueObject, oValueObject)) {
                    // as the editor does not distinguish empty string from deletion, and has no "reset" button
                    // we drop functionality to allow to set a value to an empty string (!in the editor!)
                    // and map an empty string to an effective deletion!
                    // eslint-disable-next-line no-warning-comments
                    // TODO: make sure all controls allow to enter an empty string as a "valid" value
                    if (oValueObject && oValueObject.value === null || oValueObject && oValueObject.value === "") {
                        oValueObject.value = undefined;
                    }

                    // we rectify the extended value, as the editor produces empty object
                    if (oValueObject && oValueObject.extendedValue && Array.isArray(oValueObject.extendedValue.Ranges) && oValueObject.extendedValue.Ranges.length === 0) {
                        oValueObject.extendedValue = undefined;
                    }

                    var oSetValuePromise = this._saveParameterValue(sParameterName, oValueObject, oOriginalValueObject, oSystemContext);
                    aPromises.push(oSetValuePromise);
                }
            }
            return Promise.all(aPromises);
        },

        _saveParameterValue: function (sName, oValueObject, oOriginalValueObject, oSystemContext) {
            return sap.ushell.Container.getServiceAsync("UserDefaultParameters")
                .then(function (oUserDefaultParameters) {
                    return new Promise(function (resolve, reject) {
                        oUserDefaultParameters.editorSetValue(sName, oValueObject, oSystemContext)
                            .done(function () {
                                oOriginalValueObject.value = oValueObject.value;
                                resolve();
                            })
                            .fail(reject);
                    });
                });
        },

        /**
         * Sets the current variant to modified or not. The control will be displayed with an asterisk.
         * @param {boolean} isModified True if the variant has been modified.
         * @private
         */
        _setSmartVariantModified: function (isModified) {
            if (!this._bIsSupportedPlatform) { return; }
            this.getView().byId("defaultSettingsVariantManagement").currentVariantSetModified(isModified);
        },

        /**
         * Sets the selected view to the default view in the SmartVariant control.
         * @private
         */
        _setDefaultVariant: function () {
            if (!this._bIsSupportedPlatform) { return; }
            var oSmartVariantManagement = this.getView().byId("defaultSettingsVariantManagement");
            oSmartVariantManagement.setCurrentVariantId(oSmartVariantManagement.getDefaultVariantKey());
            this._setSelectedVariant(oSmartVariantManagement.getDefaultVariantKey());
        },

        /**
         * Removes all personalizable controls from the SmartVariantManagement control
         * and re-initializes them.
         * This is required to update the "Standard" control after the UserDefaults have been saved.
         * @returns {Promise<undefined>} Resolves when the component has been initialized.
         * @private
         */
        _resetSmartVariantManagement: function () {
            if (!this._bIsSupportedPlatform) { return Promise.resolve(); }
            this.getView().byId("defaultSettingsVariantManagement").removeAllPersonalizableControls();
            return this._initializeSmartVariantManagement();
        },

        /**
         * Initializes the PersonalizableInfo instance to introduce the SmartVariantManagement
         * to the UserDefaultsForm control.
         * @returns {Promise<undefined>} Resolves when the component has been initialized.
         * @private
         */
        _initializeSmartVariantManagement: function () {
            if (!this._bIsSupportedPlatform) { return Promise.resolve(); }
            var oSmartVariantManagement = this.getView().byId("defaultSettingsVariantManagement");
            var fnSetVariant = function () {
                this._setSelectedVariant(oSmartVariantManagement.getSelectionKey());
            }.bind(this);

            return new Promise(function (resolve) {
                var oUserDefaultsForm = this.getView().byId("userDefaultsForm");
                var oPersInfo = new PersonalizableInfo({
                    type: "wrapper",
                    keyName: "persistencyKey",
                    dataSource: "none",
                    control: oUserDefaultsForm
                });

                oSmartVariantManagement.detachSelect(fnSetVariant)
                    .detachAfterSave(fnSetVariant)
                    .addPersonalizableControl(oPersInfo)
                    .attachSelect(fnSetVariant)
                    .attachAfterSave(fnSetVariant)
                    .initialise(function () {
                        oSmartVariantManagement.setVisible(true);
                        resolve();
                    }, oUserDefaultsForm);
            }.bind(this)).then(fnSetVariant);
        },

        /**
         * Checks and saves a flag to disable smartvariant management on not supported platforms.
         * Currently not supported: CDM
         * @returns {Promise<boolean>} A promise resolving when the flag has been set.
         * @private
         */
        _saveIsSupportedPlatform: function () {
            var sPlatform = sap.ushell.Container.getLogonSystem().getPlatform();
            this._bIsSupportedPlatform = (sPlatform !== "cdm");
            return Promise.resolve(this._bIsSupportedPlatform);
        },

        /**
         * Returns true if a diff between the standard variant and the currently chosen variant exists.
         * @returns {boolean} The result.
         */
        displayDiffText: function () {
            if (!this._bIsSupportedPlatform) { return false; }
            var oSmartVariantManagement = this.getView().byId("defaultSettingsVariantManagement");
            var oUserDefaultsForm = this.getView().byId("userDefaultsForm");
            var sStandardKey = oSmartVariantManagement.getStandardVariantKey();
            var sSelectionKey = oSmartVariantManagement.getSelectionKey();

            if (sSelectionKey === sStandardKey) { return false; }

            var oStandardContent = oSmartVariantManagement.getVariantContent(oUserDefaultsForm, sStandardKey);
            var oVariantContent = oSmartVariantManagement.getVariantContent(oUserDefaultsForm, sSelectionKey);

            // workaround to get a deepEqual === true
            delete oVariantContent.executeOnSelection;

            return !fnDeepEqual(oStandardContent, oVariantContent);
        }
    });
});
