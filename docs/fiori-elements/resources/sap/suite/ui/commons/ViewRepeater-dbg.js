/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.ViewRepeater.
sap.ui.define([ "sap/ui/thirdparty/jquery", './library', 'sap/ui/commons/library', 'sap/ui/commons/RowRepeater', 'sap/ui/commons/SegmentedButton', 'sap/ui/commons/SearchField', 'sap/ui/commons/Button',
				'sap/ui/base/ManagedObject', 'sap/ui/core/ResizeHandler', "./ViewRepeaterRenderer" ],
	function(jQuery, library, CommonsLibrary, RowRepeater, SegmentedButton, SearchField, Button, ManagedObject, ResizeHandler, ViewRepeaterRenderer) {
	"use strict";

	/**
	 * Constructor for a new ViewRepeater.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control extends the sap.ui.commons.RowRepeater control providing an ability to change data representation by switching between a number of views. The data can be displayed not only in rows but also in tiles that are adjusted to fill the entire horizontal space in a row.
	 * @extends sap.ui.commons.RowRepeater
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. Standard Fiori technology should be used.
	 * @alias sap.suite.ui.commons.ViewRepeater
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ViewRepeater = RowRepeater.extend("sap.suite.ui.commons.ViewRepeater", /** @lends sap.suite.ui.commons.ViewRepeater.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * The minimal width of the tile for the current view. Only applicable if "responsive" property is set to true.
				 */
				itemMinWidth: {type: "int", group: "Misc", defaultValue: null},

				/**
				 * This parameter indicates whether the content is shown in rows or tiles. If false, the content is shown in rows just like in core sap.ui.commons.RowRepeater. If true, the content is shown in tiles (similar to sap.ui.ux3.DataSet control) that have minimal width defined by the "itemMinWidth" property. The number of columns depends on the parent control's width. If you resize the control, the number of columns may change respectively so that the content tiles can fill the entire space of a row.
				 */
				responsive: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * The index of the default view starting from 0. The view is selected on the initial rendering of the control. If the index is greater than the total quantity of the views, the last view is selected.
				 */
				defaultViewIndex: {type: "int", group: "Misc", defaultValue: 0},

				/**
				 * Indicates if the search field panel is shown.
				 */
				showSearchField: {type: "boolean", group: "Misc", defaultValue: true},

				/**
				 * Indicates if the view selector panel is shown.
				 */
				showViews: {type: "boolean", group: "Misc", defaultValue: true},

				/**
				 * Indicates if the external representation of the current view is rendered.
				 */
				external: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * The height of the tile in the current view in pixels. Only applicable if the responsive property is set to true. This value is used for calculating the number of tile rows.
				 */
				itemHeight: {type: "int", group: "Misc", defaultValue: null},

				/**
				 * The height of the control. Only applicable if the responsive property is set to true.
				 */
				height: {type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: '100%'}
			},
			aggregations: {
				/**
				 * The list of views for the data representation.
				 */
				views: {
					type: "sap.suite.ui.commons.RepeaterViewConfiguration",
					multiple: true,
					singularName: "view"
				}
			},
			associations: {
				/**
				 * The control to be rendered instead of the repeater's own content.
				 */
				externalRepresentation: {type: "sap.ui.core.Control", multiple: false}
			},
			events: {
				/**
				 * This event is fired when the user performs a search.
				 */
				search: {
					parameters: {

						/**
						 * The search query.
						 */
						query: {type: "string"}
					}
				},

				/**
				 * This event is fired when a user switches between views.
				 */
				changeView: {
					parameters: {

						/**
						 * Contains an index of the previous view in the Views aggregation.
						 */
						oldViewIndex: {type: "int"},

						/**
						 * Contains an index of the new view in the Views aggregation.
						 */
						newViewIndex: {type: "int"},

						/**
						 * Contains an ID of the filter in the Filters aggregation.
						 */
						filterId: {type: "string"},

						/**
						 * Contains an ID of the sorter in the Sorters aggregation.
						 */
						sorterId: {type: "string"},

						/**
						 * Contains a page number.
						 */
						page: {type: "int"}
					}
				}
			}
		}
	});

	ViewRepeater.prototype.init = function() {
		this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
		this.addStyleClass("suiteUiVr");
		RowRepeater.prototype.init.call(this);
		this._oSegBtn = new SegmentedButton({
			id: this.getId() + "-segBtn"
		});
		this._repopulateViewSelector();
		this._oSearchField = new SearchField({
			id: this.getId() + "-searchFld",
			enableFilterMode: true,
			enableListSuggest: false,
			search: function(oEvent) {
				this.fireSearch({query: oEvent.getParameter("query")});
			}.bind(this)
		});
		this.attachFilter(function(oEvent) {
			this._currentFilterId = oEvent.getParameter("filterId");
		});
		this.attachSort(function(oEvent) {
			this._currentSorterId = oEvent.getParameter("sorterId");
		});
	};

	ViewRepeater.prototype.setDefaultViewIndex = function(value) {
		this.setProperty("defaultViewIndex", value);
		this._selectDefaultView();
		return this;
	};

	ViewRepeater.prototype._selectDefaultView = function() {
		var iView = this.getDefaultViewIndex();
		if (iView === this._currentViewIndex) {
			return;
		}
		var aViews = this.getViews() || [];
		if (aViews.length > 0) {
			if (iView >= aViews.length) {
				iView = aViews.length - 1;
			}
			this.selectView(iView);
			var sDefViewBtnId = this.getId() + "-" + aViews[iView].getId() + "-triggerBtn";
			this._oSegBtn.setSelectedButton(sDefViewBtnId);
		}
	};

	ViewRepeater.prototype._repopulateViewSelector = function() {
		var that = this; //eslint-disable-line
		var result = that._oSegBtn.removeAllAggregation("buttons", true);
		jQuery.each(result, function(i, oButton) {
			oButton.destroy();
		});

		var aViews = this.getViews() || [];
		for (var i = 0; i < aViews.length; i++) {
			var oView = aViews[i];

			if (oView.getExternal()) {
				var oExtRepr = oView.getExternalRepresentation();
				if (!oExtRepr.getModel()) {
					oExtRepr.setModel(this.getModel());
				}
			}
			var oViewButton = new Button({
				id: this.getId() + "-" + oView.getId() + "-triggerBtn",
				text: oView.getTitle() || ( oView.getIcon() ? undefined : this._rb.getText("VIEWREPEATER_TAB_DEFAULT_NAME", [(i + 1)]) ),
				icon: oView.getIcon(),
				iconHovered: oView.getIconHovered(),
				iconSelected: oView.getIconSelected(),
				tooltip: oView.getTooltip(),
				lite: true
			});
			that._oSegBtn.addButton(oViewButton);
			oViewButton.attachPress(oView, function(ev, oViewData) { //eslint-disable-line
				that.selectView(oViewData);
				that._oSegBtn.rerender();
			});
		}
		this._selectDefaultView();
	};

	ViewRepeater.prototype.setModel = function(oModel, sName) {
		ManagedObject.prototype.setModel.call(this, oModel, sName);
		this._repopulateViewSelector();
		return this;
	};

	ViewRepeater.prototype.addView = function(oRowRepeaterView) {
		this.addAggregation("views", oRowRepeaterView);
		this._repopulateViewSelector();
		return this;
	};

	ViewRepeater.prototype.removeAllViews = function() {
		var result = this.removeAllAggregation("views");
		this._repopulateViewSelector();
		return result;
	};

	ViewRepeater.prototype.insertView = function(oView, iIndex) {
		this.insertAggregation("views", oView, iIndex);
		this._repopulateViewSelector();
		return this;
	};

	ViewRepeater.prototype.removeView = function(oView) {
		var result = this.removeAggregation("views", oView);
		this._repopulateViewSelector();
		return result;
	};

	//the method switch view to selected one
	// vView can be the instance of RowRepeaterView or its index in the views aggregation
	ViewRepeater.prototype.selectView = function(vView) {
		var oView, iViewIndex = 0;
		switch (typeof vView) {
			case "number": {
				oView = this.getViews()[vView];
				iViewIndex = vView;
				break;
			}
			case "object": {
				var iViewsNumber = this.getViews().length;

				for (var i = 0; i < iViewsNumber; i++) {
					if (vView.getId() === this.getViews()[i].getId()) {
						oView = vView;
						iViewIndex = i;
						break;
					}
				}
			}
			default:
				break;
		}
		if (!oView) {
			return;
		}
		var bResponsive = oView.getResponsive();
		if (typeof bResponsive === "boolean") {
			this.setResponsive(bResponsive);
		}
		var iItemMinWidth = oView.getItemMinWidth();
		if (typeof iItemMinWidth === "number" &&
			iItemMinWidth > 0 &&
			iItemMinWidth !== this.setItemMinWidth()) {
			this.setItemMinWidth(iItemMinWidth);
		}
		var iItemHeight = oView.getItemHeight();
		if (iItemHeight !== this.getItemHeight() && iItemHeight > 0) {
			this.setItemHeight(iItemHeight);
		}
		if (oView.getNumberOfTiles() > 0 &&
			oView.getNumberOfTiles() !== this.setNumberOfRows()) {
			this.setNumberOfRows(oView.getNumberOfTiles());

		}

		var bExternal = oView.getExternal();
		if (bExternal === true) {
			this.setExternal(true);
			this.setExternalRepresentation(oView.getExternalRepresentation());
		} else {
			this.setExternal(false);
			this.setExternalRepresentation(null);
		}

		var iCurrentPage = this.getCurrentPage();
		var sPath = oView.getPath();
		var oTemplate = oView.getTemplate();
		if (sPath && oTemplate) {
			this.bindRows(sPath, oTemplate);
			this._applyFilter(this._currentFilterId);
			this._applySorter(this._currentSorterId);
		}
		if (this._currentViewIndex || iViewIndex !== this._currentViewIndex) {
			this.fireChangeView({
				newViewIndex: iViewIndex,
				oldViewIndex: this._currentViewIndex,
				filterId: this._currentFilterId,
				sorterId: this._currentSorterId,
				page: iCurrentPage
			});
		}
		this._currentViewIndex = iViewIndex;
		this._oView = oView;
	};

	ViewRepeater.prototype._applyFilter = function(sFilterId, oListBinding) {
		if (sFilterId) {
			if (!oListBinding) {
				oListBinding = this.getBinding("rows");
			}
			var aFilters = this.getFilters();
			var oFilter;
			var i = aFilters.length;
			for (var n = 0; n < i; n++) {
				if (aFilters[n].getId() === sFilterId) {
					oFilter = aFilters[n];
					break;
				}
			}
			if (oFilter) {
				oListBinding.filter(oFilter.getFilters());
			}
		}
	};

	ViewRepeater.prototype._applySorter = function(sSorterId, oListBinding) {
		if (sSorterId) {
			if (!oListBinding) {
				oListBinding = this.getBinding("rows");
			}
			var oSorter;
			var aSorters = this.getSorters();
			var i = aSorters.length;
			for (var n = 0; n < i; n++) {
				if (aSorters[n].getId() === sSorterId) {
					oSorter = aSorters[n];
					break;
				}
			}
			if (oSorter) {
				oListBinding.sort(oSorter.getSorter());
			}
		}
	};

	ViewRepeater.prototype.onBeforeRendering = function() {
		if (this.getResponsive() && this.getShowMoreSteps() === 0) {
			if (!this._bInit) {
				this.setNumberOfRows(0);
			}
		} else if (this._oView && this._oView.getNumberOfTiles() > 0 &&
			this._oView.getNumberOfTiles() !== this.getNumberOfRows() && !this.getResponsive()) {
			this.setNumberOfRows(this._oView.getNumberOfTiles());
		}
		this._bInit = false;
	};

	ViewRepeater.prototype._updateBodyPosition = function() {
		var iViewSwHeight = jQuery("#" + this.getId() + ">div.suiteUiVrViewSwHolder").outerHeight();
		var iPtbHeight = jQuery("#" + this.getId() + ">div.sapUiRrPtb").outerHeight();
		var iStbHeight = jQuery("#" + this.getId() + ">div.sapUiRrStb").outerHeight();
		var iFtrHeight = jQuery("#" + this.getId() + ">div.sapUiRrFtr").outerHeight();
		var oBody = jQuery(document.getElementById(this.getId() + "-body"));
		oBody.css("top", iViewSwHeight + iPtbHeight + iStbHeight + 3 + "px");
		oBody.css("bottom", iFtrHeight + "px");
	};

	ViewRepeater.prototype.onAfterRendering = function() {
		this._computeWidths(true);
		ResizeHandler.deregister(this._sResizeListenerId);
		if (this.getResponsive()) {
			if (this.getShowMoreSteps() === 0) {
				jQuery("#" + this.getId() + ">div.sapUiRrFtr").hide();
			}
			setTimeout(function() {
				this._sResizeListenerId = ResizeHandler.register(this.getId() + "-body" ? window.document.getElementById(this.getId() + "-body") : null, jQuery.proxy(this._handleResize, this));
				if (this.getShowMoreSteps() === 0) {
					this._updateBodyPosition();
				}
			}.bind(this), 100);
		}
	};

	ViewRepeater.prototype._handleResize = function() {
		if (!this.getDomRef()) {
			return;
		}
		this._computeWidths();
		if (this.getResponsive() && this.getShowMoreSteps() === 0) {
			var oBody = jQuery(document.getElementById(this.getId() + "-body"));
			var iBodyHeight = oBody.height();
			var iNumberOfTilesInRow = this._itemsPerRow;
			//+3px for the spaces between tiles
			var iNumberOfRows = Math.floor(iBodyHeight / (this.getItemHeight() + 3));
			var iNumberOfTiles = iNumberOfRows * iNumberOfTilesInRow;
			if (iNumberOfTiles !== this.getNumberOfRows()) {
				this._bInit = true;
				this.setNumberOfRows(iNumberOfTiles);
			} else {
				jQuery("#" + this.getId() + ">div.sapUiRrFtr").show();
			}
		}
	};

	ViewRepeater.prototype._computeWidths = function(bInitial) {
		var oThis = this;       //eslint-disable-line
		var $This = this.$();   // DOM object
		var iItemMinWidth = oThis.getItemMinWidth();
		var iNumberOfCols = (this.getResponsive() === true) ? Math.floor($This.width() / iItemMinWidth) : 1;
		var iPercentWidth = Math.floor(100 / iNumberOfCols);

		// since one percent includes several pixels
		// rounding error may cause an overflow above the actual width of control
		if ($This.width() * iPercentWidth / 100 < iItemMinWidth) {
			iNumberOfCols--;
			iPercentWidth = Math.floor(100 / iNumberOfCols);
		}

		if (bInitial || oThis._height !== $This.height() || oThis._itemsPerRow !== iNumberOfCols) {
			jQuery("#" + this.getId() + " .sapUiRrBody").css("width", "100%");
			var iOrphanedPercents = 100 - (iNumberOfCols * iPercentWidth);
			var w;
			jQuery("#" + this.getId() + " .sapUiRrBody li").each(function(index) {
				//distribute orphaned percents along the row
				w = iPercentWidth;
				if (index % iNumberOfCols < iOrphanedPercents) {
					w++;
				}
				jQuery(this).css("width", w + "%");
				jQuery(this).css("margin", "0");
			});
			oThis._height = $This.height();
			oThis._itemsPerRow = iNumberOfCols;
			oThis._percentWidth = iPercentWidth;
		}
	};

	ViewRepeater.prototype.startPagingAnimation = function() {
		ResizeHandler.deregister(this._sResizeListenerId);
		// local variables
		var oCore = sap.ui.getCore(),
			oRenderManager = oCore.getRenderManager(),
			sId = this.getId(),
			iPageFrom = this.iPreviousPage,
			iPageTo = this.getCurrentPage(),
			iNumberOfRows = this.getNumberOfRows(),
			iStartIndex = (iPageTo - 1) * iNumberOfRows,
			aRows = this.getRows(),
			iCurrentVisibleRows = this._getRowCount() > iNumberOfRows * iPageTo ? iNumberOfRows : this._getRowCount() - iNumberOfRows * (iPageTo - 1),
			n, i, w,
			oBinding = this.getBinding("rows");

		// DOM elements
		var oDomCurrentLI,
			oJQDomULFrom = jQuery(sId + "-page_" + iPageFrom ? window.document.getElementById(sId + "-page_" + iPageFrom) : null),
			oDomBodyDIV = sId + "-body" ? window.document.getElementById(sId + "-body") : null,
			oJQDomBodyDIV = jQuery(oDomBodyDIV);

		// fix the height on the body DIV to allow an animated height change
		oJQDomBodyDIV.css("height", oJQDomBodyDIV.outerHeight() + "px");

		// create UL for new page
		var sDirection;
		if (sap.ui.getCore() && sap.ui.getCore().getConfiguration() && sap.ui.getCore().getConfiguration().getRTL()) {
			sDirection = (iPageTo < iPageFrom) ? "left" : "right";
		} else {
			sDirection = (iPageTo < iPageFrom) ? "right" : "left";
		}

		// load the required contexts
		if (oBinding) {
			// update the rows aggregation
			this._bSecondPage = !this._bSecondPage;
			this.updateRows(true);
			aRows = this.getRows();
			iStartIndex = (this._bSecondPage ? 1 : 0) * iNumberOfRows;
		}

		// create the rows where we navigate to in the DOM
		jQuery("<ul id=\"" + sId + "-page_" + iPageTo + "\" class=\"sapUiRrPage\"></ul>").css("top", oJQDomULFrom.outerHeight(true) + "px").css(sDirection, oJQDomULFrom.outerWidth(true) + "px").appendTo(oDomBodyDIV);
		var oDomULTo = oDomBodyDIV.lastChild;
		var oJQDomULTo = jQuery(oDomULTo);
		var iOrphanedPercents = 100 - (this._itemsPerRow * this._percentWidth);
		for (n = iStartIndex, i = 0; n < iStartIndex + iCurrentVisibleRows; n++, i++) {
			//distribute orphaned percents along the row
			w = this._percentWidth;
			if (i % this._itemsPerRow < iOrphanedPercents) {
				w++;
			}
			jQuery("<li id=\"" + sId + "-row_" + n + "\" class=\"sapUiRrRow\"></li>").css("width", w + "%").appendTo(oDomULTo);
			oDomCurrentLI = oDomULTo.lastChild;
			oRenderManager.render(aRows[n], oDomCurrentLI);
		}

		// animate the paging effect
		if (sDirection === "right") {
			oJQDomULFrom.animate({right: -oJQDomULFrom.outerWidth(true)}, "slow");
			oJQDomULTo.animate({right: 0}, "slow");
		} else {
			oJQDomULFrom.animate({left: -oJQDomULFrom.outerWidth(true)}, "slow");
			oJQDomULTo.animate({left: 0}, "slow");
		}

		// animate the height change if number of displayed rows changes
		oJQDomBodyDIV.animate({height: oJQDomULTo.outerHeight(true)}, "slow", jQuery.proxy(this.endPagingAnimation, this));
	};

	ViewRepeater.prototype.endPagingAnimation = function() {
		RowRepeater.prototype.endPagingAnimation.call(this);
		this._sResizeListenerId = ResizeHandler.register(this.getId() + "-body" ? window.document.getElementById(this.getId() + "-body") : null, jQuery.proxy(this._handleResize, this));
	};

	ViewRepeater.prototype.exit = function() {
		this._oSegBtn.destroy();
		this._oSearchField.destroy();
		ResizeHandler.deregister(this._sResizeListenerId);
	};

	return ViewRepeater;
});