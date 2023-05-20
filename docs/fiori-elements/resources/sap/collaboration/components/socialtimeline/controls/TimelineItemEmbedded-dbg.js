/*
* ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
*/
sap.ui.define([
	'sap/ui/core/Control',
	'sap/collaboration/components/controls/TimelineEntryEmbedded',
	'sap/collaboration/components/controls/FeedEntryEmbedded',
	'sap/collaboration/components/socialtimeline/controls/TimelineItemEmbeddedRenderer'
], function(Control, TimelineEntryEmbedded, FeedEntryEmbedded, TimelineItemEmbeddedRenderer) {
	"use strict";

	/**
	 * Constructor for a Timeline Item Embedded Control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.ui.core.Control
	 * The Timeline Item Embedded Control is to be used in a sap.suite.ui.commons.TimelineItem.
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @alias sap.collaboration.components.socialtimeline.controls.TimelineItemEmbedded
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var TimelineItemEmbedded = Control.extend("sap.collaboration.components.socialtimeline.controls.TimelineItemEmbedded", /** @lends sap.collaboration.components.socialtimeline.controls.TimelineItemEmbedded.prototype */ {
		metadata : {
			interfaces : [],
			library : "sap.collaboration",
			properties : {
				"timelineItem":{type:"object", group:"data"}
			},
			events : {
				atMentionClick : {
					parameters : {
						link: {type : "object"},
					}
				},
				expandCollapseClick : {
				}
			}
		},
		renderer: TimelineItemEmbeddedRenderer
	});

	/**
	*  Initializes the Control instance after creation. [borrowed from sap.ui.core.Control]
	* @protected
	* @memberOf sap.collaboration.components.socialtimeline.controls.TimelineItemEmbedded
	*/
	TimelineItemEmbedded.prototype.init = function(){
		this._oEmbeddedControl;
	};

	/**
	* Function is called before the rendering of the control is started. [borrowed from sap.ui.core.Control]
	* @protected
	* @memberOf sap.collaboration.components.socialtimeline.controls.TimelineItemEmbedded
	*/
	TimelineItemEmbedded.prototype.onBeforeRendering = function(){
		var oTimelineItem = this.getTimelineItem();
		if (oTimelineItem._feedEntryData !== undefined) {
			this._oEmbeddedControl = new FeedEntryEmbedded({
				"feedEntry": oTimelineItem._feedEntryData,
				"atMentionClick": [this.onAtMentionClicked, this],
				"expandCollapseClick": [this.onExpandCollapseClick, this]
			});
		}
		else {
			this._oEmbeddedControl = new TimelineEntryEmbedded({
				"timelineEntry": oTimelineItem.timelineItemData,
			});
		}
	};

	/**
	* Cleans up the control instance before destruction. [borrowed from sap.ui.core.Control]
	* @protected
	* @memberOf sap.collaboration.components.socialtimeline.controls.TimelineItemEmbedded
	*/
	TimelineItemEmbedded.prototype.exit = function(){
	};

	/**
	 * Returns the embedded control
	 * @public
	 * @returns {object} SAPUI5 control
	 * @memberOf sap.collaboration.components.socialtimeline.controls.TimelineItemEmbedded
	*/
	TimelineItemEmbedded.prototype.getEmbeddedControl = function(){
		return this._oEmbeddedControl;
	};

	/**
	 * Fired when the expand / collapse link is clicked
	 * @private
	 * @memberOf sap.collaboration.components.socialtimeline.controls.TimelineItemEmbedded
	*/
	TimelineItemEmbedded.prototype.onExpandCollapseClick = function(){
		this.fireExpandCollapseClick();
	};

	/**
	 * Returns the embedded control
	 * @private
	 * @param oControlEvent - event
	 * @memberOf sap.collaboration.components.socialtimeline.controls.TimelineItemEmbedded
	*/
	TimelineItemEmbedded.prototype.onAtMentionClicked = function(oControlEvent){
		this.fireAtMentionClick(oControlEvent.getParameters()); // fire the same event with the same parameters
	};

	return TimelineItemEmbedded;
});