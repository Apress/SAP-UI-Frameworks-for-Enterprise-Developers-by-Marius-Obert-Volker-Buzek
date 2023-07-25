/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define([
	'sap/base/Log',
	'sap/collaboration/components/utils/CommonUtil',
	'sap/collaboration/library',
	'sap/ui/core/UIComponent',
	'sap/ui/model/odata/ODataModel',
	'sap/ui/core/mvc/View',
	'sap/ui/core/library'
],
	function(Log, CommonUtil, library, UIComponent, ODataModel, View, coreLibrary) {
	"use strict";

	// shortcut for sap.collaboration.FeedType
	var FeedType = library.FeedType;

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	// shortcut for sap.collaboration.AppType
	var AppType = library.AppType;

	/**
	 * Constructor for the Feed Component.
	 *
	 * @param {string} [sId] ID for the new component
	 * @param {object} [mSettings] Initial settings for the new component instance
	 * @since version 1.16
	 *
	 * @class Feed Component<br>
	 *
	 * A Feed Component is a ui5 component that applications can use to render a <tt>sap.m.App</tt> that embeds the JAM Feed Widget.<br>
	 * The Component class extends the base UI5 UIComponent class.<br>
	 * This class defines the Reusable UI5 Component structure, i.e properties, aggregations and events, if any, and creates the UI5 controls to be displayed.
	 *
	 * @name sap.collaboration.components.fiori.feed.Component
	 * @extends sap.ui.core.UIComponent
	 * @public
	 * @deprecated Since version 1.26.0.
	 * Please use sap.collaboration.components.fiori.feed.dialog.Component instead.
	 */
	var Component = UIComponent.extend("sap.collaboration.components.fiori.feed.Component",
			/** @lends sap.collaboration.components.fiori.feed.Component.prototype */ {
			metadata: {
				properties: {

					/**
					 * The width of the component.
					 */
					width: 		 			{type: "sap.ui.core.CSSSize", defaultValue: ""},

					/**
					 * The height of the component.
					 */
					height:		 			{type: "sap.ui.core.CSSSize", defaultValue: ""},

					/**
					 * The OData service URL needed for the Feed Component.
					 */
					oDataServiceUrl:		{type: "sap.ui.core.URI", defaultValue: "/sap/opu/odata/sap/SM_INTEGRATION_SRV"},

					/**
					 * The type of feed to be displayed. The available types are in @link sap.collaboration.FeedType.
					 */
					feedType:				{type: "string"},

					/**
					 * A comma separated list of the IDs of the groups to display in the widget.
					 */
					groupIds:				{type: "string"},

					/**
					 * A JSON object passed to the Feed component.
					 *
					 * It is required when the value of <tt>feedType</tt> is <tt>sap.collaboration.FeedType.object</tt> or <tt>sap.collaboration.FeedType.objectGroup</tt>.
					 * This object represents business related information, such as a sales order, an opportunity, etc. It contains the following properties:
					 * 		<ul>
					 *			<li><strong><tt>id</tt></strong>: The Business Object ID to be posted in the SAP Jam Feed. It needs to be an OData URL containing the relative path to the object in the back-end.</li>
					 *			<li><strong><tt>type</tt></strong>: The type of the Business Object. It needs to be the OData meta data URL to the corresponding Entity Collection.</li>
					 *			<li><strong><tt>name?</tt></strong> (optional): The description of the Business Object to be displayed in SAP Jam, i.e. "SO 57746", "Opportunity 123", etc.</li>
					 *			<li><strong><tt>ui_url?</tt></strong> (optional): The URL to navigate to the same Business Object in the application.</li>
					 *		</ul>
					 */
					object:					{type: "object"}

				},

				aggregations: {
				},

				events: {
				}
			},

			/**
			* Initialization of the Component (inherited from sap.ui.core.UIComponent).<br>
			* This method overrides its parent in order to initialize member variables and utility classes.
			* The default values for the component's  width and height value is set to 100%, since the child control needs these properties specified.
			* @private
			*/
			init: function(){
				//Initialize and apply constants for width and height
				this.CollaborationFeedConstants = {
					defaultWidth: '100%',
					defaultHeight: '100%'
				 };

				this.setWidth(this.CollaborationFeedConstants.defaultWidth);
				this.setHeight(this.CollaborationFeedConstants.defaultHeight);
				// For SP06 the split app mode is disabled.
				this.mode = AppType.widget;

				this.oCommonUtil = new CommonUtil();
				this.oLangBundle = this.oCommonUtil.getLanguageBundle();

				UIComponent.prototype.init.apply(this);
			},

			/**
			* Contract for passing the settings to the Component.
			* @public
			* @param {object} oSettings A JSON object containing the following attributes:
			* 		<ul>
			* 			<li><tt>{sap.ui.core.URI} oDataServiceUrl</tt>: The URL of the OData Service needed for the Feed Component.</li>
			* 			<li><tt>{sap.collaboration.FeedType} feedType</tt>: The type of feed to be displayed.</li>
			* 			<li><tt>{string} [groupIds?]</tt>: A comma separated list of Group IDs.</li>
			* 			<li><tt>{object} object</tt>: The representation of a Business Object.</li>
			* 		</ul>
			*/
			setSettings : function(oSettings) {
				this.setODataServiceUrl(oSettings.oDataServiceUrl);
				this.setFeedType(oSettings.feedType);
				this.setGroupIds(oSettings.groupIds);
				this.setObject(oSettings.object);
			},

			/**
			* Invoked before the Component is rendered (inherited from sap.ui.core.UIComponent).<br>
			* Initializes the OData model.
			* @private
			*/
			onBeforeRendering: function(){
				var asJson = true;

				try {
					this.bStopRendering = false; // Initialize the flag to continue rendering.
					this.validateInputParameters();
					this.sODataServiceUrl = this.getODataServiceUrl();
					if (!this.oOdataModel){
						this.oOdataModel = new ODataModel(this.sODataServiceUrl, asJson);
					}
				} catch (oError){
					//If an error occurs, it will be logged and displayed, and the flag this.bStopRendering will be turned on to be consumed by the onAfterRendering method.
					Log.error(oError, "", "sap.collaboration.components.fiori.feed.Component.onBeforeRendering()");
					this.bStopRendering = true; // If an error is thrown then stop rendering (onAfterRendering).
					this.oCommonUtil.displayError(oError);
				}

				// delete views before rendering
				if ( sap.ui.getCore().byId(this.getId() + "_oAppView") ){
					  sap.ui.getCore().byId(this.getId() + "_oAppView").destroy();
				}
				if ( sap.ui.getCore().byId(this.getId() + "_oSplitAppView") ){
					  sap.ui.getCore().byId(this.getId() + "_oSplitAppView").destroy();
				}
			},

			/**
			* Called when the Component has been rendered (inherited from sap.ui.core.UIComponent).<br>
			* Creates a View that represents a UI5 app and places this view in the Component main HTML DIV created by the render function.
			* @function
			* @private
			*/
			onAfterRendering: function(){
				if (!this.bStopRendering){
					// log properties
					Log.debug("Feed Component properties:", "",
							"sap.collaboration.components.fiori.feed.Component.onAfterRendering()");
					Log.debug("width: " + this.getWidth());
					Log.debug("height: " + this.getHeight());
					Log.debug("oDataServiceUrl: " + this.getODataServiceUrl());
					Log.debug("feedType: " + this.getFeedType());
					Log.debug("groupIds: " + this.getGroupIds());
					Log.debug("object: " + JSON.stringify(this.getObject()));

					try {
						if (this.getMode() === AppType.widget){
							var oAppView =
								sap.ui.view({
									id: this.getId() + "_oAppView",
									viewData : {
										controlId: this.getId(),
										odataModel:  this.oOdataModel,
										appType: this.getMode(),
										feedType: this.getFeedType(),
										groupIds: this.getGroupIds(),
										object: this.getObject(),
										langBundle: this.oLangBundle
									},
									type:ViewType.JS,
									viewName:"sap.collaboration.components.fiori.feed.app.App"
								});

							oAppView.placeAt(this.getId());
						}
						else if (this.getMode() === AppType.split){
							var oSplitAppView =
								sap.ui.view({
									id: this.getId() + "_oSplitAppView",
									viewData : {
										controlId: this.getId(),
										odataModel:  this.oOdataModel,
										appType: this.getMode(),
										object: this.getObject(),
										langBundle: this.oLangBundle
									},
									type:ViewType.JS,
									viewName:"sap.collaboration.components.fiori.feed.splitApp.SplitApp"
								});

							oSplitAppView.placeAt(this.getId());
						}
					} catch (oError){
						Log.error(oError, "", "sap.collaboration.components.fiori.feed.Component.onAfterRendering()");
						this.oCommonUtil.displayError(oError);
					}
				}
			},

			/**
			 * Renders the outer HTML for the Component (inherited from sap.ui.core.UIComponent).<br>
			 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
			 * @private
			 */
			render: function(oRm){
				oRm.openStart("div", this.getId()); /* FIXME: potential ID conflict as this is not an Element ID */
				oRm.style("width", this.getWidth());
				oRm.style("height", this.getHeight());
				oRm.openEnd();
				oRm.close("div");
			},

			/**
			 * Getter for the mode property
			 * @private
			 */
			getMode: function(){
				return this.mode;
			},

			/**
			 * Validate input parameters before creating the view, initializing OData, making server calls etc.
			 * @private
			 * @throws {Error} oErrorIncorrectInputParameters - Error thrown when the
			 */
			validateInputParameters : function(){
				var oErrorIncorrectInputParameters;

				//Validations are applied in the sequence they appear, throwing an error the moment a validation fails.  If all the validations pass then continue execution.

				//Applies to both, object and object group
				if (this.getFeedType() == FeedType.object || this.getFeedType() == FeedType.objectGroup){
					if (!this.getObject()){
						oErrorIncorrectInputParameters = new Error("Object is undefined or null");
						Log.error(oErrorIncorrectInputParameters, "", "sap.collaboration.components.fiori.feed.Component.validateInputParameters()");
						throw oErrorIncorrectInputParameters;
					} else if (!this.getObject().id){
						oErrorIncorrectInputParameters = new Error("Missing Object ID");
						Log.error(oErrorIncorrectInputParameters, "", "sap.collaboration.components.fiori.feed.Component.validateInputParameters()");
						throw oErrorIncorrectInputParameters;
					}
				}

				//Only applies to object
				if (this.getFeedType() == FeedType.object){
					if (!this.getObject().type){
						oErrorIncorrectInputParameters = new Error("Missing Object Type");
						Log.error(oErrorIncorrectInputParameters, "", "sap.collaboration.components.fiori.feed.Component.validateInputParameters()");
						throw oErrorIncorrectInputParameters;
					}
				}
			}
		}
	);

	return Component;
});
