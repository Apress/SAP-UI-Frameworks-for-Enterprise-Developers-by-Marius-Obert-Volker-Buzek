/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/*************************************************************
* JamUtil helper class
*
* Is responsible for the integration and communication with the
* JAM APIs
**************************************************************/

sap.ui.define([
	"sap/base/Log",
	"sap/base/security/encodeXML",
	"sap/ui/base/Object",
	"sap/m/SelectDialog"
], function(Log, encodeXML, BaseObject, SelectDialog) {
	"use strict";

	var ShareUtil = BaseObject.extend("sap.collaboration.components.fiori.sharing.helper.ShareUtil",{

		/**
		 * @constructor
		 */
		constructor: function(oLangBundle, oODataUtil, oSMIODataModel, oCommonUtil, oJamODataModel, oCollaborationHostRestService) {
			// Boolean indicating whether or not it's ok to refresh the security token.
			this._bIsOkToRefreshSecurityToken = true;

			this.iGrowingThreshold = 10;
			this.oLangBundle = oLangBundle;
			this.oODataUtil = oODataUtil;
			this.oSMIODataModel = oSMIODataModel;
			this.oJamODataModel = oJamODataModel;
			this.oCollaborationHostRestService = oCollaborationHostRestService;
			this.oCommonUtil = oCommonUtil;
			this.bShareError = false;
			this.bShareBusinessObjShared;
			this.bFileUploaded;
			this.aUploadAttachmentsUploaded = [];
			this.IdisplaySuccessMessageIntervalId;
		},

		/**
		 * Method that performs either the sequence of steps a.* or b.*. The b.* sequence occurs when oSharingData.mappedExternalObject isn't specified.
		 * a.1. Creates an ExternalObject in Jam corresponding for the business object being shared.
		 * a.2. Features the created ExternalObject to a Jam Group.
		 * a.3. Creates a SharedExternalObject feed entry on the Group's wall. See {@link _createGroupFeedEntry_SharedExternalObject} to know what a SharedExternalObject feed entry is.
		 * b.1. Creates a SharedObjectLink feed entry on the Group's wall. See {@link _createFeedEntry_ShareObjectLink} to know what a SharedObjectLink feed entry is.
		 * @param {object} oSharingData - Share data needed for this method.
		 * @param {string} oSharingData.groupId - The Jam Id of the Group in which to feature the ExternalObject.
		 * @param {string} oSharingData.groupName - The name of the Group in which to feature the ExternalObject.
		 * @param {string} oSharingData.folderId - This is the Jam Id of the Folder in which to upload the attachment's.
		 * @param {object} oSharingData.feedContent - Data to create a feed entry in a Jam Group.
		 * @param {string} oSharingData.feedContent.uiUrl - The URL to navigate to after clicking on the link in the feed entry. This URL points to the Fiori app's view of the business object.
		 * @param {string} oSharingData.feedContent.note - The comment to add to the feed entry.
		 * @param {array} oSharingData.aFilesToUpload - Array of files (attachments) to upload to Jam.
		 * @param {object} oSharingData.mappedExternalObject - Set of URLs used by Jam to
		 * @param {string} oSharingData.mappedExternalObject.Exid - OData URL of the business object being shared. This URL is URL for the OData service that exposes the business object that is in the SAP system.
		 * @param {string} oSharingData.mappedExternalObject.ODataLink - Same as Exid.
		 * @param {string} oSharingData.mappedExternalObject.ObjectType - OData service's metadata URL appended with a hash (#) symbol and the business object's entity set.
		 * @param {string} oSharingData.mappedExternalObject.ODataMetadata - Same as ObjectType.
		 * @param {string} oSharingData.mappedExternalObject.ODataAnnotations - Annotations URL. Specifies to Jam what to display of the business object.
		 */
		shareBusinessObject: function(oSharingData) {
			var that = this;
			// Share external object
			if (oSharingData.mappedExternalObject) {
				// Check if the oSharingData.feedContent.uiUrl (object.id) is passed, this is a mandatory field when sharing the business object. For this reason, this check was placed after the
				// line above, which checks if the business object was passed in the first place
				if (oSharingData.feedContent !== undefined &&  oSharingData.feedContent.uiUrl !== undefined) {
					var oPayload = oSharingData.mappedExternalObject;
					oPayload.Name = oSharingData.externalObject.name;
					oPayload.Groups = [{ __metadata : { uri : "Groups('" + oSharingData.groupId + "')" } }];
					oPayload.Permalink = oSharingData.feedContent.uiUrl;

					var mParameters = {
							async: true,
							success: function(oData, response) {
								that._bIsOkToRefreshSecurityToken = true;
								that._createGroupFeedEntry_SharedExternalObject(oSharingData);
							},
							error: function(oError) {
								if (oError.response.statusCode === 409) { // assuming '409' means BO was already shared to the group, we want to share the comment and not throw an error
									that._createGroupFeedEntry_SharedExternalObject(oSharingData);
								}
								else if (oError.response.statusCode === 403 && that._bIsOkToRefreshSecurityToken) {
									that.oJamODataModel.refreshSecurityToken(
										function () {
											that._bIsOkToRefreshSecurityToken = false;
											that.shareBusinessObject(oSharingData);
										},
										function (oError) {
											that._checkAuthorizationAndDisplayErrorMessage(oError.response.statusCode);
										},
										true
									);
								}
								else {
									that._bIsOkToRefreshSecurityToken = true;
									that._checkAuthorizationAndDisplayErrorMessage(oError.response.statusCode);
								}
							},
					};
					this.oJamODataModel.create("/ExternalObjects", oPayload, mParameters);
				}
				else {
					Log.error("feedContent.uiUrl parameter should not be undefined when sharing an external object", "sap.collaboration.components.fiori.sharing.helper.ShareUtil.shareBusinessObject()");
					this.displayErrorMessage();

				}

			}
			// Share object link
			else {
				this._createFeedEntry_ShareObjectLink(oSharingData);
			}
		},

		/**
		 * Method that creates a SharedExternalObject feed entry. A SharedExternalObject feed entry is a feed entry with a QuickView.
		 * @param {object} oSharingData - See the parameter of the same name for method {@link shareBusinessObject}.
		 * @private
		 */
		_createGroupFeedEntry_SharedExternalObject: function(oSharingData) {
			var xmlPayload =
				'<?xml version="1.0" encoding="UTF-8"?>' +
				'<feed xmlns="http://www.w3.org/2005/Atom" xmlns:activity="http://activitystrea.ms/spec/1.0/">' +
					'<entry>' +
						'<title> </title>' +
						'<content type="html">' + encodeXML(oSharingData.feedContent.note) + '</content>' +
						'<author>' +
							'<email>' + encodeXML(oSharingData.memberEmail) + '</email>' +
							'<activity:object-type>http://activitystrea.ms/schema/1.0/person</activity:object-type>' +
						'</author>' +
						'<activity:verb>http://activitystrea.ms/schema/1.0/share</activity:verb>' +
						'<activity:object>' +
							'<id>' + encodeXML(oSharingData.mappedExternalObject.Exid) + '</id>' +
							'<title type="html">' + encodeXML(oSharingData.externalObject.name) + '</title>' +
							'<activity:object-type>' + encodeXML(oSharingData.mappedExternalObject.ObjectType) + '</activity:object-type>' +
							'<link type="text/html" rel="alternate" href="' + encodeXML(oSharingData.feedContent.uiUrl) + '"/>' +
							'<link rel="http://www.odata.org" href="' + encodeXML(oSharingData.mappedExternalObject.ODataLink) + '"/>' +
							'<link rel="http://www.odata.org/metadata" href="' + encodeXML(oSharingData.mappedExternalObject.ODataMetadata) + '"/>' +
							'<link rel="http://www.odata.org/annotation" href="' + encodeXML(oSharingData.mappedExternalObject.ODataAnnotations) + '"/>' +
							'<source>' +
								'<id>tag:www.cubetree.com,2013:/groups/' + encodeXML(oSharingData.groupId) + '</id>' +
							'</source>' +
						'</activity:object>' +
					'</entry>' +
				'</feed>';

			var that = this;
			var fnOnReadyStateChange = function() {
				if (this.readyState == 4) {
					if (this.status == 200){
						that.bShareBusinessObjShared = true;
						that.displaySuccessMessage(oSharingData.groupName);
					}
					else {
						that._checkAuthorizationAndDisplayErrorMessage(this.status);
					}
				}
			};

			this._createFeedEntryViaRestAPI( xmlPayload, fnOnReadyStateChange );
		},

		/**
		 * Method that creates a SharedObjectLink feed entry. A SharedObjectLink usually has a link back to the Fiori application's view of the Object.
		 * @param {object} oSharingData - See the parameter of the same name for method {@link shareBusinessObject}.
		 * @private
		 */
		_createFeedEntry_ShareObjectLink: function(oSharingData){
			// Build the feed content to be posted. The feed content can either be
			// - Note + Object Id
			// - Note only
			// - Object Id only
			this.bShareBusinessObjShared = false;

			// If feed content is not empty, add request to batch and execute
			if (oSharingData.feedContent){

				if (oSharingData.feedContent.note !== undefined){

					var sContent = oSharingData.feedContent.note;
					if (oSharingData.feedContent.uiUrl){
						sContent = sContent + "<br/><a href='" + oSharingData.feedContent.uiUrl.replace(/'/g, "&apos;" ) + "'>"
									+  this.oLangBundle.getText("SHARE_OBJECT_LINK") + '</a>';
					}

					var xmlPayload =
						'<?xml version="1.0" encoding="UTF-8"?>' +
						'<feed xmlns="http://www.w3.org/2005/Atom" xmlns:activity="http://activitystrea.ms/spec/1.0/">' +
							'<entry>' +
								'<title>' + encodeXML(this.oLangBundle.getText("SHARE_OBJECT_LINK_TITLE")) + '</title>' +
								'<content type="html">' + encodeXML(sContent) + '</content>' +
								'<author>' +
									'<email>' + encodeXML(oSharingData.memberEmail) + '</email>' +
									'<activity:object-type>http://activitystrea.ms/schema/1.0/person</activity:object-type>' +
								'</author>' +
								'<activity:verb>http://activitystrea.ms/schema/1.0/share</activity:verb>' +
								'<activity:object>' +
									'<source>' +
										'<id>tag:www.cubetree.com,2013:/groups/' + encodeXML(oSharingData.groupId) + '</id>' +
									'</source>' +
								'</activity:object>' +
							'</entry>' +
						'</feed>';

					var self = this;
					var fnOnReadyStateChange = function() {
						if (this.readyState == 4) {
							if (this.status == 200) {
								self.bShareBusinessObjShared = true;
								self._bIsOkToRefreshSecurityToken = true;
								self.displaySuccessMessage(oSharingData.groupName);
							}
							else {
								if (this.status == 403 && self._bIsOkToRefreshSecurityToken) {
									self.oJamODataModel.refreshSecurityToken(
										function() {
											self._bIsOkToRefreshSecurityToken = false;
											self._createFeedEntry_ShareObjectLink(oSharingData);
										},
										function(oError) {
											self._checkAuthorizationAndDisplayErrorMessage(oError.response.statusCode);
										},
										true
									);
								}
								else {
									self._bIsOkToRefreshSecurityToken = true;
									self._checkAuthorizationAndDisplayErrorMessage(this.status);
								}
							}
						}
					};

					this._createFeedEntryViaRestAPI( xmlPayload, fnOnReadyStateChange );

				} else {
					Log.error("feedContent.note parameter should not be undefined", "sap.collaboration.components.fiori.sharing.helper.ShareUtil._createFeedEntry_ShareObjectLink()");
					this.displayErrorMessage();
				}
			}
			else {
				Log.error("feedContent parameter should not be undefined", "sap.collaboration.components.fiori.sharing.helper.ShareUtil._createFeedEntry_ShareObjectLink()");
				this.displayErrorMessage();
			}
		},

		/**
		 * Creates a feed entry using Jam's REST API.
		 * @param {string} sXMLPayload - XML payload that will be in the HTTP request's body.
		 * @callback {XMLHttpRequest#onreadystatechange} fnOnReadyStateChange
		 */
		_createFeedEntryViaRestAPI: function(sXMLPayload, fnOnReadyStateChange){

			var atomHeaders = {
					'Accept':'application/atom+xml',
					'Content-Type':'application/atom+xml',
					'x-csrf-token': this.oJamODataModel.getSecurityToken()
			};

			var sFeedPostURL = this.oCollaborationHostRestService.url + "/feed/post";
			if (this.oCollaborationHostRestService.urlParams != undefined && this.oCollaborationHostRestService.urlParams != "" ){
				sFeedPostURL = sFeedPostURL + "?" + this.oCollaborationHostRestService.urlParams;
			}

			var xmlHttpRequest = new window.XMLHttpRequest();
			xmlHttpRequest.open("POST",	sFeedPostURL, true );
			for (var headerField in atomHeaders) {
				xmlHttpRequest.setRequestHeader(headerField, atomHeaders[headerField]);
			}
			xmlHttpRequest.onreadystatechange = fnOnReadyStateChange;
			xmlHttpRequest.send(sXMLPayload);
		},
		/**
		* Uploads the attachments
		* @private
		*/
		uploadAttachments: function(oSharingData) {
			for (var i in oSharingData.aFilesToUpload){
				this.oSMIODataModel.create( '/UploadTargetFile', null,
						 {	async 	: true,
							success : function(oData,response){

								Log.debug('File was uploaded', "sap.collaboration.components.fiori.sharing.helper.ShareUtil.uploadAttachments()" );
							},
							error 	: function(oError){
								Log.error('Error, file was not uploaded', "sap.collaboration.components.fiori.sharing.helper.ShareUtil.uploadAttachments()");
							},
							urlParameters : {
								FileMimeType : "'" + oSharingData.aFilesToUpload[i].mimeType + "'",
								FileName : "'" + oSharingData.aFilesToUpload[i].name + "'",
								FileURL : "'" + oSharingData.aFilesToUpload[i].url + "'",
								FolderId : "'" + oSharingData.folderId + "'",
								GroupId : "'" + oSharingData.groupId + "'"
							}
						 });
			}
		},
		/**
		 * Create Group Selection Dialog
		 * @private
		 */
		createGroupSelectionDialog: function(sPrefixId, oItemTemplate, fSelectGroupCallback, iWidth, iHeight, oOdataModel){

			var self = this;
			var handleSearch = function(oEvent) {
				var sValue = oEvent.getParameter("value");
				self.oGroupSelectionDialog.bindAggregation("items", "/Groups/?$filter=substringof('" + sValue.replace(/'/g,"''") + "',Name)", oItemTemplate);
			};

			this.oGroupSelectionDialog = new SelectDialog(sPrefixId + "_GroupSelectionDialog", {
				multiSelect: false,
				noDataText:this.oLangBundle.getText("GRP_NO_GROUPS_FOUND_TEXT"),
				rememberSelections: false,
				growingThreshold: this.iGrowingThreshold,
				title:this.oLangBundle.getText("GROUP_SELECTION_DIALOG_TITLE"),
				confirm: fSelectGroupCallback,
				search: handleSearch,
				liveChange: handleSearch

			}).addStyleClass("sapUiPopupWithPadding");

			if (iWidth){
				this.oGroupSelectionDialog.setContentWidth(iWidth.toString() + "px");
			}

			if (iHeight){
				this.oGroupSelectionDialog.setContentHeight(iHeight.toString() + "px");
			}

			this.oGroupSelectionDialog.setModel(oOdataModel);
			this.oGroupSelectionDialog.bindAggregation("items","/Groups", oItemTemplate);

			return this.oGroupSelectionDialog;
		},

		/**
		* Displays Success Message in case the share operation (BO + attachments) was processed successfully
		* @private
		*/
		displaySuccessMessage : function(sGroupName) {
			var bBoShareOk = true;
			// Check if the BO is shared
			if (!(this.bShareBusinessObjShared === true || this.bShareBusinessObjShared === undefined)){
				bBoShareOk = false;
			}

			var bFileUploadOk = true;

			if (!(this.bFileUploaded === true || this.bFileUploaded === undefined)){
				bBoShareOk = false;
			}

			if (this.bShareError === false){
				if (bBoShareOk === true && bFileUploadOk === true){
					this.oCommonUtil.showMessage(this.oLangBundle.getText("SHARING_SUCCESS_MSG", [sGroupName]), {width: "20em", autoClose: false});
					clearInterval(this.IdisplaySuccessMessageIntervalId);
				}
			}
			else {
				clearInterval(this.IdisplaySuccessMessageIntervalId);
			}
		},

		/**
		* Displays Error Message in case one of the attachments was not uploaded successfully
		* @private
		*/
		displayErrorMessage : function() {
			if (!this.bShareError){
				var sErrorMessage = this.oLangBundle.getText("SHARING_FAILURE_MSG");
				this.oCommonUtil.displayError(sErrorMessage);
			}
			this.bShareError = true;
		},

		/**
		* Check if the error is an authorization error, if so, display a different error message
		* @private
		*/
		_checkAuthorizationAndDisplayErrorMessage : function(iStatus) {
			var self = this;

			// Check if the server response is a 401 or 403, if so, then throw an 'authorization failure' error message. Otherwise, throw the standard error message.
			if (iStatus == 401 || iStatus == 403){
				self.oCommonUtil.displayError(self.oLangBundle.getText("SHARE_AUTHORIZATION_FAILURE_MSG"));
			}
			else {
				self.displayErrorMessage();
			}
		}

	});


	return ShareUtil;

});
