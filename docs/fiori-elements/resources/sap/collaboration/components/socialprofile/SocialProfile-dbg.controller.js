/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define([
	'sap/base/Log',
	'sap/base/security/encodeURL',
	'sap/base/util/isEmptyObject',
	'sap/collaboration/components/utils/CommonUtil',
	'sap/collaboration/components/utils/OdataUtil',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/odata/ODataModel',
	'sap/ui/model/json/JSONModel'
], function(Log, encodeURL, isEmptyObject, CommonUtil, OdataUtil, Controller, ODataModel, JSONModel) {
	"use strict";

	sap.ui.controller("sap.collaboration.components.socialprofile.SocialProfile", {

		/**************************************************************************************
		 * PROTECTED METHODS
		 **************************************************************************************/
		/**
		* Called when a controller is instantiated and its View controls (if available) are already created.
		* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		* @protected
		* @memberOf sap.collaboration.components.socialprofile.SocialProfile
		*/
		onInit: function() {
			this.getView().getViewData().collaborationHostServiceUrl ?
					this._sJamODataServiceUrl = this.getView().getViewData().collaborationHostServiceUrl : this._sJamODataServiceUrl = "/sap/bc/ui2/smi/rest_tunnel/Jam/api/v1/OData";
			this.getView().getViewData().smiServiceUrl ? this._sSMIODataServiceUrl = this.getView().getViewData().smiServiceUrl : this._sSMIODataServiceUrl =  "/sap/opu/odata/sap/SM_INTEGRATION_V2_SRV";
			this._oODataUtil = new OdataUtil();
			this._oCommonUtil = new CommonUtil();
			this._sPrefixId = this.getView().getId();
			this._sJamURL = "";
			this._sJamUserId = "";
			this._sPopoverPrefix = this.getView().getViewData().popoverPrefix;
			this._fnUserInfoFetchedCallback = this.getView().getViewData().afterUserInfoRetrieved;
			this._initializeModels();
		},

		/**
		* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		* (NOT before the first rendering! onInit() is used for that one!).
		* @protected
		* @memberOf sap.collaboration.components.socialprofile.SocialProfile
		*/
		onBeforeRendering: function() {
			if (this._memberId !== this.getView().getViewData().memberId) { // if the same user profile is not clicked, then fetch the user's data
				this.getView().resetHeader(); // this is done in case the header is set to 'No user' in the previous call (where the image, user full name and role have been removed)
				this._clearViewData(); // clear fields
				this._memberId = this.getView().getViewData().memberId;

				var oMember = this.getView().getViewData().memberInfo;
				if (isEmptyObject(oMember)) { // if no member information was passed, fetch the data
					this._getMember();
				}
				else {
					this._setMember(oMember);
					if (this._fnUserInfoFetchedCallback) {
						this._fnUserInfoFetchedCallback(oMember); // execute the callback
					}
				}
			}
		},

		/**************************************************************************************
		 * PRIVATE METHODS
		 **************************************************************************************/
		/**
		 * Initialize models
		 * @private
		 * @memberOf sap.collaboration.components.socialprofile.SocialProfile
		 */
		_initializeModels: function(){
			var bAsJSON = true;
			this._oJamODataModel = new ODataModel(this._sJamODataServiceUrl, bAsJSON);
			this._oJSONModel = new JSONModel({});
			this.getView().setModel(this._oJSONModel);
		},

		/**
		 * Fetch the SAP Jam user profile data
		 * @private
		 * @memberOf sap.collaboration.components.socialprofile.SocialProfile
		 */
		_getMember: function(){
			var that = this;
			if (this._oSocialProfileRequest) {
				this._oSocialProfileRequest.abort(); // abort an existing request, this is required for cases where the user clicks on a different user profile before the previous request is complete
			}

			var sPath = "Members_FindByEmail";
			var mParameters = {};
			mParameters.urlParameters = {
					"Email" : "'" + that._memberId + "'",
					"$expand" : "MemberProfile/PhoneNumbers",
					"$select" : "Id,FullName,Title,Email,WebURL,MemberProfile"
			};
			mParameters.success = function(oData, response){
				var oMember = that._oCommonUtil.getODataResult(oData);
				if (!isEmptyObject(oMember)) {

					var aPhoneNumbers = oMember.MemberProfile.PhoneNumbers.results;
					var iPhoneNumbersLength = aPhoneNumbers.length;
					for (var i = 0;  i < iPhoneNumbersLength; i++) {
						if (aPhoneNumbers[i]['PhoneNumberType'] === 'Work') {
							oMember.MemberProfile.WorkPhoneNumber =  aPhoneNumbers[i]['PhoneNumber'];
						}
						if (aPhoneNumbers[i]['PhoneNumberType'] === 'Mobile') {
							oMember.MemberProfile.MobilePhoneNumber = aPhoneNumbers[i]['PhoneNumber'];
						}
					}
					that._oJSONModel.setData(oMember);
					that._sJamUserId = oMember.Id;

					var sImageURL = that._buildThumbnailImageURL(that._sJamUserId);
					sap.ui.getCore().byId(that._sPrefixId + "_HeaderUserImage").setSrc(sImageURL);

					if (that._fnUserInfoFetchedCallback) {
						that._fnUserInfoFetchedCallback(oMember); // execute the callback
					}
				}
			};
			mParameters.error = function(oError){
				if (oError.response && oError.response.statusCode) {
					Log.error("SAP Jam request failed at sap.collaboration.components.socialprofile.SocialProfileController._getMember()");
					that.getView().setHeaderNoUser();
				}
			};
			this._oSocialProfileRequest = this._oJamODataModel.read(sPath, mParameters);
		},
		/**
		 * Fills the data model with the SAP Jam profile information
		 * @param {object} oMember - The member profile information
		 * @private
		 * @memberOf sap.collaboration.components.socialprofile.SocialProfile
		 */
		_setMember: function(oMember){
			var oMemberData = {
					"UserImage": oMember.picture,
					"Id": oMember.id,
					"FullName": oMember.fullname,
					"Title": oMember.title,
					"Email": oMember.email,
					"MemberProfile": {
						"Address" : oMember.address,
						"WorkPhoneNumber" : oMember.workPhoneNumber,
						"MobilePhoneNumber" : oMember.mobilePhoneNumber
					}
			};
			this._sJamUserId = oMember.id;
			this._oJSONModel.setData(oMemberData);
		},
		/**
		 * Clear the fields in the view
		 * @private
		 * @memberOf sap.collaboration.components.socialprofile.SocialProfile
		 */
		_clearViewData: function(){
			sap.ui.getCore().byId(this._sPrefixId + "_HeaderUserImage").setSrc();
			sap.ui.getCore().byId(this._sPrefixId + "_FullName").setText();
			sap.ui.getCore().byId(this._sPrefixId + "_Role").setText();
			sap.ui.getCore().byId(this._sPrefixId + "_MobileNumber").setText();
			sap.ui.getCore().byId(this._sPrefixId + "_WorkNumber").setText();
			sap.ui.getCore().byId(this._sPrefixId + "_Email").setText();
			sap.ui.getCore().byId(this._sPrefixId + "_CompanyAddress").setText();
		},

		/**
		 * Returns a URL for the ThumbnailImage
		 * @param {string} sUserId
		 * @return {string}
		 * @private
		 * @memberOf sap.collaboration.components.socialprofile.SocialProfile
		 */
		_buildThumbnailImageURL: function(sUserId) {
			return this._sJamODataServiceUrl + "/Members('" + encodeURL(sUserId) + "')/ThumbnailImage/$value";
		}
	});


});
