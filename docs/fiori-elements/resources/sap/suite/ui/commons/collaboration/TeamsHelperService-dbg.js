/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Core",
    "sap/base/security/URLListValidator",
    "./CollaborationHelper",
    "sap/suite/ui/commons/collaboration/BaseHelperService",
    'sap/ui/core/Element'
], function (Log, Core, URLListValidator, CollaborationHelper, BaseHelperService, Element) {
    "use strict";

    /**
     * Provides the Share options
     * @namespace
     * @since 1.104
     * @alias module:sap/suite/ui/commons/collaboration/TeamsHelperService
     * @private
     * @ui5-restricted
     * @experimental Since 1.108
     */
    var TeamsHelperService = BaseHelperService.extend("sap.suite.ui.commons.collaboration.TeamsHelperService");

    /**
     * sTeamsAppID is hardcoded as of now, will be changed when app is published at org level.
     */
    var COLLABORATION_MSTEAMS_APPID = 'db5b69c6-0430-4ae1-8d6e-a65c2220b50c';
    var oLogger = Log.getLogger("sap.suite.ui.commons.collaboration.TeamsHelperService");

    var oResourceBundle = Core.getLibraryResourceBundle("sap.suite.ui.commons");

    /**
     * Gives list of all Collaboration Options
     * @param {object} oParams Optional argument in case consumer wants to influence the options, otherwise pass as undefined
     * @param {boolean} oParams.isShareAsLinkEnabled Allow Share as Chat option
     * @param {boolean} oParams.isShareAsTabEnabled Allow Share as Tab option
     * @returns {array} Array of available options
     * @private
     * @ui5-restricted
     * @experimental Since 1.108
     */
    TeamsHelperService.prototype.getOptions = function (oParams) {
        var oDefaultParams = {
            isShareAsLinkEnabled: true,
            isShareAsTabEnabled: true
        };

        var oTeamsParams = oParams || oDefaultParams;
        var aOptions = [];
        var aFinalOptions = [];

        if (oTeamsParams.isShareAsLinkEnabled) {
            if (this._providerConfig.isShareAsLinkEnabled) {
                aOptions.push({
                    "text": oResourceBundle.getText("COLLABORATION_MSTEAMS_CHAT"),
                    "key": "COLLABORATION_MSTEAMS_CHAT",
                    "icon": "sap-icon://post",
                    "fesrStepName": "MST:ShareAsLink"
                });
            } else {
                oLogger.info("Share as Chat option is not enabled in the tenant");
            }
        } else {
            oLogger.info("Consumer disable Share as Chat option");
        }

        if (oTeamsParams.isShareAsTabEnabled) {
            // TODO: Share as Tab option is enabled only based on the Feature flag. Communication arrangement will not expose
            // this flag in UI Extension 9.0 delivery. This code will have to be changed to check
            // this._providerConfig.isShareAsTabEnabled once communication arrangement expose this switch and make generally
            // available. Till then feature will work based on the feature toggle
            if (this._isShareAsTabEnabled()) {
                aOptions.push({
                    "text": oResourceBundle.getText("COLLABORATION_MSTEAMS_TAB"),
                    "key": "COLLABORATION_MSTEAMS_TAB",
                    "icon": "sap-icon://image-viewer",
                    "fesrStepName": "MST:ShareAsTab"
                });
            } else {
                oLogger.info("Share as Tab option is not enabled in the tenant");
            }
        } else {
            oLogger.info("Consumer disable Share as Tab option");
        }

        if (aOptions.length === 1) {
            aFinalOptions = aOptions;
            if (aFinalOptions[0].key === "COLLABORATION_MSTEAMS_CHAT") {
                aFinalOptions[0].text = oResourceBundle.getText("COLLABORATION_MSTEAMS_CHAT_SINGLE");
            } else if (aFinalOptions[0].key === "COLLABORATION_MSTEAMS_TAB") {
                aFinalOptions[0].text = oResourceBundle.getText("COLLABORATION_MSTEAMS_TAB_SINGLE");
            }
            return aFinalOptions;
        }

        if (aOptions.length > 1) {
            aFinalOptions.push({
                "type": "microsoft",
                "text": oResourceBundle.getText("COLLABORATION_MSTEAMS_SHARE"),
                "icon": "sap-icon://collaborate",
                "subOptions": aOptions
            });
        }

        return aFinalOptions;
    };

    /**
     * Method to be called to trigger the share operation
     *
     * @param {Object} oOption Option Object/SubObject which is clicked
     * @param {Object} oParams Parameter object which contain the information to share
     * @param {string} oParams.url Url of the application which needs to be shared
     * @param {string} oParams.appTitle Title of the application which needs to be used while integration
     * @param {string} oParams.subTitle Title of the object page which needs to be used while integration
     * @param {boolean} oParams.minifyUrlForChat Experimental flag. Set to true to minify the Url in chat scenario
     * @returns {void}
     * @private
     * @ui5-restricted
     * @experimental Since 1.108
     */
    TeamsHelperService.prototype.share = function (oOption, oParams) {

        if (!oParams.url) {
            oLogger.error("url is not supplied in object so terminating Click");
            return;
        }

        if (!URLListValidator.validate(oParams.url)) {
            oLogger.error("Invalid URL supplied");
            return;
        }

        if (oOption.key === "COLLABORATION_MSTEAMS_CHAT") {
            this._shareAsChat(oParams);
            return;
        }

        if (oOption.key === "COLLABORATION_MSTEAMS_TAB") {
            this._shareAsTab(oParams);
            return;
        }
    };

    /**
     * Helper method which shares the URL as Link
     *
     * @param {Object} oParams Parameter object which contain the information to share
     * @param {string} oParams.url Url of the application which needs to be shared
     * @param {string} oParams.appTitle Title of the application which needs to be used in the chat message
     * @param {string} oParams.subTitle Title of the object page which needs to be used in the chat message
     * @param {boolean} oParams.minifyUrlForChat Experimental flag. Set to true to minify the Url.
     * @returns {void}
     * @private
     * @ui5-restricted
     * @experimental Since 1.108
     */
    TeamsHelperService.prototype._shareAsChat = function (oParams) {
        var newWindow = window.open(
            "",
            "_blank",
            "width=700,height=600"
        );
        var sMessage = oParams.appTitle;
        if (oParams.subTitle.length > 0) {
            sMessage += ": " + oParams.subTitle;
        }

        newWindow.opener = null;
        if (oParams.minifyUrlForChat) {
			CollaborationHelper.compactHash(oParams.url, []).then(function (sShortURL) {
				newWindow.location = "https://teams.microsoft.com/share?msgText=" + encodeURIComponent(sMessage) + "&href=" + encodeURIComponent(sShortURL.url);
			});
		} else {
			newWindow.location = "https://teams.microsoft.com/share?msgText=" + encodeURIComponent(sMessage) + "&href=" + encodeURIComponent(oParams.url);
		}
    };

    /**
     * Helper method which shares the application as a Tab in MS Teams
     *
     * @param {Object} oParams Parameter object which contain the information to share
     * @param {string} oParams.url Url of the application which needs to be shared
     * @param {string} oParams.appTitle Title of the application which needs to be used in the Tab title
     * @param {string} oParams.subTitle Title of the object page which needs to be used in the Tab title
     * @returns {void}
     * @private
     * @ui5-restricted
     * @experimental Since 1.108
     */
    TeamsHelperService.prototype._shareAsTab = function (oParams) {
        var oUshellContainer = sap.ushell && sap.ushell.Container;
        var oURLParsing = oUshellContainer && oUshellContainer.getService("URLParsing");
        var sAppUri = oParams.url;
        var iIndexOfHash = sAppUri.indexOf('#');
        if (iIndexOfHash !== -1) {
            var sUriForHeaderLess = sAppUri.substring(0, iIndexOfHash);
            var iIndexOfQuestionMark = sUriForHeaderLess.indexOf('?', 0);
            var sParam = 'appState=lean&sap-collaboration-teams=true';
            if (iIndexOfQuestionMark !== -1) {
                sUriForHeaderLess = sUriForHeaderLess.substring(0, iIndexOfQuestionMark + 1) + sParam + '&' + sUriForHeaderLess.substring(iIndexOfQuestionMark + 1);
            } else {
                sUriForHeaderLess += ("?" + sParam);
            }
            sAppUri = sUriForHeaderLess + sAppUri.substring(iIndexOfHash);
            iIndexOfHash = sAppUri.indexOf('#');
            var oHashPartOfUri = oURLParsing.parseShellHash(sAppUri.substring(iIndexOfHash));
            oHashPartOfUri.params['sap-ushell-navmode'] = 'explace';
            oHashPartOfUri.params['sap-ushell-next-navmode'] = 'explace';
            var sHashOfUri = oURLParsing.constructShellHash(oHashPartOfUri);
            sAppUri = sAppUri.substring(0, iIndexOfHash) + '#' + sHashOfUri;
        }

        var oData = {
            "subEntityId": {
                "url": sAppUri,
                "appTitle": oParams.appTitle,
                "subTitle": oParams.subTitle,
                "mode": "tab"
            }
        };
        this._getApplicationID().then(function(teamsAppId) {
            var sURL = "https://teams.microsoft.com/l/entity/" + teamsAppId + "/home?&context=" + encodeURIComponent(JSON.stringify(oData));
            sap.m.URLHelper.redirect(sURL, true);
        });
    };

    TeamsHelperService.prototype._getApplicationID = function () {
        var oUshellContainer = sap.ushell && sap.ushell.Container;
        var oURLParsing = oUshellContainer && oUshellContainer.getService("URLParsing");
        return CollaborationHelper._getCurrentUrl().then(function (sCurrentUrl) {
            var sBeforeHashURL = sCurrentUrl.split("#")[0];
            if (sBeforeHashURL.indexOf('?') !== -1) {
                var oParsedUrl = oURLParsing && oURLParsing.parseParameters(sBeforeHashURL.substring(sBeforeHashURL.indexOf('?')));
                if (oParsedUrl &&
                    oParsedUrl["sap-collaboration-xx-TeamsAppId"] &&
                    oParsedUrl["sap-collaboration-xx-TeamsAppId"][0] &&
                    oParsedUrl["sap-collaboration-xx-TeamsAppId"][0].length > 0) {
                    return Promise.resolve(oParsedUrl["sap-collaboration-xx-TeamsAppId"][0]);
                }
                return Promise.resolve(COLLABORATION_MSTEAMS_APPID);
            } else {
                return Promise.resolve(COLLABORATION_MSTEAMS_APPID);
            }
        });
    };

    TeamsHelperService.prototype._isShareAsTabEnabled = function () {
        if (window["sap-ushell-config"] &&
			window["sap-ushell-config"].renderers &&
			window["sap-ushell-config"].renderers.fiori2 &&
			window["sap-ushell-config"].renderers.fiori2.componentData &&
			window["sap-ushell-config"].renderers.fiori2.componentData.config &&
			window["sap-ushell-config"].renderers.fiori2.componentData.config.sapHorizonEnabled) {
                return true;
            }

        return false;
    };

    return TeamsHelperService;
});