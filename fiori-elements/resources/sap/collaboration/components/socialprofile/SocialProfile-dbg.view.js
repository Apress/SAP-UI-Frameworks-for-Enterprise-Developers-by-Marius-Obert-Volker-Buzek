/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/mvc/JSView", "sap/m/VBox", "sap/m/Label", "sap/m/Text", "sap/m/Link", "sap/m/HBox", "sap/m/Image", "sap/m/ObjectStatus"], function(JSView, VBox, Label, Text, Link, HBox, Image, ObjectStatus) {
	"use strict";

	sap.ui.jsview("sap.collaboration.components.socialprofile.SocialProfile", {

		/**
		* Specifies the Controller belonging to this View.
		* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
		* @private
		* @memberOf sap.collaboration.components.socialprofile.SocialProfile
		*/
		getControllerName : function() {
			return "sap.collaboration.components.socialprofile.SocialProfile";
		},

		/**
		* Is the place where the UI is constructed (inherited).<br>
		* It is initially called once after the Controller has been instantiated.
		* Since the Controller is given to this method, its event handlers can be attached right away.
		* It creates the VBox for the Responsive Popover
		* @param {sap.ui.controller} oController The view Controller
		* @private
		* @memberOf sap.collaboration.components.socialprofile.SocialProfile
		*/
		createContent : function(oController) {
			this._sPrefixId = this.getId();
			this._oVBox = new VBox(this._sPrefixId + "_VBox").addStyleClass("vbox");
			this._createVBoxContent();

			return this._oVBox;
		},

		/**
		 * Creates the content for the Social Profile VBox
		 * @private
		 * @memberOf sap.collaboration.components.socialprofile.SocialProfile
		 */
		_createVBoxContent : function(){
			this._oVBox.addItem(this._createHBoxHeader()); // add the header (HBox that contains the user image, full name and title) to the VBox content first

			var oContactDetailsLabel = new Label(this._sPrefixId + "_ContactDetailsLabel", {
				text: this.getViewData().langBundle.getText("SP_CONTACT_DETAILS_LABEL")
			}).addStyleClass("heading");

			// mobile #
			var oMobileNumber = new Text(this._sPrefixId + "_MobileNumber", {
				text: "{/MemberProfile/MobilePhoneNumber}"
			});
			var oMobileLabel = new Label(this._sPrefixId + "_MobileLabel", {
				text: this.getViewData().langBundle.getText("SP_MOBILE_LABEL"),
				labelFor: oMobileNumber.getId()
			}).addStyleClass("label");

			// work #
			var oWorkNumber = new Text(this._sPrefixId + "_WorkNumber", {
				text: "{/MemberProfile/WorkPhoneNumber}"
			});
			var oWorkLabel = new Label(this._sPrefixId + "_WorkLabel", {
				text: this.getViewData().langBundle.getText("SP_WORK_LABEL"),
				labelFor: oWorkNumber.getId()
			}).addStyleClass("label");

			// email address
			var oEmail = new Link(this._sPrefixId + "_Email", {
				text: "{/Email}",
				press: function(){
					this.setHref("mailto:" + this.getText());
				}
			});
			var oEmailLabel = new Label(this._sPrefixId + "_EmailLabel", {
				text: this.getViewData().langBundle.getText("SP_EMAIL_LABEL"),
				labelFor: oEmail.getId()
			}).addStyleClass("label");

			var oCompanyDetailsLabel = new Label(this._sPrefixId + "_CompanyDetailsLabel", {
				text: this.getViewData().langBundle.getText("SP_COMPANY_DETAILS_LABEL")
			}).addStyleClass("heading");

			// company address
			var oCompanyAddress = new Text(this._sPrefixId + "_CompanyAddress", {
				text: "{/MemberProfile/Address}"
			});
			var oCompanyAddressLabel = new Label(this._sPrefixId + "_CompanyAddressLabel", {
				text: this.getViewData().langBundle.getText("SP_COMPANY_ADDRESS_LABEL"),
				labelFor: oCompanyAddress.getId()
			}).addStyleClass("label");

			this._oVBox.addItem(oContactDetailsLabel)
			.addItem(oMobileLabel)
			.addItem(oMobileNumber)
			.addItem(oWorkLabel)
			.addItem(oWorkNumber)
			.addItem(oEmailLabel)
			.addItem(oEmail)
			.addItem(oCompanyDetailsLabel)
			.addItem(oCompanyAddressLabel)
			.addItem(oCompanyAddress);
		},

		/**
		 * Creates the content for the Social Profile Header HBox
		 * @private
		 * @memberOf sap.collaboration.components.socialprofile.SocialProfile
		 */
		_createHBoxHeader : function(){
				var oHeaderVBox = new VBox(this._sPrefixId + "_HeaderVBox").addStyleClass("headervbox");

				var oFullName = new Text(this._sPrefixId + "_FullName", {
					text: "{/FullName}",
					width: "200px",
					maxLines: 1
				}).addStyleClass("fullname");

				var oRole = new Text(this._sPrefixId + "_Role", {
					text: "{/Title}",
					width: "200px",
					maxLines: 1
				}).addStyleClass("role");

				oHeaderVBox.addItem(oFullName).addItem(oRole);

				var oHeaderHBox = new HBox(this._sPrefixId + "_HeaderHBox", {
					height: "48px"
				});

				var oUserImage = new Image(this._sPrefixId + "_HeaderUserImage", {
					src: "{/UserImage}",
					alt: "{/FullName}",
					width: "48px",
					height: "48px"
				}).addStyleClass("image");

				var oNoUserHeader = new ObjectStatus(this._sPrefixId + "_NoUserHeader", {
					text: this.getViewData().langBundle.getText("SP_NO_USER"),
					state: "Warning",
					icon: "sap-icon://alert",
					visible: false
				});

			oHeaderHBox.addItem(oUserImage)
			.addItem(oHeaderVBox)
			.addItem(oNoUserHeader);

			return oHeaderHBox;
		},

		/**
		 * Reset the content header in the Popover to have the image, user full name and role visible
		 * @public
		 * @memberOf sap.collaboration.components.socialprofile.SocialProfile
		 */
		resetHeader : function(){
			var oNouserHeader = sap.ui.getCore().byId(this._sPrefixId + "_NoUserHeader");

			if (oNouserHeader.getVisible() === true) {
				oNouserHeader.setVisible(false);
				sap.ui.getCore().byId(this._sPrefixId + "_HeaderVBox").setVisible(true);
				sap.ui.getCore().byId(this._sPrefixId + "_HeaderUserImage").setVisible(true);
			}
		},

		/**
		 * Sets the header for the content if the user does not exist
		 * @public
		 * @memberOf sap.collaboration.components.socialprofile.SocialProfile
		 */
		setHeaderNoUser : function(){
			var oUserImage = sap.ui.getCore().byId(this._sPrefixId + "_HeaderUserImage");

			if (oUserImage.getVisible() === true) {
				oUserImage.setVisible(false);
				sap.ui.getCore().byId(this._sPrefixId + "_HeaderVBox").setVisible(false);
				sap.ui.getCore().byId(this._sPrefixId + "_NoUserHeader").setVisible(true);
			}
		}
	});

});
