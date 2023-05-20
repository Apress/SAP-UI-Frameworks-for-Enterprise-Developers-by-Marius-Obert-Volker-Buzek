/*
* ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
*/
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/dom/includeStylesheet',
	'sap/collaboration/components/utils/LanguageBundle',
	'sap/collaboration/components/controls/TimelineEntryEmbeddedRenderer',
	'sap/m/Text',
	'sap/m/Link',
	'sap/m/List',
	'sap/m/FeedListItem',
	'sap/m/Popover',
	'sap/m/library'
],
	function(Control, includeStylesheet, LanguageBundle, TimelineEntryEmbeddedRenderer, Text, Link, List, FeedListItem, Popover, mobileLibrary) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	/**
	 * Constructor for a new Timeline Entry Embedded Control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.ui.core.Control
	 * The Timeline Entry Embedded Control is to be used in a sap.suite.ui.commons.TimelineItem.
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @alias sap.collaboration.components.controls.TimelineEntryEmbedded
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var TimelineEntryEmbedded = Control.extend("sap.collaboration.components.controls.TimelineEntryEmbedded", /** @lends sap.collaboration.components.controls.TimelineEntryEmbedded.prototype */ {
		metadata : {
			interfaces : [],
			library : "sap.collaboration",
			properties : {
				"timelineEntry":{type:"object", group:"data"}
			},
			events : {
			},
			aggregations:{
			}
		},
		renderer: TimelineEntryEmbeddedRenderer
	});

	/**
	*  Initializes the Control instance after creation. [borrowed from sap.ui.core.Control]
	* @protected
	* @memberOf sap.collaboration.components.controls.TimelineEntryEmbedded
	*/
	TimelineEntryEmbedded.prototype.init = function(){
		this._oLangBundle = new LanguageBundle();
		includeStylesheet(sap.ui.require.toUrl("sap/collaboration/components/resources/css/EmbeddedControl.css"));

		this._aTimelineItemTextDisplay;	// controls (sap.m.Text & sap.m.Link) for the Text
	};

	/**
	* Function is called before the rendering of the control is started. [borrowed from sap.ui.core.Control]
	* @protected
	* @memberOf sap.collaboration.components.controls.TimelineEntryEmbedded
	*/
	TimelineEntryEmbedded.prototype.onBeforeRendering = function(){
		if (!this._aTimelineItemTextDisplay){
			this._createTimelineItemText();
		}
	};

	/**
	* Cleans up the control instance before destruction. [borrowed from sap.ui.core.Control]
	* @protected
	* @memberOf sap.collaboration.components.controls.TimelineEntryEmbedded
	*/
	TimelineEntryEmbedded.prototype.exit = function(){
		if ( this._aTimelineItemTextDisplay ){
			this._aTimelineItemTextDisplay.forEach(function(oControl){
				oControl.destroy();
			});
		}
		if ( this._oPopover ){
			this._oPopover.destroy();
		}
	};
	/**
	 * Returns the content control
	 * @private
	 * @returns {object} SAPUI5 control
	 * @memberOf sap.collaboration.components.controls.TimelineEntryEmbedded
	 */
	TimelineEntryEmbedded.prototype._getTimelineItemTextControls = function(){
		return this._aTimelineItemTextDisplay;
	};

	/**
	 * Creates the controls for the Text
	 * @private
	 * @memberOf sap.collaboration.components.controls.TimelineEntryEmbedded
	 */
	TimelineEntryEmbedded.prototype._createTimelineItemText = function(){
		var oTimelineItemData = this.getTimelineEntry();

		this._aTimelineItemTextDisplay = [];

		if (oTimelineItemData.timelineEntryDetails != undefined && oTimelineItemData.timelineEntryDetails.length > 0){

			var sFirstEntry = this._parseTimelineEntryDetail(oTimelineItemData.timelineEntryDetails[0]);
			this._aTimelineItemTextDisplay.push( new Text({text: sFirstEntry + " "}).addStyleClass("alignMiddle") );

			if (oTimelineItemData.timelineEntryDetails.length > 1){
				var oLink = this._createTLEntryDetailsLink(oTimelineItemData.timelineEntryDetails).addStyleClass("alignMiddle");
				this._aTimelineItemTextDisplay.push(oLink);
			}
		}
		else {
			this._aTimelineItemTextDisplay.push( new Text({text: oTimelineItemData.text}).addStyleClass("alignMiddle") );
		}

	};
	/**
	 * Called by the renderer. This will render the Text part of the embedded control.
	 * @param oRenderManager
	 * @memberOf sap.collaboration.components.controls.TimelineEntryEmbedded
	 */
	TimelineEntryEmbedded.prototype._renderTimelineItemText = function(oRenderManager){
		var space = "\u00a0";

		if (this._aTimelineItemTextDisplay.length > 0){
			oRenderManager.openStart("div", this).openEnd();

			for (var i = 0; i < this._aTimelineItemTextDisplay.length; i++) {

				var sClassName = this._aTimelineItemTextDisplay[i].getMetadata().getName();

				switch (sClassName){
				case "sap.m.Text":
					// WORKAROUND: the SAPUI5 framework trims text automatically when rendering;
					// therefore we must add the spaces at the beginning and at the end
					var sText = this._aTimelineItemTextDisplay[i].getText();

					// adding spaces at the beginning
					if (sText.search(/\s/) == 0){
						var iFirstNonSpace = sText.search(/\S/);
						do {
							oRenderManager.text(space);
							iFirstNonSpace--;
						}
						while (iFirstNonSpace > 0);
					}
					oRenderManager.renderControl(this._aTimelineItemTextDisplay[i]);

					// adding spaces at the end
					if ( sText[sText.length - 1] == " " ){
						var index = sText.length - 1;
						var character = sText[index];
						do {
							oRenderManager.text(space);
							character = sText[--index];
						}
						while (character == " " && character != undefined);
					}

					break;
				case "sap.m.Link":
				case "sap.ui.core.HTML":
				default:
					oRenderManager.renderControl(this._aTimelineItemTextDisplay[i]);
				}
			}
			oRenderManager.close("div");
		}
	};
	/*********************************************************
	 * Timeline Entry functions
	 *********************************************************/
	/**
	 * Creates Link control for the additional changes
	 * @param {array} aTimelineEntryDetails - Number of timeline entry details
	 * @returns {sap.m.Link} Link control
	 * @memberOf sap.collaboration.components.socialtimeline.controls.TimelineItemEmbeddedControl
	 */
	TimelineEntryEmbedded.prototype._createTLEntryDetailsLink = function(aTimelineEntryDetails){
		var that = this;
		var iAdditionalChanges = aTimelineEntryDetails.length - 1;
		var sLangBundleText = this._oLangBundle.getText("TE_LINK_TEXT", iAdditionalChanges);

		var oLink = new Link(this.getId() + "_PopoverLink", { text: sLangBundleText });

		oLink.attachPress(function(){
			if (!that._oPopover){
				that._oPopover = that._createTLEntryDetailsPopover(aTimelineEntryDetails);
			}
			that._oPopover.openBy(oLink);
		});
		return oLink;
	};
	/**
	 * Create the popover list for the additional changes
	 * @param {array} aTimelineEntryDetails - list of timeline entry details items
	 * @returns {sap.m.Popover}
	 * @memberOf sap.collaboration.components.socialtimeline.controls.TimelineItemEmbeddedControl
	 */
	TimelineEntryEmbedded.prototype._createTLEntryDetailsPopover = function(aTimelineEntryDetails){

		var oChangeList = new List(this.getId() + "_ChangeList", {inset:false});

		for (var oEntry in aTimelineEntryDetails){
			var sEntry = this._parseTimelineEntryDetail(aTimelineEntryDetails[oEntry]);
			var oListItem = new FeedListItem({text: sEntry,
												showIcon: false});
			oChangeList.addItem(oListItem);
		}

		var S_CONTENT_WIDTH = "20em";
		var oPopover = new Popover(this.getId() + "_Popover", {
			contentWidth: S_CONTENT_WIDTH,
			placement: PlacementType.Auto,
			title: this._oLangBundle.getText("TE_DETAILS_POPOVER_HEADER") + "(" + aTimelineEntryDetails.length + ")",
			content:[oChangeList]
		});
		return oPopover;
	};
	/**
	 * Parses the Timeline entry detail to a format for the additional changes to be displayed in the popover
	 * @param {Object} oDetail - Timeline entry detail
	 * @returns {String} Timeline entry change description
	 * @memberOf sap.collaboration.components.socialtimeline.controls.TimelineItemEmbeddedControl
	 */
	TimelineEntryEmbedded.prototype._parseTimelineEntryDetail = function(oDetail){

		var sTimelineEntryDetail = "";

		switch (oDetail.changeType) {
			case "U":
				sTimelineEntryDetail = this._oLangBundle.getText("TE_DETAILS_CHANGED",[oDetail.propertyLabel, oDetail.beforeValue, oDetail.afterValue]);
				break;
			case "I":
				sTimelineEntryDetail = this._oLangBundle.getText("TE_DETAILS_SET",[oDetail.propertyLabel, oDetail.afterValue]);
				break;
			case "D":
				sTimelineEntryDetail = this._oLangBundle.getText("TE_DETAILS_CLEARED",[oDetail.propertyLabel, oDetail.beforeValue]);
				break;
		}
		return sTimelineEntryDetail;
	};
	return TimelineEntryEmbedded;
});