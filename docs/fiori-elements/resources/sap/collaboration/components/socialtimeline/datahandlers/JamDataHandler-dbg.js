/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2014 SAP AG. All rights reserved
 */
sap.ui.define([
	'sap/base/Log',
	'sap/base/security/encodeURL',
	'sap/ui/base/Object',
	'sap/collaboration/components/utils/OdataUtil',
	'sap/ui/thirdparty/jquery'
], function(Log, encodeURL, BaseObject, OdataUtil, jQuery) {
	"use strict";

	var JamDataHandler = BaseObject.extend("sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler",{
		/**
		 * Constructor for the Jam Data handler
		 * This class is responsible for getting and posting requests to Jam
		 *
		 * @class JamDataHandler
		 * @name sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 *
		 * @constructor
		 * @param oCollabModel Collaboration Host OData Service Model (Jam)
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 */
		constructor: function(oCollabModel) {
			this._oLogger = Log.getLogger("sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler");
			this._oOdataUtil = new OdataUtil();

			this._oCollabModel = oCollabModel;
			this._oExternalBObuffer = {}; // buffer for external object from Jam
		},

		// Each request is fully defined by the following information:
		// 1. The request URL.
		// 2. The parameters to add the URL the HTTP request is made to.
		// 3. What to log in case of a success.
		// 4. What to log in case of an error.
		_requestsData: {
			getGroups: {
				url: function(sExternalObjectId) {
					return "/ExternalObjects('" + encodeURL(sExternalObjectId) + "')/Groups";
				},
				urlParameters: function() {
					return {};
				},
				successLog: function(oData, response) {
					return "Groups were successfully retrieved.";
				},
				errorLog: function(oError) {
					this._oLogger.error("Failed to retrieve groups: " + oError.response.statusText);
				}
			},
			getExternalObjectByExidAndObjectType: {
				url: function(sExid, sObjectType, sNextLink) {
					return sNextLink ? sNextLink : "/ExternalObjects_FindByExidAndObjectType";
				},
				urlParameters: function(sExid, sObjectType) {
					return {
						"Exid": "'" + sExid.replace(/'/g, "''") + "'",
						"ObjectType": "'" + sObjectType.replace(/'/g, "''") + "'",
						"$expand": "FeedEntries/Creator"
					};
				},
				successLog: function(oData, response) {
					return "External object found: " + oData.results.Name;
				},
				errorLog: function(oError) {
					this._oLogger.error(oError.response.statusText);
				}
			},
			getFeedEntries: {
				url: function(sExternalObjectId, sNextLink) {
					return sNextLink ? sNextLink : "/ExternalObjects" + "('" + encodeURL(sExternalObjectId) + "')/FeedEntries";
				},
				urlParameters: function() {
					return {
						"$expand": "Creator/MemberProfile"
					};
				},
				successLog: function(oData, response) {
					return "Feed entries were successfully retrieved.";
				},
				errorLog: function(oError) {
					this._oLogger.error("Failed to retrieve feed entries: " + oError.response.statusText);
				}
			},
			getSuggestions: {
				url: function() {
					return "/Members_Autocomplete";
				},
				urlParameters: function(sValue, sGroupId) {
					var urlParameters = {
						"Query": "'" + sValue + "'",
						"$top": "4"
					};
					if (sGroupId) {
						urlParameters.GroupId = "'" + sGroupId + "'";
					}
					return urlParameters;
				},
				successLog: function(oData, response) {
					return "";
				},
				errorLog: function(oError) {
					this._oLogger.error("");
				}
			},
			getAtMentions: {
				url: function(sFeedEntryId) {
					return "/FeedEntries('" + encodeURL(sFeedEntryId) + "')/AtMentions";
				},
				urlParameters: function() {
					return {};
				},
				successLog: function(oData, response) {
					return "@mentions were successfully retrieved.";
				},
				errorLog: function(oError) {
					this._oLogger.error("Failed to retrieve the @mentions: " + oError.response.statusText, oError.stack);
				}
			},
			getReplies: {
				url: function(sFeedEntryId, sNextLink) {
					return sNextLink ? sNextLink : "/FeedEntries('" + encodeURL(sFeedEntryId) + "')/Replies";
				},
				urlParameters: function() {
					return {
						'$orderby': 'CreatedAt desc',
						'$expand': 'Creator'
					};
				},
				successLog: function(oData, response) {
					return "Replies were successfully retrieved.";
				},
				errorLog: function(oError) {
					if (oError.response){
						this._oLogger.error("Failed to retrieve replies: " + oError.response.statusText, oError.stack);
					}
				}
			}
		},

		/**
		 * This method encodes the pattern used for many of the HTTP GET requests.
		 * @param sRequestName - The name of the HTTP GET request.
		 * @param oURLParameters - Additional URL parameters to append to the HTTP GET request's URL.
		 * If the argument received by this method is undefined, null, or an empty object ({}),
		 * then no parameters are appended.
		 * @returns {object} object containing the object to abort the request and promise
		 * @private
		 */
		_doAllTheThings: function(sRequestName, oURLParameters) {
			var that = this;

			// This obtains all the request specific info for the input request.
			var requestObject = this._requestsData[sRequestName];

			// The arguments object is an array like object. The arguments are accessible
			// like elements of an array. For example, the first argument is retrieved
			// with arguments[0]. This method should always have the first two arguments
			// be the name of the request and an object specifying additional URL parameters
			// to append to the HTTP GET request's URL. Below, we create an array object from
			// the arguments object and remove from that array the first two arguments. What
			// remains are the arguments passed to the method calling this method. These
			// arguments are then passed to the request specific functions.
			var requestArguments = Array.prototype.slice.apply(arguments);
			requestArguments.shift(); // Removes the name from the object.
			requestArguments.shift(); // Removes the URL parameters from the object.

			// This is the deferred object which will be used to notify the user
			// that the request is complete.
			var oDeferred = new jQuery.Deferred();

			// The success callback function. Passed to the ODataModel object when
			// initiating the request.
			var success = function(oData, response) {
				that._oLogger.info(requestObject.successLog.apply(that, [oData, response]));
				oDeferred.resolve(oData, response);
			};

			// The error callback function. Passed to the ODataModel object when
			// initiating the request.
			var error = function(oError) {
				requestObject.errorLog.apply(that, [oError]);
				oDeferred.reject(oError);
			};

			// The URL parameters. The URL parameters passed as arguments are
			// added to those already specified for the request. If a URL argument
			// is already specified, then the one passed through the argument will
			// override the one already specified.
			var oCombinedURLParameters =  requestObject.urlParameters.apply(that, requestArguments);
			if (Object.prototype.toString.apply(oURLParameters) === "[object Object]") {
				for (var URLParameter in oURLParameters) {
					oCombinedURLParameters[URLParameter] = oURLParameters[URLParameter];
				}
			}

			// Parameters controlling some aspects of the request. Passed to the ODataModel
			// object when initiating the request.
			var mParameters = {
				context: null,
				urlParameters: oCombinedURLParameters,
				async: true,
				filters: [],
				sorters: [],
				success: success,
				error: error
			};

			// Return an object containing the request, which is abortable, and a promise to attach event handlers to.
			return {
				request: this._oCollabModel.read(requestObject.url.apply(that, requestArguments), mParameters),
				promise: oDeferred.promise()
			};
		},

		/**********************************************************************
		 * GET request functions
		 **********************************************************************/

		/**
		 * Perform GET request to read the groups associated to an external object.
		 * The following inputs are expected:
		 * 1.
		 *   sExternalObjectId is a non empty string.
		 *   sNextLink null.
		 *   oURLParameter is either undefined, null, an empty object ({}) or a non empty object.
		 * 2.
		 *   sExternalObject is null.
		 *   sNextLink is a non empty string.
		 *   oURLParameters is either undefined, null, an empty object ({}) or a non empty object.
		 *
		 * Any other combinations don't make sense.
		 *
		 * @param {string} sExternalObjectId - external object id from Jam
		 * @param {string} sNextLink - next link to get the next page of groups
		 * @param {object} oURLParameters - An object of name-value pairs, where each name and value
		 * will be used to append a parameter of that name with the corresponding value to the
		 * request URL. Example: Suppose the base URL is http://<hostname>/resource?$skip=2, and the argument
		 * is {"$top":"5"}, then the resulting request URL will be http://<hostname>/resource?$skip=2&$top=5.
		 * @returns {object} object containing the object to abort the request and promise
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 */
		getGroups: function(sExternalId, sNextLink, oURLParameters) {
			return this._doAllTheThings("getGroups", oURLParameters, sExternalId, sNextLink);
		},

		/**
		 * Performs a GET request to get an external object from Jam by exid and object type
		 *
		 * @param {string} sExid - OData URL of the business object being shared. This URL is URL for the OData service that exposes the business object that is in the SAP system.
		 * @param {string} sObjectType - OData service's metadata URL appended with a hash (#) symbol and the business object's entity set.
		 * @returns {object} object containing the object to abort the request and promise
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 */
		getExternalObjectByExidAndObjectType: function(oExternalObject, sNextLink) {
			var sBufferKey = oExternalObject.ObjectType + oExternalObject.Exid;
			this._oExternalBObuffer[sBufferKey] = oExternalObject;
			return this._doAllTheThings("getExternalObjectByExidAndObjectType", null, oExternalObject.Exid, oExternalObject.ObjectType, sNextLink);
		},

		/**
		 * Perform GET request to read the feed entries of an external object
		 *
		 * @param {string} sExternalObjectId - external object id from Jam
		 * @param {string} sNextLink - next link to get the next page of feed entries
		 * @returns {object} object containing the object to abort the request and promise
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 */
		getFeedEntries: function(sExternalObjectId, sNextLink) {
			return this._doAllTheThings("getFeedEntries", null, sExternalObjectId, sNextLink);
		},

		/**
		 * Performs a GET request to get the Autocomplete for a specific value in SAP Jam
		 *
		 * @param {string} sValue - The value entered for the Autocomplete and will be used to search in SAP Jam.
		 * @param {string} [sGroupId] - The Group Id
		 * @returns {object} an object which has an abort function to abort the current request
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 */
		getSuggestions: function(sValue, sGroupId) {
			return this._doAllTheThings("getSuggestions", null, sValue, sGroupId);
		},

		/**
		 * Get the @mentions for a specific FeedEntry
		 *
		 * @param {string} sFeedEntryId - Feed entry ID
		 * @returns {object} object containing the object to abort the request and promise
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 */
		getAtMentions: function(sFeedEntryId) {
			return this._doAllTheThings("getAtMentions", null, sFeedEntryId);
		},

		/**
		 * Get the Replies for a specific FeedEntry
		 *
		 * @param {string} sFeedEntryId - Feed entry ID
		 * @param {string} sNextLink - next link to get the next set of replies
		 * @returns {object} object containing the object to abort the request and promise
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 */
		getReplies: function(sFeedEntryId, sNextLink) {
			return this._doAllTheThings("getReplies", null, sFeedEntryId, sNextLink);
		},

		/**
		 * Gets the external object from Jam (with buffer)
		 * 1 - Find the external object by Exid and Object Type
		 * 2 - If the external object is not found, create the external object in Jam
		 *
		 * @param {object} oExternalObjectMapping - Set of URLs used by Jam to create an external object.
		 * 			{string} oExternalObjectMapping.Exid - OData URL of the business object being shared. This URL is URL for the OData service that exposes the business object that is in the SAP system.
		 * 			{string} oExternalObjectMapping.ODataLink - Same as Exid.
		 * 			{string} oExternalObjectMapping.ObjectType - OData service's metadata URL appended with a hash (#) symbol and the business object's entity set.
		 * 			{string} oExternalObjectMapping.ODataMetadata - Same as ObjectType.
		 * 			{string} oExternalObjectMapping.ODataAnnotations - Annotations URL. Specifies to Jam what to display of the business object.
		 * @returns {jQuery.Deferred} Promise object
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 */
		getExternalObject: function(oExternalObjectMapping){
			var that = this;
			var sBufferKey = oExternalObjectMapping.ObjectType + oExternalObjectMapping.Exid;
			var oPromise = jQuery.Deferred();

			if (!this._oExternalBObuffer[sBufferKey]){													// if external object is not in buffer
				var creatingExternalObject = this.postExternalObject(oExternalObjectMapping);			// create external object in Jam
																										// if exist jam will return the existing external object
				creatingExternalObject.promise.done(function(oData, response){
					var oExternalObject = oData.results;
					that._oExternalBObuffer[sBufferKey] = oExternalObject; 								// save to buffer
					oPromise.resolve(oExternalObject);
				});
				creatingExternalObject.promise.fail(function(oError){
					oPromise.reject(oError);
				});
			}
			else {
				oPromise.resolve(this._oExternalBObuffer[sBufferKey]);
			}
			return oPromise.promise();
		},

		/**
		 * Performs a GET request to get the Feed Entry from SAP Jam
		 *
		 * @param {string} sActivityId - Activity Id for the Feed Entry
		 * @returns {object} object containing the object to abort the request and promise
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 * */
		getFeedEntryFromActivity: function(sActivityId){
			var that = this;
			var sEndpoint = "/Activities('" + encodeURL(sActivityId) + "')/FeedEntry";

			var oPromise = jQuery.Deferred();
			var fnSuccess = function(oData, response){
				oPromise.resolve(oData, response);
			};
			var fnError = function(oError){
				that._oLogger.error("Failed to get the feed entry: " + oError.response.statusText);
				oPromise.reject(oError);
			};
			var mParameters = {
					urlParameters: {
						$expand: "Creator"
					},
					async: true,
					success: fnSuccess,
					error: 	fnError
			};
			this._oCollabModel.read(sEndpoint, mParameters);

			return oPromise.promise();
		},

		/**
		 * Perform a $batch request to get the info for several members
		 *
		 * @param {array} aUserEmails - array of emails
		 * @returns {object} object containing the object to abort the request and promise
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 */
		getUserInfoBatch: function(aUserEmails){
			var that = this;

			var aBatchReadOperations = [];
			aUserEmails.forEach(function(sUserEmail){
				var sEndpoint = "/Members_Autocomplete?Query='" + encodeURL(sUserEmail) + "'&$expand=MemberProfile";
				var sMethod = "GET";
				var oData = null;
				var oParameters = null;

				aBatchReadOperations.push(that._oCollabModel.createBatchOperation( sEndpoint, sMethod, oData, oParameters));
			});

			this._oCollabModel.addBatchReadOperations(aBatchReadOperations);

			var bAsync = true;
			var bIsOkToRefreshSecurityToken = true;
			var oPromise = jQuery.Deferred();
			var fnSuccess = function(oData, response){
				var aResults = that._oOdataUtil.parseBatchResponse(oData.__batchResponses);
				oPromise.resolve(aResults, response);
			};
			var fnError = function(oError){
				if (oError.response.statusCode === 403 && bIsOkToRefreshSecurityToken){
					that._oCollabModel.refreshSecurityToken(
							function(){
								bIsOkToRefreshSecurityToken = false;
								that._oCollabModel.addBatchReadOperations(aBatchReadOperations);
								that._oCollabModel.submitBatch(fnSuccess, fnError, bAsync);
							},
							function(oRefreshSecurityTokenError){
								that._oLogger.error("Failed to get member information: " + oRefreshSecurityTokenError.response.statusText);
								oPromise.reject(oRefreshSecurityTokenError);
							},
							true
						);
				}
				else {
					that._oLogger.error("Failed to get member information: " + oError.response.statusText);
					oPromise.reject(oError);
				}
			};
			return {
				request: this._oCollabModel.submitBatch(fnSuccess, fnError, bAsync),
				promise: oPromise.promise()
			};
		},

		/**
		 * Perform a $batch request to get the @mentions for all feeds
		 *
		 * @param {array} aAtMentions - array of @mentions
		 * @returns {object} object containing the object to abort the request and promise
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 */
		getAtMentionsBatch: function(aFeedEntryIds){
			var that = this;
			var iMinBatchSize = 10;
			var aBatchReadOperations = [];
			aFeedEntryIds.forEach(function(sFeedEntryId, index){
				if (index < iMinBatchSize){
					var sEndpoint = "/FeedEntries('" + encodeURL(sFeedEntryId) + "')/AtMentions";
					var sMethod = "GET";
					var oData = null;
					var oParameters = null;

					aBatchReadOperations.push(that._oCollabModel.createBatchOperation(sEndpoint, sMethod, oData, oParameters));
				}
			});

			this._oCollabModel.addBatchReadOperations(aBatchReadOperations);
			var bAsync = true;
			var bIsOkToRefreshSecurityToken = true;
			var oPromise = new jQuery.Deferred();
			var fnSuccess = function(oData, response){
				var aResults = that._oOdataUtil.parseBatchResponse(oData.__batchResponses);
				oPromise.resolve(aResults, response);
			};
			var fnError = function(oError){
				if (oError.response.statusCode === 403 && bIsOkToRefreshSecurityToken){
					that._oCollabModel.refreshSecurityToken(
							function(){
								bIsOkToRefreshSecurityToken = false;
								that._oCollabModel.addBatchReadOperations(aBatchReadOperations);
								that._oCollabModel.submitBatch(fnSuccess, fnError, bAsync);
							},
							function(oRefreshSecurityTokenError){
								that._oLogger.error("Failed to get the feeds @mentions: " + oRefreshSecurityTokenError.response.statusText);
								oPromise.reject(oRefreshSecurityTokenError);
							},
							true
						);
				}
				else {
					that._oLogger.error("Failed to get the feeds @mentions: " + oError.response.statusText);
					oPromise.reject(oError);
				}
			};
			return {
				request: this._oCollabModel.submitBatch(fnSuccess, fnError, bAsync),
				promise: oPromise
			};
		},

		/**
		 *
		 * @returns {___anonymous16587_16678}
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 */
		getSender: function(){
			var that = this;
			var sEndpoint = "/Self";

			var oPromise = jQuery.Deferred();
			var fnSuccess = function(oData, response){
				that._oLogger.info("The reply was successfully posted.");
				oPromise.resolve(oData.results);
			};
			var fnError = function(oError){
				that._oLogger.error("Failed to retrieve the sender: " + oError.response.statusText, oError.stack);
				oPromise.reject(oError);
			};
			var mParameters = {
					urlParameters: null,
					async: true,
					success: fnSuccess,
					error: 	fnError
			};

			return {
				request: this._oCollabModel.read(sEndpoint, mParameters),
				promise: oPromise.promise()
			};
		},

		/**
		 * Get the Feed Entries of a Group
		 * @param {string} sGroupId - Group ID
		 * @param {string} sNextLink
		 * @returns {object} object containing the object to abort the request and promise
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 */
		getGroupFeedEntries: function(sGroupId, sNextLink){
			var that = this;

			var sEndpoint = "";
			if (sNextLink){
				sEndpoint = sNextLink;
			}
			else {
				sEndpoint = "/Groups('" + encodeURL(sGroupId) + "')/FeedEntries";
			}

			var oPromise = jQuery.Deferred();
			var fnSuccess = function(oData, response){
				that._oLogger.info("The feed entries for the group '" + sGroupId + "' were retrieved.");
				oPromise.resolve(oData, response);
			};
			var fnError = function(oError){
				that._oLogger.error("Failed to get feed entries for the group '" + sGroupId + "'." );
				oPromise.reject(oError);
			};
			var mParameters = {
				context: null,
				urlParameters: {
					$expand: "Group,Creator,TargetObjectReference"
				},
				async: true,
				success: fnSuccess,
				error: 	fnError
			};

			return {
				request: this._oCollabModel.read(sEndpoint, mParameters),
				promise: oPromise.promise()
			};
		},

		/**
		 * Get the Feed Entries of a Group Object Feed
		 * @param {string} sGroupId - Group ID
		 * @param {string} sExternalObjectId - Jam External Object ID
		 * @param {string} sNextLink - OData NextLink to retrieve next page of feed entries
		 * @returns {object} object containing the object to abort the request and promise
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 */
		getGroupExternalObjectFeedEntries : function(sGroupId, sExternalObjectId, sNextLink) {
			var that = this;
			var sEndPoint = "";
			var oPromise = jQuery.Deferred();

			if (sNextLink){
				sEndPoint = sNextLink;
			}
			else {
				sEndPoint = "/GroupExternalObjects(GroupId='" + encodeURL(sGroupId) + "',ExternalObjectId='" + encodeURL(sExternalObjectId) + "')/FeedEntries";
			}

			var fnSuccess = function(oData, response){
				that._oLogger.info("The feed entries for the group object wall was retrieved. Group Id is:'" + sGroupId + "', External Object Id is:" + sExternalObjectId + ".");
				oPromise.resolve(oData, response);
			};
			var fnError = function(oError){
				that._oLogger.error("Failed to get feed entries for the group object wall. Group Id is:'" + sGroupId + "', External Object Id is:" + sExternalObjectId + ".");
				oPromise.reject(oError);
			};

			var mParameters = {
					context: null,
					urlParameters: {
						$expand: "Group,Creator,TargetObjectReference"
					},
					async: true,
					success: fnSuccess,
					error: 	fnError
				};

			return {
				request: this._oCollabModel.read(sEndPoint, mParameters),
				promise: oPromise.promise()
			};
		},

		/**********************************************************************
		 * POST request functions
		 **********************************************************************/

		/**
		 * Add a post to an external object in Jam.
		 * 1 - Find the external object in Jam
		 * 2 - Post the feed entry to the object.
		 *
		 * @param {string} sContent - Feed content to be posted
		 * @param {object} oExternalObject
		 *
		 * @returns {jQuery.Deferred} Promise object resolving with a feed entry
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 */
		addPostToExternalObject: function(sContent, oExternalObject){
			var that = this;

			var oPromise =
				this.postFeedEntryToObject(oExternalObject, sContent).promise	// post feed entry to object
					.then(function(oData, response){
						var oActivity = oData.results;
						return that.getFeedEntryFromActivity(oActivity.Id);
					}).then(function(oData, response){
						var oFeedEntry = oData.results;
						return oFeedEntry;
					}).fail(function(oError){
						return oError;
					});

			return oPromise.promise();
		},

		/**
		 * Performs a POST request to create an external object in Jam
		 *
		 * @param {object} oExternalObjectMapping - Set of URLs used by Jam to create an external object.
		 * 			{string} oExternalObjectMapping.Exid - OData URL of the business object being shared. This URL is URL for the OData service that exposes the business object that is in the SAP system.
		 * 			{string} oExternalObjectMapping.ODataLink - Same as Exid.
		 * 			{string} oExternalObjectMapping.ObjectType - OData service's metadata URL appended with a hash (#) symbol and the business object's entity set.
		 * 			{string} oExternalObjectMapping.ODataMetadata - Same as ObjectType.
		 * 			{string} oExternalObjectMapping.ODataAnnotations - Annotations URL. Specifies to Jam what to display of the business object.
		 * @returns {object} object containing the object to abort the request and promise
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 */
		postExternalObject: function(oExternalObjectMapping){
			var that = this;
			var sEndpoint = "/ExternalObjects";
			var oDataPayload = oExternalObjectMapping;

			var oPromise = jQuery.Deferred();
			var postExternalObjectSuccess = function(oData, response){
				that._oLogger.info("External object created. " + oData.results.Name);
				oPromise.resolve(oData, response);
			};
			var postExternalObjectError = function(oError){
				that._oLogger.error("Failed to create external object: " + oError.response.statusText);
				oPromise.reject(oError);
			};
			var mParameters = {
					context: null,
					urlParameters: null,
					async: true,
					success: postExternalObjectSuccess,
					error: 	postExternalObjectError
			};

			return {
				request: this._oCollabModel.create(sEndpoint, oDataPayload, mParameters),
				promise: oPromise.promise()
			};
		},

		/**
		 * Performs a POST request to create a feed entry to the object feed of an existing external object in Jam
		 *
		 * @param {object} oExternalObject - external object from Jam
		 * @param {string} sContent - Desired text for the feed entry
		 * @returns {object} object containing the object to abort the request and promise
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 */
		postFeedEntryToObject: function(oExternalObject, sContent){
			var that = this;
			var sEndpoint = "/Activities";
			var oObject = {};
			oObject.__metadata = oExternalObject.__metadata;
			var oDataPayload = { "Content": sContent, "Object":  oObject, "Verb": "comment" };
			var bIsOkToRefreshSecurityToken = true;

			var oPromise = jQuery.Deferred();
			var fnSuccess = function(oData, response){
				oPromise.resolve(oData, response);
			};
			var fnError = function(oError){
				if (oError.response.statusCode === 403 && bIsOkToRefreshSecurityToken){
					that._oCollabModel.refreshSecurityToken(
							function(){
								bIsOkToRefreshSecurityToken = false;
								that._oCollabModel.create(sEndpoint, oDataPayload, mParameters);
							},
							function(oRefreshSecurityTokenError){
								that._oLogger.error("Failed to get the activity: " + oRefreshSecurityTokenError.response.statusText);
								oPromise.reject(oRefreshSecurityTokenError);
							},
							true
						);
				}
				else {
					that._oLogger.error("Failed to get the activity: " + oError.response.statusText);
					oPromise.reject(oError);
				}
			};
			var mParameters = {
					context: null,
					urlParameters: null,
					async: true,
					success: fnSuccess,
					error: 	fnError
			};

			return {
				request: this._oCollabModel.create(sEndpoint, oDataPayload, mParameters),
				promise: oPromise.promise()
			};
		},

		/**
		 * Post a Reply for a specific FeedEntry
		 *
		 * @param {string} sFeedEntryId - Feed entry ID
		 * @param {string} sReplyText - Reply text to post
		 * @returns {object} object containing the object to abort the request and promise
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 */
		postReply: function(sFeedEntryId, sReplyText){
			var that = this;
			var sEndpoint =  "/FeedEntries('" + encodeURL(sFeedEntryId) + "')/Replies";
			var oDataPayload = { "Text": sReplyText };
			var bIsOkToRefreshSecurityToken = true;

			var oPromise = jQuery.Deferred();
			var fnSuccess = function(oData, response){
				that._oLogger.info("The reply was successfully posted.");
				oPromise.resolve(oData);
			};
			var fnError = function(oError){
				if (oError.response.statusCode === 403 && bIsOkToRefreshSecurityToken){
					that._oCollabModel.refreshSecurityToken(
							function(){
								bIsOkToRefreshSecurityToken = false;
								that._oCollabModel.create(sEndpoint, oDataPayload, mParameters);
							},
							function(oRefreshSecurityTokenError){
								that._oLogger.error("Failed to post reply: " + oRefreshSecurityTokenError.response.statusText, oRefreshSecurityTokenError.stack);
								oPromise.reject(oRefreshSecurityTokenError);
							},
							true
						);
				}
				else {
					that._oLogger.error("Failed to post reply: " + oError.response.statusText, oError.stack);
					oPromise.reject(oError);
				}
			};
			var mParameters = {
					context: null,
					urlParameters: null,
					async: true,
					success: fnSuccess,
					error: 	fnError
			};

			return {
				request: this._oCollabModel.create(sEndpoint, oDataPayload, mParameters),
				promise: oPromise.promise()
			};
		},

		/**
		 * Post a Feed Entry to a Group
		 * @param {string} sGroupId - Group ID
		 * @param {string} sText - Desired text for the feed entry
		 * @returns {object} object containing the object to abort the request and promise
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 */
		postGroupFeedEntry: function(sGroupId, sText){
			var that = this;

			var sEndpoint = "/Groups('" + encodeURL(sGroupId) + "')/FeedEntries";

			var oDataPayload = { "Text": sText };

			var oPromise = jQuery.Deferred();
			var fnSuccess = function(oData, response){
				that._oLogger.info("Feed entry was successfully posted to Group '" + sGroupId + "'.");
				oPromise.resolve(oData, response);
			};
			var fnError = function(oError){
				that._oLogger.error("Failed to post feed entry to group '" + sGroupId + "'." );
				oPromise.reject(oError);
			};
			var mParameters = {
				context: null,
				urlParameters: null,
				async: true,
				success: fnSuccess,
				error: 	fnError
			};

			return {
				request: this._oCollabModel.create(sEndpoint, oDataPayload, mParameters),
				promise: oPromise.promise()
			};
		},

		/**
		 * REMARKS MISSING
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.JamDataHandler
		 */
		postGroupExternalObjectFeedEntry : function(sGroupId, sExternalObjectId, sText) {
			var that = this;
			var sEndPoint = "/GroupExternalObjects(GroupId='" + encodeURL(sGroupId) + "',ExternalObjectId='" + encodeURL(sExternalObjectId) + "')/FeedEntries";
			var oDataPayload = { "Text": sText };
			var oPromise = jQuery.Deferred();

			var fnSuccess = function(oData, response){
				that._oLogger.info("Feed entry was successfully posted to group object wall. Group Id is:'" + sGroupId + "', External Object Id is:" + sExternalObjectId + ".");
				oPromise.resolve(oData, response);
			};
			var fnError = function(oError){
				that._oLogger.error("Failed to post feed entry to group object wall. Group Id is:'" + sGroupId + "', External Object Id is:" + sExternalObjectId + ".");
				oPromise.reject(oError);
			};

			var mParameters = {
					context: null,
					urlParameters: null,
					async: true,
					success: fnSuccess,
					error: 	fnError
				};

			return {
				request: this._oCollabModel.create(sEndPoint, oDataPayload, mParameters),
				promise: oPromise.promise()
			};
		},

		/**
		 * Get the number of new updates since the latest feed entry
		 * @param {string} LatestFeedEntryId
		 * @param {string} ExternalObjectId
		 * @return {object} Deferred object for the request
		 *
		 * @public
		 * @memberOf sap.collaboration.components.feed.BOMode
		 */
		getFeedUpdatesLatestCount : function(LatestTopLevelId, ExternalObjectId) {
			var gettingFeedUpdates = jQuery.Deferred();

			var sPath = "/ExternalObject_FeedLatestCount";
			var mParameters = {
				"urlParameters": {
					LatestTopLevelId: "'" + LatestTopLevelId + "'",
					Id: "'" + ExternalObjectId + "'"
				},
				"success": function(oData, response) {
					gettingFeedUpdates.resolve(oData, response);
				},
				"error": function(oError) {
					gettingFeedUpdates.reject(oError);
				}
			};

			return gettingFeedUpdates.promise(this._oCollabModel.read(sPath, mParameters));
		}

	});


	return JamDataHandler;

});
