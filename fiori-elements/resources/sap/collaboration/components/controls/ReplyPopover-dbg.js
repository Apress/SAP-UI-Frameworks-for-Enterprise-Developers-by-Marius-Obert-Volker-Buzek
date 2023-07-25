/*
* ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/base/util/isEmptyObject",
	"../utils/LanguageBundle",
	"sap/ui/Device",
	"sap/ui/core/Control",
	"sap/ui/core/library",
	"sap/ui/core/mvc/View",
	"sap/ui/dom/includeStylesheet",
	"sap/ui/model/json/JSONModel",
	"sap/m/App",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/m/FeedListItem",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Link",
	"sap/m/List",
	"sap/m/Page",
	"sap/m/ResponsivePopover"
], function(jQuery, isEmptyObject, LanguageBundle, Device, Control, coreLibrary, View, includeStylesheet, JSONModel,
			App, Bar, Button, FeedListItem, Label, mobileLibrary, Link, List, Page, ResponsivePopover) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	// shortcut for sap.m.ListSeparators
	var ListSeparators = mobileLibrary.ListSeparators;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	includeStylesheet(sap.ui.require.toUrl("sap/collaboration/components/resources/css/SocialProfile.css"));
	includeStylesheet(sap.ui.require.toUrl("sap/collaboration/components/resources/css/ReplyPopover.css"));

	/**
	 * Constructor for the ReplyPopover
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class ReplyPopover
	 * This class is responsible for creating the ReplyPopover
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.29.0-SNAPSHOT
	 *
	 * @constructor
	 * @alias sap.collaboration.components.controls.ReplyPopover
	 * @memberOf sap.collaboration.components.controls.ReplyPopover
	 */
	var ReplyPopover = Control.extend("sap.collaboration.components.controls.ReplyPopover",
	/** @lends sap.collaboration.components.controls.ReplyPopover.prototype */ {
		metadata : {
			library : "sap.collaboration",
			events : {

				/**
				 * This event is fired after the "Post" button is pressed.
				 */
				postReplyPress : {
					parameters : {

						/**
						 * This parameter contains the value entered by the user after the "Post" button is pressed.
						 */
						value : {type : "string"}
					}
				},

				/**
				 * This event is fired after the "Show more replies" link is pressed.
				 */
				moreRepliesPress : {},

				/**
				 * This event is fired after the ReplyPopover is closed.
				 */
				afterClose : {},
			},
			aggregations : {

				/**
				 * The Social Text Area control
				 */
				socialTextArea : {type : "sap.collaboration.components.controls.SocialTextArea", multiple : false},
			}
		},
		renderer: null // this is a popup-like control, it has no renderer
	});

	/*******************
	 * Protected methods
	 *******************/
	/**
	* Initialization on the ReplyPopover
	* @protected
	* @memberOf sap.collaboration.components.controls.ReplyPopover
	*/
	ReplyPopover.prototype.init = function () {
		// Util Classes
		this._oLangBundle = new LanguageBundle();

		// Initialize Model
		this._oJSONModelData = [];
		this._oJSONModel = new JSONModel(this._oJSONModelData);

		// Initialize variables
		this._oControlToReceiveFocus;

		// Initialize Controls
		this._oSocialProfileView;
		this._oReplyApp;
		this._oReplyPage;
		this._oReplyTextArea;
		this._oReplyList;
		this._oReplyButton;
		this._oReplyHeaderBar;
		this._oReplyPopover = this._oReplyPopover || this._createReplyPopover();
	};

	/**
	* Clean up before control is destroyed
	* @protected
	* @memberOf sap.collaboration.components.controls.ReplyPopover
	*/
	ReplyPopover.prototype.exit = function () {
		if (this._oReplyPopover) {
			this._oReplyPopover.destroy();
		}
	};

	/*****************
	 * Public methods
	 *****************/
	/**
	* Post new reply
	* @public
	* @param {object} oReplyData - the data for the reply to be added
	* @memberOf sap.collaboration.components.controls.ReplyPopover
	*/
	ReplyPopover.prototype.addReply = function(oReplyData) {
		// checks whether oReplyData is empty before adding it
		if (!isEmptyObject(oReplyData)) {
			if (oReplyData.Text) {
				oReplyData.Text = this._replaceCarriageReturnWithBRTag(oReplyData.Text);
			}
			this._oJSONModelData.push(oReplyData);
			this._oJSONModel.setData(this._oJSONModelData, true);
		}
		else {
			this._oReplyTextArea.focus(); // this is required or the popover will close
		}
	};

	/**
	* Add Replies
	* @public
	* @param {object} oRepliesData - the data for the replies to be added
	* @memberOf sap.collaboration.components.controls.ReplyPopover
	*/
	ReplyPopover.prototype.addReplies = function(oRepliesData) {
		var aRepliesData = oRepliesData && oRepliesData.data;
		// checks whether oRepliesData has 'data' and the length is not 0 before adding it
		if (aRepliesData && aRepliesData.length !== 0) {
			var iReplyListLength = this._oReplyList.getItems().length;
			var iRepliesDataLength = aRepliesData.length;

			// replace each return carriage in the Replies Data Text with <br>
			for (var i = 0; i < aRepliesData.length; i++) {
				if (aRepliesData[i].Text) {
					aRepliesData[i].Text = this._replaceCarriageReturnWithBRTag(aRepliesData[i].Text);
					aRepliesData[i].Text = "\u200E" + aRepliesData[i].Text + "\u200E";
				}
			}

			this._oJSONModelData = aRepliesData.concat(this._oJSONModelData);
			this._oJSONModel.setData(this._oJSONModelData, true);

			// if the reply list length before setting the data is not 0, it implies that the list already had replies
			// and the 'Show More' link was pressed. We then set the focus to the last item in the list before the 'Show More' link was pressed
			if (iReplyListLength !== 0) {
				this._oControlToReceiveFocus = this._oReplyList.getItems()[iRepliesDataLength];
			}

			// hide/show the 'Show more replies' link
			if (oRepliesData.more) {
				this._oShowMoreBar.setVisible(true);
			}
			else {
				this._oShowMoreBar.setVisible(false);
			}
		}
	};

	/**
	* Open the ReplyPopover
	* @public
	* @param {object} oOpeningControl - the control that will open the ReplyPopover
	* @returns {sap.collaboration.components.controls.ReplyPopover} this method allows for chaining
	* @memberOf sap.collaboration.components.controls.ReplyPopover
	*/
	ReplyPopover.prototype.openBy = function(oOpeningControl) {
		if (!this._oReplyTextArea) {
			this._oReplyTextArea = this.getSocialTextArea();
			this._oReplyTextArea.addStyleClass("replyTextAreaToBottom").addStyleClass("replyTextArea");
			this._oControlToReceiveFocus = this._oReplyTextArea;

			this._oReplyPage.addContent(this._oShowMoreBar).addContent(this._addList()).addContent(this._oReplyTextArea);

			this._oReplyPopover.setInitialFocus(this._oReplyTextArea);
		}
		this._oReplyPopover.openBy(oOpeningControl);

		return this;
	};

	/**
	* Define the delay, after which the busy indicator will show up
	* @public
	* @param {int} iDelay - The delay in ms
	* @returns {sap.collaboration.components.controls.ReplyPopover} this method allows for chaining
	* @memberOf sap.collaboration.components.controls.ReplyPopover
	*/
	ReplyPopover.prototype.setBusyIndicatorDelay = function(iDelay) {
		this._oReplyPage.setBusyIndicatorDelay(iDelay);
		return this;
	};

	/**
	* Set the controls busy state
	* @public
	* @param {boolean} bBusy - Set the controls busy state
	* @returns {sap.collaboration.components.controls.ReplyPopover} this method allows for chaining
	* @memberOf sap.collaboration.components.controls.ReplyPopover
	*/
	ReplyPopover.prototype.setBusy = function(bBusy) {
		this._oReplyPage.setBusy(bBusy);
		return this;
	};

	/**
	* Getter for the text area
	* @public
	* @return {sap.ui.core.Control} - the ReplyPopover text area
	* @memberOf sap.collaboration.components.controls.ReplyPopover
	*/
	ReplyPopover.prototype.getTextArea = function () {
		return this._oReplyTextArea;
	};

	/*******************
	 * Private methods
	 *******************/
	/**
	* Creates a Responsive Popover for the Replies
	* @private
	* @returns {sap.m.ResponsivePopover}
	* @memberOf sap.collaboration.components.controls.ReplyPopover
	*/
	ReplyPopover.prototype._createReplyPopover = function () {
		var oReplyPopover = new ResponsivePopover({
			showHeader: false,
			placement: PlacementType.Vertical,
			contentWidth: "25rem",
			contentHeight: "455px",
			content: this._addApp(),
			afterClose: [function(){
				this._oReplyApp.backToTop();
				this._oReplyList.destroyItems();
				this._oJSONModelData = [];
				this._oJSONModel.setData(this._oJSONModelData);
				this._oShowMoreBar.setVisible(false);
				this._oControlToReceiveFocus = this._oReplyTextArea;
				this.fireAfterClose();
			},this]
		});

		return oReplyPopover;
	};

	/**
	* Adds a List to the Popover content
	* @private
	* @returns {sap.m.List}
	* @memberOf sap.collaboration.components.controls.ReplyPopover
	*/
	ReplyPopover.prototype._addList = function () {
		var that = this;

		var oReplyListTemplate = new FeedListItem({
			text: "{Text}",
			icon: "{Creator/ThumbnailImage}",
			sender: "{Creator/FullName}",
			timestamp: "{CreatedAt}",
			iconActive: false,
			senderPress: function(oEvent){
				var oReplyObject = oEvent.getSource().getBindingContext().getObject();
				var sMemberEmail = oReplyObject.Creator.Email;
				that._oSocialProfileView.getViewData().memberId = sMemberEmail;
				that._oSocialProfileView.rerender();
				that._oReplyApp.to(that._oSocialProfilePage);
			}
		}).addStyleClass("replyFeedListItem");

		if (!this._oReplyList) {
			this._oReplyList = new List({
				width: "100%",
				items: [],
				noDataText: this._oLangBundle.getText("ST_REPLY_LIST_AREA"),
				showNoData: true,
				showSeparators: ListSeparators.None,
				updateFinished: function(oEvent){
					var iListLength = that._oReplyList.getItems().length;
					// We need to set the focus to the last Reply to have the scrollbar scroll to the bottom of the list
					if (iListLength !== 0 && that._oControlToReceiveFocus === that._oReplyTextArea) {
						that._oReplyList.getItems()[iListLength - 1].focus();
					}

					if (that._oReplyList.getItems().length === 0) {
						that._oReplyTextArea.addStyleClass("replyTextAreaToBottom");
						that._oReplyTextArea._oPop.setOffsetX(0);
					}
					else {
						/*
						 * We need to check if the height of the reply list is larger than the height of the reply page content.
						 * If so, then we remove the css class which sticks the text area on top of the footer bar.
						 * If we don't remove this css class, then the text area will also remain in the same spot and
						 * not move down as the replies grow
						 */
						// height of the reply list (grows as you add replies)
						var iReplyPopoverListHeight = jQuery(that._oReplyList.getDomRef()).height();
						// height of the ReplyPopover content, in this case it's everything inside the popover (header, content, text area, footer)
						var iReplyPopoverContentHeight =  jQuery(that._oReplyPopover.getDomRef("cont")).height();
						// height of the header containing the title "Replies"
						var iReplyPopoverHeaderHeight = jQuery(that._oReplyPage.getCustomHeader().getDomRef()).height();
						// height of the text area where you enter your reply
						var iReplyTextAreaHeight = parseInt(that._oReplyTextArea.getHeight());
						// height of the footer containing the 'Post' button
						var iReplyPopoverFooterHeight = jQuery(that._oReplyPage.getFooter().getDomRef()).height();
						if (iReplyPopoverListHeight > (iReplyPopoverContentHeight - iReplyPopoverHeaderHeight - iReplyTextAreaHeight - iReplyPopoverFooterHeight)) {
							that._oReplyTextArea.removeStyleClass("replyTextAreaToBottom");
							that._oReplyTextArea._oPop.setOffsetX(9); // we need to offset the suggestions popover to account for the vertical scrollbar that will now appear
						}
						else {
							that._oReplyTextArea.addStyleClass("replyTextAreaToBottom");
							that._oReplyTextArea._oPop.setOffsetX(0);
						}
					}
					that._oControlToReceiveFocus.focus();
				}
			});
		}
		this._oReplyList.setModel(this._oJSONModel);
		this._oReplyList.bindItems({
			path: "/",
			template: oReplyListTemplate
		});

		return this._oReplyList;
	};

	/**
	* Adds the Social Profile
	* @private
	* @returns {sap.ui.View}
	* @memberOf sap.collaboration.components.controls.ReplyPopover
	*/
	ReplyPopover.prototype._addSocialProfile = function () {
		var that = this;
		this._oSocialProfileView = 	new sap.ui.view({
			viewData : {
				langBundle : this._oLangBundle,
				popoverPrefix : this.getId(),
				afterUserInfoRetrieved : function( oUserData ){
					if (oUserData) {
						that._sUserProfileURL = oUserData.WebURL;
					}
				}
			},
			type: ViewType.JS,
			viewName: "sap.collaboration.components.socialprofile.SocialProfile"
		});

		return this._oSocialProfileView;
	};

	/**
	* Enables/Disables the 'Post' button
	* @public
	* @param {boolean} enabled Enables/Disables the post reply button
	* @memberOf sap.collaboration.components.controls.ReplyPopover
	*/
	ReplyPopover.prototype.enableButton = function(enabled) {
		this._oReplyButton.setEnabled(enabled);
	};

	/**
	* Adds a Button to the Popover
	* @private
	* @returns {sap.m.App}
	* @memberOf sap.collaboration.components.controls.ReplyPopover
	*/
	ReplyPopover.prototype._addApp = function () {
		var that = this;

		if (this._oReplyApp) {
			return this._oReplyApp;
		}
		/**************************
		 * Create the Reply Page
		 **************************/
		this._oReplyButton = new Button({
			text: this._oLangBundle.getText("ST_REPLY_POST"),
			enabled: false,
			press: this._postReply.bind(that)
		});
		this._oShowMoreLink = new Link({
			text:  this._oLangBundle.getText("ST_SHOW_MORE_REPLIES"),
			press: this._showMoreReplies.bind(that)
		});
		this._oShowMoreBar = new Bar({
			contentMiddle: [this._oShowMoreLink],
			visible: false
		}).addStyleClass("showMoreReplies");

		this._oReplyPage =  new Page({
			showHeader: true,
			showSubHeader: false,
			showFooter: true,
			customHeader: new Bar({
				contentMiddle: [new Label({ text : this._oLangBundle.getText("ST_REPLY_TITLE")})]
			}),
			footer: new Bar({
				contentRight: [this._createMentionButton(), this._oReplyButton]
			}),
		});

		/**************************
		 * Create the Profile Page
		 **************************/
		this._oSocialProfileButton = new Button({
			text: this._oLangBundle.getText("SP_OPEN_JAM_BUTTON"),
			press: function() {
				window.open(that._sUserProfileURL, "_blank");
			}
		});
		this._oSocialProfilePage = new Page({
			title: this._oLangBundle.getText("SP_TITLE"),
			showNavButton: true,
			showHeader: true,
			showSubHeader: false,
			showFooter: true,
			navButtonPress: function(oEvent){
				that._oReplyApp.back();
			},
			footer: new Bar({
				contentRight: [this._oSocialProfileButton]
			}),
			content: [this._addSocialProfile()]
		});

		/**************************
		 * Add pages to App
		 **************************/
		this._oReplyApp = new App({
			backgroundColor: "#ffffff",
			pages: [this._oReplyPage, this._oSocialProfilePage]
		});

		return this._oReplyApp;
	};

	/**
	* Adds the 'mention' button to the Responsive Popover
	* @private
	* @returns {sap.m.Button}
	* @memberOf sap.collaboration.components.controls.ReplyPopover
	*/
	ReplyPopover.prototype._createMentionButton = function () {
		// Due to Ux issues, we don't want the @mention feature available on phones
		if (Device.system.phone) {
			return;
		}
		var oMentionButton = new Button({
			text: "@",
			tooltip: this._oLangBundle.getText("ST_MENTION_TOOLTIP"),
			press: [function() {
				this._oReplyTextArea.atMentionsButtonPressed();
			}, this]

		});

		return oMentionButton;
	};

	/**
	* Replaces all the carriage returns ('\n', '\r') in a string with the br tag
	* @private
	* @param {string} text - the text to be formatted
	* @returns {string} sFormattedText - the formatted text
	* @memberOf sap.collaboration.components.controls.ReplyPopover
	*/
	ReplyPopover.prototype._replaceCarriageReturnWithBRTag = function (text) {
		var sFormattedText;
		if (typeof text === "string") {
			sFormattedText = text.replace(/[\n\r]/g, '<br>'); // check for '\n' or '\r'
		}
		return sFormattedText;
	};

	/********************
	 * Event Handlers
	 *******************/
	/**
	* Post new reply
	* @private
	* @memberOf sap.collaboration.components.controls.ReplyPopover
	*/
	ReplyPopover.prototype._postReply = function () {
		var sValueWithEmailAlias = this._oReplyTextArea.convertTextWithFullNamesToEmailAliases();
		this.firePostReplyPress({ value : sValueWithEmailAlias });
		this._oControlToReceiveFocus = this._oReplyTextArea;
	};

	/**
	* Show more replies
	* @private
	* @memberOf sap.collaboration.components.controls.ReplyPopover
	*/
	ReplyPopover.prototype._showMoreReplies = function () {
		this.fireMoreRepliesPress();
	};

	return ReplyPopover;

});
