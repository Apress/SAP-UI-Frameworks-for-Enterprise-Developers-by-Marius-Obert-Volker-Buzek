/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2014 SAP AG. All rights reserved
 */
sap.ui.define([
	'sap/base/Log',
	'sap/ui/base/Object',
	'sap/collaboration/components/utils/OdataUtil',
	'sap/ui/thirdparty/jquery'
], function(Log, BaseObject, OdataUtil, jQuery) {
	"use strict";

	var SMIntegrationDataHandler = BaseObject.extend("sap.collaboration.components.socialtimeline.datahandlers.SMIntegrationDataHandler",{
		/**
		 * Constructor for the Social Media Integration Data handler
		 * This class is now responsible to provide the mapping of the business object to be used by Jam
		 *
		 * @class SMIntegrationDataHandler
		 * @name sap.collaboration.components.socialtimeline.datahandlers.SMIntegrationDataHandler
		 *
		 * @constructor
		 * @param {object} oSMIntegrationModel - Social Media Integration OData model
		 */
		constructor: function(oSMIntegrationModel) {
			this._oLogger = Log.getLogger("sap.collaboration.components.socialtimeline.datahandlers.SMIntegrationDataHandler");

			this._oSMIntegrationModel = oSMIntegrationModel;

			this._oOdataUtil = new OdataUtil();

			this.oJamConfigurationStatusMap = {
				configurationOk: 0,
				configuartionError: 1
			};
		},
		/**
		 * Map the internal object to external object using the SMI OData service
		 *
		 * @param {object} oInternalBO - internal identifier of a business object
		 * 			{string} appContext - application context
		 * 			{string} collection - entity collection
		 * 			{string} key - business object key
		 * 			{string} odataServicePath - path for the business object's OData service
		 * @returns {object} Promise object
		 */
		mapInternalBOToExternalBO: function(oInternalBO){

			var oPromise = this.getExternalObjectMapping(oInternalBO).promise
			.then(function(oData){
				this._oLogger.info("External business object mapping was found.");
				return oData.MapInternalBOToExternalBO;
			}.bind(this));

			return oPromise.promise();
		},

		/**
		 * Get Jam Configuration Status
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 */
		getJamConfigurationStatus : function(fCallerSuccess, fCallerError){
			var sOdataEndPoint = "/GetJamConfigurationStatus";
			var that = this;
			var mParameters = {
					async: false,
					success: function(oData,response){
						if (oData.GetJamConfigurationStatus.StatusCode === that.oJamConfigurationStatusMap.configurationOk){
							fCallerSuccess(true);
						}
						else {
							fCallerSuccess(false);
						}
					},
					error: function(oError){
						that._oLogger.error(JSON.stringify(oError));
						fCallerError();
					}
			};
			this._oSMIntegrationModel.read(sOdataEndPoint, mParameters);
		},


		/**
		 * Get the Mapping for the External Object
		 * @param {object} oInternalBO - internal identifier of a business object
		 * 			{string} appContext - application context
		 * 			{string} collection - entity collection
		 * 			{string} key - business object key
		 * 			{string} odataServicePath - path for the business object's OData service
		 * @returns {object} object containing the object to abort the request and promise
		 */
		getExternalObjectMapping: function(oInternalBO){
			var that = this;
			var sEndpoint = "/MapInternalBOToExternalBO";
			var oPromise = jQuery.Deferred();

			//Passing the URL parameters in a map so the encoding is done in SAPUI5 ODataModel class
			var aUrlParameters = {};
			aUrlParameters["ApplicationContext"] = "'" + oInternalBO.appContext + "'";
			aUrlParameters["ODataCollection"] = "'" + oInternalBO.collection + "'";
			aUrlParameters["ODataKeyPredicate"] = "'" + oInternalBO.key + "'";
			aUrlParameters["ODataServicePath"] = "'" + oInternalBO.odataServicePath + "'";

			var fnSuccess = function(oData, response){
				that._oLogger.info("External object mapping found");
				oPromise.resolve(oData, response);
			};
			var fnError = function(oError){
				that._oLogger.error(oError.response.statusText);
				oPromise.reject(oError);
			};

			var mParameters = {
					context: null,
					urlParameters: aUrlParameters,
					async: true,
					filters: [],
					sorters: [],
					success: fnSuccess,
					error: 	fnError
			};

			return {
				request: this._oSMIntegrationModel.read(sEndpoint,mParameters),
				promise: oPromise.promise()
			};
		}
	});


	return SMIntegrationDataHandler;

});
