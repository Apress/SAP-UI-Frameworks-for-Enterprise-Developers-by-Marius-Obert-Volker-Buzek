/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"./SvgBase",
	"sap/ui/core/ResizeHandler",
	"./GraphMapRenderer"
], function (jQuery, SvgBase, ResizeHandler, GraphMapRenderer) {
	"use strict";

	var NAVIGATORLINESIZE = 4;

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

	/**
	 * Constructor for a new GraphMap.
	 *
	 * @class
	 * A component which displays an overview of the entire graph and allows users to quickly navigate in the linked graph.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @since 1.50
	 * @alias sap.suite.ui.commons.networkgraph.GraphMap
	 */
	var GraphMap = SvgBase.extend("sap.suite.ui.commons.networkgraph.GraphMap", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * The height of the graph map.
				 */
				height: {
					type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: ""
				},
				/**
				 * The width of the graph map.
				 */
				width: {
					type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: ""
				},
				/**
				 * This property affects the threshold at which the renderer switches from link rendering to direct
				 * graph rendering. Rendering using xlink is much faster, but with larger graphs it may slow down the
				 * browser performance. Modify this property with care.
				 * Please also keep in mind that a graph map that is rendered directly does not adapt to changes until
				 * it's fully rerendered. Available only for <code>SVG</code> rendering type.
				 */
				directRenderNodeLimit: {
					type: "int", group: "Behavior", defaultValue: 250
				},
				/**
				 * Graph overview title
				 */
				title: {
					type: "string", group: "Misc", defaultValue: ""
				}
			},
			associations: {
				/**
				 * An association to a graph displayed by this component.
				 */
				graph: {type: "sap.suite.ui.commons.networkgraph.Graph", multiple: false, singularName: "graph"}
			},
			events: {
				/**
				 * This event is fired when the map is fully rendered.
				 */
				mapReady: {}
			}
		}
	});

	/* =========================================================== */
	/* Events & pseudo events */
	/* =========================================================== */
	GraphMap.prototype.init = function () {
		this._oResizeListener = null;
		this.setBusyIndicatorDelay(0);
	};

	GraphMap.prototype.onAfterRendering = function () {
		var oGraph = this.getGraph();

		if (oGraph && oGraph._bIsLayedOut) {
			this._renderMap();
		} else {
			this.setBusy(true);
		}
	};

	/* =========================================================== */
	/* Rendering */
	/* =========================================================== */
	GraphMap.prototype._renderMap = function () {
		var oGraph = this.getGraph();
		if (!oGraph) {
			return;
		}

		var sViewBox, iGraphWidth, iGraphHeight, sSvg, $svg, iRatio, iStrokeWidthRating,
			that = this,
			iZoomRatio = oGraph._fZoomLevel,
			bIsEmpty = oGraph.getNodes().length === 0,
			bUseNodeHtml = oGraph._isUseNodeHtml();

		var fnRenderItems = function (aItems) {
			var sRenderedHtml = "";
			aItems.forEach(function (oItem) {
				sRenderedHtml += oItem._render({
					mapRender: true,
					idSufix: that.getId()
				});
			});
			return sRenderedHtml;
		};

		var fnCreateHtmlNodes = function (aNodes, oWrapper) {
			var oRm = sap.ui.getCore().createRenderManager();

			aNodes.forEach(function (oNode) {
				oNode._render({
					mapRender: true,
					renderManager: oRm,
					idSufix: that.getId()
				});
			});

			oRm.flush(oWrapper);
			oRm.destroy();
		};

		var fnCreateHtmlGroups = function () {
			var oRm = sap.ui.getCore().createRenderManager();

			oGraph.getGroups().forEach(function (oGroup) {
				oGroup._render({
					mapRender: true,
					renderManager: oRm,
					idSufix: that.getId()
				});
			});

			oRm.flush(this.getDomRef("divgroups"));
			oRm.destroy();
		}.bind(this);

		var fnCreateMapNavigator = function (sClass) {
			sSvg += this._renderControl("rect", {
				x: NAVIGATORLINESIZE / 2,
				y: NAVIGATORLINESIZE / 2,
				width: Math.min((oGraph.$scroller.width() - NAVIGATORLINESIZE / 2) / iZoomRatio, (oGraph.$svg.width() - NAVIGATORLINESIZE / 2) / iZoomRatio),
				height: Math.min((oGraph.$scroller.height() - NAVIGATORLINESIZE / 2) / iZoomRatio, (oGraph.$svg.height() - NAVIGATORLINESIZE / 2) / iZoomRatio),
				"class": sClass,
				id: this._getDomId("mapNavigator")
			});
		}.bind(this);

		if (!oGraph._iWidth || !oGraph._iHeight || bIsEmpty) {
			if (oGraph._bIsInvalid || bIsEmpty) {
				this.setBusy(false);
				this.$().find(".sapSuiteUiCommonsNetworkGraphMapContent").html("");
				this.fireMapReady();
			}
			return;
		}

		sViewBox = oGraph.$("networkGraphSvg").attr("viewBox");
		if (!sViewBox) {
			sViewBox = "0 0 " + oGraph._iWidth + " " + oGraph._iHeight;
		}

		// items rendering + svg wrapper
		sSvg = "<svg class=\"sapSuiteUiCommonsNetworkGraphMapSvg\" width=\"100%\" height=\"100%\" aria-hidden=\"true\" viewBox=\"" + sViewBox + "\" " +
			"id=\"" + this._getDomId("svg") + "\"";

		if (oGraph._bIsRtl) {
			sSvg += " direction =\"rtl\"";
		}

		sSvg += " >";

		if (this._useGraphClone()) {
			sSvg += this._renderControl("use", {
				"xlink:href": "#" + oGraph._getDomId("svgbody")
			});
		} else {
			sSvg += fnRenderItems(oGraph.getLines());
			if (!bUseNodeHtml) {
				sSvg += fnRenderItems(oGraph.getNodes());
			}
		}

		// map boundary
		sSvg += this._renderControl("rect", {
			x: 0,
			y: 0,
			width: oGraph._iWidth,
			height: oGraph._iHeight,
			"class": "sapSuiteUiCommonsNetworkGraphMapBoundary",
			"pointer-events": "fill"
		});

		if (!bUseNodeHtml) {
			fnCreateMapNavigator("sapSuiteUiCommonsNetworkGraphMapNavigator");
		}
		sSvg += "</svg>";

		// groups
		sSvg += "<div id=\"" + this._getDomId("divgroups") + "\" class=\"sapSuiteUiCommonsNetworkGraphMapDivGroups";

		if (sap.ui.getCore().getConfiguration().getRTL()) {
			sSvg += " sapSuiteUiCommonsNetworkGraphMapDivGroupsLeft";
		}

		sSvg += "\"></div>";

		if (bUseNodeHtml) {
			sSvg += "<div id=\"" + this._getDomId("divnodes") + "\" class=\"sapSuiteUiCommonsNetworkGraphMapDivNodes";

			if (sap.ui.getCore().getConfiguration().getRTL()) {
				sSvg += " sapSuiteUiCommonsNetworkGraphMapDivGroupsLeft";
			}

			sSvg += "\">";
			sSvg += "</div>";

			sSvg += "<svg class=\"sapSuiteUiCommonsNetworkGraphSvgNavigator\" width=\"100%\" height=\"100%\" viewBox=\"" + sViewBox + "\">";
			fnCreateMapNavigator("sapSuiteUiCommonsNetworkGraphMapNavigator");
			sSvg += "</svg>";
		}

		this.$().find(".sapSuiteUiCommonsNetworkGraphMapContent").html(sSvg);

		fnCreateHtmlGroups();
		if (bUseNodeHtml) {
			var oDivNodes = this.getDomRef("divnodes");
			fnCreateHtmlNodes(oGraph.getNodes(), oDivNodes);
		}

		// set navigator and viewport rect stroke width to fit viewbox ratio
		$svg = this.$("svg");
		iGraphWidth = oGraph._iWidth;
		iGraphHeight = oGraph._iHeight;
		iRatio = Math.max(iGraphWidth / $svg.width(), iGraphHeight / $svg.height());

		this._setHtmlNodesPosition(iRatio);

		iStrokeWidthRating = Math.ceil(iRatio / 5);

		this._iStrokeWidth = iStrokeWidthRating;
		this._correctLineWidth();

		this.$("svg").find("circle").css("stroke-width", iStrokeWidthRating + "px");

		this._setupEvents();
		this._correctPosition();
		this.setBusy(false);
		this.fireMapReady();
	};

	GraphMap.prototype._setHtmlNodesPosition = function (iRatio) {
		var oGraph = this.getGraph(),
			$svg = this.$("svg"),
			iCalcRatio = 1 / iRatio,
			iTranslateX, iTranslateY;

		iTranslateX = Math.floor(($svg.width() / 2) - ((oGraph._iWidth / 2) * iCalcRatio));
		iTranslateY = Math.floor(($svg.height() / 2) - ((oGraph._iHeight / 2) * iCalcRatio));
		this.$("divgroups").css("transform", "matrix(" + iCalcRatio + ", 0, 0, " + iCalcRatio + ", " + iTranslateX + ", " + iTranslateY + ")");

		if (oGraph._isUseNodeHtml) {
			this.$("divnodes").css("transform", "matrix(" + iCalcRatio + ", 0, 0, " + iCalcRatio + ", " + iTranslateX + ", " + iTranslateY + ")");
		}
	};

	GraphMap.prototype._useGraphClone = function () {
		var iLimit = this.getDirectRenderNodeLimit(),
			oGraph = this.getGraph();

		if (oGraph) {
			return iLimit > oGraph.getNodes().length && !oGraph._isUseNodeHtml();
		}

		return false;
	};

	GraphMap.prototype._correctLineWidth = function (oGraph) {
		var oGraph = this.getGraph(),
			bCorrectWidth = this._isMSBrowser() || (!this._useGraphClone() || oGraph._preventZoomToChangeLineWidth());

		this.$("svg").css("stroke-width", bCorrectWidth ? this._iStrokeWidth + "px" : "1px");
	};

	/* =========================================================== */
	/* Private methods  */
	/* =========================================================== */
	GraphMap.prototype._correctMapNavigator = function () {
		var $mapNavigator = this.$("mapNavigator"),
			fWidth = parseFloat($mapNavigator.attr("width")),
			fHeight = parseFloat($mapNavigator.attr("height")),
			fX = parseFloat($mapNavigator.attr("x")),
			fY = parseFloat($mapNavigator.attr("y")),
			oGraph = this.getGraph(),
			iGraphWidth = oGraph._iWidth,
			iGraphHeight = oGraph._iHeight;

		// compare with max viewbox
		if (fWidth + fX > iGraphWidth) {
			$mapNavigator.attr("width", iGraphWidth - fX);
		}
		if (fHeight + fY > iGraphHeight) {
			$mapNavigator.attr("height", iGraphHeight - fY);
		}
	};

	GraphMap.prototype._resize = function () {
		var oGraph = this.getGraph(),
			$scroller = oGraph.$scroller,
			$mapNavigator = this.$("mapNavigator");

		$mapNavigator.attr("x", Math.max(NAVIGATORLINESIZE / 2, $scroller[0].scrollLeft / oGraph._fZoomLevel));
		$mapNavigator.attr("y", Math.max(NAVIGATORLINESIZE / 2, $scroller[0].scrollTop / oGraph._fZoomLevel));

		$mapNavigator.attr("width", $scroller.width() / oGraph._fZoomLevel);
		$mapNavigator.attr("height", $scroller.height() / oGraph._fZoomLevel);

		this._correctLineWidth();
		this._correctMapNavigator();
	};

	GraphMap.prototype._resizeHandler = function () {
		this._resize();

		var oGraph = this.getGraph();
		if (oGraph._isUseNodeHtml()) {
			var $svg = this.$("svg"),
				$screen = this.getGraph().$svg;

			if ($screen) {
				var iRatio = Math.max($screen.width() / $svg.width(), $screen.height() / $svg.height()) * (1 / oGraph._fZoomLevel);
				this._setHtmlNodesPosition(iRatio);
			}
		}
	};

	GraphMap.prototype._correctPosition = function () {
		var oGraph = this.getGraph(),
			$scroller = oGraph && oGraph.$scroller,
			$mapNavigator = this.$("mapNavigator");

		if (oGraph && $scroller[0]) {
			$mapNavigator.attr("x", Math.max(NAVIGATORLINESIZE / 2, $scroller[0].scrollLeft / oGraph._fZoomLevel));
			$mapNavigator.attr("y", Math.max(NAVIGATORLINESIZE / 2, $scroller[0].scrollTop / oGraph._fZoomLevel));

			this._correctMapNavigator();
		}
	};

	GraphMap.prototype._setupEvents = function () {
		var bDragging = false,
			oGraph = this.getGraph(),
			$svg = this.$("svg"),
			$scroller = oGraph.$scroller;

		var fnScrollScreen = function (oScrollData) {
			var $screen = oGraph.$svg,
				iRatio = Math.max($screen.width() / $svg.width(), $screen.height() / $svg.height()),
				$border = $svg.find(".sapSuiteUiCommonsNetworkGraphMapBoundary"),
				oScroller = $scroller[0],
				fRealStartX = $border.offset().left,
				fRealStartY = $border.offset().top;

			oScroller.scrollLeft = (oScrollData.pageX - fRealStartX) * iRatio - ($scroller.width() / 2);
			oScroller.scrollTop = (oScrollData.pageY - fRealStartY) * iRatio - ($scroller.height() / 2);
		};

		var fnEndDragging = function () {
			$svg.removeClass("sapSuiteUiCommonsNetworkGraphPanning");
			bDragging = false;
		};

		$scroller.on("scroll", function () {
			this._correctPosition();
		}.bind(this));

		$svg.off();
		$svg.on("mousedown", function (oEvent) {
			bDragging = true;
			fnScrollScreen(oEvent);
			oEvent.preventDefault();
		});

		$svg.on("mousemove", function (oEvent) {
			if (bDragging) {
				if (!$svg.hasClass("sapSuiteUiCommonsNetworkGraphPanning")) {
					$svg.addClass("sapSuiteUiCommonsNetworkGraphPanning");
				}

				fnScrollScreen(oEvent);
			}
		});

		$svg.on("mouseleave", function (oEvent) {
			fnEndDragging();
		});

		$svg.on("mouseup", function (oEvent) {
			fnEndDragging();
		});
	};

	GraphMap.prototype._onBeforeDataProcess = function () {
		if (this.getDomRef("svg")) {
			this.$("svg").html("");
			this.setBusy(true);
		}
	};

	GraphMap.prototype._onGraphReady = function () {
		if (this.getVisible()) {
			setTimeout(this._renderMap.bind(this), 0);

			if (this._oResizeListener) {
				ResizeHandler.deregister(this._oResizeListener);
			}
			this._oResizeListener = ResizeHandler.register(this.getGraph().$("wrapper")[0], jQuery.proxy(this._resizeHandler, this));
		}
	};

	GraphMap.prototype._removeListeners = function () {
		var oGraph = this.getGraph();
		if (oGraph) {
			oGraph.detachBeforeLayouting(this._onBeforeDataProcess, this);
			oGraph.detachGraphReady(this._onGraphReady, this);
			oGraph.detachZoomChanged(this._resize, this);
		}
	};

	GraphMap.prototype.destroy = function () {
		this._removeListeners();
		SvgBase.prototype.destroy.apply(this, arguments);
	};

	GraphMap.prototype.exit = function () {
		if (this._oResizeListener) {
			ResizeHandler.deregister(this._oResizeListener);
			this._oResizeListener = null;
		}
	};

	/* =========================================================== */
	/* Getters & Setters */
	/* =========================================================== */
	GraphMap.prototype.getTitle = function () {
		var sTitle = this.getProperty("title");
		return sTitle ? sTitle : oResourceBundle.getText("NETWORK_GRAPH_MAP_TITLE");
	};

	GraphMap.prototype.getGraph = function () {
		var sId = this.getAssociation("graph");
		return sId ? sap.ui.getCore().byId(sId) : null || null;
	};

	GraphMap.prototype.setGraph = function (oGraph) {
		this._removeListeners();
		this.setAssociation("graph", oGraph);

		var oGraphInstance = this.getGraph();

		if (oGraphInstance) {
			oGraphInstance.attachBeforeLayouting(this._onBeforeDataProcess, this);
			oGraphInstance.attachGraphReady(this._onGraphReady, this);
			oGraphInstance.attachZoomChanged(this._resize, this);
			if (oGraphInstance._isLayedOut()) {
				this._onGraphReady();
			}
		}

		return this;
	};

	return GraphMap;
});
