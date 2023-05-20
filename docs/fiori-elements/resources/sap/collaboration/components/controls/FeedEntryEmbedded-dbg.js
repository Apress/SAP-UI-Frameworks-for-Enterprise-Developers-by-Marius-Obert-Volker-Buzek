/*
* ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
*/
sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/base/util/isEmptyObject',
	'sap/ui/dom/includeStylesheet',
	'sap/ui/core/Control',
	'sap/collaboration/components/utils/LanguageBundle',
	'sap/collaboration/components/controls/FeedEntryEmbeddedRenderer',
	'sap/collaboration/components/controls/PlaceholderUtility',
	'sap/collaboration/components/utils/MediaTypeToSAPIcon',
	'sap/m/Link',
	'sap/ui/model/json/JSONModel',
	'sap/m/VBox',
	'sap/m/Image',
	'sap/ui/core/Icon',
	'sap/m/HBox'
],
	function(jQuery, isEmptyObject, includeStylesheet, Control, LanguageBundle, FeedEntryEmbeddedRenderer, PlaceholderUtility, MediaTypeToSAPIcon, Link, JSONModel, VBox, Image, Icon, HBox) {
	"use strict";

	/**
	 * Constructor for a new Feed Entry Embedded Control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.ui.core.Control
	 * The Feed Entry Embedded Control is to be used in a sap.suite.ui.commons.TimelineItem.
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @alias sap.collaboration.components.controls.FeedEntryEmbedded
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var FeedEntryEmbedded = Control.extend("sap.collaboration.components.controls.FeedEntryEmbedded", /** @lends sap.collaboration.components.controls.FeedEntryEmbedded.prototype */ {
		metadata : {
			interfaces : [],
			library : "sap.collaboration",
			properties : {
				"feedEntry": {type:"object", group:"data"},
				"serviceUrl": {type:"string", group:"data"}
			},
			events : {
				"atMentionClick": {
					parameters : {
						link: {type : "object"}
					}
				},
				"expandCollapseClick": {
				},
				"previewLoad": {
				}
			}
		},
		renderer: FeedEntryEmbeddedRenderer
	});

	/**
	*  Initializes the Control instance after creation. [borrowed from sap.ui.core.Control]
	* @protected
	* @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	*/
	FeedEntryEmbedded.prototype.init = function(){

		this.nMaxCollapsedLength = 200;
		this.CONTENT_MAX_HEIGHT = 128;
		this._oLangBundle = new LanguageBundle();

		this._oTimelineItemContent; // control for the Content (sap.m.VBox)
		includeStylesheet(sap.ui.require.toUrl("sap/collaboration/components/resources/css/EmbeddedControl.css"));
	};

	/**
	* Function is called before the rendering of the control is started. [borrowed from sap.ui.core.Control]
	* @overwrite
	* @protected
	* @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	*/
	FeedEntryEmbedded.prototype.onBeforeRendering = function(){
	};
	/**
	* Function is called after the rendering of the control is started. [borrowed from sap.ui.core.Control]
	* @overwrite
	* @protected
	* @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	*/
	FeedEntryEmbedded.prototype.onAfterRendering = function(){

		this._$ExpandedTextDiv = this.$('expanded-text');
		var sExpandedInnerHTML = this._$ExpandedTextDiv.html();

		// render the links in the html
		if (sExpandedInnerHTML != undefined) {
			this._$ExpandedTextDiv.html(this._renderLinks(sExpandedInnerHTML));
		}

		if (this.oExpandLink && this.oCollapseLink) {
			this._$FeedEntryDiv = this.$();
			this._$CollapsedTextDiv = this.$('collapsed-text');
			var sCollapsedInnerHTML = this._$CollapsedTextDiv.html();

			if (sCollapsedInnerHTML != undefined) {
				this._$CollapsedTextDiv.html(this._renderLinks(sCollapsedInnerHTML));
			}

			jQuery(this._$ExpandedTextDiv).detach();
		}

		// adjust the size of Image content
		if (this._oTimelineItemContent.getItems()[0] && this._oTimelineItemContent.getItems()[0].getMetadata().getName() === 'sap.m.Image') {

			var oImage = this._oTimelineItemContent.getItems()[0];

			oImage.getDomRef().addEventListener("load", function() {

				var iMaxContentWidth = this._oTimelineItemContent.getDomRef().clientWidth;
				var iMaxContentHeight = this.CONTENT_MAX_HEIGHT;

				var iImageWidth = oImage.getDomRef().width;
				var iImageHeight = oImage.getDomRef().height;
				var iImageRatio = iImageWidth / iImageHeight;

				// If the image is bigger than the max width and height, need to resize the Image control
				if (!(iImageHeight <= iMaxContentHeight && iImageWidth <= iMaxContentWidth)) {
					// if image height is bigger than the max height, shrink image
					if (iImageHeight > iMaxContentHeight) {
						iImageWidth = iImageRatio * iMaxContentHeight;
						iImageHeight = iMaxContentHeight;
					}
					// if image width is bigger than the max width, shrink image again
					if (iImageWidth > iMaxContentWidth) {
						iImageHeight = iMaxContentWidth / iImageRatio;
						iImageWidth = iMaxContentWidth;
					}

					oImage.setWidth(iImageWidth + "px");
					oImage.setHeight(iImageHeight + "px");
					oImage.rerender();
				}
				this.firePreviewLoad(); // fire event previewLoad
			}.bind(this));
		}
	};
	/**
	* Cleans up the control instance before destruction. [borrowed from sap.ui.core.Control]
	* @overwrite
	* @protected
	* @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	*/
	FeedEntryEmbedded.prototype.exit = function(){

		this._destroyAtMentionLinks();

		if (this.oExpandLink){
			this.oExpandLink.destroy();
		}

		if (this.oCollapseLink){
			this.oCollapseLink.destroy();
		}

		if ( this._oTimelineItemContent ){
			this._oTimelineItemContent.destroy();
		}
	};

	/**
	* Setter for the feedEntry property
	* @protected
	* @param {object} feedEntry
	* @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	*/
	FeedEntryEmbedded.prototype.setFeedEntry = function(feedEntry) {
		this.setProperty("feedEntry", feedEntry);

		// save the text and text with placeholder
		this._sText = feedEntry.Text;
		this._sTextWithPlaceholders = feedEntry.TextWithPlaceholders;

		// resolve the atMentions and create the link controls
		this._destroyAtMentionLinks();
		this._mAtMentionsLinks = {};
		var aAtMentions = PlaceholderUtility.getAtMentionsValues(this._sText, this._sTextWithPlaceholders);
		for (var i = 0; i < aAtMentions.length; i++) {
			this._mAtMentionsLinks[aAtMentions[i].placeholder] = this._createAtMentionLink(aAtMentions[i], feedEntry);
		}

		this._oTimelineItemContent = this._createTimelineItemContent();
		return this;
	};

	/**
	 * The first this._nMaxCollapsedLength characters of the text are shown in the collapsed form, the text string ends up
	 * with a complete word, the text string contains at least one word
	 *
	 * @public
	 * @returns {string} returns the collapsed text to be rendered
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	*/
	FeedEntryEmbedded.prototype.getCollapsedText = function() {

		this.oExpandLink;
		this.oCollapseLink;

		var iTotalCount = 0;
		var iTextAndPlaceholderIndex = 0;
		var iTextSplitByPlaceholderIndex = 0;
		var sTextWithPlaceholders = "";

		var rPlaceholderPattern = /@@.\{\d+\}/; // Regex pattern for placeholder

		var aTextSplitByPlaceholders = this._splitByPlaceholders(this._sTextWithPlaceholders);
		var aTextAndPlaceholders = PlaceholderUtility.getAtMentionsValues(this._sText, this._sTextWithPlaceholders);

		do {
			if (rPlaceholderPattern.test(aTextSplitByPlaceholders[iTextSplitByPlaceholderIndex])) {

				if (aTextAndPlaceholders[iTextAndPlaceholderIndex].placeholder === aTextSplitByPlaceholders[iTextSplitByPlaceholderIndex]) {
					iTotalCount += aTextAndPlaceholders[iTextAndPlaceholderIndex].value.length;
					sTextWithPlaceholders += aTextAndPlaceholders[iTextAndPlaceholderIndex].placeholder;
					iTextAndPlaceholderIndex++;
				}
			}
			else {
				iTotalCount += aTextSplitByPlaceholders[iTextSplitByPlaceholderIndex].length;
				sTextWithPlaceholders += aTextSplitByPlaceholders[iTextSplitByPlaceholderIndex];
			}
			iTextSplitByPlaceholderIndex++;
		} while (iTotalCount <= this.nMaxCollapsedLength);

		sTextWithPlaceholders = sTextWithPlaceholders.substring(0, this.nMaxCollapsedLength);
		var nLastSpace = sTextWithPlaceholders.lastIndexOf(" ");
		if (nLastSpace > 0) {
			this._sCollapsedTextWithPlaceholders = sTextWithPlaceholders.substr(0, nLastSpace);
		} else {
			this._sCollapsedTextWithPlaceholders = sTextWithPlaceholders;
		}
	};

	/**
	 * Create and return the expand / collapse link control
	 * @public
	 * @param {string} languagebundlekey - id and text for the expand / collapse link
	 * @returns {sap.m.Link} SAPUI5 link control
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	 */
	FeedEntryEmbedded.prototype.createExpandCollapseLink = function(languagebundlekey) {
		var oExpandCollapseLink = new Link({
			id: this.getId() + "-" + languagebundlekey,
			text: this._oLangBundle.getText(languagebundlekey),
			press: [function(oControlEvent){

				var sLinkId = oControlEvent.getSource().getId();

				if (sLinkId.indexOf("-TE_MORE") > -1) {

					jQuery(this._$CollapsedTextDiv).detach();
					jQuery(this._$ExpandedTextDiv).prependTo(this._$FeedEntryDiv);
				}
				else {

					jQuery(this._$ExpandedTextDiv).detach();
					jQuery(this._$CollapsedTextDiv).prependTo(this._$FeedEntryDiv);
				}

				this.fireExpandCollapseClick();

			},this]
		}).addStyleClass("alignMiddle");

		return oExpandCollapseLink;
	};
	/**
	 * Returns if the Text Display should be rendered
	 *
	 * @private
	 * @returns {boolean}
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	 */
	FeedEntryEmbedded.prototype._shouldTextBeRendered = function() {
		// do not create text control for the following cases:
		// - feed text is empty
		// - feed entry is consolidated
		// - feed entry is a Poll
		// - feed entry is a Question
		// - feed entry is an Idea
		// - feed entry is an Event
		// - feed entry is a Task
		// - feed entry is a Blog
		var oFeedEntry = this.getFeedEntry();
		if ( oFeedEntry.Text == undefined ||
			 oFeedEntry.Text == "" ||
			 oFeedEntry.ConsolidatedCount > 1 ||
			((!isEmptyObject(oFeedEntry.TargetObjectReference)) &&
				(oFeedEntry.TargetObjectReference.Type == "Task" ||
				oFeedEntry.TargetObjectReference.Type == "ForumItem" ||
				oFeedEntry.TargetObjectReference.Type == "Event" ||
				oFeedEntry.TargetObjectReference.FullPath == "ContentItem/BlogEntry" ||
				oFeedEntry.TargetObjectReference.FullPath == "ContentItem/Page" ||
				oFeedEntry.TargetObjectReference.FullPath == "ContentItem/Poll")
			)
		) {
			return false;
		}
		else {
			return true;
		}
	};

	/**
	 * Returns if the Text Display should be rendered
	 *
	 * @private
	 * @returns {boolean}
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	 */
	FeedEntryEmbedded.prototype._shouldContentBeRendered = function() {
		return (this._oTimelineItemContent.getItems().length > 0);
	};

	/**
	 * Returns array of text split by placeholders
	 *
	 * @private
	 * @returns {array} array of strings
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	 */
	FeedEntryEmbedded.prototype._splitByPlaceholders = function(textWithPlaceholders) {
		return PlaceholderUtility.splitByPlaceholders(textWithPlaceholders);
	};

	/**************************
	 * Text Display methods
	 **************************/
	/**
	 * Replaces fully defined urls in the text with anchor tags
	 *
	 * @private
	 * @returns {string} returns text with url anchors
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	 */
	FeedEntryEmbedded.prototype._renderLinks = function(text) {
		var rLinkPattern = /(^|[\s\n]|<br\/?>)((?:https?|ftp):\/\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~()_|])/gi;

		return text.replace(rLinkPattern, "$1<a href='$2' target='_blank'>$2</a>");
	};
	/**
	 * Create and return the link control for AtMention
	 *
	 * @private
	 * @param mPlaceholder - placeholder and its value
	 * @param oFeedEntry - feed entry
	 * @returns {sap.m.Link} SAPUI5 link control
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	 */
	FeedEntryEmbedded.prototype._createAtMentionLink = function(mPlaceholder, oFeedEntry) {
		var sFullName = mPlaceholder.value.slice(1); // remove the @ at the beginning
		var iPlaceholderIndex = mPlaceholder.placeholder.replace(/[@a-z{}]/g,"");

		var oModel = new JSONModel({
			feedId: oFeedEntry.Id,
			placeholderIndex: iPlaceholderIndex,
			placeholderValue: mPlaceholder.value
		});

		var oLink = new Link({
			id: "at_mention_link-" + this.getId() + "-" + iPlaceholderIndex,
			text: "{/placeholderValue}",
			press: [function(oControlEvent){
				this.fireAtMentionClick({ link: oControlEvent.getSource()}); // fire the atMentionClick event with the link control
			},this]
		}).addStyleClass("sapCollaborationAtMentionLink");

		oLink.setModel(oModel);
		return oLink;
	};
	/**
	 * Destroy the atMention links
	 *
	 * @private
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	 */
	FeedEntryEmbedded.prototype._destroyAtMentionLinks = function() {
		if (this._mAtMentionsLinks) {
			for (var placeholder in this._mAtMentionsLinks) {
				if (this._mAtMentionsLinks.hasOwnProperty(placeholder)) {
					this._mAtMentionsLinks[placeholder].destroy();
				}
			}
			this._mAtMentionsLinks = undefined;
		}
	};

	/**************************
	 * Content methods
	 **************************/
	/**
	 * Create the control for the Content
	 *
	 * @private
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	 */
	FeedEntryEmbedded.prototype._createTimelineItemContent = function(){
		var oTimelineItemContent = new VBox(this.getId() + "-content", {}).addStyleClass("sapUiTinyMarginTopBottom");

		// get the data
		var oFeedEntry =  this.getFeedEntry();

		// feed entry content
		if ( (!isEmptyObject(oFeedEntry.TargetObjectReference)
				&& oFeedEntry.TargetObjectReference.Type !== undefined
				&& oFeedEntry.TargetObjectReference.Type !== "FeedEntry") ||
			oFeedEntry.ConsolidatedCount > 1 ){

			oTimelineItemContent.addItem(this._createFeedEntryContent(oFeedEntry));
		}
		return oTimelineItemContent;
	};

	/**
	 * Create the control for a feed entry with a target object reference.
	 *
	 * @private
	 * @param oFeedEntry
	 * @returns {sap.m.HBox}
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	 */
	FeedEntryEmbedded.prototype._createFeedEntryContent = function(oFeedEntry){

		var sIconSrc = "";
		var sLinkText = "";
		var sLinkHref = "";

		if ( oFeedEntry.ConsolidatedCount > 1 ) {
			sIconSrc = "sap-icon://documents";
			sLinkText = this._oLangBundle.getText("TE_CONSOLIDATED_FEED_TEXT");
			sLinkHref = oFeedEntry.WebURL;
		}
		else {
			sLinkHref = oFeedEntry.TargetObjectReference.WebURL;

			switch (oFeedEntry.TargetObjectReference.Type) {
			case "ContentItem":
				if (oFeedEntry.TargetObjectReference.ContentType) {
					// If the content is an image, return an image control with the preview image
					if (oFeedEntry.TargetObjectReference.ContentType.indexOf('image') > -1) {

						var oPreviewImage = new Image( this.getId() + "-preview", {
							src: this.getServiceUrl() + "/FeedEntries('" + oFeedEntry.Id + "')/PreviewImage/$value",
							press: [function(oControlEvent) {
								window.open(sLinkHref, '_blank');
							}, this]
						});
						return oPreviewImage;
					}

					sIconSrc = MediaTypeToSAPIcon.getSAPIconForMediaType(oFeedEntry.TargetObjectReference.ContentType);
					sLinkText = PlaceholderUtility.getContentItemName(oFeedEntry.Action, oFeedEntry.ActionWithPlaceholders);
				}
				else {
					switch (oFeedEntry.TargetObjectReference.FullPath){
					case "ContentItem/Poll":
						sIconSrc = "sap-icon://horizontal-bar-chart";
						break;
					case "ContentItem/Page":
						sIconSrc = "sap-icon://e-learning";
						break;
					case "ContentItem/BlogEntry":
						sIconSrc = "sap-icon://request";
						break;
					default:
						sIconSrc = "";
						break;
					}
					sLinkText = oFeedEntry.TargetObjectReference.Title;
				}
				break;
			case "ForumItem":
				sIconSrc = this._getForumItemIconSrc(oFeedEntry.TargetObjectReference);
				sLinkText = oFeedEntry.TargetObjectReference.Title;
				break;
			case "Task":
				sIconSrc = "sap-icon://task";
				sLinkText = oFeedEntry.TargetObjectReference.Title;
				break;
			case "Event":
				sIconSrc = "sap-icon://calendar";
				sLinkText = oFeedEntry.TargetObjectReference.Title;
				break;
			default:
				sIconSrc = "sap-icon://action";
				sLinkText = oFeedEntry.TargetObjectReference.Title;
				break;
			}
		}
		// icon
		var ICON_SIZE = "2.5em";
		var oIcon = new Icon({
			src: sIconSrc,
			size: ICON_SIZE
		}).addStyleClass("sapUiTinyMarginBeginEnd");
		// link
		var oLink = new Link({
			text: sLinkText,
			target: "_blank",
			href: sLinkHref,
			tooltip: sLinkText,
			wrapping: true,
			width: "95%"
		}).addStyleClass("RightToLeftParenthesisStyling");

		var oHBox = new HBox({});
		oHBox.addItem(oIcon);
		var oVBox = new VBox({
			width:"100%"
		}).addStyleClass("sapUiTinyMarginBeginEnd"); // Vbox in case we want to add text under the link
		oVBox.addItem(oLink);
		oHBox.addItem(oVBox);

		return oHBox;
	};
	/**
	 * Get the icon source for a Forum Item.
	 *
	 * @private
	 * @param oForumItem
	 * @returns {String}
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	 */
	FeedEntryEmbedded.prototype._getForumItemIconSrc = function(oForumItem){

		var sFullPath = oForumItem.FullPath;

		switch (sFullPath){
		case "ForumItem/Inquiry":
		case "ForumItem/Question":
			return "sap-icon://question-mark";
		case "ForumItem/Idea":
			return "sap-icon://lightbulb";
		case "ForumItem/Discussion":
			return "sap-icon://discussion";
		default:
			return "";
		}
	};


	return FeedEntryEmbedded;
});