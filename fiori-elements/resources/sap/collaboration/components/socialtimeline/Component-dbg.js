/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2014 SAP AG. All rights reserved
 */
sap.ui.define([
	'sap/base/Log',
	'sap/base/util/isEmptyObject',
	'../controls/FilterPopover',
	'../controls/ReplyPopover',
	'../controls/SocialTextArea',
	'./controls/TimelineItemEmbedded',
	'./datahandlers/JamDataHandler',
	'./datahandlers/SMIntegrationDataHandler',
	'./datahandlers/ServiceDataHandler',
	'./datahandlers/TimelineDataHandler',
	'./filter/FilterType',
	'./validation/InputValidator',
	'../utils/CommonUtil',
	'../utils/DateUtil',
	'sap/suite/ui/commons/library',
	'sap/suite/ui/commons/Timeline',
	'sap/suite/ui/commons/TimelineItem',
	'sap/ui/core/CustomData',
	'sap/ui/core/library',
	'sap/ui/core/Item',
	'sap/ui/core/UIComponent',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/odata/ODataModel',
	'sap/m/Button',
	'sap/m/library',
	'sap/m/Link',
	'sap/m/Popover',
	'sap/m/ResponsivePopover',
	'sap/m/SelectList',
	'sap/m/StandardListItem'
], function(Log, isEmptyObject,
			FilterPopover, ReplyPopover, SocialTextArea, TimelineItemEmbedded,
			JamDataHandler, SMIntegrationDataHandler, ServiceDataHandler, TimelineDataHandler,
			FilterType, InputValidator, CommonUtil, DateUtil,
			commonsLibrary, Timeline, TimelineItem,
			CustomData, coreLibrary, Item, UIComponent,
			JSONModel, ODataModel,
			Button, mobileLibrary, Link, Popover, ResponsivePopover, SelectList, StandardListItem) {

	"use strict";

	// shortcut for sap.ui.core.MessageType
	var MessageType = coreLibrary.MessageType;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.suite.ui.commons.TimelineAxisOrientation
	var TimelineAxisOrientation = commonsLibrary.TimelineAxisOrientation;

	// shortcut for sap.suite.ui.commons.TimelineAlignment
	var TimelineAlignment = commonsLibrary.TimelineAlignment;

	/**
	* Constructor for the Social Timeline Component.
	*
	* Accepts an object literal <code>mSettings</code> that defines initial
	* property values, aggregated and associated objects as well as event handlers.
	*
	* @param {string} [sId] id for the new control, generated automatically if no id is given
	* @param {object} [mSettings] initial settings for the new control
	*
	* @class
	* Social Timeline
	* @extends sap.ui.core.UIComponent
	* @version 1.27.0-SNAPSHOT
	*
	* @deprecated Since version 1.34.0. For new integrations and existing implementations running on release 1.32 or later, use the Group Feed component (sap.collaboration.components.feed.Component), Business Object mode(sap.collaboration.FeedType.BusinessObjectGroups).  Note that the Group Feed component does not display any updates related to the business object from the back-end system (system updates).
	* @public
	* @name sap.collaboration.components.socialtimeline.Component
	*
	*/
	var Component = UIComponent.extend("sap.collaboration.components.socialtimeline.Component",
		/** @lends sap.collaboration.components.socialtimeline.Component.prototype */
		{
			metadata: {
				version: "1.0",
				includes: ["../resources/css/SocialTimeline.css"],
				dependencies:{
					libs: ["sap.collaboration"],
					components: [],
					ui5version: ""
				},
				config: {},
				customizing: {},
				rootView: null,
				publicMethods: ["setBusinessObject", "setBusinessObjectKey", "setBusinessObjectMap", "updateTimelineEntry", "deleteTimelineEntry"],
				aggregations: {
				},
				properties: {
					"enableSocial": {type:"boolean",group:"Social",defaultValue:true},
					"alignment": {type:"sap.suite.ui.commons.TimelineAlignment",group:"Misc",defaultValue:TimelineAlignment.Right},
					"axisOrientation": {type:"sap.suite.ui.commons.TimelineAxisOrientation",group:"Misc",defaultValue:TimelineAxisOrientation.Vertical},
					"noDataText": {type:"string",group:"Misc",defaultValue:null},
					"showIcons": {type:"boolean",group:"Misc",defaultValue:true},
					"visible": {type:"boolean",group:"Appearance",defaultValue:true},
					"width": {type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:'100%'},
					"customFilter": {type:"object[]", group:"Social"}
				},
				events : {
					"customActionPress": {}
				}
			},
			_defaultAttributes: {
				collaborationHostServiceUrl: "/sap/bc/ui2/smi/rest_tunnel/Jam/api/v1/OData",
				smiServiceUrl: "/sap/opu/odata/sap/SM_INTEGRATION_V2_SRV",
				pageSize: 10,
				jamOnly: false
			},

			/**
			* Initializes the Component instance after creation.
			* @protected
			* @memberOf sap.collaboration.components.socialtimeline.Component
			*/
			init: function(){
				this._oLogger = Log.getLogger("sap.collaboration.components.socialtimeline.Component");

				// OData service models
				this._oCollaborationHostModel;
				this._oSMIntegrationModel;

				// Timeline
				this._oTimeline;
				this._oTimelineModelData = {
					enableSocial: true,
					alignment: TimelineAlignment.Right,
					axisOrientation: TimelineAxisOrientation.Vertical,
					enableBackendFilter: true,
					enableScroll: true,
					forceGrowing: true,
					noDataText: null,
					showIcons: true,
					sort: true,
					visible: true,
					width: '100%',
					timelineData: [],
					suggestions: []
				};
				this._oTimelineModel = new JSONModel(this._oTimelineModelData);
				this._oTimelineModel.setSizeLimit(10000); // change max size for number of bound entries to 10000, default is 100
				this._oTimelineModel.bindProperty("/enableSocial").attachChange(this._onEnableSocialChange,this);
				this._iGrowingThreshold = this._defaultAttributes.pageSize;

				// Header Controls
				this._oFilterIcon;
				this._oContextSelect;
				this._oAddPostButton;

				// Business object
				this._oBusinessObjectMap = {};
				this._oBusinessObject = {};

				// Utilities
				this._oCommonUtil = new CommonUtil(); // display error, language bundle, date format
				this._oDateUtil = new DateUtil();
				// Language Bundle
				this._oLanguageBundle = this._oCommonUtil.getLanguageBundle();

				// Handlers
				this._oTimelineDataHandler;
				this._oJamDataHandler;
				this._oSMIntegrationDataHandler;

				// Filter
				this._oFilterPopover;
				this._oFilterConstants = new FilterType();
				this._oFilter = {};

				// Reply
				this._oRepliesData;
				this._oReplyPopover;

				// Add Post
				this._oAddPostPopover;

				// Social Profile
				this._oSocialProfile;

				// User that is currently logged in
				this._oTimelineUser = {};

				// Input Parameters Validation
				this._oInputValidator;

				// promise for getting the timeline data
				this._oGettingTimelineData;

				this._initialize(); // initialize Utilities and Handlers

				this._oInputValidator = new InputValidator(this);


				UIComponent.prototype.init.apply(this); // call superclass; needed to call createContent
			},
			/**
			* Cleans up the component instance before destruction.
			* @protected
			* @memberOf sap.collaboration.components.socialtimeline.Component
			*/
			exit: function() {
				if (this._oTimeline){
					this._oTimeline.destroy();
				}
				if (this._oAddPostPopover){
					this._oAddPostPopover.destroy();
				}
				if (this._oReplyPopover){
					this._oReplyPopover.destroy();
				}
				if (this._oFilterPopover){
					this._oFilterPopover.destroy();
				}
				if (this._oSocialProfile){
					this._oSocialProfile.destroy();
				}
				if (this._oInputValidator){
					this._oInputValidator.destroy();
				}
				if (this._oFilterIcon){
					this._oFilterIcon.destroy();
				}
				if (this._oContextSelect){
					this._oContextSelect.destroy();
				}
				if (this._oAddPostButton){
					this._oAddPostButton.destroy();
				}

	//			this._stopAutoCheckingForNewUpdates();
			},
			/**
			* Function is called when the rendering of the Component Container is started.
			* @protected
			* @memberOf sap.collaboration.components.socialtimeline.Component
			*/
			onBeforeRendering: function(){

				if ( this._oInputValidator.areSocialFeaturesEnabled() === true ){
					if ( !this._oBusinessObject.key || this._oBusinessObject.key === "" ){
						this._oTimeline._filterIcon.setEnabled(false); // disabled filter icon if business object key is not set
						this._oContextSelect.setEnabled(false); // disable context selector if the business object is not set
					}
				}
				else {
					if ( !this._oBusinessObject.key || this._oBusinessObject.key === "" ){
						this._oTimeline._filterIcon.setEnabled(false); // disabled filter icon if business object key is not set
					}
					this._oContextSelect.setVisible(false); // hide the context selector if the social features are disabled.
					this._oAddPostButton.setVisible(false); // hide the add post button if the social features are disabled.
				}

				this._getLoggedInUser();
				this._bindTemplates();
			},

			/**
			* Function is called when the rendering of the Component Container is completed.
			* @protected
			* @memberOf sap.collaboration.components.socialtimeline.Component
			*/
			onAfterRendering: function() {
			},
			/**
			 * The method to create the Content (UI Control Tree) of the Component.
			 * @protected
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			createContent: function() {
				return this._createTimeline();
			},
			/**
			 * Set property of component
			 * @redefine
			 * @protected
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			setProperty: function(propertyName, propertyValue) {
				UIComponent.prototype.setProperty.call(this, propertyName, propertyValue);
				this._oLogger.info(propertyName + ": " + propertyValue);

				// Set the property to the Timeline's model
				switch (propertyName) {
				case 'enableSocial':
					var bEnableSocial = propertyValue;
					if (bEnableSocial === true) {
						bEnableSocial = this._oInputValidator.validateEnableSocial();
					}
					this._oTimelineModel.setProperty("/" + propertyName, bEnableSocial);
					break;
				case 'customFilter':
					var aCustomFilter = propertyValue;

					this._oInputValidator.validateCustomFilter();

					if (aCustomFilter && aCustomFilter.length !== 0) {
						this._oTimeline.setCustomFilter(this._getFilter());
						this._oTimeline._filterIcon.setEnabled(true);
					}
					else {
						this._oTimeline._filterIcon.setEnabled(false); // disabled filter icon no custom filters exist
					}
					break;
				default:
					this._oTimelineModel.setProperty("/" + propertyName, propertyValue);
					break;
				}


			},
			/**************************************************************************************
			 * PUBLIC METHODS for the Component
			 **************************************************************************************/
			/**
			* Setter for the Component settings.
			* @public
			* @param {object} settings A JSON object used to set the component settings, this object should contains the same
			* properties used in the constructor.
			* @memberOf sap.collaboration.components.socialtimeline.Component
			*/
			setSettings: function(settings){
				for (var key in settings) {
					if (settings.hasOwnProperty(key)) {
						this.setProperty(key, settings[key]);
					}
				}
			},

			/**
			 * Set the business object map. It is used to initialize the data needed to retrieve the timeline entries.
			 * This function must be called once before calling setBusinessObjectKey for the first time.
			 * @public
			 * @param {object} businessObjectMap required - JSON object containing the following properties:
			 * 	<ul>
			 * 		<li>{sap.ui.model.odata.ODataModel} serviceModel required - OData model to retrieve timeline entries
			 * 		<li>{string} servicePath: The relative path to the OData service for the business object (example: "/sap/opu/odata/sap/ODATA_SRV")
			 * 		<li>{string} collection: Entity collection name of the business object
			 * 		<li>{string} applicationContext: The application context (example: "CRM", "SD", etc.)
			 * 		<li>{function} customActionCallback: A callback function to determine which timeline entries should receive the custom action. The function should return an array of text/value objects.
			 * 	<ul>
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			setBusinessObjectMap: function(oBusinessObjectMap){
				this._oLogger.info("servicePath: " + oBusinessObjectMap.servicePath);
				this._oLogger.info("collection: " + oBusinessObjectMap.collection);
				this._oLogger.info("applicationContext: " + oBusinessObjectMap.applicationContext);

				// recreate timeline terms utility with new object map
				this._oBusinessObjectMap = oBusinessObjectMap;

				this._validateBusinessObjectMap();

				this._defaultAttributes.jamOnly = isEmptyObject(this._oBusinessObjectMap.serviceModel);

				var oTimelineTermsUtility;
				var oServiceDataHandler;
				if (this._defaultAttributes.jamOnly) {
					this._oFilter = {
							type: this._oFilterConstants.FILTER_TYPE.feedUpdates
					};
					this._oContextSelect.setVisible(false);
					this._oTimeline._filterIcon.setVisible(false);
				}
				else {
					this._oContextSelect.setVisible(true);
					this._oTimeline._filterIcon.setVisible(true);
					oTimelineTermsUtility = this._oInputValidator.createTermsUtilityForBackend(this._oBusinessObjectMap.serviceModel);
					oServiceDataHandler = new ServiceDataHandler(this._oBusinessObjectMap.serviceModel, oTimelineTermsUtility);
				}

				this._oTimelineDataHandler = new TimelineDataHandler(
						this._oBusinessObjectMap,
						this._oJamDataHandler,
						this._oSMIntegrationDataHandler,
						oServiceDataHandler,
						oTimelineTermsUtility,
						this._iGrowingThreshold,
						this._oInputValidator.areSocialFeaturesEnabled(),
						this._oInputValidator.areBackendFeaturesEnabled());
			},
			/**
			 * Set the current business object for the social timeline to display.
			 * Note: The function setBusinessObjectMap must be called once before calling setBusinessObjectKey for the first time.
			 * @deprecated since 1.28.5. This method is deprecated, use method setBusinessObject instead.
			 * @public
			 * @param {string} sKey
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			setBusinessObjectKey: function(sKey){
				this._oLogger.info("Business Object Key: " + sKey);

				if (!this._oTimelineDataHandler){
					this._oLogger.error("Function setBusinessObjectMap must be called before calling setBusinessObjectKey for the first time.");
				}

				// Since the business object key is set, we enable the filter and context selector but disable the add post button
				// because the default context is 'System Updates'.
				this._oTimeline._filterIcon.setEnabled(true);
				this._oAddPostButton.setEnabled(false);
				this._oContextSelect.setEnabled(true);

				// for backwards compatibility, we set the name the same as the key and set the key/name to this._oBusinessObject
				this._oBusinessObject = {key: sKey, name: sKey};
				this._oTimelineDataHandler.setBusinessObject(this._oBusinessObject);

				if (!this._defaultAttributes.jamOnly) {
					this._resetFilterAndContextSelector();
				}

				this._refreshTimelineModel();
			},
			/**
			 * Set the current business object for the social timeline to display.
			 * Note: The function setBusinessObjectMap must be called once before calling setBusinessObject for the first time.
			 * @public
			 * @param {object} oObject - an object that contains the key and name for the business object
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			setBusinessObject: function(oObject){
				this._oBusinessObject = oObject;

				this._oLogger.info("Business Object Key: " + this._oBusinessObject.key);
				this._oLogger.info("Business Object Name: " + this._oBusinessObject.name);
				if (!this._oTimelineDataHandler){
					this._oLogger.error("Function setBusinessObjectMap must be called before calling setBusinessObject for the first time.");
				}
				this._validateBusinessObject();

				// Since the business object key is set, we enable the filter and context selector but disable the add post button
				// because the default context is 'System Updates'.
				if (this._defaultAttributes.jamOnly) {
					this._oAddPostButton.setEnabled(true);
				}
				else {
					this._oTimeline._filterIcon.setEnabled(true);
					this._oAddPostButton.setEnabled(false);
					this._oContextSelect.setEnabled(true);
					this._oTimelineDataHandler.setBusinessObject(this._oBusinessObject); // set the current business object
				}

				if (!this._defaultAttributes.jamOnly) {
					this._resetFilterAndContextSelector();
				}

				this._refreshTimelineModel();
			},
			/**
			 * Update a Timeline Entry text.
			 * This method should be called when a custom action requires a content update of a Timeline entry and should only be called if an
			 * an update to the backend is performed successfully.
			 * @public
			 * @param {string} sText - the text that will be displayed in the content of the timeline entry
			 * @param {string} sId - the id of the timeline entry to update
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			updateTimelineEntry: function(sText, sId){
				// the embedded control consists of a flex box, we are setting the text of the first item in the flexbox here
				var oTimelineEntry = sap.ui.getCore().byId(sId);
				var oEmbCtrl = oTimelineEntry.getAggregation('embeddedControl');
				var aFlexBoxItems = oEmbCtrl._oFlexbox.getItems();

				aFlexBoxItems[0].setText(sText);
				// check if the timeline entry has a second item in the flexbox (e.g. link which contains 'and 2 other things') and remove it
				if (aFlexBoxItems.length > 1){
					for (var i = 1; i < aFlexBoxItems.length; i++){
						aFlexBoxItems[i].destroy();
					}
				}
				var oTimelineModel = oTimelineEntry.getModel();

				// get the index of the timeline entry from the content of the timeline
				var iTimelineEntryIndex = this._oTimeline.getContent().indexOf(oTimelineEntry);

				// update the timeline entry text in the model with the new text
				oTimelineModel.getData().timelineData[iTimelineEntryIndex].timelineItemData.text = sText;
				oTimelineModel.getData().timelineData[iTimelineEntryIndex].timelineItemData.timelineEntryDetails = []; // clear any timeline entry details
			},

			/**
			 * Delete a Timeline Entry.
			 * This method should be called when a custom action requires a deletion of a Timeline entry and should only be called if an
			 * a delete to the backend is performed successfully.
			 * @public
			 * @param {string} sId - the id of the timeline entry to delete
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			deleteTimelineEntry: function(sId){
				var oTimelineEntry = sap.ui.getCore().byId(sId);
				var oTimelineModel = oTimelineEntry.getModel();

				// get the index of the timeline entry from the content of the timeline
				var iTimelineEntryIndex = this._oTimeline.getContent().indexOf(oTimelineEntry);

				// remove the timeline entry from the model. The function splice removes items based on index and number of items to remove
				oTimelineModel.getData().timelineData.splice(iTimelineEntryIndex, 1);

				// by destroying this timeline entry it will also remove it from the content of the timeline
				oTimelineEntry.destroy();
			},
			/**************************************************************************************
			 * PRIVATE METHODS for the Component
			 **************************************************************************************/
			/**
			 * initialize the OData models and Jam data handler
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_initialize: function(){
				// OData service models
				var asJson = true;
				if (!this._oCollaborationHostModel){
					this._oCollaborationHostModel = new ODataModel(this._defaultAttributes.collaborationHostServiceUrl, asJson);
				}
				if (!this._oSMIntegrationModel){
					this._oSMIntegrationModel = new ODataModel(this._defaultAttributes.smiServiceUrl, asJson);
				}

				// Utilities
				if (!this._oJamDataHandler){
					this._oJamDataHandler = new JamDataHandler(this._oCollaborationHostModel);
				}
				if (!this._oSMIntegrationDataHandler){
					this._oSMIntegrationDataHandler = new SMIntegrationDataHandler(this._oSMIntegrationModel);
				}
			},
			/**
			 * Create the Timeline Control
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_createTimeline: function(){
				this._oTimeline = new Timeline( this.getId() + "_timeline", {
					enableSocial: "{/enableSocial}",
					alignment: "{/alignment}",
					axisOrientation: "{/axisOrientation}",
					enableBackendFilter: "{/enableBackendFilter}",
					enableScroll: "{/enableScroll}",
					forceGrowing: "{/forceGrowing}",
					noDataText: "{/noDataText}",
					showIcons: "{/showIcons}",
					visible: "{/visible}",
					width: "{/width}",
					sort: "{/sort}",
					data:[],
					grow: this._onGrow.bind(this),
				});
				this._modifyHeaderBar();

				this._oTimeline.setModel(this._oTimelineModel);
				return this._oTimeline;
			},
			/**
			 * Modify the Timeline Header Bar
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_modifyHeaderBar: function(){
				var oHeaderBar = this._oTimeline.getHeaderBar();

				var contents = oHeaderBar.getContent();
				this._oFilterIcon = contents[contents.length - 1];

				// create the Context Selector
				this._oContextSelect = this._createContextSelector();
				oHeaderBar.insertContent(this._oContextSelect, 0);

				// create the Add Post button
				this._oAddPostButton = this._createAddPostButton();
				oHeaderBar.insertContent(this._oAddPostButton, 3);
			},
			/**
			 * Create the Context Selector Control
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_createContextSelector: function(){

				var onContextSelectButtonPress = function(oEvent){
					var oContextSelect = sap.ui.getCore().byId(this.getId() + "_context_select");

					var oContextSelectPopover = sap.ui.getCore().byId(this.getId() + "_context_select_popover");
					if (oContextSelectPopover == undefined ){
						// entries in the context selector
						var oTimelineContextData = [];
						oTimelineContextData.push({context_type: this._oFilterConstants.FILTER_TYPE.systemUpdates, context_text: this._oLanguageBundle.getText("ST_CONTEXT_SYSTEM_UPDATES")});
						oTimelineContextData.push({context_type: this._oFilterConstants.FILTER_TYPE.feedUpdates, context_text: this._oLanguageBundle.getText("ST_CONTEXT_DISCUSSION_POSTS")});
						var oTimelineContextModel = new JSONModel(oTimelineContextData);
						this.setModel(oTimelineContextModel, "timeline_context");	// save model in the Social Timeline Component
						// context select list
						var oContextSelectItemTemplate = new Item({key:"{context_type}", text:"{context_text}"});
						var oContextSelectList = new SelectList(this.getId() + "_context_select_list",
								{	selectedKey: this._oFilterConstants.FILTER_TYPE.systemUpdates,
									selectionChange: [this._onContextSelect, this],
									width: "15rem"
						});
						oContextSelectList.bindAggregation("items", { path: "/", template: oContextSelectItemTemplate});
						oContextSelectList.setModel(oTimelineContextModel);

						// context select popover
						oContextSelectPopover = new Popover(this.getId() + "_context_select_popover",
								{	placement: PlacementType.VerticalPreferedBottom,
									title: this._oLanguageBundle.getText("ST_CONTEXT_SELECT_HEADER")
						});
						oContextSelectPopover.addContent(oContextSelectList);
					}

					oContextSelectPopover.getContent()[0].setSelectedKey(this._oFilter.type);
					oContextSelectPopover.openBy(oContextSelect);
				};

				var oContextSelect = new Button( this.getId() + "_context_select",
						{ 	icon: "sap-icon://navigation-down-arrow",
							iconFirst: false,
							text: this._oLanguageBundle.getText("ST_CONTEXT_SYSTEM_UPDATES"),
							type: ButtonType.Transparent,
							press: [onContextSelectButtonPress, this]
				});

				return oContextSelect;
			},
			/**
			 * Create the Add Post Button
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_createAddPostButton: function(){
				if (this._oAddPostPopover === undefined){
					this._oAddPostPopover = new ResponsivePopover(this.createId("_addPostPopover"), {
						placement: PlacementType.Auto,
						title: this._oLanguageBundle.getText("ST_ADD_POST_TITLE"),
						contentWidth:"25rem",
						contentHeight:"10rem",
						content: new SocialTextArea(this.createId("social_TextArea"), {
							height: "10rem",
							width: "100%",
							enableNotifyAll: false,
							liveChange: [function(oEvent) {
								oEvent.getParameter("value").trim() !== "" ? this.byId("addPost_postButton").setEnabled(true) : this.byId("addPost_postButton").setEnabled(false);
							}, this],
							suggest: [this._onSuggest, this],
							afterSuggestionClose: [function() {
								if (this.gettingSuggestions) {
									this.gettingSuggestions.request.abort();
								}
							}, this]
						}),
						endButton: new Button(this.createId("addPost_postButton"), {
							text : this._oLanguageBundle.getText("ST_ADD_POST_BUTTON"),
							enabled: false,
							press: [this._onAddPost, this],
						}),
						beginButton: new Button(this.createId("addPost_atMentionButton"), {
							text: "@",
							press: [function() {
								this.byId("social_TextArea").atMentionsButtonPressed();
							}, this]
						})
					}).setInitialFocus(this.byId("social_TextArea"));
				}

				var oAddPostButton = new Button(this.createId("_addPostButton"), {
					icon: "sap-icon://add",
					type: ButtonType.Transparent,
					enabled: false,
					press: [function(){
						this._oAddPostPopover.openBy(this.byId("_addPostButton"));
					}, this]
				});
				return oAddPostButton;
			},
			/**
			 * Refreshes the model for the timeline control
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_refreshTimelineModel: function(){
				var that = this;
	//			this._stopAutoCheckingForNewUpdates();

				this._oTimeline.setBusyIndicatorDelay(0).setBusy(true);

				this._oGettingTimelineData =
					this._oTimelineDataHandler.getTimelineData(this._oFilter, this._defaultAttributes.jamOnly ? this._oBusinessObject : null).then(
						function(oTLData){
							that._oTimeline.setBusy(false);
							that._oFilter.text === undefined || that._oFilter.text === that._oLanguageBundle.getText("ST_FILTER_ALL") ?
									that._oTimeline.setCustomMessage("") : that._oTimeline.setCustomMessage(that._oLanguageBundle.getText("ST_FILTER_TEXT") + " " + that._oFilter.text);
							that._oTimeline.destroyContent();
							that._oTimelineModelData.timelineData = oTLData;
							that._oTimelineModel.setData(that._oTimelineModelData);

							that._setReplies(); // set the replies

							// Removing since JAM api in not working correctly and socialtimeline is being deprecated
	//						if (that._oFilter.type !== that._oFilterConstants.FILTER_TYPE.systemUpdates
	//								&& that._oFilter.type !== that._oFilterConstants.FILTER_TYPE.custom) {
	//							that._startAutoCheckingForNewUpdates();
	//						}


						},
						function(oError){
							that._oCommonUtil.displayError();
							that._oTimeline.setBusy(false);
					});
			},
			/**
			 * Create and bind the Timeline and Filter Item template to the Timeline
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_bindTemplates: function(){

				if ( this._oTimeline.getBinding("content").getPath() !== "/timelineData"){
					var oCustomDataTemplate = new CustomData({
						key:"{key}",
						value: "{value}"
					});

					var oTLItemTemplate = new TimelineItem({
						dateTime: "{timelineItemData/dateTime}",
						userName: "{timelineItemData/userName}",
						title: "{timelineItemData/title}",
						icon: "{timelineItemData/icon}",
						filterValue: "{timelineItemData/filterValue}",
						userNameClickable: "{/enableSocial}",
						userNameClicked: this._onUserNameClicked,
						userPicture: "{timelineItemData/userPicture}",
						embeddedControl: this._createEmbeddedControl(),
						customAction: {
							template: oCustomDataTemplate,
							path: "timelineItemData/customActionData"
						},
						customActionClicked: this._onCustomActionClicked.bind(this),
						replyCount: "{timelineItemData/replyCount}",
						replyListOpen: this._onReplyListOpen.bind(this)
					});
					this._oTimeline.bindAggregation("content", {
						path: "/timelineData",
						template: oTLItemTemplate
					});
				}
			},
			/**
			 * Returns the embedded control for the timeline
			 * @param {object} oTLItemData
			 * @returns {sap.collaboration.components.socialtimeline.controls.TimelineItemEmbedded}
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_createEmbeddedControl: function(oTLItemData){

				var oTimelineItem = (oTLItemData === undefined) ? "{}" : oTLItemData;

				var oEmbeddedControl = new TimelineItemEmbedded({
					timelineItem: oTimelineItem,
					expandCollapseClick: [function() {
						this._oTimeline.adjustUI();

					}, this],

					atMentionClick: [this._getAtMentionClicked, this]
				});
				return oEmbeddedControl;
			},
			/**
			 * Returns the custom filter for the timeline
			 * @private
			 * @returns {sap.m.ResponsivePopover}
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_getFilter: function(){
				var aCustomFilter = this.getCustomFilter();
				var iCustomFilterLength =  aCustomFilter.length;
				for (var i = 0; i < iCustomFilterLength; i++) {
					aCustomFilter[i].type = this._oFilterConstants.FILTER_TYPE.custom;
				}
				var aFilter = [{text: this._oLanguageBundle.getText("ST_FILTER_ALL"), type: this._oFilterConstants.FILTER_TYPE.systemUpdates}].concat(aCustomFilter);

				if (!this._oFilterPopover){
					var oJSONModel = new JSONModel({ filter: aFilter });
					var oStandardListItem = new StandardListItem({
						title: "{text}"
					});
					this._oFilterPopover = new FilterPopover(this.getId() + "_filterPopover", {
						title: this._oLanguageBundle.getText("ST_FILTER_HEADER"),
						selectionChange: [function(oControlEvent){
							this._oFilter = oControlEvent.getParameter("listItem").getBindingContext().getObject();
							this._oTimelineDataHandler.reset();
							this._refreshTimelineModel();
						}, this]
					}).setModel(oJSONModel).bindItems("/filter", oStandardListItem);
					this._oFilterPopover.setSelectedItem(this._oFilterPopover.getItems()[0]); // set the first item as the selected on
				}
				else {
					this._oFilterPopover.getModel().setProperty("/filter", aFilter);
				}

				return this._oFilterPopover;
			},
			/**
			 * Resets the Filter and the Context Selector in the UI
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_resetFilterAndContextSelector: function(){
				this._resetFilter();
				// reset context selector
				this._oContextSelect.setText(this._oLanguageBundle.getText("ST_CONTEXT_SYSTEM_UPDATES"));
			},
			/**
			 * Resets the Filter
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_resetFilter: function() {
				this._oTimelineModel.setProperty("/sort", true);
				this._oFilter = {type: this._oFilterConstants.FILTER_TYPE.systemUpdates};
				if (this._oFilterPopover){
					this._oFilterPopover.setSelectedItem(this._oFilterPopover.getItems()[0]);
				}
			},
			/**
			 * TODO: This method needs to be revisited until it is not needed
			 * Go through the timeline items and hide the 'Reply' if social features are disabled.
			 * Otherwise set a custom reply for each timeline item.
			 * Also removes the reply for Timeline Entries because the anchor feed on Jam is not yet implemented.
			 * This is a workaround implementation until a better solution comes from the Timeline and Jam.
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_setReplies: function(){
				var that = this;
				var aTimelineItems = this._oTimeline.getContent();
				aTimelineItems.forEach(function(oTLItem){
					var oTLData = oTLItem.getBindingContext().getObject();
					if (!oTLData._feedEntryData){
						that._hideReply(oTLItem);
					}
					else {
						oTLItem.setCustomReply(that._createReplyPopover());
					}
				});
			},
			/**
			 * TODO: This method needs to be revisited until it is not needed
			 * Removes the reply link from a timeline item
			 * @param oTLItem
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_hideReply: function(oTLItem){
				oTLItem._replyLink.setVisible(false);
			},
			/**
			 * Show the Social Profile for an @mention that was clicked in the feed
			 * @param {object} oSource
			 * @param {object} oLink - a reference to the link control
			 * @param {string} sEmail - the email linked with the @mention link
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_showSocialProfile: function(oSource, oLink, sEmail){
				if (oSource){
					// get the Component of the Social Timeline to have a single instance of the SocialProfile
					var oSocialTimelineComponent = oSource.getParent().getParent().getParent();

					if (!oSocialTimelineComponent._oSocialProfile){
						oSocialTimelineComponent._oSocialProfile = sap.ui.getCore().createComponent({
							name:"sap.collaboration.components.socialprofile",
							id: this.getId() + "_socialProfile"
						});
						 //copy odata service urls to the Social Profile
						oSocialTimelineComponent._oSocialProfile._defaultAttributes = oSocialTimelineComponent._defaultAttributes;
					}
					var oSettings = {
							openingControl: oLink,
							memberId: sEmail
					};
					oSocialTimelineComponent._oSocialProfile.setSettings(oSettings);
					oSocialTimelineComponent._oSocialProfile.open();
				}
			},
			/**
			 * Get the Feed Entry ID given a Feed List Item
			 * @param {object} oTimelineItem - The TimelineItem event corresponding to the Feed List Item
			 * @returns {string} sFeedEntryId - The Feed Entry ID
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_getFeedId: function(oTimelineItem){
				var sPath = oTimelineItem.getBindingContext().getPath();
				var aPathElements = sPath.split("/");
				var sPosition = aPathElements[aPathElements.length - 1];
				var sFeedEntryId = oTimelineItem.getModel().getData().timelineData[sPosition]._feedEntryData.Id;

				return sFeedEntryId;
			},
			/**
			 * Get the sender from Jam and assign it to a member attribute of the component.
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_getLoggedInUser: function(){
				var that = this;
				var oGetSender = this._oJamDataHandler.getSender();
				oGetSender.promise.done(function(oJamResults, response){
					that._oTimelineUser = oJamResults;
				});

				oGetSender.promise.fail(function(oError){
					that._oLogger.error('Failed to get the sender', oError.stack);
					//that._oCommonUtil.displayError(that._oLanguageBundle.getText('ST_POST_REPLY_FAILED'));
				});
			},

			/**
			 * Adds a TimelineItem control to the Timeline control
			 * @param {object} oTLItemData - data for a timeline item
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_addTimelineItemToTimeline: function(oTLItemData){
				// add timeline item data to the timeline control's data model
				var aModelData = this._oTimeline.getModel().getData();
				aModelData.timelineData.push(oTLItemData);

				var oTimelineItem = new TimelineItem({
					dateTime: oTLItemData.timelineItemData.dateTime,
					userName: oTLItemData.timelineItemData.userName,
					title: oTLItemData.timelineItemData.title,
					text: oTLItemData.timelineItemData.text,
					icon: oTLItemData.timelineItemData.icon,
					userNameClickable: true,
					userNameClicked: this._onUserNameClicked,
					userPicture: oTLItemData.timelineItemData.userPicture,
					embeddedControl: this._createEmbeddedControl(oTLItemData),
					replyCount: oTLItemData.timelineItemData.replyCount,
					replyListOpen: this._onReplyListOpen.bind(this),
					customReply: this._createReplyPopover(),
				});

				// insert the timeline item to the timeline
				this._oTimeline.insertContent(oTimelineItem, 0);

				// get the index of the timeline item in the model
				// create a binding context using this index and set this binding context to the timeline item
				var iFeedEntryIndex = aModelData.timelineData.indexOf(oTLItemData);
				var oContext = oTimelineItem.getParent().getModel().createBindingContext("/timelineData/" + iFeedEntryIndex);
				oTimelineItem.setBindingContext(oContext);
			},
			/**************************************************************************************
			 * Validation methods for the Social Timeline
			 **************************************************************************************/
			/**
			 * Validation for the input parameters.
			 * Parameters not validated here will be handled by the framework.
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_validateInputParameters: function(){
				this._oInputValidator = new InputValidator(this);

				if (!this._oInputValidator.areCustomFiltersValid()){
					this.destroy();
				}
				return this._oInputValidator;
			},
			/**
			 * Validation for the parameters of the function setBusinessObjectMap.
			 *
			 * Note: Validating the return statement for the function customActionCallback is done when the function gets executed in the method
			 * TimelineDataHandler._mapTimelineEntriesToTimelineItems. Here we validate whether the customActionCallback is a function.
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_validateBusinessObjectMap: function(){
				if (!this._oInputValidator){
					this._validateInputParameters();
				}
				if (!this._oInputValidator.isBusinessObjectMapValid(this._oBusinessObjectMap)){
					this.destroy();
				}
			},
			/**
			 * Validation for the object passed to the function setBusinessObject.
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_validateBusinessObject: function(){
				if (!this._oInputValidator){
					this._validateInputParameters();
				}
				if (!this._oInputValidator.isBusinessObjectValid(this._oBusinessObject)){
					this.destroy();
				}
			},

			/*************************************************************************************
			 * EVENT HANDLERS
			 *************************************************************************************/
			/**
			 * Event handler for the context selector.
			 * Changes the context of the Timeline between System Updates and Feed Updates
			 * @param {object} oEvent
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component		 */
			_onContextSelect: function(oEvent) {

				var oSelectedContext = oEvent.getParameter("selectedItem");

				this._oFilter = {type: oSelectedContext.getKey()}; // set the context
				// disable the filter icon if the context is Feed Updates
				if (oSelectedContext.getKey() == this._oFilterConstants.FILTER_TYPE.feedUpdates) {
					this._oTimelineModel.setProperty("/sort", false);
					this._oFilterIcon.setEnabled(false);
					this._oAddPostButton.setEnabled(true); // enable add post button if the context is jam feed
				}
				else {
					if (!this._defaultAttributes.jamOnly) {
						this._resetFilter();
					}
					this._oFilterIcon.setEnabled(true);
					this._oAddPostButton.setEnabled(false); // disable add post button if the context is system updates
				}
				// refresh the timeline
				this._oTimelineDataHandler.reset();
				this._refreshTimelineModel();

				// close the popover and change the context select button's text
				var oContextSelectPopover = sap.ui.getCore().byId(this.getId() + "_context_select_popover");
				oContextSelectPopover.close();
				this._oContextSelect.setText(oSelectedContext.getText());
			},
			/**
			 * Event handler for the grow event.
			 * Appends the next page of data to the model for the timeline control
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_onGrow: function(){
				var that = this;
				// if the previous request to get the timeline data is not finish,
				if (!this._oGettingTimelineData || this._oGettingTimelineData.state() != "pending"){
					this._oGettingTimelineData =
						this._oTimelineDataHandler.getTimelineData(this._oFilter)
						.then(
							function(oTLData){
								var oData = that._oTimelineModel.getData();
								oData.timelineData = oData.timelineData.concat(oTLData);
								that._oTimelineModel.setData(oData);

								that._setReplies();
							},
							function(oError){
								 that._oCommonUtil.displayError();
						});
				}
				else {
					this._oLogger.info("A previous request is still pending.");
				}
			},
			/**
			 * Event handler for userNameClicked event
			 * @param {object} oControlEvent - event when the user name is clicked
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_onUserNameClicked: function(oControlEvent){
				var oSocialTimelineComponent = oControlEvent.getSource().getParent().getParent(); // get the Component of the Social Timeline to have a single instance of the SocialProfile
				var oTimeline = oControlEvent.getSource().getParent();
				var oTimelineEntry = oControlEvent.getSource();

				if (!oSocialTimelineComponent._oSocialProfile){
					oSocialTimelineComponent._oSocialProfile = sap.ui.getCore().createComponent(
										{	name:"sap.collaboration.components.socialprofile",
											id: this.getId() + "_socialProfile"
					});
					oSocialTimelineComponent._oSocialProfile._defaultAttributes = oSocialTimelineComponent._defaultAttributes; //copy odata service urls to the Social Profile
				}
				var iTimelineEntryIndex = oTimeline.getContent().indexOf(oTimelineEntry);
				var oSettings = {
						openingControl: oTimelineEntry._userNameLink,
						memberId: oTimeline.getModel().getData().timelineData[iTimelineEntryIndex].timelineItemData.userEmail
				};
				oSocialTimelineComponent._oSocialProfile.setSettings(oSettings);
				oSocialTimelineComponent._oSocialProfile.open();
			},
			/**
			 * Event handler for adding post
			 *
			 * 1 - get the external object
			 * 2 - add a post for the external object in Jam
			 * 3 - add timeline item to the timeline control for a smooth UI transition
			 *
			 * @param {object} oControlEvent - event when the + add post button
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_onAddPost: function(oControlEvent) {
				var that = this;
				var sContent = this.byId("social_TextArea").convertTextWithFullNamesToEmailAliases();

				this.byId("_addPostPopover").close();

				// post the user content if it's not empty
				if (sContent && sContent.trim() !== "") {
					this._oTimeline.setBusyIndicatorDelay(0).setBusy(true);

					// add a post for the external object
					this._oJamDataHandler.addPostToExternalObject(sContent, this._oTimelineDataHandler.getCurrentExternalBO())
					.then(function(oFeedEntryFromActivity) {
						that.byId("social_TextArea").clearText(); // clear the text in the add post popover if success
						that.byId("addPost_postButton").setEnabled(false); // disable the add post button until user types

						//if a backend filter is set, there's no need to show the new timeline item on the UI
						if (that._oFilter.type !== that._oFilterConstants.FILTER_TYPE.systemUpdates && that._oFilter.type !== that._oFilterConstants.FILTER_TYPE.custom) {
							// 3 - add timeline item to the timeline control for a smooth UI transition
							var oFeedEntryTLItem = that._oTimelineDataHandler._mapFeedEntriesToTimelineItems([oFeedEntryFromActivity])[0];
							that._addTimelineItemToTimeline(oFeedEntryTLItem);

							// check if the current user who created a new high level post is in the buffer, if not, then add it
							if (!that._oTimelineDataHandler.getUserInfoFromBuffer(oFeedEntryFromActivity.Creator.Email)) {
								that._oTimelineDataHandler.addUserInfoToBuffer(oFeedEntryFromActivity.Creator);
							}

						}
					})
					.always(function() {
						that._oTimeline.setBusy(false);
					})
					.fail(function() {
						that._oCommonUtil.displayError(that._oLanguageBundle.getText("ST_POST_TO_JAM_FAILED"));
					});
				}
				else {
					this._oLogger.info('Posting an empty comment is not allowed, no feed entry will be created.');
				}
			},
			/**
			 * Event handler for the suggestions
			 *
			 * @param {object} oEventData
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_onSuggest: function(oEventData) {
				var that = this;

				if (this.gettingSuggestions) {
					this.gettingSuggestions.request.abort();
				}

				var oSocialTextArea = oEventData.getSource();
				var sValue = oEventData.getParameter("value");
				if (sValue.trim() === "") { // if value is empty then it's the suggestions is triggered but user has not entered any text yet
					oSocialTextArea.showSuggestions([]);
				}
				else {
					this.gettingSuggestions = this._oJamDataHandler.getSuggestions(sValue);

					this.gettingSuggestions.promise.done(function(oData, response) {
						var aJamResults = oData.results;
						if (aJamResults.length === 0) { // if nothing is returns from jam then close the suggestion popover
							oSocialTextArea.closeSuggestionPopover();
						}
						else {
							var aSuggestions = [];
							for (var i = 0; i < aJamResults.length; i++) {
								aSuggestions.push({ fullName: aJamResults[i].FullName, email: aJamResults[i].Email,
													userImage: that._buildThumbnailImageURL(aJamResults[i].Id) });
							}
							oSocialTextArea.showSuggestions(aSuggestions);
						}
				});

					this.gettingSuggestions.promise.fail(function(oError) {
						// we need this check since an aborted request also causes an error, but doesn't have a status code and should not be treated as an error
						if (oError.response && oError.response.statusCode){
							that._oCommonUtil.displayError(that._oLanguageBundle.getText("ST_GET_SUGGESTIONS_FAILED"));
						}
					});
				}
			},
			/**
			 * Event handler for customActionClicked event
			 * @param {object} oCustomActionEvent
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_onCustomActionClicked: function(oCustomActionEvent){
				var oCustomActionEventParam = {};
				var oBindingContext = oCustomActionEvent.getSource().getBindingContext();
				var sBindingPath = oBindingContext.getPath();
				var oOdataEntry = oCustomActionEvent.getSource().getModel().getProperty(sBindingPath + "/timelineItemData/customActionData/oDataEntry");

				oCustomActionEventParam.oDataEntry = oOdataEntry;
				oCustomActionEventParam.timelineEntryId = oCustomActionEvent.getParameters().id;
				oCustomActionEventParam.key = oCustomActionEvent.getParameters().key;
				this.fireCustomActionPress(oCustomActionEventParam);
			},
			/**
			 * Get the @mentions on the press of an @mention link in the feed.
			 * @param {object} oControlEvent
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_getAtMentionClicked: function(oControlEvent){

				var that = this;
				var aAtMentions = [];
				var oSource = oControlEvent.getSource();
				var oLink = oControlEvent.getParameter("link");

				var gettingAtMentions = this._oJamDataHandler.getAtMentions(oLink.getModel().getData().feedId);

				gettingAtMentions.promise.done(function(oJamResults, response){

					var placeholderIndex =  oLink.getModel().getProperty("/placeholderIndex");
					aAtMentions = oJamResults.results;

					that._showSocialProfile(oSource, oLink, aAtMentions[placeholderIndex].Email);
				});

				gettingAtMentions.promise.fail(function(){
					that._oLogger.error('Failed to retrieve the @mentions.');
					that._oCommonUtil.displayError(that._oCommonUtil.getLanguageBundle().getText('ST_GET_ATMENTIONS_FAILED'));
				});
			},

			/**
			 * Load replies for a specific High Level Feed when the user clicks on the Reply link of the TimelineItem.
			 * Fetch the replies from the Jam OData Service.
			 * Set the results to the Timeline OData Model.
			 *
			 * @param {object} oEventData - the event data
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_onReplyListOpen: function(oEventData) {
				if (!this._bReplyPopoverIsOpen) {
					this._bReplyPopoverIsOpen = true;
					var oTimelineItem = oEventData.getSource();

					try {
						var sFeedEntryId = this._getFeedId(oTimelineItem);
						if (!sFeedEntryId){
							throw new Error('Failed to get the feed entry ID.');
						}
					}
					catch (oError) {
						this._oLogger.error('Failed to get the feed entry ID');
						// In this case, the reply box needs to be closed manually.
						this._oCommonUtil.displayError(this._oLanguageBundle.getText('ST_GET_REPLIES_FAILED'));
						return;
					}

					this._getReplies(sFeedEntryId, undefined, oTimelineItem);
				}
			},
			/**
			 * Get the Replies based on whether the sFeedEntryId or sNextLink is passed:
			 * i- If the sFeedEntryId is passed, then the assumption is that it's the initial set of replies
			 * ii- If the sNextLink is passed, then the assumption is that the "Show More" link is pressed and the next link from SAP Jam is used
			 * to make the call to retrieve the next set of Replies
			 *
			 * @param {string} sFeedEntryId - the feed entry id
			 * @param {string} sNextLink - the next link from SAP Jam
			 * @param {object} oTimelineItem - the timeline item that corresponds to this Reply
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_getReplies: function(sFeedEntryId, sNextLink, oTimelineItem) {
				var that = this;

				oTimelineItem.getCustomReply().setBusyIndicatorDelay(0).setBusy(true);

				this.gettingReplies = this._oJamDataHandler.getReplies(sFeedEntryId, sNextLink);
				this.gettingReplies.promise.done(function(oJamResults, response){
					that._oRepliesData = oJamResults;
					var aReplies = oJamResults.results.reverse();

					// for each reply, build the image url and format the date
					aReplies.forEach(function(oReply){
						oReply.Creator.ThumbnailImage = that._oTimelineDataHandler.buildImageUrl(oReply.Creator);
						oReply.CreatedAt = that._oDateUtil.formatDateToString(oReply.CreatedAt);
					});

					oTimelineItem.getCustomReply().addReplies({
						data : aReplies,
						more : that._oRepliesData.__next ? true : false
					});
					oTimelineItem.getCustomReply().setBusy(false);
				});
				this.gettingReplies.promise.fail(function(oError){
					// we need this check since an aborted request also causes an error, but doesn't have a status code and should not be treated as an error
					if (oError.response && oError.response.statusCode){
						// In this case, the reply box is closed successfully when the error message is displayed
						that._oCommonUtil.displayError(that._oCommonUtil.getLanguageBundle().getText('ST_GET_REPLIES_FAILED'));
					}
				});
			},

			/**
			 * Returns ReplyPopover control
			 *
			 * @private
			 * @returns {sap.collaboration.components.controls.ReplyPopover}
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_createReplyPopover: function() {
				this._oReplyPopover = new ReplyPopover({
					socialTextArea: new SocialTextArea({
						height: "80px",
						width: "100%",
						enableNotifyAll: false,
						suggestionPlacement: PlacementType.Top,
						suggest: [this._onSuggest, this],
						afterSuggestionClose: [function() {
							if (this.gettingSuggestions) {
								this.gettingSuggestions.request.abort();
							}
						}, this]
					}),
					postReplyPress: [this._onPostReplyPress, this],
					moreRepliesPress: [function(oEventData) {
						var oTimelineItem = oEventData.getSource().getParent();
						if (this._oRepliesData.__next){
							this._getReplies(undefined, this._oRepliesData.__next, oTimelineItem);
						}
					}, this],
					afterClose: [function(oEventData){
						if (this.gettingReplies){
							this.gettingReplies.request.abort();
						}
						this._bReplyPopoverIsOpen = false;
					}, this],
				});

				this._oReplyPopover.getSocialTextArea().attachLiveChange(function(oEvent) {
					oEvent.getParameter("value").trim() !== "" ? this.enableButton(true) : this.enableButton(false);
				}.bind(this._oReplyPopover));

				return this._oReplyPopover;
			},

			/**
			 * Event handler for postReplyPress
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_onPostReplyPress: function(oEventData) {
				var that = this;
				var sValue = oEventData.getParameter("value");
				var oTimelineItem = oEventData.getSource().getParent();
				var oTimelineItemContextObject = oTimelineItem.getBindingContext().getObject();
				var sFeedId = oTimelineItemContextObject.timelineItemData.feedId;
				var oReplyPop = oTimelineItem.getCustomReply();

				oReplyPop.setBusyIndicatorDelay(0).setBusy(true);

				var oPostingReply = this._oJamDataHandler.postReply(sFeedId, sValue);

				// We need to put the focus on the text area to avoid the Popover from closing - not sure why it closes
				oReplyPop._oReplyTextArea.focus();
				oPostingReply.promise.done(function(oJamResults, response) {
					oReplyPop.getTextArea().clearText(); // clear the text in the reply popover
					oReplyPop.enableButton(false); // disable button until user types
					var oReply = {
						Text: oJamResults.results.Text,
						Creator: {
							Email: that._oTimelineUser.Email,
							FullName: that._oTimelineUser.FullName
						},
						CreatedAt: that._oDateUtil.formatDateToString(oJamResults.results.CreatedAt),
					};

					// method getUserPicture tries to get the image from the buffer, if does not exist, we build the image url
					var sUserImage = that._oTimelineDataHandler.getUserPicture(that._oTimelineUser.Email);
					sUserImage ? oReply.Creator.ThumbnailImage = sUserImage : oReply.Creator.ThumbnailImage = that._oTimelineDataHandler.buildImageUrl(oJamResults.results);

					oReplyPop.addReply(oReply);
					oReplyPop.setBusy(false);

					oTimelineItem.setReplyCount(oTimelineItem.getReplyCount() + 1);
				});
				oPostingReply.promise.fail(function(oError) {
					oReplyPop.setBusy(false);
					that._oCommonUtil.displayError(that._oLanguageBundle.getText("ST_POST_REPLY_FAILED"));
				});
			},
			/**
			 * Event handler for when the property enableSocial changes
			 * @private
			 * @param oEvent
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_onEnableSocialChange: function(oEvent) {
				var bEnableSocial = oEvent.getSource().getValue();
				(bEnableSocial === true) ?	this._oAddPostButton.setVisible(true) : this._oAddPostButton.setVisible(false);
			},


			/***************************************************
			 * FEED UPDATE METHODS
			 ***************************************************/
			/**
			 * Shows the number of new Feed Updates in the Timeline
			 * @param {integer} newFeedUpdatesCount: number of new feed updates
			 * @private
			 * @memberOf sap.collaboration.components.feed.views.GroupFeed
			 */
			_showFeedUpdatesInTimeline: function(newFeedUpdatesCount) {
				var oMessageStrip = this._oTimeline.getMessageStrip();

				if (newFeedUpdatesCount > 0) {
					if (!this.byId("refreshLink")) {
						var oRefreshLink = new Link(this.createId("refreshLink"), {
							text: this._oLanguageBundle.getText("GF_REFRESH_FEED"),
							press: [function() {
								// refresh the feed
	//							this._stopAutoCheckingForNewUpdates();
								this._hideFeedUpdatesInTimeline();
								this._oTimelineDataHandler.reset();
								this._refreshTimelineModel();
							}, this]
						});
						oMessageStrip.setLink(oRefreshLink);
						oMessageStrip.setType(MessageType.Information);
						oMessageStrip.setShowIcon(true);
					}
					newFeedUpdatesCount == 1 ? oMessageStrip.setText(this._oLanguageBundle.getText("GF_NEW_FEED_UPDATE")) :
						oMessageStrip.setText(this._oLanguageBundle.getText("GF_NEW_FEED_UPDATES", newFeedUpdatesCount));

					oMessageStrip.setVisible(true);
					this._oTimeline.rerender();
				}
			},
			/**
			 * Hide the number of new Feed Updates in the Timeline
			 * @private
			 * @memberOf sap.collaboration.components.feed.views.GroupFeed
			 */
			_hideFeedUpdatesInTimeline: function() {
				var oMessageStrip = this._oTimeline.getMessageStrip();
				oMessageStrip.close();
			},
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

				// get the first timeline item and get the Id
				var oLatestFeedEntry = this._oTimeline.getContent()[0];
				var sLatestTopLevelId = oLatestFeedEntry ? oLatestFeedEntry.getBindingContext().getObject()._feedEntryData.TopLevelId : '';
				var sExternalObjectId = this._oTimelineDataHandler.getCurrentExternalBO().Id;

				// check Jam for the new feed updates
				this._oJamDataHandler.getFeedUpdatesLatestCount(sLatestTopLevelId, sExternalObjectId).done(fnSuccess.bind(this)).fail(fnError.bind(this));
			},


			/**
			 * Returns a URL for the ThumbnailImage
			 * @param {string} sUserId
			 * @return {string}
			 * @private
			 * @memberOf sap.collaboration.components.socialtimeline.Component
			 */
			_buildThumbnailImageURL: function(sUserId) {
				return this._defaultAttributes.collaborationHostServiceUrl + "/Members('" + sUserId + "')/ThumbnailImage/$value";
			}
		}
	);

	/**
	 * Getter for property <code>alignment</code>.
	 * Timeline item alignment.
	 *
	 * Default value is <code>Right</code>
	 *
	 * @returns {sap.suite.ui.commons.TimelineAlignment} the value of property <code>alignment</code>
	 * @public
	 * @name sap.collaboration.components.socialtimeline.Component#getAlignment
	 * @function
	 * @memberOf sap.collaboration.components.socialtimeline.Component
	 */

	/**
	 * Setter for property <code>alignment</code>.
	 *
	 * Default value is <code>Right</code>
	 *
	 * @param {sap.suite.ui.commons.TimelineAlignment} oAlignment  new value for property <code>alignment</code>
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.collaboration.components.socialtimeline.Component#setAlignment
	 * @function
	 * @memberOf sap.collaboration.components.socialtimeline.Component
	 */

	/**
	 * Getter for property <code>axisOrientation</code>.
	 * Timeline axis orientation.
	 *
	 * Default value is <code>Vertical</code>
	 *
	 * @returns {sap.suite.ui.commons.TimelineAxisOrientation} the value of property <code>axisOrientation</code>
	 * @public
	 * @name sap.collaboration.components.socialtimeline.Component#getAxisOrientation
	 * @function
	 * @memberOf sap.collaboration.components.socialtimeline.Component
	 */

	/**
	 * Setter for property <code>axisOrientation</code>.
	 *
	 * Default value is <code>Vertical</code>
	 *
	 * @param {sap.suite.ui.commons.TimelineAxisOrientation} oAxisOrientation  new value for property <code>axisOrientation</code>
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.collaboration.components.socialtimeline.Component#setAxisOrientation
	 * @function
	 * @memberOf sap.collaboration.components.socialtimeline.Component
	 */

	/**
	 * Getter for property <code>noDataText</code>.
	 * This text is displayed when the control has no data.
	 *
	 * Default value is empty/<code>undefined</code>
	 *
	 * @returns {string} the value of property <code>noDataText</code>
	 * @public
	 * @name sap.collaboration.components.socialtimeline.Component#getNoDataText
	 * @function
	 * @memberOf sap.collaboration.components.socialtimeline.Component
	 */

	/**
	 * Setter for property <code>noDataText</code>.
	 *
	 * Default value is empty/<code>undefined</code>
	 *
	 * @param {string} sNoDataText  new value for property <code>noDataText</code>
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.collaboration.components.socialtimeline.Component#setNoDataText
	 * @function
	 * @memberOf sap.collaboration.components.socialtimeline.Component
	 */

	/**
	 * Getter for property <code>showIcons</code>.
	 * Show icon on each Timeline item.
	 *
	 * Default value is <code>true</code>
	 *
	 * @returns {boolean} the value of property <code>showIcons</code>
	 * @public
	 * @name sap.collaboration.components.socialtimeline.Component#getShowIcons
	 * @function
	 * @memberOf sap.collaboration.components.socialtimeline.Component
	 */

	/**
	 * Setter for property <code>showIcons</code>.
	 *
	 * Default value is <code>true</code>
	 *
	 * @param {boolean} bShowIcons  new value for property <code>showIcons</code>
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.collaboration.components.socialtimeline.Component#setShowIcons
	 * @function
	 * @memberOf sap.collaboration.components.socialtimeline.Component
	 */

	/**
	 * Getter for property <code>visible</code>.
	 * Set Timeline control visibility
	 *
	 * Default value is <code>true</code>
	 *
	 * @returns {boolean} the value of property <code>visible</code>
	 * @public
	 * @name sap.collaboration.components.socialtimeline.Component#getVisible
	 * @function
	 * @memberOf sap.collaboration.components.socialtimeline.Component
	 */

	/**
	 * Setter for property <code>visible</code>.
	 *
	 * Default value is <code>true</code>
	 *
	 * @param {boolean} bVisible  new value for property <code>visible</code>
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.collaboration.components.socialtimeline.Component#setVisible
	 * @function
	 * @memberOf sap.collaboration.components.socialtimeline.Component
	 */

	/**
	 * Getter for property <code>width</code>.
	 * Sets the width of the Timeline.
	 *
	 * Default value is <code>100%</code>
	 *
	 * @returns {sap.ui.core.CSSSize} the value of property <code>width</code>
	 * @public
	 * @name sap.collaboration.components.socialtimeline.Component#getWidth
	 * @function
	 * @memberOf sap.collaboration.components.socialtimeline.Component
	 */

	/**
	 * Setter for property <code>width</code>.
	 *
	 * Default value is <code>100%</code>
	 *
	 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.collaboration.components.socialtimeline.Component#setWidth
	 * @function
	 * @memberOf sap.collaboration.components.socialtimeline.Component
	 */

	/**
	 * Getter for property <code>customFilter</code>.
	 *
	 * Default value is <code>[]</code>. The customFilter is an array of objects, each object contains text and value.
	 * Text is the name of the filter category and value is the filter value.
	 *
	 * @returns {array} the value of property <code>customFilter</code>
	 * @public
	 * @name sap.collaboration.components.socialtimeline.Component#getCustomFilter
	 * @function
	 * @memberOf sap.collaboration.components.socialtimeline.Component
	 */

	/**
	 * Event fire when a custom action is clicked
	 *
	 * @name sap.collaboration.components.socialtimeline.Component#customActionPress
	 * @event
	 * @param {object} oEventData
	 * @public
	 * @memberOf sap.collaboration.components.socialtimeline.Component
	 */



	return Component;
});
