/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define([
	'sap/base/Log',
	'sap/collaboration/components/utils/CommonUtil',
	'sap/collaboration/library',
	'sap/ui/core/UIComponent',
	'sap/ui/core/mvc/View',
	'sap/ui/core/library'
], function(Log, CommonUtil, library, UIComponent, View, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	/**
	 * Constructor for the share component
	 * @since version 1.16
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class Share Component
	 *
	 * A Share Component is a ui5 component that applications
	 * can use to share information to SAP Jam
	 * @name sap.collaboration.components.fiori.sharing.Component
	 * @public
	 * @deprecated Since version 1.26.0.
	 * Please use sap.collaboration.components.fiori.sharing.dialog.Component instead.
	 */
	var Component = UIComponent.extend("sap.collaboration.components.fiori.sharing.Component",
			/** @lends sap.collaboration.components.fiori.sharing.Component.prototype */ {

			metadata: {
				includes: ["../../resources/css/Sharing.css"],
				properties: {
					width: {type: "sap.ui.core.CSSSize", defaultValue: "100%"},
					height: {type: "sap.ui.core.CSSSize", defaultValue: "100%"},

					/**
					 * The OData service URL needed for the share component.
					 */
					oDataServiceUrl: {type: "sap.ui.core.URI", defaultValue: "/sap/opu/odata/sap/SM_INTEGRATION_V2_SRV"},

					collaborationHostODataServiceUrl: {type: "sap.ui.core.URI", defaultValue: "/sap/bc/ui2/smi/rest_tunnel/Jam/api/v1/OData"},
					tunnelServiceUrl: {type: "sap.ui.core.URI", defaultValue: "/sap/bc/z_sail_httproxy/Jam/api/v1/OData"},

					/**
					 * A JSON object passed to the share component. This object contains the following properties:
					 *		<ul>
					 *			<li>id (optional): is the object Id to be shared in SAP Jam, i.e a URL that navigates back to the same object in the application</li>
					 *			<li>display (optional): is a UI5 control to be displayed in the component UI</li>
					 *			<li>share (optional): is a note that will be displayed in the component UI and shared to SAP Jam too</li>
					 *		</ul>
					 */
					object: {type: "object"},

					/**
					 * @When you want to provide the user with the option to share file attachments,
					 * then the following properties need to be specified:
					 * <ul>
					 *   <li>attachmentsArray: An array of {@link sap.collaboration.components.fiori.sharing.attachment.Attachment} objects. This array offers users a list of files they can attach.</li>
					 * </ul>
					 */
					attachments: {type: "object"},

					/**
					 * A Business Object such as an Opportunity, Sales Order, Account, etc. from the back-end that will be shared as a Featured External Object in a Group in Jam.
					 * <code>
					 * <ul>
					 *  <li>{string} appContext: The application context. Example: "CRM", "SD", etc.</li>
					 *	<li>{string} odataServicePath: The relative path to the OData Service.  Example: "/sap/opu/odata/sap/ODATA_SRV"</li>
					 *  <li>{string} collection: The name of the OData Collection. Example: "Account", "Opportunity", etc.</li>
					 *  <li>{string} key: The key to identify a particular instance of the Business Object. It can be a simple ID or a compound key. Example: "123", "ObjectID='123'", "ObjectID='123',ObjectType='BUS000123'", etc.</li>
					 *  <li>{string} name: The short name of the Business Object. Example: "Sales Order 123", "Opportunity 123", "Account 123", etc.</li>
					 * </ul>
					 * </code>
					 * These attributes are not enforced by the UI (missing or incorrect values are not validated), but they are required to make the integration work.
					 * These attributes also should be mapped in the Back-end System and Jam in order to make the External Object work.
					 * <br><b>Note:</b> the externalObject is dependent on object.id, therefore, the object.id must also be passed to the Share Component. See the parameter "object" for more information.
					 */
					externalObject: {type: "object"}
				}
			},

			/**
			* Initialization of the Component
			* @private
			*/
			init: function(){
				this.oCommonUtil = new CommonUtil();
				this.oLangBundle = this.oCommonUtil.getLanguageBundle();
				this.sODataServiceUrl = undefined;
				this.sTunnelServiceUrl = undefined;
				this.sJamUrl = undefined;
				this.oODataUtil = undefined;

				this.oSharingView = undefined;

				this.oView = undefined;

				this.aJamGroups = [];

				// a flag that can be set to inform this component to bypass any OData call
				// so in this case the groups "this.aJamGroups" should be initialized by the caller like:
				// var oComp =  sap.ui.getCore().createComponent(....);
				// oComp.aJamGroups = aGroups;
				this.bOdataOn = true;
			},

			/**
			* Invoked before the Component is rendered.
			* @private
			*/
			onBeforeRendering: function(){
			},

			/**
			* Called when the Component has been rendered
			* Creates the sharing View or rerender it
			* @function
			* @private
			*/
			onAfterRendering: function(){
				// Log Component properties.
				this.logComponentProperties();
				if (this.bStopRendering === undefined || this.bStopRendering === false){
					this.oSharingView =  this.getSharingView();
					this.oSharingView.placeAt(this.getId());

				}
			},

			/**
			* Called when the Component is destroyed. Use this one to free resources and finalize activities.
			* Destroys the sharing view
			* @private
			*/
			exit: function() {
				// destroy the view in case the component is destroyed as the view will not be destroyed by default. It's not in the aggregation of the component.
				this.oSharingView.destroy();
			},

			/**
			* Setter for the Component settings.
			* @param {object} oSettings A JSON object used to set the component settings, this object should contains the same
			* properties used in the constructor.
			* @public
			*/
			setSettings : function(oSettings) {
				this.setODataServiceUrl(oSettings.oDataServiceUrl);
				this.setTunnelServiceUrl(oSettings.tunnelServiceUrl);
				this.setObject(oSettings.object);
				this.setAttachments(oSettings.attachments);
				this.setExternalObject(oSettings.externalObject);
			},

			/**
			 * Renders the outer HTML for the Component
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
			 * Creates and returns the sharing view
			 * @private
			 */
			getSharingView : function() {

				var oObjectDisplay;
				var sObjectShare;
				var sObjectId;
				var oObject = this.getObject();
				if (oObject){
					sObjectId = oObject.id;
					oObjectDisplay = oObject.display;
					sObjectShare = oObject.share;
				}

				var oComponentData = this.getComponentData();
				if (oComponentData) {
					this.oDialogComponent = oComponentData.dialogComponent;
				}

				var self = this;

				var fNoGroupsCallBack = function() {
					if (!self.oNoGroupsView){
						self.oNoGroupsView = sap.ui.view({
							id: self.getId() + "_NoGroupsView",
							viewData : {
								controlId: self.getId(),
								langBundle: self.oLangBundle,
								jamUrl: self.oSharingView.getController().sJamUrl,
							},
							type: ViewType.JS,
							viewName: "sap.collaboration.components.fiori.sharing.NoGroups"
						});
					}
					self.oSharingView.destroy();
					self.oSharingView = undefined;
					self.oNoGroupsView.placeAt(self.getId());
				};

				if (!this.oSharingView)
				{
					this.oSharingView = sap.ui.view({
						id: this.getId() + "_SharingView",
						viewData : {
							controlId: this.getId(),
							odataServiceUrl: this.systemSettings.oDataServiceUrl,
							collaborationHostODataServiceUrl: this.systemSettings.collaborationHostODataServiceUrl,
							collaborationHostRestService: this.systemSettings.collaborationHostRestService,
							langBundle: this.oLangBundle,
							jamGroups: this.aJamGroups,
							sharingDialog: undefined,
							noGroupsCallBack: fNoGroupsCallBack,
							objectDisplay: oObjectDisplay,
							objectShare: sObjectShare,
							objectId: sObjectId,
							attachments: this.getAttachments(),
							externalObject: this.getExternalObject()
						},
						type: ViewType.JS,
						viewName: "sap.collaboration.components.fiori.sharing.Sharing"
					});
				}
				else {
						//this.oSharingView.getController().aJamGroups = this.aJamGroups;
						this.oSharingView.getViewData().objectId = sObjectId;
						this.oSharingView.getViewData().objectShare = sObjectShare;
						this.oSharingView.getViewData().objectDisplay = oObjectDisplay;
						this.oSharingView.getViewData().externalObject = this.getExternalObject();
						//**** Note: we dont rerender the view here because when the component container rerender this component, it deleted the domRef and the rerender
						//**** for the view can not be accomplished without the domRef, so we depend on the "placeAt" to do the trick
				}

				if (this.oNoGroupsView){
					this.oNoGroupsView.destroy();
					this.oNoGroupsView = undefined;
				}


				return this.oSharingView;
			},

			/**
			 * Shares the data to Jam group
			 * @public
			 */
			shareToJam : function() {
				this.oSharingView.getController().shareToJam();
			},

			/**
			 * Logs the properties of the component
			 * @private
			 */
			logComponentProperties: function(){
				Log.debug("Share Component properties:", "",
						"sap.collaboration.components.fiori.sharing.Component.logComponentProperties()");
				Log.debug("width: " + this.getWidth());
				Log.debug("height: " + this.getHeight());
				Log.debug("oDataServiceUrl: " + this.getODataServiceUrl());
				Log.debug("tunnelServiceUrl: " + this.getTunnelServiceUrl());

				if (this.getObject()) {
					Log.debug("object->id: " + this.getObject().id);
					Log.debug("object->display: " + this.getObject().display);
					Log.debug("object->share: " + this.getObject().share);
				} else {
					Log.debug("object: undefined");
				}

				if (this.getAttachments() && this.getAttachments().attachmentsArray){
					Log.debug("Attachments:");
					var attachmentsArray = this.getAttachments().attachmentsArray;
					for (var i = 0; i < attachmentsArray.length; i++){
						Log.debug("Attachments" + (i + 1) + ":");
						Log.debug(attachmentsArray[i].mimeType);
						Log.debug(attachmentsArray[i].name);
						Log.debug(attachmentsArray[i].url);
					}
				}
				else {
					Log.debug("attachments: undefined");
				}

				if (this.getExternalObject()){
					Log.debug("externalObject->appContext: " + this.getObject().appContext);
					Log.debug("externalObject->odataServicePath: " + this.getObject().odataServicePath);
					Log.debug("externalObject->collection: " + this.getObject().collection);
					Log.debug("externalObject->key: " + this.getObject().key);
					Log.debug("object->name: " + this.getObject().name);
					Log.debug("object->summary: " + this.getObject().summary);
				} else {
					Log.debug("externalObject: undefined");
				}
			}
		}
	);


	return Component;
});
