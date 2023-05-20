/**
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define([],
	function(){
	"use strict";

	/**
	 * FeedEntryEmbedded renderer.
	 * @namespace
	 */
	var TimelineEntryEmbeddedRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.collaboration.components.controls.TimelineEntryEmbedded} oControl an object representation of the control that should be rendered.
	 */
	TimelineEntryEmbeddedRenderer.render = function(oRm, oTimelineEntryEmbedded){

		// The embedded control is divided into 2 parts:
		// 1-Timeline Item Text Display: Text Display of for the feed and timeline entries

		var iNumberTimelineItemTextControls = oTimelineEntryEmbedded._getTimelineItemTextControls().length;

		// Timeline Item Text Display
		if ( iNumberTimelineItemTextControls > 0 ){
			oTimelineEntryEmbedded._renderTimelineItemText(oRm);
		}
	};

	return TimelineEntryEmbeddedRenderer;
}, /* bExport= */ true);


