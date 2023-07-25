/*
* ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
*/
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/base/Log",
	"sap/base/security/encodeURL",
	"sap/base/util/isEmptyObject",
	"sap/ui/core/mvc/Controller",
	"sap/suite/ui/commons/TimelineItem",
	"sap/m/MessageBox",
	"sap/collaboration/components/utils/LanguageBundle",
	"sap/collaboration/components/utils/DateUtil",
	"sap/collaboration/components/controls/FeedEntryEmbedded",
	"sap/collaboration/components/controls/ReplyPopover",
	"sap/collaboration/components/controls/SocialTextArea",
	"sap/collaboration/components/controls/FilterPopover",
	"sap/collaboration/components/utils/CommonUtil",
	"sap/collaboration/components/feed/ModeFactory",
	"sap/ui/model/json/JSONModel",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/library",
	"sap/ui/core/Fragment",
	"sap/m/ResponsivePopover",
	"sap/ui/Device",
	"sap/ui/core/CustomData",
	"sap/m/Link",
	"sap/ui/core/library",
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/collaboration/library"
],
	function(jQuery, Log, encodeURL, isEmptyObject, Controller, TimelineItem, MessageBox, LanguageBundle, DateUtil, FeedEntryEmbedded, ReplyPopover, SocialTextArea, FilterPopover, CommonUtil, ModeFactory, JSONModel, ToolbarSpacer, Button, mobileLibrary, Fragment, ResponsivePopover, Device, CustomData, Link, coreLibrary, List, CustomListItem, library) {
	"use strict";

	// shortcut for sap.collaboration.FeedType
	var FeedType = library.FeedType;

	// shortcut for sap.ui.core.MessageType
	var MessageType = coreLibrary.MessageType;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	var sControllerName = "sap.collaboration.components.feed.views.GroupFeed";

	var oGroupFeed =  Controller.extend(sControllerName, {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onInit: function() {

			this._initializeUtilities();
			this._initializeRequestStateData();
			this._initializeSystemData();
			this._initializeModels();
			this._initializeTimeline();
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onBeforeRendering: function() {
			if (!this._oMode.isJamServiceAvailable()) {
				this.displayErrorMessage();
			}
		},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onAfterRendering: function() {
		},
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onExit: function() {
			this._abortAllPendingRequests();

			// destroy controls
			this.byId("filter_popover").destroy();
			this.byId("addPost_popover").destroy();

			this._stopAutoCheckingForNewUpdates();
		},


		/************************************************************************
		 * Initialization
		 ************************************************************************/
		/**
		 * Initialize the utility classes that will be needed
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_initializeUtilities: function() {
			this._oCommonUtil = new CommonUtil();
			this._oLogger = Log.getLogger(sControllerName);
			this._oLanguageBundle = new LanguageBundle();
			this._oDateUtil = new DateUtil();
		},
		/**
		 * Initialize feed component system data for to keep track of the Group Feed's state
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_initializeSystemData: function() {
			this._oModes = {};
			this._mCurrentUser;
		},
		/**
		 * Initialize data to keep track of the requests
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_initializeRequestStateData: function() {
			this._oNextLinks = {
				"feedEntriesNextLink": "",
				"repliesNextLink": ""
			};
			this._oPendingRequests = {
				"loadingFeedEntriesRequest": undefined,
				"loadingRepliesRequest": undefined,
				"loadingSuggestionsRequest": undefined,
				"loadingFeedAtMentions": undefined,
				"refreshingSecurityToken": undefined
			};

			this._oPostRequestData = {
				"path": undefined,
				"payload": undefined,
				"parameters": undefined
			};
		},
		/**
		 * Create and initialized the models for the view
		 * 1- Jam model: OData model for connecting to Jam
		 * 2- SMI v2 model: OData model for connecting to SMIntegration V2 gateway service
		 * 3- View model: JSON model for the controls' properties
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_initializeModels: function() {
			// resource model
			var i18nModel = this._oLanguageBundle.createResourceModel();
			this.getView().setModel(i18nModel, "i18n");
			this._i18nModel = i18nModel;

			// View Data model
			var oViewDataModel = new JSONModel();
			oViewDataModel.setData({
				"feedSources": undefined,

				"axisOrientation": undefined,
				"enableSocial": true,
				"enableScroll": undefined,
				"forceGrowing": false,
				"growingThreshold": 20,

				"groupSelectorEnabled": false,
				"groupSelected": {},
				"groups":[],

				"filterEnabled": false,
				"filter": [],
				"filterMessage": "",

				"feedEndpoint": undefined,

				"addPostButtonEnabled": false,
			});
			oViewDataModel.bindProperty("/feedSources").attachChange(this._onFeedSourcesChange, this);
			oViewDataModel.bindProperty("/feedEndpoint").attachChange(this._onFeedEndpointChange, this);
			oViewDataModel.bindProperty("/filterMessage").attachChange(this._onFilterMessageChange, this);
			this.getView().setModel(oViewDataModel);
			this._oViewDataModel = oViewDataModel;
		},

		/************************************************************************
		 * Timeline manipulation
		 ************************************************************************/
		/**
		 * Initialize timeline
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_initializeTimeline: function() {
			var oTimeline = this.byId("timeline");
			oTimeline.setContent([]);

			this._modifyHeaderBar();
			this._createSocialProfile();
		},
		/**
		 * Modify the Timeline Header Bar
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_modifyHeaderBar: function(){
			var oHeaderBar = this.byId("timeline").getHeaderBar();

			// remove all content
			oHeaderBar.removeAllContent();

			// add the group selector
			var oGroupSelector = this._createGroupSelector();
			oHeaderBar.insertContent(oGroupSelector, 0);

			// add a spacer
			var oSpacer = new ToolbarSpacer(this.createId("header_spacer"));
			oHeaderBar.insertContent(oSpacer, 1);

			// Add the filter
			var oFilterButton = this._createFilterButton();
			oHeaderBar.insertContent(oFilterButton, 2);

			// create the Add Post button
			var oAddPostButton = this._createAddPostButton();
			oHeaderBar.insertContent(oAddPostButton, 3);
		},
		/**
		 * Create the Context Selector Control
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_createGroupSelector: function(){
			var oGroupSelectButton = new Button( this.createId("groupSelect_button"), {
				icon: "sap-icon://slim-arrow-down",
				iconFirst: false,
				text: "{/groupSelected/Name}",
				width: "20em",
				enabled: "{/groupSelectorEnabled}",
				type: ButtonType.Transparent,
				press: [this.onGroupSelectorButtonPress, this]
			});
			oGroupSelectButton.setModel(this._oViewDataModel);

			return oGroupSelectButton;
		},
		/**
		 * Create the filter button
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_createFilterButton: function() {
			if (!this.byId("filter_popover")) {

				// construct the custom list item fragment
				var oCustomListItem = sap.ui.xmlfragment("sap.collaboration.components.feed.fragments.CustomListItem", this);

				new FilterPopover(this.createId("filter_popover"), {
					title: this._oLanguageBundle.getText("ST_FILTER_HEADER"),
				}).setModel(this._oViewDataModel).bindItems("/filter", oCustomListItem);
			}

			var oFilterButton = new Button(this.createId("filter_button"), {
				enabled: "{/filterEnabled}",
				visible: "{/filterEnabled}",
				icon: "sap-icon://filter",
				type: ButtonType.Transparent,
				press: [function() {
					this.byId("filter_popover").openBy(this.byId("filter_button"));
				}, this]
			}).setModel(this._oViewDataModel);

			return oFilterButton;
		},
		/**
		 * Create the Add Post button
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_createAddPostButton: function(){
			if (this.byId("addPost_popover") === undefined) {
				new ResponsivePopover(this.createId("addPost_popover"), {
					placement: PlacementType.Auto,
					title: this._oLanguageBundle.getText("ST_ADD_POST_TITLE"),
					contentWidth:"25rem",
					contentHeight:"10rem",
					content: new SocialTextArea(this.createId("social_TextArea"), {
						height: "10rem",
						width: "100%",
						liveChange: [function(oEvent) {
							oEvent.getParameter("value").trim() !== "" ? this.byId("addPost_postButton").setEnabled(true) : this.byId("addPost_postButton").setEnabled(false);
						}, this],
						suggest: [this.onSuggest, this],
						afterSuggestionClose: [function() {
							this._oPendingRequests.loadingSuggestionsRequest && this._oPendingRequests.loadingSuggestionsRequest.abort();
						}, this]
					}),
					endButton: new Button(this.createId("addPost_postButton"), {
						text : this._oLanguageBundle.getText("ST_ADD_POST_BUTTON"),
						enabled: false,
						press: [this.onAddPost, this],
					}),
				}).setInitialFocus(this.byId("social_TextArea"));

				// Due to Ux issues, we don't want the @mention feature available on phones
				if (!Device.system.phone) {
					this.byId("addPost_popover").setBeginButton(new Button(this.createId("addPost_atMentionButton"), {
						text: "@",
						press: [function() {
							this.byId("social_TextArea").atMentionsButtonPressed();
						}, this]
					}));
				}
			}

			var oAddPostButton = new Button(this.createId("addPost_button") , {
				enabled: "{/addPostButtonEnabled}",
				icon: "sap-icon://add",
				type: ButtonType.Transparent,
				press: [function(){
					 this.byId("addPost_popover").openBy(this.byId("addPost_button"));
				}, this]
			});
			oAddPostButton.setModel(this._oViewDataModel);

			return oAddPostButton;
		},
		/**
		 * Clear the timeline of all its content
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_clearTimeline: function() {
			var oTimeline = this.byId("timeline");
			oTimeline.destroyContent();
		},
		/**
		 * Create a timeline item control
		 * @param oFeedEntry
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_createTimelineItem: function(oFeedEntry) {
			var oFeedEntryModel = new JSONModel(oFeedEntry);
			var oFeedEntryEmbedded = new FeedEntryEmbedded(this.createId(oFeedEntry.Id + "_embedded"), {
				"feedEntry": "{/}",
				"serviceUrl": this._oMode.getJamServiceUrl(),
				"expandCollapseClick": [function() {
					this.byId("timeline").adjustUI();
				}, this],
				"atMentionClick": [this.onAtMentionClicked, this],
				"previewLoad": [function(oControlEvent) {
					this.byId('timeline').adjustUI();
				}, this]
			});

			var oReplyPopover = new ReplyPopover(this.createId("replyPostPopover_" + oFeedEntry.Id), {
				socialTextArea: new SocialTextArea({
					height: "80px",
					width: "100%",
					suggestionPlacement: PlacementType.Top,
					suggest: [this.onSuggest, this],
					afterSuggestionClose: [function() {
						this._oPendingRequests.loadingSuggestionsRequest && this._oPendingRequests.loadingSuggestionsRequest.abort();
					}, this]
				}),
				postReplyPress: [this.onPostReplyPress, this],
				moreRepliesPress: [function(oEvent){
					var oTimelineItem = oEvent.getSource().getParent();
					this._getReplies(undefined, oTimelineItem.getModel().getData().Replies.__next, oTimelineItem);
				}, this],
				afterClose: [function() {
					if (this._oPendingRequests.loadingRepliesRequest){
						this._oPendingRequests.loadingRepliesRequest.abort();
					}
					this._bReplyPopoverIsOpen = false;
				}, this]
			});

			oReplyPopover.getSocialTextArea().attachLiveChange(function(oEvent) {
				oEvent.getParameter("value").trim() !== "" ? this.enableButton(true) : this.enableButton(false);
			}.bind(oReplyPopover));

			var oMoreLinkCustomAction = new CustomData({
				key:"1",
				value:this._oLanguageBundle.getText("ST_MORE_CUSTOM_ACTION")
			});

			var oTimelineItem = new TimelineItem(this.createId(oFeedEntry.Id), {
				"dateTime": "{/CreatedAt}",
				"userName": "{/Creator/FullName}",
				"title": "{/Action}",
				"text": "{/Text}",
				"icon": "sap-icon://post",
				"userNameClickable": this._oViewDataModel.getProperty("/enableSocial"),
				"userNameClicked": [this.onUserNameClicked, this],
				"userPicture": {
					path: "/Creator/Id",
					formatter: this._buildThumbnailImageURL.bind(this)
				},
				"replyCount": "{/RepliesCount}",
				"embeddedControl": oFeedEntryEmbedded,
				"customReply": oReplyPopover,
				"replyListOpen": [this.onReplyListOpen, this],
				"customAction": oMoreLinkCustomAction,
				"customActionClicked": [this.onMoreClicked, this]
			});
			oTimelineItem.setModel(oFeedEntryModel);
			oTimelineItem.setTitle("\u200E" + oTimelineItem.getTitle() + "\u200E");
			return oTimelineItem;
		},
		/**
		 * Add the feed entries to the Timeline control
		 * @param {object[]} feedEntries - array of feed entries entities
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_addFeedEntriesToTimeline: function(feedEntries) {

			// create timeline item controls for each feed entry and add it to the timeline
			var oTimeline = this.byId("timeline");

			feedEntries.forEach(function(oFeedEntry){
				var oTimelineItem = this._createTimelineItem(oFeedEntry);
				oTimeline.addContent(oTimelineItem);
			}, this);
		},
		/**
		 * Process the addition of more feed entries
		 * 1a - Add Timeline items for each feed entry
		 * 1b - If no feed entries, disable the more button
		 * 2 - Set timeline to not busy
		 * @param {object[]} aFeedEntries
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_processFeedEntries: function(feedEntries) {
			if (feedEntries.length > 0) {
				this._addFeedEntriesToTimeline(feedEntries);
			}
			else {
				this._oViewDataModel.setProperty("/forceGrowing",false); // disable the more button
			}
			this._setTimelineToNotBusy();
		},

		/**
		 * Process the @mentions for the embedded control
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_processAtMentions: function(){

			if (this._oPendingRequests.loadingFeedAtMentions &&
					this._oPendingRequests.loadingFeedAtMentions.state("pending")) {
				this._oPendingRequests.loadingFeedAtMentions.abort();
			}

			var that = this;
			var sPath;

			var mParameters = {
					"async": true,
					"success": function(oData, response){
						getttingAtMentionsPromise.resolveWith(that, [oData,response]);
					},
					"error": function(oError){
						that._oLogger.error('Failed to retrieve the @mentions.');
						getttingAtMentionsPromise.rejectWith(that, [oError]);
					}
				};

			if (this._oAtMention.atMentionsNextLink){
				sPath = "/" + this._oAtMention.atMentionsNextLink;
				mParameters.urlParameters = this._extractUrlParams(decodeURIComponent(this._oAtMention.atMentionsNextLink));
			}
			else {
				sPath = "/FeedEntries(" + encodeURL("'" + this._oAtMention.feedId + "'") + ")/AtMentions";
			}

			var getttingAtMentionsPromise = jQuery.Deferred();
			getttingAtMentionsPromise.done(function(oData, response){

				that._oAtMention.atMentionsNextLink = oData.__next;
				that._oAtMention.aAtMentions = that._oCommonUtil.getODataResult(oData).concat(that._oAtMention.aAtMentions);

				if (that._oAtMention.atMentionsNextLink) {
					that._processAtMentions();
				}
				else {
					var oSettings = {
							openingControl: that._oAtMention.oUserNameLink,
							memberId: that._oAtMention.aAtMentions[that._oAtMention.placeholderIndex].Email
					};
					that._oSocialProfile.setSettings(oSettings);
					that._oSocialProfile.open();
				}
			});

			this._oPendingRequests.loadingFeedAtMentions = getttingAtMentionsPromise.promise(this._oJamModel.read(sPath, mParameters));
		},

		/**
		 * Create the Social Profile component
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_createSocialProfile: function(){
			this._oSocialProfile = new sap.ui.getCore().createComponent("sap.collaboration.components.socialprofile");
			return this._oSocialProfile;
		},
		/**
		 * Sets the busy indicator for the Timeline control
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_setTimelineToBusy: function(){
			var oTimeline = this.byId("timeline");
			oTimeline.setBusyIndicatorDelay(0).setBusy(true);
		},
		/**
		 * Turn off the busy indicator for the Timeline control
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_setTimelineToNotBusy: function(){
			var oTimeline = this.byId("timeline");
			oTimeline.setBusyIndicatorDelay(0).setBusy(false);
		},
		/**
		 * Shows the number of new Feed Updates in the Timeline
		 * @param {integer} newFeedUpdatesCount: number of new feed updates
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_showFeedUpdatesInTimeline: function(newFeedUpdatesCount) {
			var oTimeline = this.byId("timeline");
			var oMessageStrip = oTimeline.getMessageStrip();

			if (newFeedUpdatesCount > 0) {
				if (!this.byId("refreshLink")) {
					var oRefreshLink = new Link(this.createId("refreshLink"), {
						text: this._oLanguageBundle.getText("GF_REFRESH_FEED"),
						press: [function() {
							// refresh the feed
							var sFeedEndpoint = this._oViewDataModel.getProperty("/feedEndpoint");
							this._initialLoadFeedEntries(sFeedEndpoint);
						}, this]
					});
					oMessageStrip.setLink(oRefreshLink);
					oMessageStrip.setType(MessageType.Information);
					oMessageStrip.setShowIcon(true);
				}
				newFeedUpdatesCount == 1 ? oTimeline.setCustomMessage(this._oLanguageBundle.getText("GF_NEW_FEED_UPDATE")) :
					oTimeline.setCustomMessage(this._oLanguageBundle.getText("GF_NEW_FEED_UPDATES", newFeedUpdatesCount));

				oMessageStrip.setVisible(true);
				oTimeline.rerender();
			}
		},
		/**
		 * Hide the number of new Feed Updates in the Timeline
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_hideFeedUpdatesInTimeline: function() {
			var oMessageStrip = this.byId("timeline").getMessageStrip();
			oMessageStrip.close();
		},

		/************************************************************************
		 * Controls event handlers
		 ***********************************************************************/
		/**
		 * Event handler for the "Show More" button of the Timeline Control
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onGrow: function(oEvent) {
			// if there's a pending request, do not start a new one
			if (!this._oPendingRequests.loadingFeedEntriesRequest || !this._oPendingRequests.loadingFeedEntriesRequest.state() != "pending") {
				var sFeedEndpoint = this._oViewDataModel.getProperty("/feedEndpoint");

				this._loadFeedEntries(sFeedEndpoint).done(this._loadFeedEntriesSuccess.bind(this));
			}
		},
		/**
		 * Event handler for the Group Selector button of the Timeline Control
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onGroupSelectorButtonPress: function(oEvent){
			// asks the mode class instance to display its source
			// selector popover next to the group selector button.
			this._oMode.displayFeedSourceSelectorPopover(oEvent.getSource());
		},
		/**
		 * Event handler for the add post button. Opens a pop over to add a post.
		 * @param {object} event
		 * @public
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onAddPost: function(event) {
			this.byId("addPost_popover").close();
			var sContent = this.byId("social_TextArea").convertTextWithFullNamesToEmailAliases();
			// post the user content if it's not empty
			if (sContent && sContent.trim() !== "") {
				this._getLoggedInUser().done(function() {
					this._setTimelineToBusy();

					var fnSuccessCallback = function (oData, response) { // success callback
						this.byId("social_TextArea").clearText(); // clear the text in the add post popover
						this.byId("addPost_postButton").setEnabled(false); // disable the add post button until the user types
						this._setTimelineToNotBusy();

						var oFeedEntry = this._oCommonUtil.getODataResult(oData);
						oFeedEntry.Creator = this._mCurrentUser;

						var oTimelineItem = this._createTimelineItem(oFeedEntry);
						this.byId("timeline").insertContent(oTimelineItem, 0); // add timeline item to timeline
					};
					var fnFailCallback = function (oError) { // fail callback
						this._oLogger.error("Error occured when adding a post.", oError.stack);
					};

					var mAddPostReturn = this._oMode.addPost(sContent);

					this._oPostRequestData = { "path" : mAddPostReturn.path, "payload" : mAddPostReturn.payload }; // save the request data
					this._oPostRequestData.parameters = { success : fnSuccessCallback, error : fnFailCallback };

					var oAddPostPromise = mAddPostReturn.promise;
					oAddPostPromise.then(fnSuccessCallback.bind(this), fnFailCallback.bind(this));
				}.bind(this));
			}
			else {
				this._oLogger.info('Posting an empty comment is not allowed, no feed entry will be created.');
			}
		},
		/**
		 * Event handler when the ReplyPopover is opened.
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onReplyListOpen: function(oEvent){
			// set the focus on the text area inside the reply popover immediately on open
			var oCustomReply = oEvent.getSource().getCustomReply();
			oCustomReply.getTextArea().focus();

			if (!this._bReplyPopoverIsOpen) {
				this._bReplyPopoverIsOpen = true;
				var oTimelineItem = oEvent.getSource();
				var sFeedId = oTimelineItem.getModel().getProperty("/Id");
				this._getReplies(sFeedId, undefined, oTimelineItem);
			}
		},
		/**
		 * Event handler when the "Post" button is pressed on the ReplyPopover.
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onPostReplyPress: function(oEvent){
			var that = this;
			var sValue = oEvent.getParameter("value");
			var oTimelineItem = oEvent.getSource().getParent();
			var oCustomReply = oTimelineItem.getCustomReply();
			var sFeedId = oTimelineItem.getModel().getData().Id;
			var sPath = "/FeedEntries('" + encodeURL(sFeedId) + "')/Replies";
			var oDataPayload = { "Text" : sValue };
			this._getLoggedInUser();
			this._getLoggedInUser().done(function() {
				var mParameters = {
					"async": true,
					"success": function(oData, response) {
						oCustomReply.getTextArea().clearText(); // clear the text area on successfully reply
						oCustomReply.enableButton(false); // disable the post button until user starts typing again
						oCustomReply.setBusy(false);

						var oJamResults = that._oCommonUtil.getODataResult(oData);

						var oReply = {
							"CreatedAt": that._oDateUtil.formatDateToString(oJamResults.CreatedAt),
							"Text": oJamResults.Text,
							"Creator" : that._mCurrentUser
						};
						oReply.Creator.ThumbnailImage = that._buildThumbnailImageURL(that._mCurrentUser.Id);

						oCustomReply.addReply(oReply);

						oTimelineItem.getModel().setProperty("/RepliesCount", oTimelineItem.getModel().getProperty("/RepliesCount") + 1); // +1 to the reply count
					},
					"error": function(oError) {
						that._oLogger.error("Failed to post reply: " + oError.statusText, oError.stack);
					}
				};

				// We need to put the focus on the text area to avoid the Popover from closing - not sure why it closes
				oCustomReply.getTextArea().focus();
				oCustomReply.setBusyIndicatorDelay(0).setBusy(true);
				this._oPostRequestData = {"path": sPath, "payload": oDataPayload, "parameters": mParameters}; // save the request data
				this._oJamModel.create(sPath, oDataPayload, mParameters);
			}.bind(this));
		},
		/**
		 * Event handler for the suggestions
		 * @param {object} oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onSuggest: function(oEvent){
			var that = this;

			if (this._oPendingRequests.loadingSuggestionsRequest){
				this._oPendingRequests.loadingSuggestionsRequest.abort();
			}

			var oSocialTextArea = oEvent.getSource();
			var sValue = oEvent.getParameter("value");
			if (sValue.trim() === ""){ // if value is empty then it's the suggestions is triggered but user has not entered any text yet
				oSocialTextArea.showSuggestions([]);
			}
			else {
				var sPath = "/Members_Autocomplete";
				var sGroupId = this._oViewDataModel.getProperty("/groupSelected/Id");
				var mParameters = {
					"async": true,
					"urlParameters": {
						"Query": "'" + sValue + "'",
						"GroupId": "'" + sGroupId + "'",
						"$top": "4"
					},
					"success": function(oData, response){
						gettingSuggestionsPromise.resolveWith(that, [oData,response]);
					},
					"error": function(oError){
						that._oLogger.error("Failed to get suggestions: " + oError.statusText);
						gettingSuggestionsPromise.rejectWith(that, [oError]);
					}
				};

				var gettingSuggestionsPromise = jQuery.Deferred();
				gettingSuggestionsPromise.done(function(oData, response){
					var aJamResults = that._oCommonUtil.getODataResult(oData);
					if (aJamResults.length === 0) { // if nothing is returns from jam then close the suggestion popover
						oSocialTextArea.closeSuggestionPopover();
					}
					else {
						var aSuggestions = [];
						var iJamResultsLength = aJamResults.length;
						for (var i = 0; i < iJamResultsLength; i++){
							aSuggestions.push({
								fullName: aJamResults[i].FullName,
								email: aJamResults[i].Email,
								userImage: that._buildThumbnailImageURL(aJamResults[i].Id)
							});
						}
						oSocialTextArea.showSuggestions(aSuggestions);
					}
				});
				this._oPendingRequests.loadingSuggestionsRequest = gettingSuggestionsPromise.promise(this._oJamModel.read(sPath, mParameters));
			}
		},
		/**
		 * Event handler for userNameClicked event
		 * @param {object} oControlEvent - event when the user name is clicked
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onUserNameClicked: function(oControlEvent){
			var oUserNameLink = oControlEvent.getParameter("uiElement");
			var oTimelineEntryModel = oControlEvent.getSource().getModel();
			var sMemberId = oTimelineEntryModel.getProperty("/Creator/Email");

			this._oSocialProfile.setSettings({
				openingControl: oUserNameLink,
				memberId: sMemberId
			});
			this._oSocialProfile.open();
		},
		/**
		 * Event handler for the more custom action. Opens a pop over that contain links to the group and feed entry.
		 * @param oControlEvent - event when a custom action is clicked
		 * @public
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onMoreClicked: function(oControlEvent){
			var sFeedEntryWebURL  = oControlEvent.getSource().getModel().getProperty("/WebURL");
			var sFeedEntryId = oControlEvent.getSource().getModel().getProperty("/Id");

			var sSelectedGroupName = oControlEvent.getSource().getParent().getModel().getProperty("/groupSelected/Name");
			var sSelectedGroupWebURL = oControlEvent.getSource().getParent().getModel().getProperty("/groupSelected/WebURL");

			var oMorePopover = this.byId(this.createId("moreListPopover_" + sFeedEntryId));

			if (oMorePopover === undefined){
				var oMoreList = new List(this.createId("moreList_" + sFeedEntryId), {});

				var oGroupNameLink = new Link(this.createId("groupNameLink_" + sFeedEntryId), {
					text: this._oLanguageBundle.getText("ST_GROUP_NAME_LINK", sSelectedGroupName),
					target: "_blank",
					href: sSelectedGroupWebURL,
					width: "15em"
				}).addStyleClass("sapCollaborationCustomLinkPadding");

				var oGroupNameLinkListItem = new CustomListItem(this.createId( sFeedEntryId + "_groupNameLinkListItem" ), {
					content: oGroupNameLink
				});

				oMoreList.addItem(oGroupNameLinkListItem);

				var oFeedEntryLink = new Link(this.createId("feedEntryLink_" + sFeedEntryId), {
					 text: this._oLanguageBundle.getText("ST_FEED_ENTRY_LINK"),
					 target: "_blank",
					 href: sFeedEntryWebURL,
					 width: "15em"
				}).addStyleClass("sapCollaborationCustomLinkPadding");

				var oFeedEntryLinkListItem = new CustomListItem(this.createId("feedEntryLinkListItem_" + sFeedEntryId), {
					 content: oFeedEntryLink
				});

				oMoreList.addItem(oFeedEntryLinkListItem);

				var bshowHeader = false;

				if (Device.system.phone) {
					bshowHeader = true;
				}

				oMorePopover = new ResponsivePopover(this.createId("moreListPopover_" + sFeedEntryId), {
					content: oMoreList,
					showHeader: bshowHeader,
					title: this._oLanguageBundle.getText("ST_MORE_CUSTOM_ACTION"),
					showCloseButton: true,
					placement: PlacementType.VerticalPreferedBottom,
					contentWidth: "15em"
				});

				var fnClose = function () {
					this.close();
				};
				// close popover after clicking links
				oGroupNameLink.attachPress(fnClose.bind(oMorePopover));
				oFeedEntryLink.attachPress(fnClose.bind(oMorePopover));
			}
			oMorePopover.openBy(oControlEvent.getParameter("linkObj"));
		},
		/**
		 * Event handler when an AtMention in the embedded control is clicked
		 * @param {object} oControlEvent - event when the user name is clicked
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onAtMentionClicked: function(oControlEvent){

			var sFeedId = oControlEvent.getSource().getModel().getProperty("/Id");
			var oUserNameLink = oControlEvent.getParameter("link");
			var placeholderIndex = oUserNameLink.getModel().getProperty("/placeholderIndex");

			this._oAtMention = {
					"feedId": sFeedId,
					"oUserNameLink": oUserNameLink,
					"placeholderIndex": placeholderIndex,
					"aAtMentions": [],
					"atMentionsNextLink": undefined
			};

			this._processAtMentions();
		},

		/************************************************************************
		 * View model's event handlers
		 ************************************************************************/
		/**
		 * Event handler when the url is changed
		 * @param {object} event
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_onFeedEndpointChange: function(event) {
			var sFeedEndpoint = event.getSource().getValue();

			this._initialLoadFeedEntries(sFeedEndpoint);
		},
		/**
		 * Event handler for when the property feedSources changes
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_onFeedSourcesChange: function(oEvent) {
			// For backwards compatibility:
			var sErrorMessage;
			var oFeedSources = oEvent.getSource().getValue();
			if (Array.isArray(oFeedSources)) {
				oFeedSources = {
					mode: FeedType.GroupIds,
					data: oFeedSources
				};
			}

			if (this._oMode) {
				this._oMode.stop();
			}

			if (this._oCommonUtil.isString(oFeedSources.mode)) {
				if (this._oModes[oFeedSources.mode] === undefined) {
					this._oModes[oFeedSources.mode] = ModeFactory.getInstance().createMode(oFeedSources.mode, this);
				}
			}
			else {
				sErrorMessage = "The mode must be a string.";
				this.logError(sErrorMessage);
				this.byId("timeline").destroy();
				throw new Error(sErrorMessage);
			}

			this._oMode = this._oModes[oFeedSources.mode];
			this._oMode.start(oFeedSources.data);
		},

		/**
		 * Event handler when the property 'filterMessage' is changed.
		 * Sets the custom message on the timeline.
		 * @param {object} event
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_onFilterMessageChange: function(event) {
			var sText = event.getSource().getValue();
			this.byId("timeline").setCustomMessage(sText);
			this.byId("timeline").rerender();
		},
		/************************************************************************
		 * SM Integration V2 model's event handlers
		 ************************************************************************/
		/**
		 * Event handler for when Jam or SMI fail to load their metadata
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_onMetadataFailed: function(oEvent) {

			switch (oEvent.oSource.sServiceUrl) {
			case this._oMode.getJamServiceUrl():
				this._oLogger.error("Failed to load Jam metadata. Service unavailable or possible missing JAM configuration.");
				this._displayJamConnectionErrorMessage();
				this._oMode.setJamServiceAvailable(false);
				break;

			case this._oMode.getSMIv2ServiceUrl():
				this._oLogger.error("Failed to load SMIv2 metadata.");
				this.displayErrorMessage();
				break;
			}
			this.disableGroupFeed();
		},
		/************************************************************************
		 * Jam model's event handlers
		 ************************************************************************/
		/**
		 * Event handler for when the requests to Jam are completed
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_onJamRequestCompleted: function(oEvent) {
			var sMethod = oEvent.getParameter("method");

			if (oEvent.success && sMethod === "POST") {
				// reset the refreshing security token request because it is not needed
				this._oPendingRequests.refreshingSecurityToken = undefined;
			}
		},
		/**
		 * Event handler for when the requests to Jam fail
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_onJamRequestFailed: function(oEvent) {
			this._setTimelineToNotBusy();

			var sMethod = oEvent.getParameter("method");
			var iStatusCode = parseInt(oEvent.getParameter("response").statusCode);
			var sFeedEndpoint = oEvent.getParameter("feedEndpoint");

			// if the endpoint is still empty, read the parameter url
			if (!sFeedEndpoint) {
				sFeedEndpoint = oEvent.getParameter("url");
			}

			if (/ExternalObjects_FindByExidAndObjectType/.test(sFeedEndpoint)) {
				// Leave the BOMode class handle its own error messages.
				// This assumes that only the BOMode makes this call and
				// no other part of the code relies on this method to
				// display errors when a failure occurs for this call.
				this.disableGroupFeed();
				return;
			}

			switch (iStatusCode) {
			case 403: // Forbidden
				// For Post requests, we must refresh the security token and re-execute the request
				// to make sure it's actually a forbidden request
				if (sMethod === "POST") {
					if (this._oPendingRequests.refreshingSecurityToken === undefined) {
						this._refreshSecurityToken().done(function(oData,response){
							this._oJamModel.create(this._oPostRequestData.path, this._oPostRequestData.payload, this._oPostRequestData.parameters);
						});
					}
					else {
						this._oPendingRequests.refreshingSecurityToken = undefined;
						this.displayErrorMessage(this._oLanguageBundle.getText('JAM_NO_ACCESS_TO_POST_TO_GROUP'));
					}
				}
				else {
					this.displayErrorMessage(this._oLanguageBundle.getText('JAM_FORBIDDEN_ACCESS'));
				}
				break;
			case 404: // Not Found
				if (/Groups\(.*\)\/FeedEntries/.test(sFeedEndpoint)) { // /Groups(*)/FeedEntries
					this.displayErrorMessage(this._oLanguageBundle.getText('JAM_NO_ACCESS_TO_GROUP'));
					this.disableGroupFeed();
				}
				else if (/Groups\(.*\)/.test(sFeedEndpoint)) { // /Groups(*)
					this.displayErrorMessage(this._oLanguageBundle.getText('JAM_NO_ACCESS_TO_GROUP'));
					this.disableGroupFeed();
				}
				else if (/GroupExternalObject_FeedLatestCount|Group_FeedLatestCount/.test(sFeedEndpoint) ) {
					// stop checking for feed updates
					this._stopAutoCheckingForNewUpdates();
				}
				else {
					this.displayErrorMessage();
				}
				break;
			case 500: // Internal Server Error
			case 503: // Service Unavailable
				this._displayJamConnectionErrorMessage();
				break;
			default:
				this.displayErrorMessage();
			}

		},
		/**
		 * Event handler for when the requests to Jam is sent
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_onJamRequestSent: function(oEvent) {
		},
		/**
		 * Event handler for when the requests to Jam batch call is completed
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_onBatchCompleted: function(oEvent) {
			this._oJamModel.setUseBatch(false); // batch is required for initial load, turn off for all subsequent requests
			this._oMode.onBatchCompleted(oEvent);
		},
		/**
		 * Event handler for when the requests to Jam batch call fails
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_onBatchFailed: function(oEvent) {
		},
		/**
		 * Event handler for when the requests to Jam batch call is sent
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_onBatchSent: function(oEvent) {
		},
		/************************************************************************
		 * Requests
		 ************************************************************************/
		/**
		 * Abort all pending requests
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_abortAllPendingRequests: function() {
			if (this._oPendingRequests.loadingFeedEntriesRequest) {
				this._oPendingRequests.loadingFeedEntriesRequest.abort();
			}
			if (this._oPendingRequests.loadingRepliesRequest) {
				this._oPendingRequests.loadingRepliesRequest.abort();
			}
			if (this._oPendingRequests.loadingSuggestionsRequest) {
				this._oPendingRequests.loadingSuggestionsRequest.abort();
			}
		},
		/**
		 * Refreshes the security token and performs a POST to the path provided
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_refreshSecurityToken: function(){
			var that = this;
			var refreshingSecurityToken = jQuery.Deferred();

			return this._oPendingRequests.refreshingSecurityToken =
				refreshingSecurityToken.promise(this._oJamModel.refreshSecurityToken(
					function(oData, response){
						that._oLogger.info("Security token refreshed");
						refreshingSecurityToken.resolveWith(that,[oData, response]);
					},
					function(oSecurityTokenError){
						that._oLogger.error("Security token error: " + oSecurityTokenError.statusText);
						refreshingSecurityToken.rejectWith([oSecurityTokenError],that);
					}
				));
		},
		/**
		 * Get the logged in user from Jam and assign it to a member attribute of the controller.
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_getLoggedInUser: function(){
			var getLoggedInUser = jQuery.Deferred();
			if (!this._mCurrentUser){
				var sPath = "/Self";
				var mParameters = {
					"success": function(oData, response){
						this._mCurrentUser = this._oCommonUtil.getODataResult(oData);
						getLoggedInUser.resolve(oData, response);
					}.bind(this),
					"error": function(oError){
						this._oLogger.error('Failed to get the logged in user', oError.stack);
						getLoggedInUser.reject(oError);
					}.bind(this)
				};

				return getLoggedInUser.promise(this._oJamModel.read(sPath, mParameters));
			}
			return getLoggedInUser.resolve();
		},
		/**
		 * Load the feed entries for the selected group. If a next link exists, get the next page.
		 * @private
		 * @param {string} feedEndpoint the feed endpoint to fetch the feed entries
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_loadFeedEntries: function(feedEndpoint) {
			var sSkipToken = undefined;
			// if Jam is not configured, do not execute
			if (!this._oMode.isJamServiceAvailable()) {
				return;
			}
			this._setTimelineToBusy();

			// resolve next link
			var sNextLink = this._oNextLinks.feedEntriesNextLink;
			if (sNextLink !== "") {
				sNextLink = decodeURIComponent(sNextLink);
				sSkipToken = this._extractUrlParams(sNextLink).$skiptoken;
			}

			return this._oPendingRequests.loadingFeedEntriesRequest = this._oMode.getFeedEntries(feedEndpoint, sSkipToken);
		},
		/**
		 * Loading the feed entries success function
		 * @private
		 * @param {string} feedEndpoint the feed endpoint to fetch the feed entries
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_loadFeedEntriesSuccess: function(oData, response) {
			this._oNextLinks.feedEntriesNextLink = oData.__next;
			var aFeedEntries = this._oCommonUtil.getODataResult(oData); // get the feed entries from the results
			this._processFeedEntries(aFeedEntries);
		},
		/**
		 * Initial load the feed entries for the selected group.
		 * @private
		 * @param {string} feedEndpoint - the feed endpoint to fetch the feed entries
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_initialLoadFeedEntries: function(feedEndpoint) {

			if (this._oPendingRequests.loadingFeedEntriesRequest) {
				this._oPendingRequests.loadingFeedEntriesRequest.abort();
			}

			this._initializeRequestStateData();
			this._oViewDataModel.setProperty("/forceGrowing", true); // enable the more button
			this._hideFeedUpdatesInTimeline();	// reset feed updates message
			this._stopAutoCheckingForNewUpdates();

			this._loadFeedEntries(feedEndpoint).done([this._clearTimeline.bind(this),
													   this._loadFeedEntriesSuccess.bind(this),
													   this._startAutoCheckingForNewUpdates.bind(this)]);
		},
		/**
		 * Get the Replies based on whether the sFeedEntryId or sNextLink is passed:
		 * i- If the sFeedEntryId is passed, then the assumption is that it's the initial set of replies
		 * ii- If the sNextLink is passed, then the assumption is that the "Show More" link is pressed and the next link from SAP Jam is used
		 * to make the call to retrieve the next set of Replies
		 *
		 * @param {string} sFeedId - the feed entry id
		 * @param {string} sNextLink - the next link from SAP Jam
		 * @param {object} oTimelineItem - the timeline item that corresponds to this Reply
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_getReplies: function(sFeedId, sNextLink, oTimelineItem) {
			var that = this;
			var sPath;
			var mParameters = {
				"async": true,
				"urlParameters": {
						'$orderby': 'CreatedAt desc',
						'$expand': 'Creator'
				},
				"success": function(oData, response){
					that._oLogger.info("Replies were successfully retrieved.");
					gettingRepliesPromise.resolveWith(that, [oData,response]);
				},
				"error": function(oError){
					that._oLogger.error("Failed to retrieve replies: " + oError.statusText);
					gettingRepliesPromise.rejectWith(that, [oError]);
				}
			};
			var oCustomReply = oTimelineItem.getCustomReply();

			if (sNextLink){
				sPath = "/" + sNextLink;
				mParameters.urlParameters = this._extractUrlParams(decodeURIComponent(sNextLink));
				mParameters.urlParameters.$orderby = mParameters.urlParameters.$orderby.replace("+", " ");
			}
			else {
				sPath = "/FeedEntries('" + encodeURL(sFeedId) + "')/Replies";
			}

			var gettingRepliesPromise = jQuery.Deferred();
			gettingRepliesPromise.done(function(oData, response){
				var aReplies = that._oCommonUtil.getODataResult(oData).reverse();

				// for each reply, build the image url and format the date
				aReplies.forEach(function(oReply){
					oReply.Creator.ThumbnailImage = that._buildThumbnailImageURL(oReply.Creator.Id);
					oReply.CreatedAt = that._oDateUtil.formatDateToString(oReply.CreatedAt);
				});

				oCustomReply.addReplies({
					data : aReplies,
					more : oData.__next ? true : false
				});
				oTimelineItem.getModel().getData().Replies.__next = oData.__next;
			})
			.always(function(){
				oCustomReply.setBusy(false);
			})
			.fail(function(){
				oCustomReply._oReplyPopover.close();
			});

			oCustomReply.setBusyIndicatorDelay(0).setBusy(true);
			this._oPendingRequests.loadingRepliesRequest = gettingRepliesPromise.promise(this._oJamModel.read(sPath, mParameters));

		},
		/************************************************************************
		 * Logging Services
		 ************************************************************************/
		 /**
		  * A service method to allow class instances needed by the controller
		  * to log their errors.
		  * @param {string} sErrorMessageToLog - The error message to log.
		  * @memberOf sap.collaboration.components.feed.views.GroupFeed
		  */
		 logError: function(sErrorMessageToLog) {
			this._oLogger.error(sErrorMessageToLog);
		 },
		 /************************************************************************
		 * Public Methods to Expose Resources Needed by Collaboration Classes
		 ************************************************************************/
		 /**
		  * A service method to expose the controller's view's models.
		  * @param {string|undefined} [sName] name of the model to be retrieved
		  * @return {sap.ui.model.Model} the requested model
		  * @memberOf sap.collaboration.components.feed.views.GroupFeed
		  */
		 getModel: function(sName) {
			return this.getView().getModel(sName);
		 },
		 /**
		  * A service method to define the controller's view's models.
		  * @param {object} [oModel] model to be assigned
		  * @param {string|undefined} [sName] name of the model to be defined
		  * @public
		  * @memberOf sap.collaboration.components.feed.views.GroupFeed
		  */
		 setModel: function(oModel, sName) {
			 this.getView().setModel(oModel, sName);
		 },
		 /**
		  * This method returns this controller's LanguageBundle instance.
		  * @return {sap.collaboration.components.util.LanguageBundle} the LanguageBundle instance used by the controller
		  * @public
		  * @memberOf sap.collaboration.components.feed.views.GroupFeed
		  */
		 getLanguageBundle: function () {
			return this._oLanguageBundle;
		 },
		 /**
		  * A method to set the jam model
		  * @param {object} [oModel] model to be assigned
		  * @public
		  * @memberOf sap.collaboration.components.feed.views.GroupFeed
		  */
		 setJamModel: function(oModel) {
			 this._oJamModel = oModel;
			 this.setModel(oModel, "jam");
		 },
		 /**
		  * A method to set the jam model
		  * @param {object} [oModel] model to be assigned
		  * @public
		  * @memberOf sap.collaboration.components.feed.views.GroupFeed
		  */
		 setSmiModel: function(oModel) {
			 this._oSMIModel = oModel;
			 this.setModel(oModel, "smi");
		 },
		/************************************************************************
		 * Error handling
		 ************************************************************************/
		/**
		 * Display error message
		 * @public
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		displayErrorMessage: function(sErrorText) {
			var sMessage = sErrorText || this._oLanguageBundle.getText("SYSTEM_ERROR_MESSAGEBOX_GENERAL_TEXT");

			MessageBox.error(sMessage);
		},
		/**
		 * Display Jam connection error
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_displayJamConnectionErrorMessage: function() {
			var sMessage = this._oLanguageBundle.getText("JAM_CONNECTION_ERROR_MESSAGEBOX_TEXT");

			MessageBox.error(sMessage);
		},
		/**
		 * Disable the Timeline control
		 * @public
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		disableGroupFeed: function(){
			this._abortAllPendingRequests();

			var oTimeline = this.byId("timeline");
			if (!isEmptyObject(oTimeline)){
				oTimeline.setBusyIndicatorDelay(0).setBusy(false);

				this._clearTimeline();

				this._oViewDataModel.setProperty("/groupSelectorEnabled",false);
				this._oViewDataModel.setProperty("/addPostButtonEnabled",false);
				this._oViewDataModel.setProperty("/forceGrowing",false);
			}
		},

		/**
		 * Enable the Timeline control
		 * @public
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		enableGroupFeed: function(){
			var oTimeline = this.byId("timeline");
			if (!isEmptyObject(oTimeline)){
				oTimeline.setBusyIndicatorDelay(0).setBusy(false);

				this._oViewDataModel.setProperty("/groupSelectorEnabled", true);
				this._oViewDataModel.setProperty("/addPostButtonEnabled", true);
				this._oViewDataModel.setProperty("/forceGrowing", true);
			}
		},

		/************************************************************************
		 * Utilities
		 ************************************************************************/
		/**
		 * Starts the auto new feed checking feature
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_startAutoCheckingForNewUpdates: function() {
			this._iNewFeedUpdatesCheckerTimeDelay = 120000; // in milliseconds
			this._sNewFeedUpdatesCheckerTimeoutId = setTimeout(this._checkForNewFeedUpdates.bind(this), this._iNewFeedUpdatesCheckerTimeDelay);
		},
		/**
		 * Stops the auto new feed checking feature
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_stopAutoCheckingForNewUpdates: function() {
			clearTimeout(this._sNewFeedUpdatesCheckerTimeoutId);
		},
		/**
		 * Checks Jam for new feed updates
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_checkForNewFeedUpdates: function() {

			var fnSuccess = function(oData, response) {
				this._showFeedUpdatesInTimeline(oData);
				this._sNewFeedUpdatesCheckerTimeoutId = setTimeout(this._checkForNewFeedUpdates.bind(this), this._iNewFeedUpdatesCheckerTimeDelay);
			};
			var fnError = function(oError) {
				this._oLogger.error("Failed to check for new feed updates.");
				this._sNewFeedUpdatesCheckerTimeoutId = setTimeout(this._checkForNewFeedUpdates.bind(this), this._iNewFeedUpdatesCheckerTimeDelay);
			};

			// check Jam for the new feed updates
			this._oMode.getFeedUpdatesLatestCount().done(fnSuccess.bind(this)).fail(fnError.bind(this));
		},
		/************************************************************************
		 * Utilities
		 ************************************************************************/
		/**
		 * Returns a map containing URL parameters extracted from a URL
		 * @param {string} sURL
		 * @return {map} mUrlParameters
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_extractUrlParams: function(sURL) {
			var sUrlParameters = sURL.slice(sURL.indexOf("?") + 1);
			var aUrlParameters = sUrlParameters.split("&");
			var mUrlParameters = {};

			aUrlParameters.forEach(function(urlParameter) {
				var indexOfEqual = urlParameter.indexOf("=");
				mUrlParameters[urlParameter.slice(0, indexOfEqual)] = urlParameter.slice(indexOfEqual + 1);
			});
			return mUrlParameters;
		},
		/**
		 * Returns a URL for the ThumbnailImage
		 * @param {string} sUserId
		 * @return {string}
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_buildThumbnailImageURL: function(sUserId) {
			return this._oJamModel.sServiceUrl + "/Members('" + encodeURL(sUserId) + "')/ThumbnailImage/$value";
		}

	});
	return oGroupFeed;
}, /* bExport= */ true);
