/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/*************************************************************
* OdataUtil helper class
*
* Is responsible for the integration and communication with the
* Backend OData Server
**************************************************************/

sap.ui.define([
	'sap/base/Log',
	'sap/base/security/encodeURL',
	'sap/base/util/each',
	'./CommonUtil',
	'sap/ui/base/Object'
],
	function(Log, encodeURL, each, CommonUtil, BaseObject) {
	"use strict";

	var OdataUtil = BaseObject.extend("sap.collaboration.components.utils.OdataUtil",{

		/**
		 * Constants for the OdataUtil Class
		 */
		OdataUtilConstants: {
			HttpStatusCode: {
				success: 200,
				created: 201
			},

			EndPoint: {
				AssignedGroups: "AssignedGroups",
				BusinessObjects: "BusinessObjects",
				ContentItems: "ContentItems",
				PostContentItem: "PostContentItem",
				Feed: "Feed",
				Folders: "Folders",
				GetCollaborationHostUrl: "GetCollaborationHostURL",
				MapInternalBOToExternalBO: "MapInternalBOToExternalBO",
				GetExternalODataURL: "GetExternalODataURL",
				GetSingleUseToken: "GetSingleUseToken",
				Groups: "Groups",
				GroupsCount: "Groups/$count",
				GetNotificationUnreadCount: "GetNoticeUnreadCount",
				Notifications: "Notices",
				FeaturedExternalObjects: "FeaturedExternalObjects",
				GroupsAsFeatured: "GroupsAsFeatured",
				ExternalObjects: "ExternalObjects",
				Activities: "Activities",
				ExternalObjects_FindByExidAndObjectType : "ExternalObjects_FindByExidAndObjectType"
			},

			HttpMethod: {
				GET: "GET",
				POST: "POST"
			},
			ResponseType: {
				blob: "blob",
				arraybuffer: "arraybuffer"
			}

		},
		constructor: function(){
			this.oCommonUtil = new CommonUtil();
			this.bError = false;
		},
		/**
		 * Gets the JAM URL using OData
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @return {string} sJamUrl A string containing the URL of the Collaboration Tool (Jam)
		 * @private
		 */
		getJamUrl:function(oOdataModel, oPromise, bAsync) {
		   var sErrorCode = "";
		   var sJamURL = "";

		   var fSuccessFn = function(oData,response){
			   if (oPromise){
				   oPromise.resolve(oData.GetCollaborationHostURL.URL);
			   }
			   else {
				   sJamURL = oData.GetCollaborationHostURL.URL;
			   }
			};
			var fErrorFn = function(oError){
				Log.error(JSON.stringify(oError));
				sErrorCode = oError.response.statusCode;
				if (oPromise){
					oPromise.reject(sErrorCode);
				}
			};
			oOdataModel.read("/" + this.OdataUtilConstants.EndPoint.GetCollaborationHostUrl, {
				success: fSuccessFn,
				error: fErrorFn,
				async: bAsync
			});

			// if no oPromise is passed, return sJamURL
			if (!oPromise){
				return sJamURL;
			}
		},

		/**
		 * Batch Operation to get the JAM URL from the back-end
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @return {request} a request object for this end point
		 * @private
		 */
		createJamUrlBatchOperation: function(oOdataModel){
			var oDataPayload = null;
			var aParameters = null;
			var oBatchOperation;

			try {
				oBatchOperation = oOdataModel.createBatchOperation(
					"/" + this.OdataUtilConstants.EndPoint.GetCollaborationHostUrl,
					this.OdataUtilConstants.HttpMethod.GET,
					oDataPayload,
					aParameters
				);
			} catch (oError){
				Log.error(oError, "", "sap.collaboration.components.utils.OdataUtil.createJamUrlBatchOperation()");
				throw oError;
			}

			return oBatchOperation;
		},

		/**
		 * Gets the JAM token using OData
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @return {string} sJamToken The single use token from SAP Jam
		 * @private
		 */
		getJamToken:function(oOdataModel) {
		   var sJamToken = "";
		   var sErrorCode = "";
		   var fSuccessFn = function(oData,response){
				sJamToken = oData.GetSingleUseToken.Id;
			};
			var fErrorFn = function(oError){
				Log.error(JSON.stringify(oError));
				sErrorCode = oError.response.statusCode;
			};
			oOdataModel.read("/" + this.OdataUtilConstants.EndPoint.GetSingleUseToken, null, null, false, fSuccessFn, fErrorFn);

			if (sErrorCode){
				throw new Error(sErrorCode);
			}

			return sJamToken;

		},

		/**
		 * Batch Operation to get the Single Use Token from SAP Jam
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @return {request} a request object for this end point
		 * @private
		 */
		createJamTokenBatchOperation: function(oOdataModel){
			var oDataPayload = null;
			var aParameters = null;
			var oBatchOperation;

			try {
				oBatchOperation = oOdataModel.createBatchOperation(
					"/" + this.OdataUtilConstants.EndPoint.GetSingleUseToken,
					this.OdataUtilConstants.HttpMethod.GET,
					oDataPayload,
					aParameters
				);
			} catch (oError){
				Log.error(oError, "", "sap.collaboration.components.utils.OdataUtil.createJamTokenBatchOperation()");
				throw oError;
			}

			return oBatchOperation;
		},

		/**
		 * Gets the JAM groups using OData
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @param {string}	sODataEndPoint The OData end point
		 * @private
		 */
		getGroupsData:function(oOdataModel, sODataEndPoint) {
			var aGroupsData;
			var sErrorCode = "";
			var fSuccessFn = function(oData,response){
			   aGroupsData = this.oCommonUtil.getODataResult(oData);
			}.bind(this);
			var fErrorFn = function(oError){
				Log.error(JSON.stringify(oError));
				sErrorCode = oError.response.statusCode;
			};
			oOdataModel.read(sODataEndPoint, null, null, false, fSuccessFn, fErrorFn);

			if (sErrorCode){
				throw new Error(sErrorCode);
			}

			return aGroupsData;
		},

		/**
		 * Batch Operation to get the Groups Data
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @return {request} a request object for this end point
		 * @private
		 */
		createGetGroupsDataBatchOperation : function(oOdataModel) {
			var oDataPayload = null;
			var aParameters = null;
			var oBatchOperation;

			try {
				oBatchOperation = oOdataModel.createBatchOperation(
					"/" + this.OdataUtilConstants.EndPoint.Groups,
					this.OdataUtilConstants.HttpMethod.GET,
					oDataPayload,
					aParameters
				);
			} catch (oError){
				Log.error(oError, "", "sap.collaboration.components.utils.OdataUtil.createGetGroupsDataBatchOperation()");
				throw oError;
			}

			return oBatchOperation;
		},

		/**
		 * Batch Operation to get the Groups Count
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @return {request} a request object for this end point
		 * @private
		 */
		createGetGroupsCountBatchOperation : function(oOdataModel) {
			var oDataPayload = null;
			var aParameters = null;
			var oBatchOperation;

			try {
				oBatchOperation = oOdataModel.createBatchOperation(
					"/" + this.OdataUtilConstants.EndPoint.GroupsCount,
					this.OdataUtilConstants.HttpMethod.GET,
					oDataPayload,
					aParameters
				);
			} catch (oError){
				Log.error(oError, "", "sap.collaboration.components.utils.OdataUtil.createGetGroupsCountDataBatchOperation()");
				throw oError;
			}

			return oBatchOperation;
		},

		/**
		 * Batch Operation to get the Groups linked to a specific BO
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @return {request} a request object for this end point
		 * @private
		 */
		createGetGroupsLinkedToBOBatchOperation : function(oOdataModel,oExternalObject) {
			var oDataPayload = null;
			var aParameters = null;
			var oBatchOperation;

			var sOdataEndPoint = "/" + this.OdataUtilConstants.EndPoint.ExternalObjects + "(ApplicationContext='" + encodeURL(oExternalObject.appContext.replace(/'/g, "''")) + "',"
								 + "OdataServicePath='" + encodeURL(oExternalObject.odataServicePath.replace(/'/g, "''")) + "',"
								 + "OdataCollection='" + encodeURL(oExternalObject.collection.replace(/'/g, "''")) + "',"
								 + "OdataKey='" + encodeURL(oExternalObject.key.replace(/'/g, "''")) + "')/" + this.OdataUtilConstants.EndPoint.GroupsAsFeatured;

			oBatchOperation = oOdataModel.createBatchOperation(
					sOdataEndPoint,
					this.OdataUtilConstants.HttpMethod.GET,
					oDataPayload,
					aParameters
				);

			return oBatchOperation;
		},

		/**
		 * Batch Operation to get the Groups assigned to a Business Object from the SMI (CLB) mapping table
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @return {string} a string containing the Business Object ID
		 * @return {request} a request object for this end point
		 * @private
		 */
		createGetObjectGroupsBatchOperation : function(oOdataModel, sBusinessObjectId) {
			var oDataPayload = null;
			var aParameters = null;
			var oBatchOperation;

			try {
				oBatchOperation = oOdataModel.createBatchOperation(
					"/" + this.OdataUtilConstants.EndPoint.BusinessObjects + "('" + encodeURL(sBusinessObjectId) + "')/" + this.OdataUtilConstants.EndPoint.AssignedGroups,
					this.OdataUtilConstants.HttpMethod.GET,
					oDataPayload,
					aParameters
				);
			} catch (oError){
				Log.error(oError, "", "sap.collaboration.components.utils.OdataUtil.createGetObjectGroupsBatchOperation()");
				throw oError;
			}

			return oBatchOperation;
		},

		/**
		 * Helper function to extract the JAM groups' IDs
		 * @param {array} aGroupData An array of JAM Groups
		 * @private
		 */
		getGroupIds:function(aGroupData) {
			var sGroupsIds = "";
			for (var i = 0; i < aGroupData.length; i++){
				if (i == 0){
					sGroupsIds += aGroupData[i].Id;
				} else {
					sGroupsIds +=  "," + aGroupData[i].Id;
				}
			}
			return sGroupsIds;
		},

		/**
		 * Creates JAM groups Feed using OData
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @param {string}	sGroupId Jam Group Id
		 * @param {string}	sFeedContent The content of the Feed
		 * @private
		 */
		createGroupFeed: function(oOdataModel, sGroupId, sFeedContent) {
			var sOdataEndPoint = "/" + this.OdataUtilConstants.EndPoint.Groups + "(" + encodeURL(sGroupId) + ")/" + this.OdataUtilConstants.EndPoint.Feed;
			var oPayload = {
					"Text": sFeedContent
			};
			var bStatus = undefined;
			var fSuccess = function(){
				bStatus = true;
			};
			var fError = function(oError){
				Log.error(JSON.stringify(oError.response.body));
				bStatus = false;
			};

			oOdataModel.create(sOdataEndPoint, oPayload, null, fSuccess, fError);

			return bStatus;
		},

		/**
		 * Main method to execute a batch requests for the end points supported by this utilities
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @param {array} aRequests An array containing the batch of requests
		 * @param {function} fnParseBatchResults A call back function to parse the results returned from the batch call
		 * @private
		 */
		executeODataBatchRequest: function(oOdataModel, aRequests, fnParseBatchResults, bAsync, fnErrorCallBack){
			var self = this;
			var aResults;

			var fnSuccess = function(oData){
				aResults = self.parseBatchResponse(oData.__batchResponses);
				fnParseBatchResults(aResults);
			};

			var fnError = function(oError){
				if (oError.response){
					Log.error(JSON.stringify(oError.response.body));
				}
				else {
					Log.error(JSON.stringify(oError.message));
				}
				fnErrorCallBack(oError);
			};


			// Either create a Read or Change batch request
			var aReadReqs = [];
			var aChangeReqs = [];
			for (var i in aRequests){
				if (aRequests[i].method == this.OdataUtilConstants.HttpMethod.GET){
					aReadReqs.push(aRequests[i]);
				} else if (aRequests[i].method == this.OdataUtilConstants.HttpMethod.POST){
					aChangeReqs.push(aRequests[i]);
				}
			}

			if (aReadReqs.length > 0){
				oOdataModel.addBatchReadOperations(aReadReqs);
			}
			//if (aChangeReqs.length > 0)
				//oOdataModel.addBatchChangeOperations(aChangeReqs);
			for (var i = 0; i < aChangeReqs.length; i++){
				oOdataModel.addBatchChangeOperations([aChangeReqs[i]]);
			}

			if (bAsync === true){
				oOdataModel.submitBatch(fnSuccess, fnError, true);
			}
			else {
				oOdataModel.submitBatch(fnSuccess, fnError, false);
			}
		},

		/**
		 * Parse the response returned from a batch call
		 * @ param {array} aBatchResponse An array containing the responses from a batch call.
		 * @ return {JSON Map} aResults A JSON map of key, value pairs containg the results from each response within the batch.
		 */
		parseBatchResponse: function(aBatchResponse){
			var self = this;
			var aResults = [];

			each(aBatchResponse, function(i, oResponse){
				if (oResponse.statusCode && oResponse.statusCode.match(self.OdataUtilConstants.HttpStatusCode.success))	{
					aResults.push(oResponse.data);
				}
				else if (oResponse.__changeResponses){
					for (var i = 0; i < oResponse.__changeResponses.length; i++){
						if (oResponse.__changeResponses[i].statusCode && (oResponse.__changeResponses[i].statusCode.match(self.OdataUtilConstants.HttpStatusCode.created ) || oResponse.__changeResponses[i].statusCode.match(self.OdataUtilConstants.HttpStatusCode.success ))){
							aResults.push(oResponse.__changeResponses[i].data);
						}
						else {
							aResults.push({error: oResponse.__changeResponses[i].response.body});
							Log.error(JSON.stringify(oResponse.__changeResponses[i].response.body), "sap.collaboration.components.utils.OdataUtil.parseBatchResponse()");
						}
					}
				}
				else {
					aResults.push({error: oResponse.response.body});
					Log.error(JSON.stringify(oResponse.response.body), "sap.collaboration.components.utils.OdataUtil.parseBatchResponse()");
				}
			});

			return aResults;
		},



		/**
		 * Creates a single batch operation to map an external URL
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @param {string} sRelativePath A string containing the relative path to be mapped
		 * @return {request} oBatchOperation An object containing the request to be executed in a batch
		 */
		createExternalOdataUrlBatchOperation: function(oOdataModel, sRelativePath){
			// Batch operations do not encode the URL parameters, it needs to be done before creating the batch call.
			var aParameters = null;
			var oDataPayload = null;
			var oBatchOperation;

			try {
				oBatchOperation = oOdataModel.createBatchOperation(
					"/" + this.OdataUtilConstants.EndPoint.GetExternalODataURL + "/?RelativePath='" + encodeURL(sRelativePath) + "'",
					this.OdataUtilConstants.HttpMethod.GET,
					oDataPayload,
					aParameters
				);
			} catch (oError){
				Log.error(oError, "", "sap.collaboration.components.utils.OdataUtil.createExternalOdataUrlBatchOperation()");
				throw oError;
			}

			return oBatchOperation;
		},

		/**
		 * Calls the endpoint to map an external URL
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @param {string} sRelativePath A string containing the relative path to be mapped
		 * @return {string} sExternalOdataUrl A string containing the external URL that was mapped
		 */
		getExternalOdataUrl: function(oOdataModel, sRelativePath){
			var sExternalOdataUrl = "";
			var sErrorCode = "";
			//Passing the URL parameters in a map so the encoding is done in SAPUI5 ODataModel class
			var aUrlParameters = {};
			aUrlParameters["RelativePath"] = "'" + sRelativePath + "'";

			var fSuccessFn = function(oData,response){
				sExternalOdataUrl = oData.GetExternalODataURL.URL;
			};

			var fErrorFn = function(oError){
				Log.error(JSON.stringify(oError));
				sErrorCode = oError.response.statusCode;
			};

			oOdataModel.read("/" + this.OdataUtilConstants.EndPoint.GetExternalODataURL, null, aUrlParameters, false, fSuccessFn, fErrorFn);

			if (sErrorCode){
				throw new Error(sErrorCode);
			}

			return sExternalOdataUrl;
		},

		/**
		 * Batch Operation to get the count of unread notifications
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @return {request} a request object for this end point
		 * @private
		 */
		createNotificationUnreadCountBatchOperation : function(oOdataModel) {
			var oDataPayload = null;
			var aParameters = null;
			var oBatchOperation;

			try {
				oBatchOperation = oOdataModel.createBatchOperation(
					"/" + this.OdataUtilConstants.EndPoint.GetNotificationUnreadCount,
					this.OdataUtilConstants.HttpMethod.GET,
					oDataPayload,
					aParameters
				);
			} catch (oError){
				Log.error(oError, "", "sap.collaboration.components.utils.OdataUtil.createNotificationUnreadCountBatchOperation()");
				throw oError;
			}

			return oBatchOperation;
		},

		/**
		 * Batch Operation to get the Notifications
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @return {request} a request object for this end point
		 * @private
		 */
		createNotificationBatchOperation : function(oOdataModel, iNumberOfNotifications) {
			var oDataPayload = null;
			var aParameters = null;//["$top=20"];
			var oBatchOperation;

			try {
				oBatchOperation = oOdataModel.createBatchOperation(
					"/" + this.OdataUtilConstants.EndPoint.Notifications + "?$top=" + encodeURL(iNumberOfNotifications.toString()),
					this.OdataUtilConstants.HttpMethod.GET,
					oDataPayload,
					aParameters
				);
			} catch (oError){
				Log.error(oError, "", "sap.collaboration.components.utils.OdataUtil.createNotificationBatchOperation()");
				throw oError;
			}

			return oBatchOperation;
		},

		/**
		 * Batch Operation to create a Group Feed Entry
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @param {string}	sGroupId Jam Group Id
		 * @param {string}	sFeedContent The content of the Feed
		 * @return {request} a request object for this end point
		 * @private
		 */
		createGroupFeedBatchOperation : function(oOdataModel, sGroupId, oFeedContent) {
			var sOdataEndPoint = "/" + this.OdataUtilConstants.EndPoint.Groups + "(" + encodeURL(sGroupId) + ")/" + this.OdataUtilConstants.EndPoint.Feed;
			var oDataPayload = {
					"Text": oFeedContent.note,
					"UiUrl": oFeedContent.uiUrl
			};
			var aParameters = null;
			var oBatchOperation;

			try {
				oBatchOperation = oOdataModel.createBatchOperation(
					sOdataEndPoint,
					this.OdataUtilConstants.HttpMethod.POST,
					oDataPayload,
					aParameters
				);
			} catch (oError){
				Log.error(oError, "", "sap.collaboration.components.utils.OdataUtil.createGroupFeedBatchOperation()");
				throw oError;
			}

			return oBatchOperation;
		},

		/**
		 * Batch Operation to upload file
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @param {object}	oAttachment File object to be uploaded
		 * @param {string}	sGroupId Jam Group Id
		 * @param {object}	sFolderId Jam Folder Id
		 * @private
		 */
		createUploadFileBatchOperation: function(oOdataModel, oAttachment, sGroupId, sFolderId){
			var oDataPayload = null;
			var aParameters = null;
			var oBatchOperation;



			oBatchOperation = oOdataModel.createBatchOperation(
					"/" + this.OdataUtilConstants.EndPoint.PostContentItem 	+ "/?name='" + encodeURL(oAttachment.name) + "'&"
																			+ "groupId='"  + encodeURL(sGroupId) + "'&"
																			+ "mimeType='" + encodeURL(oAttachment.mimeType) + "'&"
																			+ "folderId='" + encodeURL(sFolderId) + "'&"
																			+ "url='" + encodeURL(oAttachment.url) + "'",

					this.OdataUtilConstants.HttpMethod.POST,
					oDataPayload,
					aParameters
			);

			return oBatchOperation;
		},

		/**
		 * Post a request to upload a file
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @param {sap.collaboration.components.fiori.sharing.attachment.Attachment} oAttachment - File to be uploaded
		 * @param {string} sGroupId - Group Id to which the file will be posted to
		 * @param {string} sFolderId - Folder id to which the file will be posted to
		 * The sFolderId parameter will take priority over the sGroupId. This means, if both ids are specified, then the attachment will be posted to the folder.
		 * @param {function} fnSuccess - Callback function when upload is successful
		 * @param {function} fnError - Callback function when there is an error
		 * @private
		 */
		uploadFile : function(oOdataModel, oAttachment, sGroupId, sFolderId, fSuccess, fError, bAsyn ){
			// Determine to either the group's root folder, or a specific folder
			var sOdataEndPoint = this.OdataUtilConstants.EndPoint.PostContentItem;

			var fUploadSuccess = function() {
				fSuccess();
			};
			var fUploadError = function () {
				Log.error(oAttachment.name + " was not uploaded", "",  "sap.collaboration.components.utils.OdataUtil.uploadFile()");
				fError();
			};

			oOdataModel.callFunction(sOdataEndPoint,
									 'POST',
									 {
										name : oAttachment.name,
										groupId : sGroupId,
										mimeType : oAttachment.mimeType,
										url : oAttachment.url,
										folderId :sFolderId
									 },
									 null,
									 fUploadSuccess,
									 fUploadError,
									 bAsyn
			);


		},

		/**
		 * Gets the sub-folders for a Jam Group or Folder
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel -	The OData model object
		 * @param {string} sGroupId - group id
		 * @param {string} sFolderId - folder id
		 * @return {object} oFolder - object containing an array of folder entities returned from Jam and the total count of subfolders { folders: [], count: i }
		 * @private
		 */
		getSubFolders : function(oOdataModel, sGroupId, sFolderId, skip, top ){

			var sODataEndPoint;
			if (!sFolderId && sGroupId) {
				sODataEndPoint = "/" + this.OdataUtilConstants.EndPoint.Groups + "('" + encodeURL(sGroupId) + "')/" + this.OdataUtilConstants.EndPoint.Folders;
			}
			else {
				sODataEndPoint = "/" + this.OdataUtilConstants.EndPoint.Folders + "(Id='" + encodeURL(sFolderId) + "',FolderType='Folder')/" + this.OdataUtilConstants.EndPoint.Folders;
			}
			sODataEndPoint = sODataEndPoint	+ '?$skip=' + skip + '&$top=' + top + '&$inlinecount=allpages';

			var aFolders = [];
			var iCount = 0;
			var sErrorCode = "";
			var fSuccessFn = function(oData,response){
				if (oData) {
					aFolders = this.oCommonUtil.getODataResult(oData);
					iCount = parseInt(JSON.parse(response.body).d.__count);
				}
			}.bind(this);
			var fErrorFn = function(oError){
				Log.error(JSON.stringify(oError));
				sErrorCode = oError.response.statusCode;
			};
			oOdataModel.read(sODataEndPoint, null, null, false, fSuccessFn, fErrorFn);

			if (sErrorCode){
				throw new Error(sErrorCode);
			}

			return { folders : aFolders,
					 count : iCount };

		},

		/**
		 * Batch Operation share a Featured External Object in the Group
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @param {object}	oExternalObject Featured External Object (see endpoint for more information about the object's properties)
		 * @param {string}	sGroupId Jam Group Id
		 * @return {request} a request object for this end point
		 * @private
		 * @private
		 */
		createShareFeaturedObjectBatchOperation: function (oOdataModel, oExternalObject, sGroupId){
			var sOdataEndPoint = "/" + this.OdataUtilConstants.EndPoint.Groups + "(" + encodeURL(sGroupId) + ")/" + this.OdataUtilConstants.EndPoint.FeaturedExternalObjects;
			var oDataPayload = {
					"ApplicationContext": oExternalObject.appContext,
					"OdataServicePath": oExternalObject.odataServicePath,
					"OdataCollection": oExternalObject.collection,
					"OdataKey": oExternalObject.key,
					"Name": oExternalObject.name,
					"Summary": oExternalObject.summary,
					"UiUrl": oExternalObject.uiUrl,
					"Comment": oExternalObject.note
			};
			var aParameters = null;
			var oBatchOperation;

			oBatchOperation = oOdataModel.createBatchOperation(
				sOdataEndPoint,
				this.OdataUtilConstants.HttpMethod.POST,
				oDataPayload,
				aParameters
			);

			return oBatchOperation;
		},

		/**
		 * Get the Mapping for the External Object
		 * @param oOdataModel
		 * @param oInternalObject
		 * @param oPromise
		 * @public
		 */
		getExternalObjectMapping: function(oOdataModel, oInternalObject, oPromise){
			var sOdataEndPoint = "/" + this.OdataUtilConstants.EndPoint.MapInternalBOToExternalBO;
			//Passing the URL parameters in a map so the encoding is done in SAPUI5 ODataModel class
			var aUrlParameters = {};
			aUrlParameters["ApplicationContext"] = "'" + oInternalObject.appContext + "'";
			aUrlParameters["ODataCollection"] = "'" + oInternalObject.collection + "'";
			aUrlParameters["ODataKeyPredicate"] = "'" + oInternalObject.key + "'";
			aUrlParameters["ODataServicePath"] = "'" + oInternalObject.odataServicePath + "'";
			var sErrorCode = "";

			var fSuccessFn = function(oData,response){
				oPromise.resolve(oData.MapInternalBOToExternalBO);
			};
			var fErrorFn = function(oError){
				Log.error(JSON.stringify(oError));
				sErrorCode = oError.response.statusCode;
				oPromise.reject(sErrorCode);
			};

			oOdataModel.read(sOdataEndPoint, null, aUrlParameters, true, fSuccessFn, fErrorFn);

		},

		/**
		 * Get Jam External Object
		 * @param {sap.ui.model.odata.ODataModel} oOdataModel The OData model object
		 * @param {string}	sExObjId	Object External ID (External ID in Jam)
		 * @param {string}	sExObjType	Object Id in Jam
		 * @private
		 */
		_GetJamExternalObject : function(oOdataModel, sExObjId, sExObjType, fSuccessCallBack, fErrorCallBack) {

			var sOdataEndPoint = "/" + this.OdataUtilConstants.EndPoint.ExternalObjects_FindByExidAndObjectType
									 + "/?Exid='" + encodeURL(sExObjId) + "'&"
									 + "ObjectType='"  + encodeURL(sExObjType);

			var fSuccess = function(){
				fSuccessCallBack();
			};
			var fError = function(oError){
				Log.error(JSON.stringify(oError.response.body));
				fErrorCallBack();
			};

			oOdataModel.read(sOdataEndPoint, null, null, false, fSuccess, fError);
		}

	});


	return OdataUtil;

});
