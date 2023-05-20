/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define([
	'sap/base/Log',
	'sap/collaboration/components/utils/CommonUtil',
	'sap/ui/core/UIComponent',
	'sap/ui/core/mvc/View',
	'sap/ui/core/library',
	'sap/m/Dialog',
	'sap/m/Button',
	'sap/ui/Device'
], function(Log, CommonUtil, UIComponent, View, coreLibrary, Dialog, Button, Device) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	/**
	 * Constructor for the share dialog component
	 * @since version 1.16
	 *
	 * @param {sap.ui.core.ID} [sId] id for the new component, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new component. See the documentation of the component's properties for the structure of the expected data.
	 *
	 * @class The Share Dialog component is an SAPUI5 component that you can use to create a dialog in your application to enable you to enter or edit information shared to SAP Jam.
	 * @name sap.collaboration.components.fiori.sharing.dialog.Component
	 * @extends sap.ui.core.UIComponent
	 * @public
	 */
	var Component = UIComponent.extend("sap.collaboration.components.fiori.sharing.dialog.Component",
	/** @lends sap.collaboration.components.fiori.sharing.dialog.Component.prototype */
	{


		metadata: {
			includes: [
				"../../../resources/css/Sharing.css"
			],
			properties: {

				/**
				 * When you want to provide the user with the option to share file attachments,
				 * then the following properties need to be specified:
				 *   <ul>
				 *     <li>attachmentsArray: An array of {@link sap.collaboration.components.fiori.sharing.attachment.Attachment} objects. This array offers users
				 *     a list of files they can attach.</li>
				 *   </ul>
				 */
				attachments: {
					type: "object"
				},

				/**
				 * A JSON object passed to the share component. This object contains the following properties:
				 * <ul>
				 *        <li>id (optional): is the object Id to be shared in SAP Jam, i.e a URL( or a callback function that returns a URL) that navigates back to the same object in the application</li>
				 *        <li>display (optional): is a UI5 control to be displayed in the component UI <br>
				 *        <b>Note:</b> The preferred object to pass in the display parameter is <code>sap.m.ObjectListItem</code>. Using other type of objects
				 *        (for example: <code>ap.ui.commons.TextView</code>) may result in problems in the rendering of the content which needs to be corrected by
				 *        the application owners.</li>
				 *        <li>share (optional): is a note that will be displayed in the component UI and shared to SAP Jam too</li>
				 * </ul>
				 */
				object: {
					type: "object"
				},

				/**
				 * A Business Object such as an Opportunity, Sales Order, Account, etc. from the back-end that will be shared as a
				 * Featured External Object in a Group in Jam.
				 * <code>
				 * <ul>
				 * 	<li>{string} appContext: The application context. Example: "CRM", "SD", etc.</li>
				 *	<li>{string} odataServicePath: The relative path to the OData Service.  Example: "/sap/opu/odata/sap/ODATA_SRV"</li>
				 * 	<li>{string} collection: The name of the OData Collection. Example: "Account", "Opportunity", etc.</li>
				 * 	<li>{string} key: The key to identify a particular instance of the Business Object. It can be a simple ID or a compound key. Example: "123", "ObjectID='123'", "ObjectID='123',ObjectType='BUS000123'", etc.</li>
				 * 	<li>{string} name: The short name of the Business Object. Example: "Sales Order 123", "Opportunity 123", "Account 123", etc.</li>
				 * </ul>
				 * </code> These attributes are not enforced by the UI (missing or incorrect values are not validated), but they are required to make the
				 *        integration work. These attributes also should be mapped in the Back-end System and Jam in order to make the External Object work. <br>
				 *        <b>Note:</b> the externalObject is dependent on object.id, therefore, the object.id must also be passed to the Share Component. See the
				 *        parameter "object" for more information.
				 */
				externalObject: {
					type: "object"
				}
			},

			aggregations: {},

			events: {}
		},
		systemSettings: {
			width: "400px",
			height: "",
			oDataServiceUrl: "/sap/opu/odata/sap/SM_INTEGRATION_V2_SRV",
			collaborationHostODataServiceUrl: "/sap/bc/ui2/smi/rest_tunnel/Jam/api/v1/OData",
			collaborationHostRestService: {
				url: "/sap/bc/ui2/smi/rest_tunnel/Jam/api/v1",
				urlParams: ""
			}
		},
		/**
		 * Initialization of the Component
		 *
		 * @memberOf sap.collaboration.components.fiori.sharing.dialog.Component
		 * @private
		 */
		init: function() {
			this.oCommonUtil = new CommonUtil();
			this.oLangBundle = this.oCommonUtil.getLanguageBundle();
		},

		/**
		 * Setter for the Component settings.
		 *
		 * @param {object} oSettings A JSON object used to set the component settings, this object should contains the same properties used in the
		 *        constructor.
		 * @public
		 */
		setSettings: function(oSettings) {
			this.setObject(oSettings.object);
			this.setAttachments(oSettings.attachments);
			// Treat an empty external object as undefined.
			if (JSON.stringify(oSettings.externalObject) === '{}') {
				this.setExternalObject(undefined);
			} else {
				this.setExternalObject(oSettings.externalObject);
			}
		},

		/**
		 * Creates the sharing view
		 *
		 * @private
		 */
		_createSharingView: function() {
			var self = this;

			var oObjectDisplay;
			var sObjectShare;
			var sObjectId;
			var oObject = this.getObject();
			if (oObject) {
				sObjectId = self._handleObjectId(oObject.id);
				oObjectDisplay = oObject.display;
				sObjectShare = oObject.share;
			}

			var fNoGroupsCallBack = function() {
				self.close();
				self.openoNoGroupsDialog(self.oSharingView.getController().sJamUrl);
			};

			if (!this.oSharingView) {
				this.oSharingView = sap.ui.view({
					id: this.getId() + "_SharingView",
					viewData: {
						controlId: this.getId(),
						odataServiceUrl: this.systemSettings.oDataServiceUrl,
						collaborationHostODataServiceUrl: this.systemSettings.collaborationHostODataServiceUrl,
						collaborationHostRestService: this.systemSettings.collaborationHostRestService,
						langBundle: this.oLangBundle,
						jamGroups: this.aJamGroups,
						sharingDialog: this._oSharingDialog,
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
			} else {
				this.oSharingView.getViewData().objectId = sObjectId;
				this.oSharingView.getViewData().objectShare = sObjectShare;
				this.oSharingView.getViewData().objectDisplay = oObjectDisplay;
				this.oSharingView.getViewData().externalObject = this.getExternalObject();
				this.oSharingView.getViewData().attachments = this.getAttachments();
				// **** Note: we dont rerender the view here because
				// when the component container rerender this
				// component, it deleted the domRef and the rerender
				// **** for the view can not be accomplished without
				// the domRef, so we depend on the "placeAt" to do
				// the trick
			}
		},

		/**
		 * Creates the sharing component dialog
		 *
		 * @private
		 */
		_createSharingDialog: function() {
			var oSharingDialog = new Dialog(this.getId() + "_SharingDialog", {
				title: this.oLangBundle.getText("SHARING_PAGE_TITLE"),
				contentWidth: this.systemSettings.width,
				stretch: false,
				afterClose: function() {
					// TODO: Here is where we execute the code
					// responsible
					// for sharing the files.
				}
			}).addStyleClass("sapUiPopupWithPadding");

			return oSharingDialog;
		},

		/**
		 * Creates a dialog for the case where there are no groups
		 *
		 * @param {string} sJamUrl The Jam Url
		 * @private
		 */
		createNoGroupsDialog: function(sJamUrl) {
			if (!this.oNoGroupsView) {
				this.oNoGroupsView = sap.ui.view({
					id: this.getId() + "_NoGroupsView",
					viewData: {
						controlId: this.getId(),
						langBundle: this.oLangBundle,
						jamUrl: sJamUrl
					},
					type: ViewType.JS,
					viewName: "sap.collaboration.components.fiori.sharing.NoGroups"
				});
			}

			var oNoGroupsDialog = new Dialog(this.getId() + "_NoGroupsDialog", {
				title: this.oLangBundle.getText("SHARING_PAGE_TITLE"),
				stretch: false,
				content: this.oNoGroupsView,
				beginButton: new Button(this.getId() + "_CloseButton", {
					text: this.oLangBundle.getText("CLOSE_BUTTON_TEXT"),
					press: function() {
						oNoGroupsDialog.close();
					}
				})
			}).addStyleClass("sapUiPopupWithPadding");

			return oNoGroupsDialog;
		},

		/**
		 * Opens the share component dialog
		 *
		 * @public
		 */
		open: function() {
			if (this.bStopRendering === undefined || this.bStopRendering === false) {
				if (!this._oSharingDialog) {
					this._logComponentProperties();
					this._oSharingDialog = this._createSharingDialog();
				}
				try {
					this._createSharingView();
					this._oSharingDialog.addAriaLabelledBy(this.getId() + "_SharingView");
					this._oSharingDialog.addContent(this.oSharingView);
					this._oSharingDialog.setInitialFocus(this.oSharingView);
					this._createDialogButtons();

					if (Device.system.phone) {
						this._oSharingDialog.setStretch(true);
					}

					this._oSharingDialog.open();
				} catch (oError) {
					Log.error(oError);
					this.oCommonUtil.displayError();
				}
			}
		},

		/**
		 * closes the share component dialog
		 *
		 * @private
		 */
		close: function() {
			if (this._oSharingDialog) {
				this._oSharingDialog.close();
			}
		},

		/**
		 * Opens the dialog for the case where there are no groups
		 *
		 * @param {string} sJamUrl The Jam Url
		 * @private
		 */
		openoNoGroupsDialog: function(sJamUrl) {
			this._oSharingDialog.removeAllContent();
			if (!this.oNoGroupsDialog) {
				this.oNoGroupsDialog = this.createNoGroupsDialog(sJamUrl);
			}

			this.oNoGroupsDialog.open();
		},

		/**
		 * create the sharing component dialog buttons
		 *
		 * @private
		 */
		_createDialogButtons: function() {
			if (!this.oMentionButton) {
				this.oMentionButton = new Button(this.getId() + "_mentionButton", {
					text: "@",
					enabled: false,
					press:  [function() {
						this.oSharingView.getController().atMentionsButtonPressed();
					}, this]
				});
				this._oSharingDialog.addButton(this.oMentionButton);
			}

			// Due to Ux issues, we don't want the @mention feature available on phones
			if (Device.system.phone) {
				this.oMentionButton.setVisible(false);
			}

			if (!this.oLeftButton) {
				this.oLeftButton = new Button(this.getId() + "_LeftButton", {
					text: this.oLangBundle.getText("OK_BUTTON_TEXT"),
					enabled: false,
					press: [function() {
						this.oSharingView.getController().shareToJam();
						this._oSharingDialog.close();
					}, this]
				});
				this._oSharingDialog.addButton(this.oLeftButton);
			}

			if (!this.oRightButton) {
				this.oRightButton = new Button(this.getId() + "_RightButton", {
					text: this.oLangBundle.getText("CANCEL_BUTTON_TEXT"),
					press: [function() {
						this._oSharingDialog.close();
					}, this]
				});
				this._oSharingDialog.addButton(this.oRightButton);
			}
		},

		/**
		 * Sets the begin and end buttons for the dialog
		 *
		 * @private
		 */
		setDialogButtons: function() {
			// this._oSharingDialog.setBeginButton(this.oLeftButton);
			// this.oLeftButton.setEnabled(true);
			// this.oRightButton.setEnabled(true);
			// this._oSharingDialog.setEndButton(this.oRightButton);
		},

		/**
		 * Sets the end buttons for the dialog in case there are no groups
		 *
		 * @private
		 */
		setCloseButton: function() {
			this._oSharingDialog.destroyBeginButton();
			this._oSharingDialog.setEndButton(this.oCloseButton);
		},

		/**
		 * handles oObject.id and returns object id string when possible
		 *
		 * @param {object} oObjectId The object ID
		 * @private
		 */
		_handleObjectId: function(oObjectId) {
				// check if objectId contains either empty, a sting or a
				// call back function otherwise close the dialog and
				// show an error
				var sObjectIdType = typeof oObjectId;

				var sObjectId;

				switch (sObjectIdType) {
					case "undefined":
					case "":
					case "string":
						sObjectId = oObjectId;
						break;
					case "function":
						sObjectId = oObjectId();
						if (typeof sObjectId == "string") {
							break;
						}
					default:
						Log.error("object->id is not a sting or callback function that returns a string");
						throw new Error();
				}
				return sObjectId;
		},

		/**
		 * Logs the properties of the component
		 *
		 * @private
		 */
		_logComponentProperties: function() {
			Log.debug("Share Component properties:", "", "sap.collaboration.components.fiori.sharing.Component._logComponentProperties()");
			Log.debug("width: " + this.systemSettings.width);
			Log.debug("height: " + this.systemSettings.height);
			Log.debug("oDataServiceUrl: " + this.systemSettings.oDataServiceUrl);
			Log.debug("collaborationHostODataServiceUrl: " + this.systemSettings.collaborationHostODataServiceUrl);
			Log.debug("collaborationHostRestService: " + this.systemSettings.collaborationHostRestService.url + this.systemSettings.collaborationHostRestService.urlParams);

			if (this.getObject()) {
				Log.debug("object->id: " + this.getObject().id);
				Log.debug("object->display: " + this.getObject().display);
				Log.debug("object->share: " + this.getObject().share);
			} else {
				Log.debug("object: undefined");
			}

			if (this.getAttachments() && this.getAttachments().attachmentsArray) {
				Log.debug("Attachments:");
				var attachmentsArray = this.getAttachments().attachmentsArray;
				for (var i = 0; i < attachmentsArray.length; i++) {
					Log.debug("Attachments" + (i + 1) + ":");
					Log.debug(attachmentsArray[i].mimeType);
					Log.debug(attachmentsArray[i].name);
					Log.debug(attachmentsArray[i].url);
				}
			} else {
				Log.debug("attachments: undefined");
			}

			if (this.getExternalObject()) {
				Log.debug("externalObject->appContext: " + this.getExternalObject().appContext);
				Log.debug("externalObject->odataServicePath: " + this.getExternalObject().odataServicePath);
				Log.debug("externalObject->collection: " + this.getExternalObject().collection);
				Log.debug("externalObject->key: " + this.getExternalObject().key);
				Log.debug("object->name: " + this.getExternalObject().name);
				Log.debug("object->summary: " + this.getExternalObject().summary);
			} else {
				Log.debug("externalObject: undefined");
			}
		}
	});


	return Component;
});
