/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2014 SAP AG. All rights reserved
 */
sap.ui.define([
	'sap/base/Log',
	'sap/base/security/encodeURL',
	'sap/ui/base/Object',
	'sap/ui/thirdparty/jquery'
], function(Log, encodeURL, BaseObject, jQuery) {
	"use strict";

	var ServiceDataHandler = BaseObject.extend("sap.collaboration.components.socialtimeline.datahandlers.ServiceDataHandler",{
		/**
		 * Constructor for the Service Data handler
		 * This class is responsible with providing the History data for a given business object
		 *
		 * @class ServiceDataHandler
		 * @name sap.collaboration.components.socialtimeline.datahandlers.ServiceDataHandler
		 *
		 * @constructor
		 * @param {Object} oBOModel Business Object OData Service Model
		 * @param {sap.collaboration.components.socialtimeline.datahandlers.TimelineTermsUtility} oTimelineTermsUtility - Utility class for the timeline terminology
		 */
		constructor: function(oBOModel, oTimelineTermsUtility) {
			this._oLogger = Log.getLogger("sap.collaboration.components.socialtimeline.datahandlers.ServiceDataHandler");

			this._oBOModel = oBOModel;
			this._oTimelineTermsUtility = oTimelineTermsUtility;
		},
		/**
		 * Perform the read to retrieve the timeline entries of a given business object
		 * @param {String} sEntityCollection - Entity collection name
		 * @param {String} sBOKey - Business object key
		 * @param {integer} iSkip - Skip token
		 * @param {integer} iTop - Top token
		 * @returns {Object} HTTP request
		 */
		readTimelineEntries: function(sEntityCollection, sBOKey, sOdataFilter, iSkip, iTop){
			var that = this;
			var oPromise = jQuery.Deferred();

			var sEndpoint = this._buildTimelineEntriesEndpoint(sEntityCollection, sBOKey, sOdataFilter, iSkip, iTop);
			var mParameters = {
					context: null,
					urlParameters: null,
					async: true,
					filters: [],
					sorters: [],
					success: function(oData,response){
						oPromise.resolve(oData);
					},
					error: 	function(oError){
						// we need this check since an aborted request also causes an error, but doesn't have a status code and should not be treated as an error
						if (oError.response && oError.response.statusCode){
							that._oLogger.error(oError.body);
							oPromise.reject(oError);
						}
					}
			};

			return {
				request: this._oBOModel.read(sEndpoint, mParameters),
				promise: oPromise.promise()
			};
		},

		/**
		 * Builds the endpoint to get the History
		 * @param {String} sEntityCollection - Entity collection name
		 * @param {String} sBOKey - Business object key
		 * @param {integer} iSkip - Skip token
		 * @param {integer} iTop - Top token
		 * @returns {String} Timeline Entries endpoint
		 */
		_buildTimelineEntriesEndpoint: function(sEntityCollection, sBOKey, sOdataFilter, iSkip, iTop){
			var endpoint = "/" + sEntityCollection + "(" + encodeURL(sBOKey) + ")" +
					"/" + this._oTimelineTermsUtility.getTimelineEntryNavigationPath(sEntityCollection) +
					"?$expand=" + this._oTimelineTermsUtility.getTimelineEntryFields(sEntityCollection).TimelineDetailNavigationPath;
			if (iSkip != undefined){
				endpoint +=	"&$skip=" + iSkip;
			}
			if (iTop != undefined){
				endpoint += "&$top=" + iTop;
			}
			if (sOdataFilter != undefined){
				endpoint += "&$filter=" + sOdataFilter;
			}

			this._oLogger.info("Timeline Entries Endpoint: " + endpoint);
			return endpoint;
		}

	});


	return ServiceDataHandler;

});
