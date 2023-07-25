/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.PoiManipulationTool
sap.ui.define([
	"./Tool",
	"../thirdparty/three",
	"./PoiToolHandler",
	"./PoiToolGizmo",
	"../threejs/PoiHelper",
	"./ToolNodeSet",
	"../NodeContentType"
], function(
	Tool,
	THREE,
	PoiToolHandler,
	PoiToolGizmo,
	PoiHelper,
	ToolNodeSet,
	NodeContentType
) {
	"use strict";

	var PoiManipulationTool = Tool.extend("sap.ui.vk.tools.PoiManipulationTool", /** @lends sap.ui.vk.tools.PoiManipulationTool.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				nodeSet: {
					type: "sap.ui.vk.tools.ToolNodeSet",
					defaultValue: ToolNodeSet.Highlight
				}
			},
			aggregations: {
				buttons: { type: "sap.m.Button", multiple: true }
			},
			events: {
				editing: {
					parameters: {
						nodeRef: "any"
					}
				},

				removing: {
					parameters: {
						nodeRef: "any"
					}
				},

				moving: {
					parameters: {
						x: "float",
						y: "float",
						z: "float",
						nodesProperties: "any[]"
					}
				},

				moved: {
					parameters: {
						x: "float",
						y: "float",
						z: "float",
						nodesProperties: "any[]"
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			Tool.apply(this, arguments);
			// Configure dependencies
			this._viewport = null;
			this._poiHelper = new PoiHelper();
			this.setAggregation("gizmo", new PoiToolGizmo());
			this._handler = new PoiToolHandler(this);
			this._buttonPosition = new THREE.Vector2();
			this._selectedPoi = new Set();
		}
	});

	PoiManipulationTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}

		this._editButton = new sap.m.Button({
			icon: "sap-icon://edit",
			type: sap.m.ButtonType.Neutral,
			press: function(event) {
				this.fireEditing({ nodeRef: this._selectedPoi.values().next().value });
			}.bind(this)
		}).addStyleClass("sapUiVizKitPoiButtonEdit");

		this._deleteButton = new sap.m.Button({
			icon: "sap-icon://delete",
			type: sap.m.ButtonType.Neutral,
			press: function(event) {
				this.fireRemoving({ nodeRef: this._selectedPoi.values().next().value });
			}.bind(this)
		}).addStyleClass("sapUiVizKitPoiButtonDelete");

		this.addAggregation("buttons", this._editButton);
		this.addAggregation("buttons", this._deleteButton);
		this.setButtonsVisibility(false);

		this.attachMoved(function(event) {
			var nodesProperties = event.getParameter("nodesProperties");
			for (var i = 0; i < nodesProperties.length; ++i) {
				var nodeRef = nodesProperties[i].node;

				if (this._gizmo && this._gizmo.getIgnoreNonPoiNode() && nodeRef._vkGetNodeContentType() !== NodeContentType.Symbol) {
					continue;
				}

				this._poiHelper.adjustPoi(this._viewport, nodeRef);
			}
		});

		// set footprint for tool
		this.setFootprint(["sap.ui.vk.threejs.Viewport"]);
	};

	PoiManipulationTool.prototype.getSelectedPois = function() {
		var pois = [];
		if (this._viewport) {
			var vsm = this._viewport._viewStateManager;
			vsm.getSymbolNodes().forEach(function(poi) {
				if (vsm.getSelectionState(poi)) {
					pois.push(poi);
				}
			});
		}
		return pois;
	};

	PoiManipulationTool.prototype._updateSelectedPoi = function() {
		if (this._viewport && this._viewport._viewStateManager) {
			var vsm = this._viewport._viewStateManager;
			var symbolNodes = vsm.getSymbolNodes();
			this._selectedPoi.forEach(function(poi) {
				if (!symbolNodes.includes(poi)) {
					this._selectedPoi.delete(poi);
				}
			}.bind(this));

			symbolNodes.forEach(function(poi) {
				if (vsm.getSelectionState(poi)) {
					this._selectedPoi.add(poi);
				} else {
					this._selectedPoi.delete(poi);
				}
			}.bind(this));
		}
		return this;
	};

	PoiManipulationTool.prototype._updateButtonPosition = function(nodeRef) {
		var nodeRect = this._poiHelper.getPoiRect(this._viewport, nodeRef);
		if (nodeRect) {
			var nodeBoundingBox = new THREE.Box3();
			nodeBoundingBox.expandByObject(nodeRef);
			var center = new THREE.Vector3();
			nodeBoundingBox.getCenter(center);
			var nodeCenter = this._viewport.projectToScreen(center.x, center.y, center.z, this._viewport.getCamera());
			var buttonx = nodeCenter.x + nodeRect.width / 2;
			var buttony = nodeCenter.y - nodeRect.height / 2;
			this._buttonPosition.set(buttonx, buttony);
			return true;
		}
		return false;
	};

	PoiManipulationTool.prototype.handlePoiSelectionChange = function() {
		this._updateSelectedPoi();
	};

	PoiManipulationTool.prototype.setActive = function(value, activeViewport) {
		Tool.prototype.setActive.call(this, value, activeViewport);
		if (this._viewport) {
			this.updateButtons();
			if (value) {
				this._gizmo = this.getGizmo();
				this._gizmo.show(this._viewport, this);
				this._gizmo.rerender();
				this._addLocoHandler();

				this._viewport._viewStateManager.attachSelectionChanged(this.handlePoiSelectionChange, this);
			} else {
				this._removeLocoHandler();
				if (this._viewport._viewStateManager) {
					this._viewport._viewStateManager.detachSelectionChanged(this.handlePoiSelectionChange, this);
				}
				if (this._gizmo) {
					this._gizmo.hide();
					this._gizmo = null;
				}
			}
		}

		return this;
	};

	PoiManipulationTool.prototype.updateButtons = function() {
		this._updateSelectedPoi();
		var buttons = this.getButtons();
		var buttonsDom;
		buttons.forEach(function(btn) {
			if (btn.getVisible()) {
				btn.rerender();
				if (btn.getDomRef()) {
					buttonsDom = btn.getDomRef().parentElement;
				}
			}
		});
		if (buttonsDom) {
			if (this._selectedPoi.size && this._updateButtonPosition(this._selectedPoi.values().next().value)) {
				buttonsDom.style.display = "block";
				buttonsDom.style.left = this._buttonPosition.x + "px";
				buttonsDom.style.top = this._buttonPosition.y + "px";
			} else {
				buttonsDom.style.display = "none";
			}
		}
	};

	PoiManipulationTool.prototype.setButtonsVisibility = function(visible) {
		this.getButtons().forEach(function(btn) {
			if (btn.getVisible() !== visible) {
				btn.setVisible(visible);
			}
		});
	};

	PoiManipulationTool.prototype.addButtons = function(controls) {
		if (!Array.isArray(controls)) {
			controls = [controls];
		}
		controls.forEach(function(ctr) {
			this.addAggregation("buttons", ctr);
		}, this);
	};

	return PoiManipulationTool;
});
