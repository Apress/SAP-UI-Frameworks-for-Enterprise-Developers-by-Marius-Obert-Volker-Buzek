/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.ThreePanelThingInspector.
sap.ui.define([ './library', 'sap/ui/ux3/library', 'sap/ui/ux3/ThingInspector', 'sap/ui/ux3/ThingInspectorRenderer', 'sap/suite/ui/commons/ThreePanelThingViewer' ],
	function(library, Ux3Library, ThingInspector, ThingInspectorRenderer, ThreePanelThingViewer) {
	"use strict";

	/**
	 * Constructor for a new ThreePanelThingInspector.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control extends the sap.ui.ux3.ThingInspector control. It displays the sap.suite.ui.commons.ThreePanelThingViewer control in the sap.ui.ux3.Overlay control.
	 * @extends sap.ui.ux3.ThingInspector
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. Object page should be used instead.
	 * @alias sap.suite.ui.commons.ThreePanelThingInspector
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ThreePanelThingInspector = ThingInspector.extend("sap.suite.ui.commons.ThreePanelThingInspector", /** @lends sap.suite.ui.commons.ThreePanelThingInspector.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * Shows or hides a middle panel of the ThingViewer named Header that contains general information.
				 */
				showHeader: {type: "boolean", group: "Misc", defaultValue: true},

				/**
				 * A URL of the source of the ThingViewer's key visual image.
				 */
				logo: {type: "sap.ui.core.URI", group: "Misc", defaultValue: null},

				/**
				 * The width of the ThingViewer's navigation panel.
				 */
				sidebarWidth: {type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: '224px'}
			},
			aggregations: {
				/**
				 * The items of the ThingViewer's Action Menu.
				 */
				menuContent: {type: "sap.ui.commons.Link", multiple: true, singularName: "menuContent"}
			}
		},
		renderer: ThingInspectorRenderer
	});

	ThreePanelThingInspector.prototype.init = function() {
		ThingInspector.prototype.init.apply(this);

		this._oThingViewer.destroy();
		this._oThingViewer = new ThreePanelThingViewer(this.getId() + "-thingViewer");
		this.setAggregation("thingViewer", this._oThingViewer);

		this._oThingViewer.attachFacetSelected(function(oEvent) {
			var oItem = oEvent.getParameters().item;

			if (this.fireFacetSelected({id: oItem.getId(), key: oItem.getKey(), item: oItem})) {
				this.setSelectedFacet(oItem);
			} else {
				oEvent.preventDefault();
			}
		}, this);
	};

	ThreePanelThingInspector.prototype.setShowHeader = function(showHeader) {
		this._oThingViewer.setShowHeader(showHeader);
		return this;
	};

	ThreePanelThingInspector.prototype.getShowHeader = function() {
		this._oThingViewer.getShowHeader();
	};

	ThreePanelThingInspector.prototype.setLogo = function(oUri) {
		this._oThingViewer.setLogo(oUri);
		return this;
	};

	ThreePanelThingInspector.prototype.getLogo = function() {
		this._oThingViewer.getLogo();
	};

	ThreePanelThingInspector.prototype.getSidebarWidth = function() {
		this._oThingViewer.getSidebarWidth();
	};

	ThreePanelThingInspector.prototype.setSidebarWidth = function(oWidth) {
		this._oThingViewer.setSidebarWidth(oWidth);
		return this;
	};

	ThreePanelThingInspector.prototype.addMenuContent = function(oContent) {
		this._oThingViewer.addMenuContent(oContent);
		return this;
	};

	ThreePanelThingInspector.prototype.insertMenuContent = function(oContent, iIndex) {
		this._oThingViewer.insertMenuContent(oContent, iIndex);
		return this;
	};

	ThreePanelThingInspector.prototype.getMenuContent = function() {
		return this._oThingViewer.getMenuContent();
	};

	ThreePanelThingInspector.prototype.removeMenuContent = function(oContent) {
		return this._oThingViewer.removeMenuContent(oContent);
	};

	ThreePanelThingInspector.prototype.removeAllMenuContent = function() {
		return this._oThingViewer.removeAllMenuContent();
	};

	ThreePanelThingInspector.prototype.indexOfMenuContent = function(oContent) {
		return this._oThingViewer.indexOfMenuContent(oContent);
	};

	ThreePanelThingInspector.prototype.destroyMenuContent = function() {
		this._oThingViewer.destroyMenuContent();
		return this;
	};

	return ThreePanelThingInspector;
});