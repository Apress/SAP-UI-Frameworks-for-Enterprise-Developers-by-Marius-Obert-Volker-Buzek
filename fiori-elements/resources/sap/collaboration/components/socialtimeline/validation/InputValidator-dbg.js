/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2015 SAP AG. All rights reserved
 */
sap.ui.define([
	'sap/base/Log',
	'sap/base/util/isEmptyObject',
	'sap/collaboration/library',
	'sap/ui/base/Object',
	'sap/collaboration/components/socialtimeline/annotations/TimelineTermsUtility'
],
	function(Log, isEmptyObject, library, BaseObject, TimelineTermsUtility) {
	"use strict";

	var InputValidator = BaseObject.extend("sap.collaboration.components.socialtimeline.validation.InputValidator", {
		constructor: function(oSocialTimeline){
			this._oLogger = Log.getLogger("sap.collaboration.components.socialtimeline.validation.InputValidator");

			this._bCustomFilterValid = true;
			this._bSocialFeaturesEnabled = true;
			this._bBackendFeaturesEnabled = true;

			this._oSocialTimeline = oSocialTimeline;

			// run the validation
	//		this._validateCustomFilter();
	//		this._validateEnableSocial();
		},
		/**
		 * Returns true if the Custom Filters are valid.
		 * @public
		 * @returns {Boolean}
		 *
		 * @memberOf sap.collaboration.components.socialtimeline.validation.InputValidator
		 */
		areCustomFiltersValid: function(){
			return this._bCustomFilterValid;
		},
		/**
		 * Returns true if the Social Features are enabled. (Jam configuration is ok)
		 * @public
		 * @returns {Boolean}
		 *
		 * @memberOf sap.collaboration.components.socialtimeline.validation.InputValidator
		 */
		areSocialFeaturesEnabled: function(){
			return this._bSocialFeaturesEnabled;
		},
		/**
		 * Returns true if the Backend Features are enabled. (Business Record Service is ok)
		 * @public
		 * @returns {Boolean}
		 *
		 * @memberOf sap.collaboration.components.socialtimeline.validation.InputValidator
		 */
		areBackendFeaturesEnabled: function(){
			return this._bBackendFeaturesEnabled;
		},
		/**
		 * Returns true is the Business Object Map is valid.
		 *
		 * Note: Validating the return statement for the function customActionCallback is done when the function gets executed in the method
		 * TimelineDataHandler._mapTimelineEntriesToTimelineItems. Here we validate whether the customActionCallback is a function.
		 * @public
		 * @returns {Boolean}
		 *
		 * @memberOf sap.collaboration.components.socialtimeline.validation.InputValidator
		 */
		isBusinessObjectMapValid: function(oBusinessObjectMap){
			var isValid = true;
			if (typeof (oBusinessObjectMap) !== 'object'){
				this._oLogger.error("The argument passed to the function 'setBusinessObjectMap' is of type "
						+ typeof (oBusinessObjectMap) + ", expected type is object.");
				isValid = false;
			}
			else if (!oBusinessObjectMap.collection || !oBusinessObjectMap.applicationContext || !oBusinessObjectMap.servicePath){
				this._oLogger.error("The object passed to the method setBusinessObjectMap has property 'collection', 'applicationContext', or 'servicePath' as undefined.");
				isValid = false;
			}
			else if (typeof (oBusinessObjectMap.collection) !== 'string' || typeof (oBusinessObjectMap.applicationContext) !== 'string' || typeof (oBusinessObjectMap.servicePath) !== 'string'){
				this._oLogger.error("The property 'collection', 'applicationContext', or 'servicePath' in the object passed to the method setBusinessObjectMap is not a string.");
				isValid = false;
			}
			else if (oBusinessObjectMap.customActionCallback && typeof (oBusinessObjectMap.customActionCallback) !== 'function'){
				this._oLogger.error("The type defined for the property 'customActionCallback' is "
						+ typeof (oBusinessObjectMap.customActionCallback) + ", expected type is function.");
				isValid = false;
			}
			return isValid;
		},

		/**
		 * Returns true if business object is valid
		 * @public
		 * @returns {Boolean}
		 *
		 * @memberOf sap.collaboration.components.socialtimeline.validation.InputValidator
		 */
		isBusinessObjectValid: function(oBusinessObject){
			var isValid = true;

			if (!oBusinessObject.key){
				this._oLogger.error("The key in the object passed to the function 'setBusinessObject' is undefined.");
				isValid = false;
			}
			else if (typeof (oBusinessObject.key) !== 'string'){
				this._oLogger.error("The key in the object passed to the function 'setBusinessObject' is not of type string.");
				isValid = false;
			}
			if (!oBusinessObject.name){
				this._oLogger.error("The name in the object passed to the function 'setBusinessObject' is undefined.");
				isValid = false;
			}
			else if (typeof (oBusinessObject.name) !== 'string'){
				this._oLogger.error("The name in the object passed to the function 'setBusinessObject' is not of type string.");
				isValid = false;
			}
			return isValid;
		},
		/**
		 * Create the timeline terms utility and service data handler AND
		 * at the same time checks if the backend service is compatible with the Social Timeline.
		 * The constructor of timeline terms utility throws an exception if the backend service is not compatible with the Social Timeline.
		 * @public
		 * @param {object} oServiceModel - Business object service model
		 * @return {object} The timeline terms utility class
		 * @memberOf sap.collaboration.components.socialtimeline.validation.InputValidator
		 */
		createTermsUtilityForBackend: function(oServiceModel) {
			var oTimelineTermsUtility;
			try {
				oTimelineTermsUtility = new TimelineTermsUtility(oServiceModel.getServiceMetadata(), oServiceModel.getServiceAnnotations());
				this._bBackendFeaturesEnabled = true;
			}
			catch (oError) {
				oTimelineTermsUtility = undefined;
				this._bBackendFeaturesEnabled = false;
				this._oLogger.error("The Business Object Service is not configured properly.");
				this._oSocialTimeline._oCommonUtil.displayError();
			}
			return oTimelineTermsUtility;
		},
		/**
		 * Validates the enableSocial flag to see if Social Features are ok
		 * @public
		 * @return {boolean} valid = true
		 * @memberOf sap.collaboration.components.socialtimeline.validation.InputValidator
		 */
		validateEnableSocial: function(){

			if (this._oSocialTimeline.getEnableSocial() === true) {
				return this._bSocialFeaturesEnabled = this._checkJamConfiguration();
			}
			else {
				return this._bSocialFeaturesEnabled = false;
			}
		},
		/**
		 * Validates the customFilter
		 * @public
		 * @return {boolean} valid = true
		 * @memberOf sap.collaboration.components.socialtimeline.validation.InputValidator
		 */
		validateCustomFilter: function(){
			var aCustomFilter = this._oSocialTimeline.getCustomFilter();
			this._bCustomFilterValid = true;
			if (!isEmptyObject(aCustomFilter)) {
				if (!Array.isArray(aCustomFilter)) {
					this._oLogger.error("The type defined for the property 'customFilter' is " + typeof (aCustomFilter) + ", expected type is array.");
					this._bCustomFilterValid = false;
					// DO NOT REMOVE - decision pending on whether we should destroy component or not
					//this.setCustomFilter([]);
				}
				else {
					for (var i = 0; i < aCustomFilter.length; i++) {
						if (!aCustomFilter[i].value || !aCustomFilter[i].text
								|| typeof (aCustomFilter[i].value) !== "string" || typeof (aCustomFilter[i].text) !== "string") {
							this._oLogger.error("The type defined for the property 'text' or 'value' for the filter " + JSON.stringify(aCustomFilter[i]) + " is undefined or not of type 'string'.");
							this._bCustomFilterValid = false;
							// DO NOT REMOVE - decision pending on whether we should destroy component or not
							//this._oLogger.error("The value or text for the filter " + JSON.stringify(aCustomFilter[i]) + " is not defined or not a string. It has been removed from the filter list.");
							//aCustomFilter.splice(i, 1);
							//i--;
						}
					}
				}
			}
			return this._bCustomFilterValid;
		},

		/**
		 * Check Jam Configuration
		 * This method is responsible to check Jam configuration status
		 * if status is false, all social features of the timeline should be hidden
		 * @private
		 * @memberOf sap.collaboration.components.socialtimeline.validation.InputValidator
		 */
		_checkJamConfiguration : function() {
			var bStatusOk = true;
			var that = this;
			var fSuccess = function(bConfigurationStatus) {
				if (bConfigurationStatus === false) {
					bStatusOk = false;
				}
			};
			var fError = function(sError) {
				that._oSocialTimeline._oCommonUtil.displayError();
			};
			this._oSocialTimeline._oSMIntegrationDataHandler.getJamConfigurationStatus(fSuccess, fError);

			return bStatusOk;
		},

	});

	return InputValidator;

});
