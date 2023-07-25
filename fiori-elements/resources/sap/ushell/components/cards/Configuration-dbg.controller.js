// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/components/cards/ManifestPropertyHelper",
    "sap/ushell/resources",
    "sap/ui/core/mvc/Controller",
    "sap/base/strings/formatMessage",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/ui/core/Core",
    "sap/ui/core/Configuration"
], function (manifestPropertyHelper, resources, Controller, formatter, JSONModel, jQuery, Log, Core, Configuration) {
    "use strict";

    return Controller.extend("sap.ushell.components.cards.Configuration", {
        formatter: formatter,
        onInit: function () {
            var oView = this.getView(),
                oViewData = oView.getViewData(),
                oChipInstance = oViewData.chipInstance,
                oModel,
                sManifest = oChipInstance.configuration.getParameterValueAsString("cardManifest"),
                oManifest;

            if (sManifest) {
                oManifest = this._prepareManifest(sManifest, oChipInstance);
            }

            oModel = new JSONModel({
                data: {
                    editorValue: JSON.stringify(oManifest, null, 4) || ""
                },
                config: {
                    originalLanguage: "",
                    sapLogonLanguage: "",
                    displayOriginalLanguageWarning: false,
                    manifestEditorEditable: true
                }
            });
            oView.setModel(oModel);
            oView.setModel(resources.i18nModel, "i18n");

            oView.setViewName("sap.ushell.components.cards.Configuration");

            oChipInstance.configurationUi.attachSave(this.onSaveConfiguration.bind(this));

            this._checkOriginalLanguage();
        },

        onSaveConfiguration: function () {
            var oDeferred = new jQuery.Deferred(),
                oModel = this.getView().getModel(),
                sManifest = oModel.getProperty("/data/editorValue"),
                oManifest,
                oExtractedCardData;

            try {
                oManifest = JSON.parse(sManifest);
            } catch (e) {
                this._logErrorAndReject({ error: resources.i18n.getText("configuration.invalidJSONProvided") }, oDeferred);
                return oDeferred;
            }

            oExtractedCardData = manifestPropertyHelper.extractCardData(oManifest);

            this._saveManifestAndTileConfig(oExtractedCardData.manifest, oExtractedCardData.tileConfiguration)
                .then(this._saveTilePropertiesBag.bind(this, oExtractedCardData))
                .then(this._saveTitle.bind(this, oExtractedCardData.bagProperties.display_title_text))
                .then(this._updateTileModel.bind(this, oExtractedCardData))
                .then(oDeferred.resolve)
                .catch(function (error) {
                    this._logErrorAndReject(error, oDeferred);
                }.bind(this));

            return oDeferred.promise();
        },

        /**
         * Saves the card's manifest and configuration via the CHIP API
         *
         * @param {object} manifest The card's manifest
         * @param {object} tileConfiguration The card's configuration
         * @returns {Promise} A promise that resolves when the data has been saved successfully
         * @private
         */
        _saveManifestAndTileConfig: function (manifest, tileConfiguration) {
            var oChipInstance = this.getView().getViewData().chipInstance;

            var oPromise = new Promise(function (resolve, reject) {
                // use configuration contract to write parameter values
                oChipInstance.writeConfiguration.setParameterValues(
                    {
                        cardManifest: JSON.stringify(manifest),
                        // this has to be called tileConfiguration also for cards as the FLP expects
                        // to find the configuration under this name
                        tileConfiguration: tileConfiguration
                    },
                    resolve,
                    function (oError, oErrorInfo) {
                        reject({
                            error: oError,
                            errorInfo: oErrorInfo
                        });
                    }
                );
            });

            return oPromise;
        },

        /**
         * Saves the card's translatable properies in a property bag via the CHIP API
         *
         * @param {object} cardData The card's data
         * @returns {Promise} A promise that resolves when the data has been saved successfully
         * @private
         */
        _saveTilePropertiesBag: function (cardData) {
            var oChipInstance = this.getView().getViewData().chipInstance;
            var oTilePropertiesBag = oChipInstance.bag.getBag("tileProperties");
            this._fillCardBag(cardData, oTilePropertiesBag);

            var oPromise = new Promise(function (resolve, reject) {
                oTilePropertiesBag.save(
                    resolve,
                    function (oError, oErrorInfo) {
                        reject({
                            error: oError,
                            errorInfo: oErrorInfo
                        });
                    }
                );
            });

            return oPromise;
        },

        /**
         * Saves the card's title via the CHIP API
         *
         * @param {string} title The card's title
         * @returns {Promise} A promise that resolves when the data has been saved successfully
         * @private
         */
        _saveTitle: function (title) {
            var oChipInstance = this.getView().getViewData().chipInstance;

            var oPromise = new Promise(function (resolve, reject) {
                // the chip has a separate title property that is kept in sync with the title in the bags here
                if (oChipInstance.title) {
                    oChipInstance.title.setTitle(
                        title,
                        resolve,
                        function (oError, oErrorInfo) {
                            reject({
                                error: oError,
                                errorInfo: oErrorInfo
                            });
                        }
                    );
                } else {
                    resolve();
                }
            });

            return oPromise;
        },

        /**
         * Update the title and subtitle of the card tile' model
         *
         * @param {string} cardData The card data
         * @private
         */
        _updateTileModel: function (cardData) {
            var oTileModel = this.getView().getModel("tileModel");

            // update the tile model in order to show the current information on the previewed tile outside the configuration UI
            oTileModel.setProperty("/data/display_title_text", cardData.bagProperties.display_title_text);
            oTileModel.setProperty("/data/display_subtitle_text", cardData.bagProperties.display_subtitle_text);
        },

        /**
         * Log an error to the console and reject a deferred with the error
         *
         * @param {object} error The error object
         * @param {object} deferred A deferred to reject
         * @private
         */
        _logErrorAndReject: function (error, deferred) {
            Log.error(error.error, null, "card.Configuration.controller");
            deferred.reject(error.error, error.errorInfo);
        },

        /**
         * Fill the card's CHIP bag with texts extracted from the card's manifest
         *
         * @param {Object} extractedData The card data extraced from the manifest
         * @param {Object} tilePropertiesBag The card's properties bag
         *
         * @private
         */
        _fillCardBag: function (extractedData, tilePropertiesBag) {
            Object.keys(extractedData.bagProperties).forEach(function (sProperty) {
                if (extractedData.bagProperties[sProperty]) {
                    tilePropertiesBag.setText(sProperty, extractedData.bagProperties[sProperty]);
                } else {
                    tilePropertiesBag.resetProperty(sProperty);
                }
            });
        },

        /**
         * Merges the card's bag properties into the card's manifest
         *
         * @param {string} manifest The card's raw manifest
         * @param {*} chipInstance The card's chip instance
         *
         * @returns {object} The merged data
         *
         * @private
         */
        _prepareManifest: function (manifest, chipInstance) {
            var oManifest = JSON.parse(manifest),
                oCardData = manifestPropertyHelper.getCardData(chipInstance);

            return manifestPropertyHelper.mergeCardData(oManifest, oCardData);
        },

        /**
         * Checks wether the user is logged in in the original language of the card.
         * Displays a warning message and sets the manifest editor to read only if not.
         *
         * @private
         */
        _checkOriginalLanguage: function () {
            var oModel,
                oLanguages;

            if (!this._isOriginalLanguage()) {
                oModel = this.getView().getModel();
                oLanguages = this._getLanguages();

                oModel.setProperty("/config/originalLanguage", oLanguages.originalLanguage.toUpperCase());
                oModel.setProperty("/config/sapLogonLanguage", oLanguages.logonLanguage.toUpperCase());
                oModel.setProperty("/config/displayOriginalLanguageWarning", true);
                oModel.setProperty("/config/manifestEditorEditable", false);
            }
        },

        /**
         * Checks wether the user is logged in in the original language of the card.
         *
         * @returns {boolean} Is it the original language?
         *
         * @private
         */
        _isOriginalLanguage: function () {
            var oLanguages = this._getLanguages(),
                sOriginalLanguage = oLanguages.originalLanguage.toLowerCase(),
                sSAPLogonLanguage = oLanguages.logonLanguage.toLowerCase(),
                sLanguage = oLanguages.ui5CoreLanguage.toLowerCase();

            return sOriginalLanguage === "" || sOriginalLanguage === sSAPLogonLanguage || sOriginalLanguage === sLanguage;
        },

        /**
         * Retrieves the original language of the card chip instance and the user's logon language
         *
         * @returns {object} Original and logon language
         *
         * @private
         */
        _getLanguages: function () {
            var chipInstance = this.oView.getViewData().chipInstance;

            return {
                originalLanguage: chipInstance.bag.getOriginalLanguage(),
                logonLanguage: Core.getConfiguration().getLocale().getSAPLogonLanguage(),
                ui5CoreLanguage: Configuration.getLanguage()
            };
        }
    });
});
