/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.Smart2DHandler.
sap.ui.define([
	"sap/ui/base/EventProvider",
	"sap/ui/core/ResizeHandler"
], function(
	EventProvider,
	ResizeHandler
) {
	"use strict";

	var Smart2DHandler = EventProvider.extend("sap.ui.vk.Smart2DHandler", {
		metadata: {
			library: "sap.ui.vk",
			publicMethods: [
				"beginGesture",
				"move",
				"endGesture",
				"click",
				"doubleClick",
				"contextMenu",
				"getViewport"
			]
		},
		constructor: function(viewport, viewStateManager) {
			this._viewport = viewport;
			this._rect = null;
			this._x = 0;
			this._y = 0;
			this._gesture = false;
			this._hitEndTimer = 0;
			this._lastRender = 0;
			this._viewport.attachEvent("resize", this, this._onresize);
			this._viewStateManager = viewStateManager;
			// This is where we save the state of the node that we hover so we can return
			// to that state when we hover out.
			this._previousColoring = {
				nodeRef: null,
				nodeId: null,
				color: null
			};
		}
	});

	Smart2DHandler.prototype.destroy = function() {
		this._viewport = null;
		this._rect = null;
		this._gesture = false;
		this._viewport.detachEvent("resize", this, this._onresize);
		this._viewStateManager = null;
		this._previousColoring = null;
	};

	Smart2DHandler.prototype._getOffset = function(domElement) {
		var rectangle = domElement.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	Smart2DHandler.prototype._inside = function(event) {
		var viewportDomRef = this._viewport.getDomRef();
		if (viewportDomRef == null) {
			return false;
		}

		var viewportOffset = this._getOffset(viewportDomRef);
		this._rect = {
			x: viewportOffset.x,
			y: viewportOffset.y,
			w: viewportDomRef.offsetWidth,
			h: viewportDomRef.offsetHeight
		};

		return (event.x >= this._rect.x && event.x <= this._rect.x + this._rect.w && event.y >= this._rect.y && event.y <= this._rect.y + this._rect.h);
	};

	Smart2DHandler.prototype._onresize = function(event) {
		this._gesture = false;
		this._rect = null;
	};

	Smart2DHandler.prototype.beginGesture = function(event) {
		if (this._inside(event)) {
			this._gesture = true;
			this._x = event.x;
			this._y = event.y;
		}
	};

	Smart2DHandler.prototype.callbackHover = function() {

		var nodeHierarchy = this._viewStateManager.getNodeHierarchy();

		this._lastRender = Date.now();
		this._hitEndTimer = 0;

		// Perform a hit test and see if there's any node under the mouse cursor
		var hitTestedNodeRef = this._viewport.hitTest(this._x, this._y);

		// If we hit a node different than the previously highlighted node,
		// then we remove the highlight from that old node.
		if (this._highlightedNodeRef !== hitTestedNodeRef) {

			// removing the tint from the previously highlight node
			if (this._highlightedNodeRef !== sap.ve.dvl.DVLID_INVALID) {
				// If the previously highlighted node is the one that we saved,
				// then we restore its color to what it used to be before the hover gesture.
				var tintColor = this._highlightedNodeRef === this._previousColoring.nodeRef ? this._previousColoring.color : 0;
				this._viewport.showHotspots(this._highlightedNodeRef, true, tintColor);
			}
			// If the newly hit node is a hotspot, we tint it
			if (nodeHierarchy.getHotspotNodeIds().indexOf(hitTestedNodeRef) !== -1) {
				// Retrieving and saving the hotspot color before tinting it as a result of hover gesture
				var nodeProxy = nodeHierarchy.createNodeProxy(hitTestedNodeRef);
				this._previousColoring = {
					nodeRef: hitTestedNodeRef,
					nodeId: hitTestedNodeRef,
					color: nodeProxy.getTintColorABGR()
				};
				nodeHierarchy.destroyNodeProxy(nodeProxy);
				this._viewport.showHotspots(hitTestedNodeRef, true);
			}
			// update the reference to the currently highlighted node
			this._highlightedNodeRef = hitTestedNodeRef;
		}

		this._viewport.renderFrame();
	};

	Smart2DHandler.prototype.hover = function(event) {
		if (event.n == 1 && this._inside(event)) {
			this._x = event.x - this._rect.x;
			this._y = event.y - this._rect.y;
			if (!this.getViewport().getShowAllHotspots()) {
				var timestamp = Date.now();

				if (timestamp - this._lastRender > 20) {
					this.callbackHover();
				}

				if (this._hitEndTimer != 0) {
					clearTimeout(this._hitEndTimer);
				}
				this._hitEndTimer = setTimeout(this.callbackHover.bind(this), 20);
			}
			event.handled = true;
		}
	};

	Smart2DHandler.prototype.move = function(event) {
		// Redirect 1 point touch to 2 point touch so disable rotate and do pan instead
		if (this._gesture && event.n == 1) {
			this._viewport.pan(event.x - this._x, event.y - this._y);
			this._x = event.x;
			this._y = event.y;
			event.handled = true;
		}
	};

	Smart2DHandler.prototype.endGesture = function(event) {
		this._gesture = false;
	};

	Smart2DHandler.prototype.click = function(event) { };

	Smart2DHandler.prototype.doubleClick = function(event) { };

	Smart2DHandler.prototype.contextMenu = function(event) { };

	Smart2DHandler.prototype.getViewport = function() {
		return this._viewport;
	};

	return Smart2DHandler;
});
