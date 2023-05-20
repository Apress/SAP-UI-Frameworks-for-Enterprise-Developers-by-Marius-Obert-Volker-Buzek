/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2014 SAP AG. All rights reserved
 */
sap.ui.define([
	'sap/base/Log',
	'sap/ui/base/Object',
	'sap/ui/thirdparty/jquery',
	'sap/collaboration/components/socialtimeline/filter/FilterType'
], function(Log, BaseObject, jQuery, FilterType) {
	"use strict";

	var TimelineDataHandler = BaseObject.extend("sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler",{
		/**
		 * Constructor for the Timeline Data Handler
		 * This class is responsible for providing the data for the Timeline control.
		 *
		 * @class TimelineDataHandler
		 * @name sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 *
		 * @constructor
		 * @param oBusinessObjectMap - JSON object containing the following properties:
		 * 	<ul>
		 * 		<li>{sap.ui.model.odata.ODataModel} serviceModel required - OData model to retrieve timeline entries
		 * 		<li>{string} servicePath: The relative path to the OData service for the business object (example: "/sap/opu/odata/sap/ODATA_SRV")
		 * 		<li>{string} collection: Entity collection name of the business object
		 * 		<li>{string} applicationContext: The application context (example: "CRM", "SD", etc.)
		 * 		<li>{function} customActionCallback: A callback function to determine which timeline entries should receive the custom action. The function should return an array of text/value objects.
		 * 	<ul>
		 * @param {object} oJamDataHandler - Jam data handler
		 * @param {object} oSMIntegrationDataHandler - Social Media Integration data handler
		 * @param {object} oServiceDataHandler - Business Object Service data handler
		 * @param {object} oTimelineTermsUtility - Terms Utility for the Business Object Service
		 * @param {integer} iPageSize - The page size to be returned to the timeline
		 * @param {boolean} bSocialFeaturesEnabled - Social Features Enabling flag
		 * @param {boolean} bBackendFeaturesEnabled - Backend Features Enabling flag
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		constructor: function(oBusinessObjectMap, oJamDataHandler, oSMIntegrationDataHandler, oServiceDataHandler, oTimelineTermsUtility, iPageSize, bSocialFeaturesEnabled, bBackendFeaturesEnabled) {
			this._oLogger = Log.getLogger("sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler");
			this._oFilterConstants = new FilterType();

			this._oBusinessObjectMap = oBusinessObjectMap;

			this._oJamDataHandler = oJamDataHandler;
			this._oServiceDataHandler = oServiceDataHandler;
			this._oTimelineTermsUtility = oTimelineTermsUtility;
			this._oSMIntegrationDataHandler = oSMIntegrationDataHandler;

			this._bSocialFeaturesEnabled = bSocialFeaturesEnabled;
			this._bBackendFeaturesEnabled = bBackendFeaturesEnabled;

			this._iPageSize = iPageSize;
			this._iPageSize = iPageSize;
			this._iTimelineEntriesPageSize = iPageSize;
			this._iTimelineEntriesSkip = 0;
			this._iFeedEntriesPageSize = iPageSize * 2;

			this._sBusinessObjectKey = "";
			this._sFeedEntriesNextLink = "";

			this._fCustomActionCallBack = oBusinessObjectMap.customActionCallback;

			this._aTimelineEntries = [];
			this._aFeedEntries = [];

			this._oExternalBO = {};
			this._oMemberDataBuffer = {};
			this._oExternalBOMapping = {};
		},

		/**
		 * Set the business object for the timeline data handler and reset the skip token
		 * @param {string} sKey - Business Object Key
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		setBusinessObject: function( oObject ){
			this._setBusinessObjectValues(oObject);
			this._resetBusinessObjectData();
			this.getExternalBOMapping();
		},

		/**
		 * Resets the timeline data by setting the skip counter to 0, the next link to an empty string,
		 * and the timeline/feed entries to an empty array.
		 *
		 * When changing the filter, the reset method should be called.
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		reset: function(){
			this._iTimelineEntriesSkip = 0; // reset timeline skip counter
			this._iTimelineEntriesPageSize = this._iPageSize; // reset timeline page size

			this._sFeedEntriesNextLink = ""; // reset feed entries next link
			this._aTimelineEntries = []; // empty timeline entries
			this._aFeedEntries = []; // empty feed entries
		},

		/**
		 * Based on the filter, returns the data for the Timeline Control one page at a time.
		 * To get the next page of data, the application can just call this method again.
		 *
		 * The business object key must be set using setBusinessObject before calling this function.
		 *
		 * @param {Object} oFilter - Filter object
		 * @returns {jQuery.Deferred} Promise to handle success or failure
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		getTimelineData: function(oFilter, oBusinessObject){
			var oPromise = jQuery.Deferred();
			var that = this;

			if (oFilter.type === this._oFilterConstants.FILTER_TYPE.feedUpdates) {
				if (oBusinessObject) {
					this._setBusinessObjectValues(oBusinessObject);
					this._resetBusinessObjectData();
					oPromise = this.getExternalBOMapping().then(function() {
						return that._getExternalObjectJamOnlyFeedEntries();
					});
				}
				else {
					oPromise = this._getExternalObjectFeedEntries();
				}
			}
			else if (oFilter.type === this._oFilterConstants.FILTER_TYPE.systemUpdates || oFilter.type === this._oFilterConstants.FILTER_TYPE.custom){
				oPromise = this._getTimelineEntries(oFilter);
			}
			else {
				// if a wrong filter type is passed, return nothing
				this._oLogger.error("The filter type is invalid.");
				oPromise.resolve([]);
			}

			return oPromise.promise();
		},

		/**
		 * Get external object mapping
		 * The business object key must be set using setBusinessObject before calling this function.
		 * Get the external object mapping from the SM Integration service
		 *
		 * @returns {jQuery.Deferred} Promise to handle success or failure
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		getExternalBOMapping: function(){
			var oInternalBO = {
					"appContext": this._oBusinessObjectMap.applicationContext,
					"collection": this._oBusinessObjectMap.collection,
					"name": this._sBusinessObjectName,
					"key": this._sBusinessObjectKey,
					"odataServicePath": this._oBusinessObjectMap.servicePath
			};

			var oPromise = this._oSMIntegrationDataHandler.mapInternalBOToExternalBO(oInternalBO)	// Get external object mapping
				.then(function(oExternalBOMapping){
					this._oExternalBOMapping = oExternalBOMapping;
					this._oExternalBOMapping.Name = this._sBusinessObjectName;
				}.bind(this));

			return oPromise.promise();
		},

		/**
		 * Set business object values
		 * @param {object} oBusinessObject
		 * @private
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		_setBusinessObjectValues: function(oBusinessObject) {
			this._sBusinessObjectKey = oBusinessObject.key;
			this._sBusinessObjectName = oBusinessObject.name;
		},

		/**
		 * Reset business object data for new business object selection
		 * @private
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		_resetBusinessObjectData: function() {
			this.reset();

			// Abort request if there is still one running
			if (this._oTimelineEntriesReadRequest){
				this._oTimelineEntriesReadRequest.abort();
			}
			// Abort request if there is still one running
			if (this._oFeedEntriesReadRequest){
				this._oFeedEntriesReadRequest.abort();
			}
		},

		/**
		 * Get the feed entries for the current object
		 * The business object key must be set using setBusinessObject before calling this function.
		 *
		 * 1- Get the external object
		 * 2- Get the feed entries for external object
		 * 3- Map the feed entries to timeline items
		 *
		 * @returns {jQuery.Deferred} Promise to handle success or failure
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		_getExternalObjectFeedEntries: function(){
			var that = this;
			var oPromise = this._oJamDataHandler.getExternalObject(this._oExternalBOMapping)	// Get external object
			.then(function(oExternalBO){
				that._oExternalBO = oExternalBO;
				if (that._sFeedEntriesNextLink == undefined){
					var gettingFeedEntries = jQuery.Deferred();
					gettingFeedEntries.resolve({"results":[]}, null);
					return {
						request: null,
						promise: gettingFeedEntries
					};
				}
				// if the link in buffer is "", then get the first page of feed entries
				else if (that._sFeedEntriesNextLink == ""){
					return that._oJamDataHandler.getFeedEntries(oExternalBO.Id);
				}
				// if the next link in buffer is defined, then get the next page of feed entries defined by the next link
				else {
					return that._oJamDataHandler.getFeedEntries(null, that._sFeedEntriesNextLink);
				}
			})
			.then(function(oGettingFeedEntries){
				that._oFeedEntriesReadRequest = oGettingFeedEntries.request; // save the request
				return oGettingFeedEntries.promise;
			})
			.then(function(oFeedEntries){
				that._sFeedEntriesNextLink = oFeedEntries.__next; 	// save the next link
				return oFeedEntries.results;						// return the data
			})
			.then(function(aFeedEntries){
				return that._mapFeedEntriesToTimelineItems(aFeedEntries);
			});

			return oPromise.promise();
		},

		/**
		 * Get the feed entries for the current Business Object
		 * The current Business Object key must be set using setBusinessObject before calling this function.
		 *
		 * 1- Get the external object
		 * 2- Get the feed entries for external object
		 * 3- Map the feed entries to timeline items
		 *
		 * @returns {jQuery.Deferred} Promise to handle success or failure
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		_getExternalObjectJamOnlyFeedEntries: function() {
			var fnGetFeeds = function() {
				var oPromise = jQuery.Deferred();

				if (this._sFeedEntriesNextLink === undefined) {
					var gettingFeedEntries = jQuery.Deferred();
					gettingFeedEntries.resolve({"results":[]}, null);
					oPromise = {
						request: null,
						promise: gettingFeedEntries
					};
				}
				// if the link in buffer is "", then get the first page of feed entries
				else if (this._sFeedEntriesNextLink === "") {
					oPromise = this._oJamDataHandler.getExternalObjectByExidAndObjectType(this._oExternalBOMapping);
				}
				// if the next link in buffer is defined, then get the next page of feed entries defined by the next link
				else {
					oPromise = this._oJamDataHandler.getExternalObjectByExidAndObjectType(null, this._sFeedEntriesNextLink);
				}

				return oPromise.promise;
			}.bind(this);

			var oPromise = fnGetFeeds()
			.then(function(oExternalObject) {
				this._oExternalBO = oExternalObject.results;
				var oFeedEntries = oExternalObject.results.FeedEntries;
				this._sFeedEntriesNextLink = oFeedEntries.__next; 	// save the next link
				return this._mapFeedEntriesToTimelineItems(oFeedEntries.results);
			}.bind(this));

			return oPromise.promise();
		},

		/**
		 * Get timeline entries from the backend
		 * 1- get timeline entries from backend service
		 * 2- map the timeline entries into timeline items
		 * 3- get the pictures of the timeline items from Jam
		 *
		 * @param {object} oFilter
		 * @returns {object} oPromise
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		_getTimelineEntries: function(oFilter){
			var that = this;
			// if the filter is set to get all of the backend entries, then in fact there shouldn't be a filter set. In the method
			// this._oServiceDataHandler.readTimelineEntries(...) there is a check for this. If the filter is set to undefined then the
			// parameter $filter is omitted when making the request in method this._oServiceDataHandler.readTimelineEntries(...).
			var sBackendFilter = oFilter.type;
			if (sBackendFilter !== this._oFilterConstants.FILTER_TYPE.custom){
				sBackendFilter = undefined;
			}
			else {
				sBackendFilter = oFilter.value;
			}
			var readingTimelineEntries = this._oServiceDataHandler.readTimelineEntries( this._oBusinessObjectMap.collection, this._sBusinessObjectKey, sBackendFilter, this._iTimelineEntriesSkip, this._iTimelineEntriesPageSize);
			this._oTimelineEntriesReadRequest = readingTimelineEntries.request; // save request

			var gettingTimelineEntries =
				readingTimelineEntries.promise
				.then(function(TLData){
					var aTimelineEntries = TLData.results;

					that._iTimelineEntriesPageSize = aTimelineEntries.length;
					that._iTimelineEntriesSkip += that._iTimelineEntriesPageSize;
					return that._mapTimelineEntriesToTimelineItems(aTimelineEntries);  // map TE to TI
				})
				.then(function(aTimelineItems){
					if (that._bSocialFeaturesEnabled === true){
						return that._fillPicturesForTimelineItems(aTimelineItems); // fill pictures
					}
					return aTimelineItems;
				});

			return gettingTimelineEntries.promise();
		},

		/**
		 * Fill the empty userPicture property of the Timeline items
		 * @param {array} aTimelineItems - timeline items
		 * @returns {object} Promise object
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		_fillPicturesForTimelineItems: function(aTimelineItems){
			var that = this;
			var oPromise = jQuery.Deferred();
			var aEmails = [];

			// Find emails of  timeline items with no picture
			aTimelineItems.forEach(function(oTimelineItem){
				if (!oTimelineItem.timelineItemData.userPicture){
					aEmails.push(oTimelineItem.timelineItemData.userEmail);
				}
			});
			// remove duplicate emails
			var aUniqueEmails = aEmails.filter(function(element,index){
				return aEmails.indexOf(element) == index;
			});

			if (aUniqueEmails.length > 0){
				var gettingUserInfoBatch = this._oJamDataHandler.getUserInfoBatch(aUniqueEmails);
				gettingUserInfoBatch.promise.done(function(aUserInfo){
					// remove empty user info
					var aUserInfoFiltered = jQuery.grep(aUserInfo, function(oUserInfo){
						return oUserInfo.results.length > 0;
					});
					// add user info to buffer
					aUserInfoFiltered.forEach(function(oUserInfo){
						that.addUserInfoToBuffer(oUserInfo.results[0]);
					});
					// fill the pictures
					aTimelineItems.forEach(function(oTLItem){
						if (!oTLItem.timelineItemData.userPicture){
							oTLItem.timelineItemData.userPicture = that.getUserPicture(oTLItem.timelineItemData.userEmail);
						}
					});
					oPromise.resolve(aTimelineItems);
				});
				gettingUserInfoBatch.promise.fail(function(oError){
					oPromise.resolve(aTimelineItems);
				});
			}
			else {
				oPromise.resolve(aTimelineItems);
			}
			return oPromise.promise();
		},

		/**
		 * Get the @mentions per Feed Entry
		 * @param {object} oFeedEntry - A single feed entry
		 * @returns {object} mentions object
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		_getAtMentions: function(oFeedEntry){

			var oAtMentions = {};
			var gettingAtMentions = this._oJamDataHandler.getAtMentions(oFeedEntry.Id);

			gettingAtMentions.promise.done(function(oJamResults, response){

				var aJamResults = oJamResults.results;

				for (var i = 0; i < aJamResults.length; i++){
					if (aJamResults[i]){
						oAtMentions[i] = aJamResults[i];
					}
				}
			});

			gettingAtMentions.promise.fail(function(){
				this._oLogger.error('Failed to get the @mentions.');
			});

			return oAtMentions;
		},

		/************************************************************************************************
		 * Mapping Feed Entries to Timeline Items
		 ************************************************************************************************/
		/**
		 * Map a collection of the Feed Entries into items for the Timeline control
		 * @param {Array} aFeedEntries - Array of feed entries
		 * @returns {Array} - Timeline items
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		_mapFeedEntriesToTimelineItems: function(aFeedEntries){
			var that = this;
			var oTimelineItems = [];

			aFeedEntries.forEach(function(oFeedEntry){
				var oTLItem = {};
				oTLItem.timelineItemData = that._mapFeedEntryToTimelineItem(oFeedEntry);
				oTLItem._feedEntryData = oFeedEntry; // keep original feed entry data
				if ( oFeedEntry.ConsolidatedCount > 1){
					oTLItem._feedEntryData._consolidatedUrl = "<collaboration_host_url>" + oFeedEntry.Id; //removed hardcoded internal URL for security reasons
				}
				oTimelineItems.push(oTLItem);
			});
			return oTimelineItems;
		},

		/**
		 * Map a single Feed Entry into an item for the Timeline control
		 * @param {object} oFeedEntry - A single feed entry
		 * @returns {object} Timeline item
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		_mapFeedEntryToTimelineItem: function(oFeedEntry){
			var POST_ICON = "sap-icon://post";

			if (!this.getUserInfoFromBuffer(oFeedEntry.Creator.Email)){
				this.addUserInfoToBuffer(oFeedEntry.Creator);
			}

			var oTimelineItem = {
					feedId: oFeedEntry.Id,
					dateTime: oFeedEntry.CreatedAt,
					userName: oFeedEntry.Creator.FullName,
					userEmail: oFeedEntry.Creator.Email,
					title: oFeedEntry.Action,
					text: oFeedEntry.Text,
					textWithPlaceholders: oFeedEntry.TextWithPlaceholders,
					replyCount: oFeedEntry.RepliesCount,
					icon: POST_ICON
			};

			oTimelineItem.userPicture = this.getUserPicture(oTimelineItem.userEmail);

			return oTimelineItem;
		},

		/************************************************************************************************
		 * Mapping Timeline Entries to Timeline Items
		 ************************************************************************************************/
		/**
		 * Map a collection of the Timeline Entries into items for the Timeline control
		 * @param {Array} aTimelineEntriesData - Array of timeline entries
		 * @returns {Array} - Timeline items
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		_mapTimelineEntriesToTimelineItems: function(aTimelineEntriesData){
			var that = this;
			var oTimelineItems = [];

			aTimelineEntriesData.forEach(function(oTimelineEntry){
				var oTLItem = {};
				oTLItem.timelineItemData = that._mapTimelineEntryToTimelineItem(oTimelineEntry);

				// custom actions
				var aCustomActions = undefined;
				if (that._fCustomActionCallBack){
					aCustomActions = that._fCustomActionCallBack(oTimelineEntry);
					if (aCustomActions){
						/*
						 * Validation for the customActionCallback
						 */
						var bCustomActionsOK = true;
						// check if the return statement is an array
						if (!Array.isArray(aCustomActions)){
							that._oLogger.error("The type defined for the return statement of the function 'customActionCallback' is "
									+ typeof (aCustomActions) + ", expected type is array. Custom actions have been removed.");
							bCustomActionsOK = false;
						}
						else {
							// loop through each item in the array to check:
							// 1. if the item is an object
							// 2. each object contains the property 'key' and 'value'
							// 3. if the property 'value' is the type 'string', the property 'key' can be of any type
							for (var i = 0; i < aCustomActions.length; i++){
								if (typeof (aCustomActions[i]) !== 'object'){
									that._oLogger.error("The function 'customActionCallback' returned the item " + JSON.stringify(aCustomActions[i])
											+ " of type " + typeof (aCustomActions[i]) + ", expected type is object. Custom actions have been removed.");
									bCustomActionsOK = false;
									break;
								}
								else if (!aCustomActions[i].key || !aCustomActions[i].value){
									that._oLogger.error("The function 'customActionCallback' returned the item " + JSON.stringify(aCustomActions[i])
											+ " with the property 'key' or 'value' as undefined. Custom actions have been removed.");
									bCustomActionsOK = false;
									break;
								}
								else if (typeof (aCustomActions[i].value) !== 'string'){
									that._oLogger.error("The function 'customActionCallback' returned the item " + JSON.stringify(aCustomActions[i])
											+ " with the property 'value' as type " + typeof (aCustomActions[i].value)
											+ ", expected type is string. Custom actions have been removed.");
									bCustomActionsOK = false;
									break;
								}
							}
						}

						if (bCustomActionsOK){
							aCustomActions.oDataEntry = oTimelineEntry;
							oTLItem.timelineItemData.customActionData = aCustomActions;
						}
					}
				}
				oTimelineItems.push(oTLItem);
			});
			return oTimelineItems;
		},

		/**
		 * Map a single Timeline Entry into an item for the Timeline control
		 * @param {object} oTimelineEntry - A single timeline entry
		 * @returns {object} Timeline item
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		_mapTimelineEntryToTimelineItem: function(oTimelineEntry){
			var oTimelineEntryFields = this._oTimelineTermsUtility.getTimelineEntryFields(this._oBusinessObjectMap.collection);

			var oTimelineItem = {
					dateTime: oTimelineEntry[oTimelineEntryFields.TimeStamp],
					userName: oTimelineEntry[oTimelineEntryFields.ActorName],
					userEmail: oTimelineEntry[oTimelineEntryFields.ActorExtID].toLowerCase(),
					title: oTimelineEntry[oTimelineEntryFields.ActionText] ,
					text: oTimelineEntry[oTimelineEntryFields.SummaryText],
					icon: oTimelineEntry[oTimelineEntryFields.Icon],
					timelineEntryDetails: this._processTimelineEntryDetails(oTimelineEntry[oTimelineEntryFields.TimelineDetailNavigationPath].results,
																			this._oBusinessObjectMap.collection)
				};
			oTimelineItem.userPicture = this.getUserPicture(oTimelineItem.userEmail);
			return oTimelineItem;
		},

		/**
		 * Returns the timeline entry details in format for the social timeline
		 * @param {Array} aTimelineEntryDetails - Timeline entry details
		 * @param {String} sEntityCollection - Entity collection name
		 * @returns {Array} Timeline entry details for the social timeline
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		_processTimelineEntryDetails : function(aTimelineEntryDetails, sEntityCollection){
			var that = this;
			var aTimelineEntryDetailsView = [];

			var oTimelineEntryDetailFields = that._oTimelineTermsUtility.getTimelineEntryDetailFields(sEntityCollection);

			aTimelineEntryDetails.forEach(function(oTimelineEntryDetail){
				var oDetail = {};
				oDetail.afterValue = oTimelineEntryDetail[oTimelineEntryDetailFields.AfterValue];
				oDetail.beforeValue = oTimelineEntryDetail[oTimelineEntryDetailFields.BeforeValue];
				oDetail.changeType = oTimelineEntryDetail[oTimelineEntryDetailFields.ChangeType];
				oDetail.propertyLabel = oTimelineEntryDetail[oTimelineEntryDetailFields.PropertyLabel];

				aTimelineEntryDetailsView.push(oDetail);
			});

			return aTimelineEntryDetailsView;
		},

		/************************************************************************************************
		 * Member Information APIs
		 ************************************************************************************************/
		/**
		 * get the user picture
		 * @param {string} sUserEmail
		 * @returns {string} image url
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		getUserPicture: function(sUserEmail){
			var oMember = this.getUserInfoFromBuffer(sUserEmail);
			if (!oMember){
				return "";
			}
			return oMember.picture;
		},

		/**
		 * Builds the image url
		 * @param {object} Member or FeedEntry or Comment
		 * @returns {string} image url
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		buildImageUrl: function(oObject){
			return this._oJamDataHandler._oCollabModel.sServiceUrl + "/" + oObject.__metadata.uri + "/ThumbnailImage/$value";
		},

		/**
		 * Adds member information to the buffer
		 * @param {object} oMember - member entity
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		addUserInfoToBuffer: function(oMember){
			var userPicture = this.buildImageUrl(oMember);
			var sUserEmailLC = oMember.Email.toLowerCase();
			this._oMemberDataBuffer[sUserEmailLC] = {
					"email":sUserEmailLC,
					"fullname":oMember.FullName,
					"id":oMember.Id,
					"address":oMember.MemberProfile.Address,
					"title":oMember.Title,
					"role":oMember.Role,
					"picture": userPicture
			};
		},
		/**
		 * Return the user information
		 * @param {string} sUserEmail
		 * @returns {object} user information
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		getUserInfoFromBuffer: function(sUserEmail){
			var sUserEmailLC = sUserEmail.toLowerCase();
			return this._oMemberDataBuffer[sUserEmailLC];
		},
		/**
		 * Getter for the current ExternalBO object
		 *
		 * @returns {object} Current ExternalBO
		 * @memberOf sap.collaboration.components.socialtimeline.datahandlers.TimelineDataHandler
		 */
		getCurrentExternalBO: function(){
			return this._oExternalBO;
		}

	});


	return TimelineDataHandler;

});
