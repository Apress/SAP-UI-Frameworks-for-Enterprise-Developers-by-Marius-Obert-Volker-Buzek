/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
    "sap/ui/base/Object"
], function (BaseObject) {
    "use strict";

    /**
     * Base class for the CollaborationHelpers
     * @namespace
     * @since 1.108
     * @alias module:sap/suite/ui/commons/collaboration/BaseHelperService
     * @public
     */
    var BaseHelperService = BaseObject.extend("sap.suite.ui.commons.collaboration.BaseHelperService", {
        constructor: function (oProviderConfig) {
            this._providerConfig = oProviderConfig;
        }
    });

    /**
     * Method that returns the Provider configuration settings
     * @returns {Object} Configuration settings
     * @private
     * @ui5-restricted
     * @experimental Since 1.108
     */
    BaseHelperService.prototype.getProviderConfig = function() {
        return this._providerConfig;
    };

    /**
     * Provides a list of all collaboration options
     * @param {object} oParams Optional argument in case the consumer wants to influence the options, otherwise pass as undefined
     * @param {boolean} oParams.isShareAsLinkEnabled Allow the 'Share as Chat' option to be available in case Microsoft Teams is the collaboration provider
     * @param {boolean} oParams.isShareAsTabEnabled Allow the 'Share as Tab' option to be available in case Microsoft Teams is the collaboration provider
     * @returns {array} Array of available options
     * @public
     */
    BaseHelperService.prototype.getOptions = function() {
        return [];
    };

    /**
     * Method to be called to trigger the 'Share' operation
     *
     * @param {Object} oOption JSON object of collaboration option that is clicked
     * @param {Object} oParams Parameter object which contains the information to be shared
     * @param {string} oParams.url URL of the application which needs to be shared
     * @param {string} oParams.appTitle Title of the application which needs to be used during the integration
     * @param {string} oParams.subTitle Title of the object page which needs to be used during the integration
     * @param {boolean} oParams.minifyUrlForChat Experimental flag. Set the flag to 'true' to minimize the URL if the 'Share as Chat' option is used
     * @returns {void}
     * @public
     */
    BaseHelperService.prototype.share = function(oOption, oParams) {
    };
    return BaseHelperService;
});