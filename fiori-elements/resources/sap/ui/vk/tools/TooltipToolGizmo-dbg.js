/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.TooltipToolGizmo
sap.ui.define([
	"./Gizmo",
	"./TooltipToolGizmoRenderer"
], function(
	Gizmo,
	TooltipToolGizmoRenderer
) {
	"use strict";

	/**
	 * Constructor for a new TooltipToolGizmo.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides UI to display tooltips
	 * @extends sap.ui.vk.tools.Gizmo
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.vk.tools.TooltipToolGizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TooltipToolGizmo = Gizmo.extend("sap.ui.vk.tools.TooltipToolGizmo", /** @lends sap.ui.vk.tools.TooltipToolGizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	TooltipToolGizmo.prototype.init = function() {
		if (Gizmo.prototype.init) {
			Gizmo.prototype.init.apply(this);
		}
		this._viewport = null;
		this._tool = null;
		this._previousNodeRef = null;
	};

	TooltipToolGizmo.prototype.show = function(viewport, tool) {
		this._viewport = viewport;
		this._tool = tool;
		var tooltip = this.getDomRef();
		if (tooltip) {
			tooltip.style.display = "none";
		}
	};

	TooltipToolGizmo.prototype.hide = function() {
		this._tool = null;
		var tooltip = this.getDomRef();
		if (tooltip) {
			tooltip.style.display = "none";
		}
	};

	TooltipToolGizmo.prototype.setTitle = function(title) {
		var tooltip = this.getDomRef();
		if (tooltip) {
			tooltip.style.display = title ? "block" : "none";
			tooltip.innerText = title;
		}
	};

	TooltipToolGizmo.prototype.update = function(x, y, absoluteX, absoluteY, nodeRef) {
		if (!this._tool.getFollowCursor()) {
			if (nodeRef === this._previousNodeRef) {
				return;
			} else {
				this._previousNodeRef = nodeRef;
			}
		}
		if (this._tool.fireEvent("hover", { x: x, y: y, nodeRef: nodeRef }, true)) {
			// update tooltip position
			var tooltip = this.getDomRef();
			if (tooltip) {
				var offsetParent = tooltip.offsetParent;
				while (offsetParent) {
					absoluteX -= offsetParent.offsetLeft || 0;
					absoluteY -= offsetParent.offsetTop || 0;
					offsetParent = offsetParent.offsetParent;
				}

				absoluteX += this._tool.getOffsetX(); // offset X
				absoluteY += this._tool.getOffsetY(); // offset Y
				tooltip.style.left = Math.round(absoluteX) + "px";
				tooltip.style.top = Math.round(absoluteY) + "px";
				var viewportRect = this._viewport.getDomRef().getBoundingClientRect();
				var tooltipRect = tooltip.getBoundingClientRect();
				if (tooltipRect.right > viewportRect.right) {
					tooltip.style.left = Math.round(absoluteX + viewportRect.right - tooltipRect.right) + "px";
				}
				if (tooltipRect.bottom > viewportRect.bottom) {
					tooltip.style.top = Math.round(absoluteY + viewportRect.bottom - tooltipRect.bottom) + "px";
				}
			}
		}
	};

	TooltipToolGizmo.prototype.onBeforeRendering = function() {
	};

	TooltipToolGizmo.prototype.onAfterRendering = function() {
	};

	return TooltipToolGizmo;

});
