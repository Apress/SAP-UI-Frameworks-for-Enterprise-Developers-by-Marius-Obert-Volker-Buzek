/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/suite/ui/commons/library",
	"./ElementBase",
	"./ElementAttribute",
	"sap/ui/core/IconPool",
	"sap/ui/Device",
	"sap/base/security/encodeXML",
	"sap/base/security/sanitizeHTML",
	"sap/m/CheckBox",
	"sap/m/Text",
	"./NodeRenderer"
], function(jQuery, library, ElementBase, ElementAttribute, IconPool, Device, encodeXML, sanitizeHTML, CheckBox, Text, NodeRenderer) {
	"use strict";

	var Shape = library.networkgraph.NodeShape,
		ActionButtonPosition = library.networkgraph.ActionButtonPosition,
		HeaderCheckboxState = library.networkgraph.HeaderCheckboxState;

	var HEADER_SIZE = 32,
		TITLE_OFFSET = 5,
		MIN_WIDTH = 160,
		MAX_ACTION_BUTTONS = 4;

	var Size = {
		Circle: {
			WIDTH: 96,
			HEIGHT: 64
		},
		Box: {
			WIDTH: 160,
			HEIGHT: 32
		},
		Attributes: {
			LINE: 16,
			OFFSET: 8
		},
		ActionButtons: {
			RADIUS: 13,
			MARGIN: 8,
			OFFSET: 4
		},
		Title: {
			LINESIZE: 15,
			OFFSET: 8,
			ICON_SIZE: 16,
			INFO_BOX_SIZE: 20,
			ICON_X_OFFSET: 6,
			IMAGE_OFFSET_Y: 6
		},
		Description: {
			LINESIZE: 15
		},
		Image: {
			Box: 16,
			Circle: 32
		}
	};

	var ExpandState = {
		EXPANDED: "Expanded",
		COLLAPSED: "Collapsed",
		PARTIAL: "Partial"
	};

	var ActionIcons = {
		EXPAND: "sys-add",
		COLLAPSE: "sys-minus",
		PARTIAL: "overlay"
	};

	var sIconAdd = IconPool.getIconInfo(ActionIcons.EXPAND),
		sIconMinus = IconPool.getIconInfo(ActionIcons.COLLAPSE),
		sIconOverlay = IconPool.getIconInfo(ActionIcons.PARTIAL);

	sIconAdd = sIconAdd && sIconAdd.content;
	sIconMinus = sIconMinus && sIconMinus.content;
	sIconOverlay = sIconOverlay && sIconOverlay.content;

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

	/**
	 * Constructor for a new Node.
	 *
	 * @class
	 * Holds information about one node. When changing the size of the node after the graph is rendered, you have to manually
	 * invalidate the graph, which causes the layout algorithm to be applied again.
	 *
	 * @extends sap.suite.ui.commons.networkgraph.ElementBase
	 *
	 * @constructor
	 * @public
	 * @since 1.50
	 * @alias sap.suite.ui.commons.networkgraph.Node
	 */
	var Node = ElementBase.extend("sap.suite.ui.commons.networkgraph.Node", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * Defines if the Header checkbox should be displayed and whether it should be selected or not. By default, the checkbox is hidden. Available only for box nodes.
				 */
				headerCheckBoxState: {
					type: "sap.suite.ui.commons.networkgraph.HeaderCheckboxState",
					group: "Misc",
					defaultValue: HeaderCheckboxState.Hidden
				},
				/**
				 * Defines if the subtree of this node is collapsed. By default, it is expanded.
				 */
				collapsed: {
					type: "boolean", group: "Misc", defaultValue: false
				},
				/**
				 * Shows if the node is selected. Once the node is selected, its appearance changes slightly
				 * to distinguish it from other nodes.
				 */
				selected: {
					type: "boolean", group: "Misc", defaultValue: false
				},
				/**
				 * Key of the group where this node is included.
				 */
				group: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Key of the node. This key is used throughout the DOM to reference this node,
				 * mainly in the connector line (Line) elements of the graph.
				 */
				key: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Shape of the node. The shape is round by default. To create a rectangular node, set this property to Box.
				 */
				shape: {
					type: "sap.suite.ui.commons.networkgraph.NodeShape", groups: "Behavior", defaultValue: Shape.Circle
				},
				/**
				 * An icon associated with the element.
				 */
				icon: {
					type: "string", group: "Appearance", defaultValue: null
				},
				/**
				 * An additional status icon displayed when the node is collapsed.
				 */
				statusIcon: {
					type: "string", group: "Appearance", defaultValue: null
				},
				/**
				 * Width of the node. If the width is not defined, the node expands, so it can fit the content.
				 */
				width: {
					type: "int", group: "Misc", defaultValue: undefined
				},
				/**
				 * Height of the node. In circular nodes, it determines the circle diameter.
				 */
				height: {
					type: "int", group: "Misc", defaultValue: undefined
				},
				/**
				 * Maximum width allowed. The auto grow algorithm stops increasing the width at this value.
				 */
				maxWidth: {
					type: "int", group: "Misc", defaultValue: undefined
				},
				/**
				 * The x coordinate of the node. This value must be set after the layout algorithm has finished
				 * arranging the graph. It may come from the input data but is not required for most
				 * layout algorithms. <br>Works only for <code>CustomLayout</code> or <code>NoopLayout</code> layout algorithms. Other layout algorithms override this property. However, you can
				 * still change it using an <code>afterLayouting</code> event.
				 */
				x: {
					type: "float", group: "Misc", defaultValue: 0
				},
				/**
				 * The y coordinate of the node. This value must be set after the layout algorithm has finished
				 * arranging the graph. It may come from the input data but is not required for most layout
				 * algorithms. <br>Works only for <code>CustomLayout</code> or <code>NoopLayout</code> layout algorithms. Other layout algorithms override this property. However, you can
				 * still change it using an <code>afterLayouting</code> event.
				 */
				y: {
					type: "float", group: "Misc", defaultValue: 0
				},
				/**
				 * Determines if the expand button is visible.
				 */
				showExpandButton: {
					type: "boolean", defaultValue: true
				},
				/**
				 * Determines if the links button is visible.
				 */
				showActionLinksButton: {
					type: "boolean", defaultValue: true
				},
				/**
				 * Determines if the details button is visible.
				 */
				showDetailButton: {
					type: "boolean", defaultValue: true
				},
				/**
				 * Determines the maximum number of lines allowed for the node's label. If set to 0, the label may
				 * have an unlimited number of lines.
				 */
				titleLineSize: {
					type: "int", defaultValue: 1
				},
				/**
				 * Determines the maximum number of lines allowed to be displayed in the node's description.
				 * If you want to hide the description, set this property to <code>-1</code> (default). To
				 * display an unlimited number of lines, set this property to <code>0</code>.
				 * This property does not affect the description that appears in the tooltip, which is always
				 * fully rendered.
				 */
				descriptionLineSize: {
					type: "int", defaultValue: -1
				},
				/**
				 * Determines the size of the node's icon. This property can be applied only to circular nodes.
				 */
				iconSize: {
					type: "int", group: "Appearance", defaultValue: undefined
				},
				/**
				 * Determines the size of a custom node, which can be useful for nodes that have text or other
				 * content outside of its shape.<br>This property is available for custom nodes only.
				 */
				coreNodeSize: {
					type: "int", group: "Appearance", defaultValue: 0
				},
				/**
				 * Whether the control should be visible on the screen. Node is still used for layouter.
				 */
				visible: {
					type: "boolean", group: "Appearance", defaultValue: true
				},
				/**
				 * In the absence of a title, alternate texts can be used to identify the nodes.
				 * @since 1.112
				 */
				altText: {
					type: "string", group: "Appearance", defaultValue: null
				}
			},
			aggregations: {
				/**
				 * A list of links to be shown in the links area. A link may point to any UI5 control. It's up to the
				 * caller to set up all necessary callback functions.
				 */
				actionLinks: {
					type: "sap.ui.core.Control", multiple: true, singularName: "actionLink"
				},
				/**
				 * A list of custom action buttons. These buttons are displayed in the button area for each node.
				 * A node may have up to 4 buttons. The default 3 buttons (collapse/expand, details, and links)
				 * have priority over any other custom buttons that you add.
				 * If you want all 4 of your custom buttons to be displayed, set the visibility of the default buttons
				 * to false.
				 */
				actionButtons: {
					type: "sap.suite.ui.commons.networkgraph.ActionButton", multiple: true, singularName: "actionButton"
				},
				/**
				 * The image that is displayed in the node's header instead of the icon.
				 */
				image: {
					type: "sap.suite.ui.commons.networkgraph.NodeImage", multiple: false, singularName: "nodeImage"
				},
				/**
				 * Custom content rendered with the node. Available only for rectangular nodes with HTML rendering type.
				 * When this aggregation is used, the description and attributes of {@link sap.suite.ui.commons.networkgraph.ElementBase} are ignored.
				 */
				content: {
					type: "sap.ui.core.Control", multiple: false
				},
				/**
				 * Internal aggregation for the Header checkbox.
				 */
				_checkBox: {
					type: "sap.m.CheckBox", multiple: false, visibility: "hidden"
				}
			},
			events: {
				/**
				 * This event is fired when the user selects or clears the Header checkbox.
				 */
				headerCheckBoxPress: {
					parameters: {
						/**
						 * Indicates whether checkbox is selected.
						 */
						checked: "boolean"
					}
				},
				/**
				 * This event is fired when the user clicks or taps the node.
				 */
				press: {},
				/**
				 * This event is fired when the user moves the mouse pointer over the node.
				 */
				hover: {},
				/**
				 * This event is fired when the user clicks the node's collapse/expand button.
				 */
				collapseExpand: {}
			}
		},
		onAfterRendering: function() {
			this._afterRenderingBase();
		}
	});

	// sum of properties that if changed requires data reprocessing
	Node.prototype.aProcessRequiredProperties = ["key", "group"];

	/* =========================================================== */
	/* Events & pseudo events */
	/* =========================================================== */
	Node.prototype.init = function(mOptions) {
		this._bThemeApplied = true;
		if (!sap.ui.getCore().isInitialized()) {
			this._bThemeApplied = false;
			sap.ui.getCore().attachInit(this._handleCoreInitialized.bind(this));
		} else {
			this._handleCoreInitialized();
		}
		this._oExpandState = ExpandState.EXPANDED;
		// contains object of the group this node belongs to (if any)
		this._oGroup = null;
		// calculated (or set) width of node
		this._iWidth = 0;
		// calculated (or set) height of node
		this._iHeight = 0;
		// width of area for labels in box attributes area (used for maxWidth calculation)
		this._iLabelAttrWidth = 0;
		// width of area for values in box attributes area (used for maxWidth calculation)
		this._iValueAttrWidth = 0;
		// title words split into lines based by node width
		this._aTitleLines = [[]];
		// description words split into lines based by node width
		this._aDescriptionLines = [[]];
		// indicates whether this node is visible (!== collapsed !!!). If true this node was collapsed by some other node
		this._bIsHidden = false;
		// Flag for remembering action buttons were rendered (as they are rendered only once, and then their visibility
		// is via CSS of selection class
		this._bActionButtonsRendered = false;
		// size of circle diameter
		this._iCircleSize = 0;
		// if the node has a group this index represents its order among all groups sorted by key
		this._iGroupIndex = -1;

		this._clearChildren();
	};

	/**
	 * Handler for the core's init event. In order for the control to be rendered only if all themes are loaded
	 * and everything is properly initialized, we attach a theme check in here.
	 *
	 * @private
	 */
	Node.prototype._handleCoreInitialized = function() {
		this._bThemeApplied = sap.ui.getCore().isThemeApplied();
		// handleThemeApplied has to be called on every theme change as label colors are dependant on current theme and calculated in the renderer
		sap.ui.getCore().attachThemeChanged(this._handleThemeApplied, this);

	};

	/**
	 * The NetworkGraph is not being rendered until the theme was applied.
	 * If the theme is applied, rendering starts by the control itself.
	 *
	 * @private
	 */
	 Node.prototype._handleThemeApplied = function() {
		this._bThemeApplied = true;
		this.invalidate();
	};

	// not and event, placed here to have all private stuff in one place
	Node.prototype._clearChildren = function() {
		// node with connection this node => other node
		this.aChildren = [];
		// node with connection other node => this node
		this.aParents = [];
		// lines with connection this node => other node
		this.aLines = [];
		// line with connection other node => this node
		this.aParentLines = [];
	};

	Node.prototype._afterRendering = function() {
		var $this = this.$();
		if (this._isInCollapsedGroup()) {
			return;
		}

		this._correctTitle("sapSuiteUiCommonsNetworkNodeTitle");
		this._setupEvents();

		if (this._bIsHidden) {
			$this.hide();
		}

		if (!this.getVisible() || (this._oGroup && !this._oGroup.getVisible())) {
			$this.hide();
		}

		if (this._oExpandState === ExpandState.COLLAPSED) {
			$this.addClass("sapSuiteUiCommonsNetworkNodeCollapsed");
		}

		if (this._oExpandState === ExpandState.PARTIAL) {
			$this.addClass("sapSuiteUiCommonsNetworkNodePartialCollapsed");
		}

		this.$(this.getId() + "actionbuttons").detach();
		this._bActionButtonsRendered = false;

		this._removeFromInvalidatedControls();

		if (this._isHtml() && !Node.hasNativeLineClamp) {
			this._setTextHeight($this.find(".sapSuiteUiCommonsNetworkGraphDivNodeTitle"), this.getTitleLineSize());
			this._setTextHeight($this.find(".sapSuiteUiCommonsNetworkGraphDivNodeDescription"), this.getDescriptionLineSize());
		}

		if (this.getSelected()) {
			this.showActionButtons(true);
		}

		//if the node is an interactive or clickable element then mouse pointer would be changed into an hand
		if (this._isInteractiveNode()) {
			this.addStyleClass("sapMPointer");
		} else {
			this.removeStyleClass("sapMPointer");
		}
	};

	Node.prototype._isInteractiveNode = function() {
		var bIsShowExpandButton = this.getShowExpandButton() && this._hasVisibleChildren(),
			bIsShowDetailButton = this.getShowDetailButton() && (this._hasDetailData() || this.getTitle()),
			bIsShowActionLinksButton = this.getShowActionLinksButton() && this._hasActionLinks(),
			aActionButtons = this.getActionButtons(),
			bIsActionButton = aActionButtons && aActionButtons.length > 0,
			bIsPress = this.mEventRegistry.press;

		return bIsShowExpandButton || bIsShowDetailButton || bIsShowActionLinksButton || bIsActionButton || bIsPress;

	};

	Node.prototype._render = function(mOptions) {
		var oParent = this.getParent(),
			bUseHtml = oParent && oParent._isUseNodeHtml();

		// for layouting we still need node to be rendered for node dimensions
		if (this._isIgnored()) {
			return "";
		}
		mOptions = mOptions || {};

		if (mOptions.mapRender) {
			if ((this._oGroup && !this._oGroup.getVisible()) || !this.getVisible()) {
				return "";
			}
		}

		return bUseHtml ? this._renderHtml(mOptions) : this._renderSvg(mOptions);
	};

	/* =========================================================== */
	/* HTML Rendering */
	/* =========================================================== */
	Node.prototype._renderHtmlInfoIcon = function(mArguments, mOptions) {
		mArguments = mArguments || {};
		mOptions = mOptions || {};

		var sStatusIcon = this.getStatusIcon(),
			sStyle = this._convertToStyle(mArguments, undefined, true),
			oRm = mOptions.renderManager;

		oRm.openStart("div");
		oRm.attr("id", this._getElementId(mOptions.idSufix) + "-statusiconwrapper");
		oRm.attr("title", oResourceBundle.getText("NETWORK_GRAPH_COLLAPSED"));
		this.applyStyles(oRm, this.getStyleObject(sStyle));
		oRm.class("sapSuiteUiCommonsNetworkNodeDivInfoWrapper").class("sapSuiteUiCommonsNetworkNodeInfoWrapper");
		oRm.openEnd();

		oRm.openStart("div").class("sapSuiteUiCommonsNetworkNodeDivInfoIcon").class("sapSuiteUiCommonsNetworkGraphDivNodeIcon").openEnd();
		this._renderHtmlIcon(sStatusIcon || "sap-icon://hint", null, null, null, null, oRm);
		oRm.close("div");
		oRm.close("div");
	};

	Node.prototype._renderHtmlText = function(sText, iSize, sClass, sColor, oRm) {
		this._renderHtmlElement("div", {
			"-webkit-line-clamp": iSize === 0 ? "" : iSize,
			"color": sColor
		}, {
			"class": "sapSuiteUiCommonsNetworkGraphDivNodeText " + (sClass || "") + ((iSize === 1) ? " sapSuiteUiCommonsNetworkGraphDivTextBreakAll " : "")
		}, oRm);

		oRm.text(sText);
		oRm.close("div");
	};

	Node.prototype._renderHtmlTitle = function(sColorStyle, oRm) {
        var sNodeTitle = this.getTitle();
		var sTitle = sNodeTitle ? sNodeTitle : this.getAltText();

		if (sTitle) {
			this._renderHtmlText(sTitle, this.getTitleLineSize(), "sapSuiteUiCommonsNetworkGraphDivNodeTitleText sapSuiteUiCommonsNetworkGraphDivNodeTitle", sColorStyle, oRm);
			oRm.openStart("div").style("clear", "both").openEnd().close("div");
		}
	};

	Node.prototype._renderHtmlDescription = function(sColorStyle, oRm) {
		var iDescriptionSize = this.getDescriptionLineSize(),
			sDescription = this.getDescription();

		if (sDescription && iDescriptionSize != -1) {
			this._renderHtmlText(sDescription, iDescriptionSize, "sapSuiteUiCommonsNetworkGraphDivNodeDescription", sColorStyle, oRm);
		}
	};

	Node.prototype._renderHtmlTitleAndDescription = function(oRm) {
		this._renderHtmlTitle(null, oRm);
		this._renderHtmlDescription(null, oRm);
	};

	Node.prototype._renderHtmlAttributes = function(mOptions) {
		var aAttributes = this.getVisibleAttributes();

		// rendering without manager not supported for HTML
		if (!mOptions.renderManager) {
			return;
		}

		if (aAttributes.length > 0) {
			mOptions.renderManager.openStart("div").class("sapSuiteUiCommonsNetworkGraphDivNodeAttributes").openEnd();
			aAttributes.forEach(function(oAttribute) {
				this._renderClonedControl(mOptions, oAttribute);
			}.bind(this));

			mOptions.renderManager.close("div");
		}
	};

	Node.prototype._showDivActionButtons = function(bShow) {
		var that = this,
			$right = this.$("rightdivbuttons"),
			$left = this.$("leftdivbuttons");

		if (bShow && !this._bActionButtonsRendered) {
			$right.html("");
			$left.html("");

			var iButtonRight = 0,
				iButtonLeft = 0;

			if (this.getShowExpandButton()) {
				this._appendActionButton({
					"class": "sapSuiteUiCommonsNetworkNodeActionCollapseIcon",
					icon: this._getExpandIcon(true),
					enable: this._hasVisibleChildren(),
					title: oResourceBundle.getText("NETWORK_GRAPH_EXPAND_COLLAPSE"),
					id: this._getDomId("actionCollapse"),
					click: this._expandClick.bind(this)
				}, $right);

				iButtonRight++;
			}

			if (this.getShowDetailButton()) {
                var sNodeTitle = this.getTitle();
				this._appendActionButton({
					icon: "sap-icon://menu",
					enable: this._hasDetailData() || (sNodeTitle ? sNodeTitle : this.getAltText()),
					id: this._getDomId("actionDetail"),
					title: oResourceBundle.getText("NETWORK_GRAPH_NODE_DETAILS"),
					click: function(evt) {
						this._detailClick(evt.target);
					}.bind(this)
				}, $right);
				if (document.getElementById(this._getDomId("actionDetail"))) {
					document.getElementById(this._getDomId("actionDetail")).setAttribute("aria-haspopup", "dialog");
				}
				iButtonRight++;
			}

			if (this.getShowActionLinksButton()) {
				this._appendActionButton({
					icon: "sap-icon://chain-link",
					enable: this._hasActionLinks(),
					title: oResourceBundle.getText("NETWORK_GRAPH_NODE_LINKS"),
					id: this._getDomId("actionLinks"),
					click: function(evt) {
						this._linksClick(evt.target);
					}.bind(this)
				}, $right);
				if (document.getElementById(this._getDomId("actionLinks"))) {
					document.getElementById(this._getDomId("actionLinks")).setAttribute("aria-haspopup", "dialog");
				}
				iButtonRight++;
			}

			for (var i = 0; (iButtonRight + iButtonLeft) < (MAX_ACTION_BUTTONS * 2) && i < this.getActionButtons().length; i++) {
				(function(oButton) {  // eslint-disable-line
					var sPosition = oButton.getPosition(),
						iIndex = sPosition === ActionButtonPosition.Right ? iButtonRight : iButtonLeft;

					// switch lanes if there is more then 4 items on the line
					if (iIndex >= MAX_ACTION_BUTTONS) {
						sPosition = sPosition === ActionButtonPosition.Left ? ActionButtonPosition.Right : ActionButtonPosition.Left;
					}

					var $wrapper = sPosition === ActionButtonPosition.Right ? $right : $left;

					that._appendActionButton({
						icon: oButton.getIcon(),
						enable: oButton.getEnabled(),
						title: oButton.getTitle(),
						id: oButton.getId(),
						click: function(evt) {
							oButton.firePress({
								buttonElement: evt.target
							});
						}
					}, $wrapper);
				})(this.getActionButtons()[i]);
			}
			this._bActionButtonsRendered = true;
		}

		var sFnAction = bShow ? "addClass" : "removeClass";
		this.$().find(".sapSuiteUiCommonsNetworkGraphDivActionButtons")[sFnAction](this.VISIBLE_ACTIONS_BUTTONS_CLASS);
	};

	Node.prototype._getCorrectWidth = function() {
		var iWidth = (this._iWidth || this.getWidth() || "auto"),
			iMaxWidth = "";

			if (this.getMaxWidth()) {
				iMaxWidth = this.getMaxWidth() + "px";
			}

		if (iWidth !== "" && iWidth !== "auto") {
			iWidth += "px";
		}

		return {
			width: iWidth,
			maxWidth: iMaxWidth
		};
	};

	Node.prototype._renderHtml = function(mOptions) {
		var sId = this._getElementId(mOptions.idSufix),
			bIsCircle = this._isCircle(),
			oWidth = this._getCorrectWidth();

		this._renderHtmlElement("div", {
			width: bIsCircle ? oWidth.width : "",
			"max-width": bIsCircle ? oWidth.maxWidth : "",
			// for other then map rendering X and Y is set later on in graph render method
			// we don't want to set it now, as it may be remembered from last cycle and for maxWidth
			// this may put nodes to the edge of the parent which makes calculation of div maxWidth impossible
			top: !this._bMainRender && this.getY() ? (this.getY() + "px") : "",
			left: !this._bMainRender && this.getX() ? (this.getX() + "px") : "",
			"min-width": MIN_WIDTH + "px"
		}, {
			id: sId,
			"data-sap-ui": sId,
			"class": this._getNodeClass()
		}, mOptions.renderManager);

		this.renderContent(mOptions);
		mOptions.renderManager.close("div");
	};

	Node.prototype._renderHtmlContent = function(mOptions) {
		mOptions = mOptions || {};

		var sId = this._getElementId(mOptions.idSufix),
			iHeight = this._iHeight || this.getHeight() || Size.Circle.HEIGHT,
			bIsCircle = this._isCircle();

		var fnProcessContent = function() {
			var oContent = this.getContent();
			if (oContent) {
				mOptions.renderManager.openStart("div",this.getId() + "-contentwrapper");
				mOptions.renderManager.openEnd();
				this._renderClonedControl(mOptions, oContent);
				mOptions.renderManager.close("div");
			} else {
				this.renderItemContent(mOptions);
			}
		}.bind(this);

		var sFocusColor = this._getStatusStyle({
			"border-color": ElementBase.ColorType.Focus
		}, false);

		if (bIsCircle) {
			this._iCircleSize = this._iCircleSize || iHeight;

			var sMainStyle = this._convertToStyle({
				width: this._iCircleSize + "px",
				height: this._iCircleSize + "px"
			}, this._getStatusStyle({
				"border-color": ElementBase.ColorType.Border
			}), true);

			var sStatusStyle = this._getStatusStyle({
				"border-color": ElementBase.ColorType.Background
			}, false);

			var sBorderColor = this._getStatusStyle({
				"border-color": ElementBase.ColorType.Border,
				"background-color": this.getSelected() ? ElementBase.ColorType.SelectedBackground : "",
				"border-width": ElementBase.ColorType.BorderWidth,
				"border-style": ElementBase.ColorType.BorderStyle
			}, false);

			mOptions.renderManager.openStart("div", sId + "-wrapperwithbuttons");
			mOptions.renderManager.class("sapSuiteUiCommonsNetworkGraphDivInnerWrapper");
			this.applyStyles(mOptions.renderManager, this.getStyleObject(sMainStyle));
			mOptions.renderManager.openEnd();
			this.renderHtmlActionButtons(mOptions);

			mOptions.renderManager.openStart("div", sId + "-wrapper");
			this.applyStyles(mOptions.renderManager, this.getStyleObject(sBorderColor));
			mOptions.renderManager.class("sapSuiteUiCommonsNetworkGraphDivInner");
			mOptions.renderManager.openEnd();
			mOptions.renderManager.openStart("div");
			mOptions.renderManager.class("sapSuiteUiCommonsNetworkDivCircleWrapper");
			mOptions.renderManager.openEnd();
			this._renderHtmlInfoIcon({}, mOptions);
			mOptions.renderManager.openStart("div", sId + "-focus");
			this.applyStyles(mOptions.renderManager, this.getStyleObject(sFocusColor));
			mOptions.renderManager.class("sapSuiteUiCommonsNetworkDivFocus");
			mOptions.renderManager.openEnd();
			mOptions.renderManager.openStart("div", sId + "-status");
			this.applyStyles(mOptions.renderManager, this.getStyleObject(sStatusStyle));
			mOptions.renderManager.class("sapSuiteUiCommonsNetworkDivCircleStatus");
			mOptions.renderManager.openEnd();
			this.renderItemContent(mOptions);

			mOptions.renderManager.close("div");
			mOptions.renderManager.close("div");
			mOptions.renderManager.close("div");
			mOptions.renderManager.close("div");
			mOptions.renderManager.close("div");
			this._renderHtmlTitleAndDescription(mOptions.renderManager);
		} else {
			var oWidth = this._getCorrectWidth();
			var sMainStyle = this._convertToStyle({
				width: oWidth.width,
				"max-width": oWidth.maxWidth ? oWidth.maxWidth : "inherit",
				"min-width": MIN_WIDTH + "px"
			}, this._getStatusStyle({
				"border-color": ElementBase.ColorType.Border,
				"background-color": this.getSelected() ? ElementBase.ColorType.SelectedBackground : "",
				"border-width": ElementBase.ColorType.BorderWidth,
				"border-style": ElementBase.ColorType.BorderStyle
			}), true);

			this.renderHtmlActionButtons(mOptions);
			mOptions.renderManager.openStart("div", sId + "-wrapper");
			this.applyStyles(mOptions.renderManager, this.getStyleObject(sMainStyle));
			mOptions.renderManager.class("sapSuiteUiCommonsNetworkGraphDivInner").openEnd();
			mOptions.renderManager.openStart("div", sId + "-focus");
			this.applyStyles(mOptions.renderManager, this.getStyleObject(sFocusColor));
			mOptions.renderManager.class("sapSuiteUiCommonsNetworkDivFocus").openEnd();
			mOptions.renderManager.close("div");

			var sStatusStyle = this._getStatusStyle({
				"background-color": ElementBase.ColorType.Background
			}, false);

			var sContentColor = this._getColor(this.getSelected() ? ElementBase.ColorType.Content : ElementBase.ColorType.HeaderContent);
			mOptions.renderManager.openStart("div", sId + "-header");
			this.applyStyles(mOptions.renderManager, this.getStyleObject(sStatusStyle));
			mOptions.renderManager.class("sapSuiteUiCommonsNetworkGraphDivHeader");
			if (this._hasHeaderContent()){
				mOptions.renderManager.class("sapSuiteUiCommonsNetworkGraphDivHeaderColor");
			}
			if (!this._hasAdditionalContent()) {
				mOptions.renderManager.class("sapSuiteUiCommonsNetworkGraphDivHeaderOnly");
			}
			mOptions.renderManager.openEnd();

			if (this._showHeaderCheckBox()) {
				this._renderClonedControl(mOptions, this._getHeaderCheckbox());
			}

			this._renderHtmlTitleIcon("sapSuiteUiCommonsNetworkGraphDivNodeIconTitle", mOptions.renderManager);
			this._renderHtmlTitle(sContentColor, mOptions.renderManager);
			mOptions.renderManager.close("div");

			fnProcessContent();

			mOptions.renderManager.close("div");
			this._renderHtmlInfoIcon({}, mOptions);
		}
	};

	Node.prototype._getHeaderCheckbox = function() {
		var oCheckBox = this.getAggregation("_checkBox"),
			that = this;

		if (!oCheckBox) {
			oCheckBox = new CheckBox(this.getId() + "-checkbox").addStyleClass("sapSuiteUiCommonsNetworkGraphHeaderCheckboxInner");
			oCheckBox.addEventDelegate({
				"onAfterRendering": function() {
					oCheckBox.$().on("mousedown", function(oEvent) {
						var bNewValue = !oCheckBox.getSelected();

						oCheckBox.setSelected(bNewValue);
						that.fireHeaderCheckBoxPress({
							checked: bNewValue
						});

						// we don't want to select the node
						oEvent.stopPropagation();
					});
				}
			});
			this.setAggregation("_checkBox", oCheckBox, true);
		}

		return oCheckBox;
	};

	Node.prototype._renderHtmlTitleIcon = function(sClass, oRm) {
		var sIcon = this.getIcon(),
			oImage = this.getImage(),
			sFontSize = this.getIconSize() ? "style=\"font-size:" + this.getIconSize() + "px\"" : "",
			sColorStyle, oImageSize;

		sClass = (sClass || "") + " sapSuiteUiCommonsNetworkGraphDivNodeTitleText sapSuiteUiCommonsNetworkGraphDivNodeIcon";
		sColorStyle = this._getStatusStyle({
			"color": this._isBox() ? ElementBase.ColorType.HeaderContent : ElementBase.ColorType.Content
		}, false);

		if (oImage) {
			oImageSize = this._getImageSize();

			this._renderHtmlElement("img", {
				width: oImageSize.width + "px",
				height: oImageSize.height + "px"
			}, {
				"src": oImage.getSrc(),
				"class": "sapSuiteUiCommonsNetworkGraphDivNodeImage"
			}, oRm);
		} else if (sIcon) {
			oRm.openStart("div");
			this.applyStyles(oRm, this.getStyleObject(sColorStyle));
			sClass.split(" ").forEach(function(sClassName) {
				if (sClassName) {
					oRm.class(sClassName);
				}
			});
			oRm.openEnd();
			this._renderHtmlIcon(sIcon, null, null, sFontSize, null, oRm);
			oRm.close("div");
		}
	};

	Node.prototype._renderHtmlBoxContent = function(mOptions) {
		var bHasAdditionalContent = this._hasAdditionalContent(),
			sId = this._getElementId(mOptions.idSufix);

		if (bHasAdditionalContent) {
			mOptions.renderManager.openStart("div",sId + "-additionalwarpper" );
			mOptions.renderManager.class("sapSuiteUiCommonsNetworkGraphDivAdditionalContent").openEnd();
			var sColorStyle = this._getColor(ElementBase.ColorType.Content);

			this._renderHtmlDescription(sColorStyle, mOptions.renderManager);

			this._renderHtmlAttributes(mOptions);
			mOptions.renderManager.close("div");
		}
	};

	Node.prototype._renderHtmlCircleContent = function(mOptions) {
		this._renderHtmlTitleIcon("sapSuiteUiCommonsNetworkGraphDivNodeCircleIcon", mOptions.renderManager);
	};

	/* =========================================================== */
	/* SVG Rendering */
	/* =========================================================== */
	Node.prototype._renderSvg = function(mOptions) {
		var sId = this._getElementId(mOptions.idSufix);

		var sNodeHtml = this._renderControl("g", {
			id: sId,
			"data-sap-ui": sId,
			nodeid: encodeXML(this.getKey()),
			"class": this._getNodeClass()
		}, false);

		sNodeHtml += this._renderControl("g", {
			id: sId + "-wrapper",
			"class": "sapSuiteUiCommonsNetworkNodeShape"
		}, false);

		sNodeHtml += this._renderContent(mOptions);

		sNodeHtml += "</g>";
		sNodeHtml += "</g>";

		return sNodeHtml;
	};

	Node.prototype._renderSvgContent = function(mOptions) {
		var sNodeHtml = this._isBox() ? this._renderBox(mOptions) : this._renderCircle(mOptions);

		var bIsRtl = this.getParent()._bIsRtl,
			x, y;

		if (this._isCircle()) {
			var iInfoOffsetX = this._iCircleSize / 8,
				iInfoOffsetY = this._iCircleSize / 5.3;

			x = bIsRtl ? this._getCirclePosition().x + this._iCircleSize - iInfoOffsetX : this._getCirclePosition().x + iInfoOffsetX;
			y = this.getY() + iInfoOffsetY;
		} else {
			x = this.getX();
			y = this.getY();
		}

		// rendering status icon
		sNodeHtml += this.renderStatusIcon({
			x: x - this.getX(),
			y: y - this.getY()
		});

		return sNodeHtml;
	};

	Node.prototype._renderContent = function(mOptions) {
		return this.renderContent(mOptions);
	};

	Node.prototype._renderCircleContent = function() {
		var iCircleSize = this._iCircleSize,
			bIsRtl = this.getParent()._bIsRtl,
			oImage = this.getImage(), oImageSize,
			fX = this.getX(),
			fY = this.getY(),
			sHtml = "";

		if (this._displayImage(oImage)) {
			oImageSize = this._getImageSize();
			sHtml += this._renderControl("image", {
				"xlink:href": encodeXML(oImage.getSrc()),
				x: fX + this._iWidth / 2 - oImageSize.width / 2,
				y: fY + iCircleSize / 2 - oImageSize.height / 2,
				width: oImageSize.width,
				height: oImageSize.height
			});
		} else if (this.getIcon()) {
			sHtml += this._renderIcon({
				attributes: {
					"class": "sapSuiteUiCommonsNetworkGraphIcon sapSuiteUiCommonsNetworkCircleNodeIcon sapSuiteUiCommonsNetworkStatusText",
					style: (this.getIconSize() ? ("font-size:" + this.getIconSize() + "px;") : "") +
						this._getStatusStyle({
							fill: ElementBase.ColorType.Content
						}),
					x: fX + this._iWidth / 2,
					y: fY + iCircleSize / 2
				},
				icon: this.getIcon(),
				height: this.getIconSize() ? this.getIconSize() - 2 : 22 /* default icon size offset */
			});
		}

        var sNodeTitle = this.getTitle();
		var sTitleText = sNodeTitle ? sNodeTitle : this.getAltText();
		if (sTitleText) {
			if (!this._aTitleLines || this._aTitleLines.length === 1) {
				sHtml += this._renderClipPath({
					id: this.getId() + "-title-clip",
					x: fX,
					y: fY + iCircleSize + Size.Title.OFFSET - 10,
					height: Size.Title.LINESIZE * 2 // margin for font
				});
				sHtml += this._renderTitle({
					"class": "sapSuiteUiCommonsNetworkNodeTitle sapSuiteUiCommonsNetworkNodeText",
					x: fX + this._iWidth / 2,
					y: fY + iCircleSize + Size.Title.OFFSET,
					title: sanitizeHTML(sTitleText),
					maxWidth: this._iWidth - 5
				});
			} else {
				sHtml += this._renderMultilineTitle({
					x: fX + this._iWidth / 2,
					y: fY + iCircleSize + Size.Title.OFFSET * 2
				});
			}
		}
		// description
		if (this._displayDescription()) {
			sHtml += this._renderDescription({
				x: bIsRtl ? fX + this._iWidth - Size.Title.OFFSET : fX + Size.Title.OFFSET,
				y: fY + this._getTitleHeight() + iCircleSize + Size.Title.OFFSET * 2 + Size.Title.OFFSET / 2
			});
		}

		return sHtml;
	};

	Node.prototype._renderCircle = function() {
		var sHtml = "",
			fX = this.getX(),
			fY = this.getY(),
			STATUS_OFFSET = 6,
			FOCUS_OFFSET = 2,
			iCircleSize = this._iCircleSize;

		sHtml += this._renderControl("circle", {
			id: this.getId() + "-innerBox",
			cx: fX + this._iWidth / 2,
			cy: fY + iCircleSize / 2,
			style: this._getStatusStyle({
				stroke: ElementBase.ColorType.Border
			}),
			r: iCircleSize / 2,
			"class": "sapSuiteUiCommonsNetworkInnerCircle"
		});

		sHtml += this._renderControl("circle", {
			id: this.getId() + "-statusCircle",
			cx: fX + this._iWidth / 2,
			cy: fY + iCircleSize / 2,
			style: this._getStatusStyle({
				stroke: ElementBase.ColorType.Background
			}),
			r: iCircleSize / 2 - STATUS_OFFSET,
			"class": "sapSuiteUiCommonsNetworkInnerCircleStatus"
		});

		sHtml += this._renderControl("circle", {
			id: this.getId() + "-focusCircle",
			cx: fX + this._iWidth / 2,
			cy: fY + iCircleSize / 2,
			style: this._getStatusStyle({
				stroke: ElementBase.ColorType.Focus
			}),
			r: iCircleSize / 2 - FOCUS_OFFSET,
			"class": "sapSuiteUiCommonsNetworkCircleFocus"
		});

		sHtml += this.renderItemContent();

		return sHtml;
	};

	Node.prototype._renderBoxContent = function(mOptions) {
		var TITLE_SIZE_Y = HEADER_SIZE / 2,
			sTitleLeft = Size.Title.ICON_X_OFFSET,
			bIsRtl = this.getParent()._bIsRtl,
			oImage = this.getImage(),
			fY = this.getY(),
			fX = this.getX(),
			iTitleWidth, oImageSize = this._getImageSize(),
			sHtml = "";

		if (this._displayImage(oImage)) {
			oImageSize = this._getImageSize();
			sHtml += this._renderControl("image", {
				"xlink:href": encodeXML(oImage.getSrc()),
				x: bIsRtl ? fX + this._iWidth - Size.Title.ICON_X_OFFSET - oImageSize.width : fX + Size.Title.ICON_X_OFFSET,
				y: fY + Size.Title.IMAGE_OFFSET_Y,
				width: oImageSize.width,
				height: oImageSize.height
			});
			sTitleLeft += oImageSize.width + Size.Title.ICON_X_OFFSET;
		} else if (this.getIcon()) {
			sHtml += this._renderIcon({
				attributes: {
					style: this._getStatusStyle({
						fill: ElementBase.ColorType.Content
					}),
					"class": "sapSuiteUiCommonsNetworkGraphIcon sapSuiteUiCommonsNetworkNodeTitleIcon sapSuiteUiCommonsNetworkStatusText",
					x: bIsRtl ? fX + this._iWidth - Size.Title.ICON_X_OFFSET : fX + Size.Title.ICON_X_OFFSET,
					y: fY + TITLE_SIZE_Y
				},
				icon: this.getIcon(),
				height: Size.Title.LINESIZE
			});
			sTitleLeft += Size.Title.ICON_SIZE + Size.Title.ICON_X_OFFSET;
		}

		var sNodeTitle = this.getTitle();
		var sTitleText = sNodeTitle ? sNodeTitle : this.getAltText();
		if (sTitleText) {
			iTitleWidth = this._iWidth - sTitleLeft - TITLE_OFFSET;
			// for images larger than the node itself - we ignore title
			if (iTitleWidth > 0) {
				if (!this._aTitleLines || this._aTitleLines.length === 1) {
					sHtml += this._renderClipPath({
						id: this.getId() + "-title-clip",
						x: fX,
						y: fY,
						height: HEADER_SIZE
					});
					sHtml += this._renderTitle({
						"class": "sapSuiteUiCommonsNetworkNodeTitle sapSuiteUiCommonsNetworkNodeText sapSuiteUiCommonsNetworkStatusText",
						style: this._getStatusStyle({
							fill: ElementBase.ColorType.Content
						}),
						x: bIsRtl ? fX + this._iWidth - sTitleLeft : fX + sTitleLeft,
						y: fY + TITLE_SIZE_Y,
						maxWidth: iTitleWidth,
						title: sanitizeHTML(sTitleText)
					});
				} else {
					sHtml += this._renderMultilineTitle({
						x: bIsRtl ? fX + this._iWidth - sTitleLeft : fX + sTitleLeft,
						y: fY + Size.Title.OFFSET * 2
					});
				}
			}
		}

		if (this._displayDescription()) {
			sHtml += this._renderDescription({
				x: bIsRtl ? fX + this._iWidth - Size.Title.OFFSET : fX + Size.Title.OFFSET - Size.Title.OFFSET / 3,
				y: fY + this._getTitleHeight() + (this._hasMultiLineTitle() ? (Size.Title.OFFSET * 2 + Size.Title.OFFSET / 2) : Size.Title.OFFSET * 4)
			});
		}

		if (this._displayAttributes()) {
			sHtml += mOptions.sizeDetermination ? this._renderAttributesForSize() : this._renderAttributes({
				// single line title is not rendered using offset so don't append it
				y: this.getY() + this._getDescriptionHeight() + this._getTitleHeight() + Size.Title.OFFSET + (!this._hasMultiLineTitle() ? Size.Attributes.OFFSET : 0)
			});
		}

		return sHtml;
	};

	Node.prototype._renderBox = function(mOptions) {
		var TITLE_OFFSET = 6,
			FOCUS_OFFSET = 4,
			iTitleHeight = (this._iTitleHeight || this._getTitleHeight()) + TITLE_OFFSET,
			RADIUS = 3;

		var fY = this.getY(),
			fX = this.getX();

		var sHtml = this._renderControl("rect", {
			id: this.getId() + "-innerBox",
			x: fX,
			y: fY,
			style: this._getStatusStyle({
				stroke: ElementBase.ColorType.Border
			}),
			"class": "sapSuiteUiCommonsNetworkInnerRect",
			rx: RADIUS,
			ry: RADIUS,
			width: this._iWidth,
			height: this._iHeight,
			"pointer-events": "fill"
		});

		var bRoundedBottom = this._iHeight === HEADER_SIZE;
		sHtml += this._renderRoundRect({
			id: this.getId() + "-innerStatusBox",
			x: fX,
			y: fY,
			style: this._getStatusStyle({
				fill: ElementBase.ColorType.Background
				// stroke: ElementBase.ColorType.Border
			}),
			"class": "sapSuiteUiCommonsNetworkNodeBoxStatus",
			topRight: RADIUS,
			topLeft: RADIUS,
			bottomRight: bRoundedBottom ? RADIUS : 0,
			bottomLeft: bRoundedBottom ? RADIUS : 0,
			width: this._iWidth,
			height: Math.max(iTitleHeight, HEADER_SIZE),
			"pointer-events": "fill"
		});

		sHtml += this._renderControl("rect", {
			id: this.getId() + "-focusCircle",
			x: fX + FOCUS_OFFSET,
			y: fY + FOCUS_OFFSET,
			"class": "sapSuiteUiCommonsNetworkBoxFocus",
			style: this._getStatusStyle({
				stroke: ElementBase.ColorType.Focus
			}),
			rx: 5,
			ry: 5,
			width: this._iWidth - FOCUS_OFFSET * 2,
			height: this._iHeight - FOCUS_OFFSET * 2
		});

		sHtml += this.renderItemContent(mOptions);
		return sHtml;
	};

	Node.prototype._renderInfoIcon = function(iX, iY, iSize, iFontSize) {
		var sStatusIcon = this.getStatusIcon(),
			sStatusIconClass = sStatusIcon ? "sapSuiteUiCommonsNetworkNodeInfoWrapperCustomIcon" : "",
			sHtml = "<g id=\"" + this.getId() + "-statusiconwrapper" + "\" class=\"sapSuiteUiCommonsNetworkNodeInfoWrapper " + sStatusIconClass + "\">";

		sHtml += this._renderControl("circle", {
			"class": "sapSuiteUiCommonsNetworkNodeInfoBox",
			cx: iX,
			cy: iY,
			r: iSize || Size.Title.INFO_BOX_SIZE / 2
		}, false);

		sHtml += "<title>" + oResourceBundle.getText("NETWORK_GRAPH_COLLAPSED") + "</title>";
		sHtml += "</circle>";

		sHtml += this._renderIcon({
			attributes: {
				id: this.getId() + "-statusicon",
				"class": "sapSuiteUiCommonsNetworkNodeInfoIcon sapSuiteUiCommonsNetworkGraphIcon",
				x: iX + Size.Title.INFO_BOX_SIZE / 2 - 10,
				y: iY,
				style: iFontSize ? ("font-size:" + iFontSize) : ""
			},
			icon: sStatusIcon || "sap-icon://hint",
			height: Size.Title.INFO_BOX_SIZE / 2 + 2.5
		});

		sHtml += "</g>";
		return sHtml;
	};

	Node.prototype._getNodeClass = function() {
		var sSelectedClass = this.getSelected() ? this.SELECT_CLASS : "",
			sCustomStatusClass = this._hasCustomStatus() ? " sapSuiteUiCommonsNetworkNodeCustomStatus " : "",
			sCustomClass = "";

		if (this.aCustomStyleClasses) {
			sCustomClass = this.aCustomStyleClasses.join(" ");
		}

		return (this.getParent()._isUseNodeHtml() ? "sapSuiteUiCommonsNetworkGraphDivNode " : "sapSuiteUiCommonsNetworkNode ") + sSelectedClass + sCustomStatusClass +
			(this._isBox() ? " sapSuiteUiCommonsNetworkBox " : " sapSuiteUiCommonsNetworkNodeCircle ") + this._getStatusClass() + sCustomClass;
	};

	Node.prototype._renderAttributesForSize = function() {
		var sLabelWrapper = "",
			sValueWrapper = "";
		this.getVisibleAttributes().forEach(function(oItem) {
			sLabelWrapper += this._renderText({
				attributes: {
					"class": "sapSuiteUiCommonsNetworkGraphAttribute",
					x: this.getX(),
					y: this.getY()
				},
				text: oItem.getLabel()
			});

			sValueWrapper += this._renderText({
				attributes: {
					"class": "sapSuiteUiCommonsNetworkGraphAttribute",
					x: this.getX(),
					y: this.getY()
				},
				text: oItem.getValue()
			});
		}, this);

		sLabelWrapper = "<g id=\"" + this.getId() + "-attrLabel\">" + sLabelWrapper + "</g>";
		sValueWrapper = "<g id=\"" + this.getId() + "-attrValue\">" + sValueWrapper + "</g>";

		return sLabelWrapper + sValueWrapper;
	};

	Node.prototype._getAttributeColor = function(oItem, sStatusType, sType) {
		var sAttrStatus = sStatusType + "Status",
			sStatus = oItem["get" + sAttrStatus]() || this.getStatus();

		return this._getColor(sType, sStatus);
	};

	Node.prototype._getAttributeColorString = function(oItem, sStatusType, sType) {
		var sColor = this._getAttributeColor(oItem, sStatusType, sType);

		return sColor ? "fill:" + sColor : "";
	};

	Node.prototype._renderAttributes = function(mProperties) {
		mProperties = mProperties || {};

		var PATH_OFFSET = 2,
			BORDER = 6,
			DELIMITER = 12;

		var bIsRtl = this.getParent()._bIsRtl,
			iLabelStart = bIsRtl ? this.getX() + this._iWidth - BORDER : this.getX() + BORDER,
			iLabelWidth = this._iLabelAttrWidth ? this._iLabelAttrWidth : this._iWidth / 2 - DELIMITER,
			iValueStart = bIsRtl ? iLabelStart - iLabelWidth - DELIMITER : iLabelStart + iLabelWidth + DELIMITER,
			iValueWidth = bIsRtl ? iValueStart - this.getX() - BORDER : (this.getX() + this._iWidth) - iValueStart - BORDER;

		var sValueWrapper = this._renderControl("g", {
				"clip-path": "url(#" + this.getId() + "-clip-attr-value)",
				id: this.getId() + "-attrValue"
			}, false),
			sLabelWrapper = this._renderControl("g", {
				"clip-path": "url(#" + this.getId() + "-clip-attr-label)",
				id: this.getId() + "-attrLabel"
			}, false),
			fStart = mProperties.y,
			sClip = this._renderClipPath({
				id: this.getId() + "-clip-attr-label",
				x: bIsRtl ? iLabelStart - iLabelWidth - BORDER + PATH_OFFSET : iLabelStart - PATH_OFFSET,
				y: fStart,
				width: PATH_OFFSET * 2 + (bIsRtl ? iLabelWidth + BORDER : iLabelWidth)
			});

		sClip += this._renderClipPath({
			id: this.getId() + "-clip-attr-value",
			x: bIsRtl ? this.getX() + BORDER + PATH_OFFSET : iValueStart - PATH_OFFSET,
			y: fStart,
			width: PATH_OFFSET * 2 + (bIsRtl ? iValueWidth + BORDER : iValueWidth)
		});

		this.getVisibleAttributes().forEach(function(oItem, i) {
			var iY = fStart + Size.Attributes.LINE * (i + 1);
			sLabelWrapper += this._renderText({
				attributes: {
					style: this._getAttributeColorString(oItem, ElementAttribute.Type.Label, ElementBase.ColorType.Content),
					"class": "sapSuiteUiCommonsNetworkGraphAttribute sapSuiteUiCommonsNetworkStatusText",
					x: iLabelStart,
					id: oItem.getId() + "-label",
					y: iY
				},
				text: oItem.getLabel()
			});

			sValueWrapper += this._renderText({
				attributes: {
					style: this._getAttributeColorString(oItem, ElementAttribute.Type.Value, ElementBase.ColorType.Content),
					"class": "sapSuiteUiCommonsNetworkGraphAttribute sapSuiteUiCommonsNetworkGraphAttributeValue sapSuiteUiCommonsNetworkStatusText",
					x: iValueStart,
					y: iY,
					id: oItem.getId() + "-value"
				},
				text: oItem.getValue()
			});

		}, this);

		sValueWrapper += "</g>";
		sLabelWrapper += "</g>";
		return sClip + sLabelWrapper + sValueWrapper;
	};

	Node.prototype._detailClick = function(oOpener) {
		oOpener = oOpener || this;
		// flag is set, so that method getBoundingClientRect is used from jquery-ui-position
		oOpener.useClientRect = true;
		this.getParent()._tooltip.openDetail({
			item: this,
			opener: oOpener
		});
	};

	Node.prototype._linksClick = function(oOpener) {
		oOpener = oOpener || this;
		this.getParent()._tooltip.openLink({
			item: this,
			opener: oOpener
		});
	};

	Node.prototype._expandClick = function() {
		var bExecuteDefault = this.fireEvent("collapseExpand", {}, true);
		if (bExecuteDefault) {
			this.setCollapsed(this._oExpandState !== ExpandState.COLLAPSED);
		}
	};

	/* =========================================================== */
	/* Private methods */
	/* =========================================================== */
	Node.prototype._setupMaxWidth = function() {
		var iMaxWidth = this.getMaxWidth();

		if (iMaxWidth) {
			this._iWidth = iMaxWidth;
		}
	};

	Node.prototype._setTextHeight = function($el, iMaxLines) {
		if ($el[0] && iMaxLines > 0) {
			var $icon = this.$().find(".sapSuiteUiCommonsNetworkGraphDivNodeIcon.sapSuiteUiCommonsNetworkGraphDivNodeIconTitle");
			$icon.hide();

			var iDefaultHeight = $el.height();
			$el.css("white-space", "nowrap");

			var iHeight = $el.height();
			if (iHeight !== 0 && iDefaultHeight !== 0 ) {
				$el.height(Math.min(iDefaultHeight, iMaxLines * iHeight));
			}
			$el.css("white-space", "");
			$icon.show();
		}
	};

	Node.prototype._applyMaxWidth = function() {
		var OFFSET = 30,
			TITLE_OFFSET = 10;

		var iNodeWidth, $labelAttr, $valueAttr, iValueAttrWidth = 0, iLabelAttrWidth = 0, iAttrWidth = 0, iLargerAttr,
			iMaxWidth = this.getMaxWidth();

		if (this._oGroup && this._oGroup.getCollapsed()) {
			return;
		}

		if (!this.getWidth() && this.getMaxWidth()) {
			$labelAttr = this.$("attrLabel");
			$valueAttr = this.$("attrValue");
			if ($labelAttr[0]) {
				iLabelAttrWidth = $labelAttr[0].getBBox().width;
			}

			if ($valueAttr[0]) {
				iValueAttrWidth = $valueAttr[0].getBBox().width;
			}
			iAttrWidth = iValueAttrWidth + iLabelAttrWidth + OFFSET;

			iNodeWidth = Math.max(this.$()[0].getBBox().width + TITLE_OFFSET, iAttrWidth);
			this._iWidth = Math.max(Math.min(iNodeWidth, iMaxWidth), 80);

			if ((iValueAttrWidth && iLabelAttrWidth)) {
				// this fix size of value and label column to better fit node's width
				// if there is any room we enlarge the bigger column to take place more then half of the node
				iLargerAttr = Math.max(iLabelAttrWidth, iValueAttrWidth);
				if (iLargerAttr * 2 + OFFSET / 2 < this._iWidth) {
					// do nothing both attributes can be on their side
					return;
				}

				if (iAttrWidth > this._iWidth) {
					if (iValueAttrWidth < iMaxWidth / 2) {
						this._iLabelAttrWidth = this._iWidth - iValueAttrWidth - OFFSET;
					}
					if (iLabelAttrWidth < this._iWidth / 2) {
						this._iLabelAttrWidth = iLabelAttrWidth + OFFSET / 4;
					}
				} else {
					this._iLabelAttrWidth = this._iWidth - iValueAttrWidth - OFFSET;
				}
			}
		}
	};

	Node.prototype._resetDimensions = function() {
		this._iWidth = 0;
		this._iHeight = 0;
		this._iCircleSize = 0;
		this._iTitleHeight = 0;
	};

	Node.prototype._setupDivDimensions = function() {
		var $this = this.$();

		this._iWidth = $this.width();
		this._iHeight = $this.height();
	};

	Node.prototype._setupWidthAndHeight = function(bReset) {
		var sTypeName = this._isBox() ? "Box" : "Circle",
			iTitleHeight = this._getTitleHeight(),
			iTitleOffset = this.getTitle() || this._hasDetailData() ? Size.Title.LINESIZE : 0,
			iDescriptionHeight = this._getDescriptionHeight();

		iDescriptionHeight = iDescriptionHeight ? iDescriptionHeight + 5 : 0;

		var fnGetHeight = function() {
			var iHeight = this._iHeight || this.getHeight();

			if (this._isBox() && !iHeight) {
				iHeight = iDescriptionHeight +
					(this._hasMultiLineTitle() ? iTitleHeight + Size.Title.OFFSET : Math.max(iTitleHeight + iTitleOffset, Size.Box.HEIGHT));

				if (this._displayAttributes()) {
					iHeight += this.getVisibleAttributes().length * Size.Attributes.LINE + Size.Attributes.OFFSET;
				}
			}

			if (this._isCircle() && !this._iHeight) {
				iHeight = iHeight ? iHeight : Size[sTypeName].HEIGHT;
				this._iCircleSize = iHeight;

				iHeight += iTitleHeight + iDescriptionHeight;
			}

			return Math.max(iHeight, 30/*MIN HEIGHT*/);
		}.bind(this);

		var fnGetWidth = function() {
			var iWidth = Math.max(this._iWidth || this.getWidth() || Size[sTypeName].WIDTH, 30/*MIN HEIGHT*/);

			if (this._isCircle() && iWidth < this._iCircleSize) {
				iWidth = this._iCircleSize;
			}

			return iWidth;
		}.bind(this);

		this._iHeight = fnGetHeight();
		this._iWidth = fnGetWidth();
	};

	Node.prototype._getTitleHeight = function() {
		var iHeight = 0,
			oImageSize = this._getImageSize();

		if (this._hasMultiLineTitle()) {
			iHeight = (((this.getTitleLineSize() > 0) ? Math.min(this._aTitleLines.length, this.getTitleLineSize()) : this._aTitleLines.length)) * Size.Title.LINESIZE;
		} else {
			iHeight = (this._isBox() || this.getTitle()) ? Size.Title.LINESIZE : 0;
		}

		return Math.max(oImageSize.height, iHeight);
	};

	Node.prototype._getDescriptionHeight = function() {
		var iMaxLines = this.getDescriptionLineSize();
		if (iMaxLines === -1 || !this._aDescriptionLines || !this.getDescription()) {
			return 0;
		}
		return (iMaxLines > 0 ? Math.min(iMaxLines, this._aDescriptionLines.length) : this._aDescriptionLines.length) * Size.Description.LINESIZE;
	};

	Node.prototype._setupEvents = function() {
		var $wrapper = this.$("wrapper");

		$wrapper.off("mouseover");
		$wrapper.off("mouseout");
		$wrapper.off("click");

		$wrapper.on("mouseover", function(oEvent) {
			this._mouseOver();
		}.bind(this));

		$wrapper.on("mouseout", function(oEvent) {
			this._mouseOut();
		}.bind(this));

		$wrapper.on("click", function(oEvent) {
				if (oEvent.which === 1) {
					this._onClick(oEvent.ctrlKey);
				}
			oEvent.preventDefault();
		}.bind(this));
	};

	Node.prototype._mouseOut = function() {
		this.$().removeClass(this.HIGHLIGHT_CLASS);

		if (!this.getSelected()) {
			this._setStatusColors("");
		}
	};

	Node.prototype._mouseOver = function() {
		var bExecuteDefault = this.fireEvent("hover", {}, true);

		if (bExecuteDefault) {
			if (!this.getSelected()) {
				this._setStatusColors("Hover");
			}

			this.$().addClass(this.HIGHLIGHT_CLASS);
		}
	};

	Node.prototype._onClick = function(bIsCtrlKey) {
		var bExecuteDefault = this.fireEvent("press", {}, true);
		this.getParent()._selectNode({
			element: this,
			forceFocus: true,
			renderActionButtons: bExecuteDefault && !this.getSelected(),
			preventDeselect: bIsCtrlKey
		});
		if (!this.getSelected()) {
			// this prevent flickering when click on the same node over and over
			// _selectNode removes highglight class and it is reselected by mouseover (but after it is triggered)
			this.$().addClass(this.HIGHLIGHT_CLASS);
			this._setStatusColors("Hover");
		}
	};

	Node.prototype._deselect = function() {
		var $wrapper = this.$("innerBox");
		$wrapper.css("stroke", this._getColor(ElementBase.ColorType.Border));
		$wrapper.css("fill", this._getColor(ElementBase.ColorType.Background));
	};

	Node.prototype._getExpandIcon = function(bReturnName) {
		switch (this._oExpandState) {
			case ExpandState.PARTIAL:
				return bReturnName ? ActionIcons.PARTIAL : sIconOverlay;
			case ExpandState.EXPANDED:
				return bReturnName ? ActionIcons.COLLAPSE : sIconMinus;
			case ExpandState.COLLAPSED:
				return bReturnName ? ActionIcons.EXPAND : sIconAdd;
			default:
				return bReturnName ? ActionIcons.EXPAND : sIconAdd;
		}
	};

	Node.prototype._createLineText = function(sText, iWidth, oText, iMaxLines) {
		var aLines = [[]],
			iLine = 0, sRest,
			sWord, aLine, aWords, sTrimmedWord, bTrimmed,
			oSpan = this._createElement("tspan");

		if (!sText || iWidth < 0) {
			return aLines;
		}

		aWords = sText.split(/\s+/).reverse();

		oText.appendChild(oSpan);

		while (aWords.length > 0) {
			sWord = aWords.pop();
			// skip empty words
			if (sWord) {
				aLine = aLines[iLine];
				aLine.push(sWord);
				oSpan.textContent = aLines[iLine].join(" ");
				if (oSpan.getComputedTextLength() > iWidth) {
					if (aLine.length > 1 && iMaxLines !== 1) {
						aWords.push(aLine.pop());
					}

					if (aLine.length === 1) {
						bTrimmed = this._createText(oText, {
							text: aLine[0],
							width: iWidth,
							dots: false
						});

						if (bTrimmed) {
							sTrimmedWord = oSpan.textContent;

							aLine.pop();
							aLine.push(sTrimmedWord);
							sRest = sWord.substring(sTrimmedWord.length);
							aWords.push(sRest);
						}
					}

					iLine++;

					// we don't need lines we wont render
					if (iMaxLines > 0 && iLine >= iMaxLines) {
						break;
					}
					aLines[iLine] = [];
				}
			}
		}

		// add dots for shortened title
		if (iMaxLines > 0 && aWords.length > 0) {
			aLines[aLines.length - 1].push("...");
		}

		if (aLines.length > 0) {
			// trim last line if its too long
			bTrimmed = this._createText(oText, {
				text: aLines[aLines.length - 1].join(" "),
				width: iWidth,
				dots: true
			});

			if (bTrimmed) {
				aLines[iMaxLines - 1] = [oSpan.textContent];
			}
		}

		return aLines;
	};

	Node.prototype._createDescription = function() {
		var oText,
			iWidth = this._iWidth - Size.Title.OFFSET,
			$node = this.$();

		if (this._displayDescription() && $node[0]) {
			oText = this._createElement("text");
			oText.setAttribute("class", "sapSuiteUiCommonsNetworkNodeDescription");
			$node[0].appendChild(oText);

			this._aDescriptionLines = this._createLineText(this.getDescription(), iWidth, oText, this.getDescriptionLineSize());
		}
	};

	Node.prototype._createMultilineTitle = function() {
		var fnGetPossibleTitleSize = function() {
			if (this._isBox()) {
				if (this._displayImage()) {
					return this._iWidth - this._getImageSize().width - Size.Title.ICON_X_OFFSET * 2;
				}

				if (this.getIcon()) {
					return this._iWidth - Size.Title.ICON_SIZE - Size.Title.ICON_X_OFFSET * 2;
				}

				return this._iWidth - Size.Title.OFFSET * 2;
			}

			return this._iWidth;
		}.bind(this);

		var oText,
			iWidth = fnGetPossibleTitleSize(),
			$node = this.$();

		if (this.getTitleLineSize() !== 1 && $node[0] && iWidth > 0) {
			oText = this._createElement("text");
			oText.setAttribute("class", "sapSuiteUiCommonsNetworkNodeTitle sapSuiteUiCommonsNetworkNodeMultipleLineTitle");

			$node[0].appendChild(oText);
			this._aTitleLines = this._createLineText(this.getTitle(), iWidth, oText, this.getTitleLineSize());
		}
	};

	Node.prototype.getFocusDomRef = function() {
		return this.getDomRef("wrapper");
	};

	Node.prototype._renderMultilineText = function(mAttributes) {
		var sHtml = "",
			bUseStatusText = this._isBox() && mAttributes.useCustomstyle;

		if (!mAttributes.lines) {
			return "";
		}

		for (var i = 0; i < mAttributes.lines.length; i++) {
			sHtml += this._renderText({
				attributes: {
					style: bUseStatusText ? this._getStatusStyle({
						fill: ElementBase.ColorType.Content
					}) : "",
					"class": mAttributes.class + (bUseStatusText ? " sapSuiteUiCommonsNetworkStatusText " : ""),
					x: mAttributes.x,
					y: mAttributes.y + (i * mAttributes.lineSize)
				},
				close: false
			});

			sHtml += mAttributes.lines[i].join(" ");
			sHtml += "</text>";
		}

		return sHtml;
	};

	Node.prototype._renderDescription = function(mAttributes) {
		mAttributes.class = " sapSuiteUiCommonsNetworkNodeTitle sapSuiteUiCommonsNetworkNodeMultipleLineTitle";

		return this._renderMultilineText({
			lines: this._aDescriptionLines,
			maxLineSize: this.getDescriptionLineSize(),
			lineSize: Size.Description.LINESIZE,
			"class": " sapSuiteUiCommonsNetworkNodeDescription ",
			x: mAttributes.x,
			y: mAttributes.y
		});
	};

	Node.prototype._sanitizeTitleLines = function(aLines) {
		for (var i = 0; i < aLines.length; i++) {
			aLines[i] = [sanitizeHTML(aLines[i])];
		}
		return aLines;
	};

	Node.prototype._renderMultilineTitle = function(mAttributes) {
		var aSanitizedLines = this._sanitizeTitleLines(this._aTitleLines);
		return this._renderMultilineText({
			useCustomStyle: true,
			lines: aSanitizedLines,
			maxLineSize: this.getTitleLineSize(),
			lineSize: Size.Title.LINESIZE,
			"class": " sapSuiteUiCommonsNetworkNodeTitle sapSuiteUiCommonsNetworkNodeMultipleLineTitle",
			x: mAttributes.x,
			y: mAttributes.y,
			trim: this._aTitleLines.length > this.getTitleLineSize() && this.getTitleLineSize() !== 0
		});
	};

	Node.prototype._processHideShowParents = function(bCollapse, sRootId, oChildren) {
		var bIsInCollapsedGroup = this._oGroup && this._oGroup.getCollapsed();

		var fnCheckNode = function(oNode) {
			if (oNode._bIsHidden) {
				return;
			}

			// if there is any visible node for parent set parent's state to PARTIAL otherwise set it as COLLAPSED/EXPANDED
			var bHasDifferent = false,
				bHidden;
			// check whether parent node is either root
			if (oNode.getKey() !== sRootId) {
				// we check whether there are any children with different state then action state
				// if so we change this to partial, if there is not any visible children we set COLLAPSED
				// otherwise we set EXPANDED
				if (oNode.aChildren.length > 0) {
					bHidden = oNode.aChildren[0]._bIsHidden;
					oNode.aChildren.forEach(function(oChildNode) {
						if (bHidden !== oChildNode._bIsHidden) {
							bHasDifferent = true;
						}
					});

					oNode._oExpandState = bHasDifferent ? ExpandState.PARTIAL : bHidden ? ExpandState.COLLAPSED : ExpandState.EXPANDED; // eslint-disable-line
					if (oNode._oExpandState === ExpandState.COLLAPSED) {
						oNode.$().addClass("sapSuiteUiCommonsNetworkNodeCollapsed");
					} else {
						oNode.$().removeClass("sapSuiteUiCommonsNetworkNodeCollapsed");
					}
					if (oNode._oExpandState === ExpandState.PARTIAL) {
						oNode.$().addClass("sapSuiteUiCommonsNetworkNodePartialCollapsed");
					} else {
						oNode.$().removeClass("sapSuiteUiCommonsNetworkNodePartialCollapsed");
					}
				}
			}
		};

		// we need to check this node too for cases none of the children was changed still this node can hold wrong
		// state from the last iteration
		fnCheckNode(this);

		// change direct parent's state
		this.aParents.forEach(function(oNode) {
			if (!oChildren[oNode.getKey()]) {
				fnCheckNode(oNode);
			}
		});

		// for collapsed group we need to check every node's parent
		if (bIsInCollapsedGroup) {
			if (this._oGroup._bNeedParentProcessing) {
				this._oGroup.aNodes.forEach(function(oGroupNode) {
					oGroupNode.aParents.forEach(function(oParentNode) {
						if (!oChildren[oParentNode.getKey()]) {
							fnCheckNode(oParentNode);
						}
					});
				});
				this._oGroup._bNeedParentProcessing = false;
			}
		}
	};

	Node.prototype._getAllChildren = function(bCollapse, sRootId, oChildren) {
		var fnAppend = function(sKey) {
			if (!oChildren[sKey]) {
				oChildren[sKey] = this;
				return true;
			}

			return false;
		}.bind(this);

		// we can reach the root itself by recursion, if so, exit
		if (sRootId === this.getKey()) {
			return;
		}

		// if this node is already collapsed(expanded) - depends on action taken we don't want to revert node's state
		if (this._bIsHidden === bCollapse) {
			return;
		}

		if (!fnAppend(this.getKey())) {
			// we already visited this node in this recursion
			return;
		}

		// for collapsed group we need to process every node in the group
		if (this._oGroup && this._oGroup.getCollapsed()) {
			this._oGroup.aNodes.forEach(function(oNode) {
				oNode._getAllChildren(bCollapse, sRootId, oChildren);
			});
		}

		// if node is collapsed by user, we don't stop recursion as this node and its children hold their state
		if (this._oExpandState !== ExpandState.COLLAPSED) {
			this.aChildren.forEach(function(oNode) {
				oNode._getAllChildren(bCollapse, sRootId, oChildren);
			});
		}
	};

	Node.prototype._hideShow = function(bCollapse) {
		var sFunctionName = bCollapse ? "hide" : "show",
			bHasVisibleNodes;

		this._bIsHidden = bCollapse;

		this.aLines.forEach(function(oLine) {
			oLine._hideShow(bCollapse);
		});

		this.aParentLines.forEach(function(oLine) {
			oLine._hideShow(bCollapse);
		});

		// group management	for collapsed hide whole group
		// for expanded check whether group has any visible node -> if not hide it, otherwise hide only node
		if (this._oGroup && !this._oGroup._bIsSwimLane) {
			if (this._oGroup.getCollapsed()) {
				this._oGroup._hideShow(bCollapse);
			} else {
				bHasVisibleNodes = this._oGroup._hasVisibleNodes();
				if ((bHasVisibleNodes && !bCollapse) || (!bHasVisibleNodes && bCollapse)) {
					this._oGroup._hideShow(bCollapse);
				}
			}
		}

		// nodes in collapsed group are not affected
		if (this._isInCollapsedGroup() && this._isHtml()) {
			return;
		}

		if (this.$()) {
			this.$()[sFunctionName]();
		}
	};

	Node.prototype._setActionButtonFocus = function(oItem, bFocus) {
		this.$().removeClass(this.FOCUS_CLASS);
		this.$().find("." + this.FOCUS_CLASS).removeClass(this.FOCUS_CLASS);

		var sFnAction = bFocus ? "addClass" : "removeClass";
		jQuery(oItem)[sFnAction](this.FOCUS_CLASS);
	};

	Node.prototype._getActionButtonTitle = function(oItem) {
		if (this.getParent().getRenderType() === "Html") {
			var sFirst = jQuery(oItem).attr("title");
			return oResourceBundle.getText("NETWORK_GRAPH_ACCESSIBILITY_ACTION_BUTTON") + (sFirst ? " " + sFirst : "");
		} else {
			var oFirst = jQuery(oItem).find("title")[0];
			return oResourceBundle.getText("NETWORK_GRAPH_ACCESSIBILITY_ACTION_BUTTON") + (oFirst ? " " + oFirst.textContent : "");
		}
	};

	Node.prototype._getAccessibilityLabel = function() {
        var sNodeTitle = this.getTitle();
		var sNodeTitleText = sNodeTitle ? sNodeTitle : this.getAltText();
		var sLabel = oResourceBundle.getText("NETWORK_GRAPH_NODE") + " " + sNodeTitleText;
		if (this._isBox()) {
			this.getVisibleAttributes().forEach(function(oAttribute) {
				sLabel += " " + oAttribute.getLabel() + " " + oAttribute.getValue();
			});
		}
		if (this.getStatus() && this.getStatus() != ""){
			var parent = this.getParent();
			var statusID = this.getStatus();
			if (parent._oStatuses[statusID]) {
				sLabel += " " + oResourceBundle.getText("PF_ARIA_STATUS") + " " + parent._oStatuses[statusID].getTitle();
			}else {
				sLabel += " " + oResourceBundle.getText("PF_ARIA_STATUS") + " " + this.getStatus();
			}
		}
		if (this.getSelected()) {
			sLabel += " " + oResourceBundle.getText("NETWORK_GRAPH_SELECTED_NODE");
		}
		return sLabel;
	};

	Node.prototype._setStatusColors = function(sType) {
		var fnSetAttrColor = function(item, sStatus) {
			if (sStatus && item) {
				var sColor = this._getColor(ElementBase.ColorType[sType + "Content"], sStatus),
					sAttrName = bUseNodeHtml ? "color" : "fill";

				jQuery(item).css(sAttrName, sColor || sContentColor);
			}
		}.bind(this);

		var bUseNodeHtml = this.getParent() && this.getParent()._isUseNodeHtml();

		if (this._hasCustomStatus()) {
			var sContentColor = this._getColor(ElementBase.ColorType[sType + "Content"]),
				sBackgroundColor = this._getColor(ElementBase.ColorType[sType + "Background"]),
				sBorderColor = this._getColor(ElementBase.ColorType[sType + "Border"]);

			var bHoverOrSelected = (sType === "Selected" || sType === "Hover");

			if (!bUseNodeHtml) {
				var $box = this.$("innerBox"),
					$status = bIsCircle ? this.$("statusCircle") : this.$("innerStatusBox"),
					bIsCircle = this._isCircle();

				$status.css(bIsCircle ? "stroke" : "fill", bHoverOrSelected ? "none" : sBackgroundColor);

				$box.css("fill", bHoverOrSelected ? sBackgroundColor : "");
				$box.css("stroke", sBorderColor);

				this.$().find(".sapSuiteUiCommonsNetworkStatusText").css("fill", sContentColor);

				// focus
				this.$("focusCircle").css("stroke", this._getColor(ElementBase.ColorType[sType + "Focus"]));
			} else {
				var $wrapper = this.$("wrapper"),
					$titleText = this.$().find(".sapSuiteUiCommonsNetworkGraphDivNodeTitleText");

				$wrapper.css("border-color", sBorderColor);

				this.$("focus").css("border-color", this._getColor(ElementBase.ColorType[sType + "Focus"]));

				if (this._isBox()) {
					// additional content text
					this.$().find(".sapSuiteUiCommonsNetworkGraphDivNodeText").css("color", sContentColor);

					// header background
					this.$("header").css("background-color", bHoverOrSelected && !sBackgroundColor ? "" : sBackgroundColor);

					// header text
					$titleText.css("color", bHoverOrSelected ? sContentColor : this._getColor(ElementBase.ColorType.HeaderContent));

					// background color
					$wrapper.css("background-color", bHoverOrSelected && sBackgroundColor ? sBackgroundColor : "");
				} else {
					// inner border color
					this.$("status").css("border-color", sBackgroundColor);

					// background - applied only for hover or selected otherwise cannot be changed
					$wrapper.css("background-color", bHoverOrSelected && sBackgroundColor ? sBackgroundColor : "");

					// content text
					this.$().find(".sapSuiteUiCommonsNetworkGraphDivNodeCircleIcon").css("color", sContentColor);
				}
			}
		}

		// attributes
		this.getAttributes().forEach(function(oAttribute) {
			if (oAttribute && oAttribute.getVisible()) {
				var sLabelStatus = oAttribute.getLabelStatus(),
					sValueStatus = oAttribute.getValueStatus();

				if (sLabelStatus) {
					fnSetAttrColor(oAttribute.$("icon"), sLabelStatus);
					fnSetAttrColor(oAttribute.$("label"), sLabelStatus);
				}

				if (sValueStatus) {
					fnSetAttrColor(oAttribute.$("value"), sValueStatus);
				}
			}
		});
	};

	Node.prototype._setNodeOpacity = function(bSet) {
		// for circle we just can't set opacity as it would display lines which are rendered beneath the circle nodes
		// we put another div with background to hide these lines
		if (this._isCircle()) {
			this.$("wrapper").css("opacity", bSet ? 0.3 : "");
			this.$().find(".sapSuiteUiCommonsNetworkGraphDivNodeTitleText").css("opacity", bSet ? 0.3 : "");
			if (bSet) {
				this.$("wrapperwithbuttons").append(jQuery('<div></div>', {
					"class": "sapSuiteUiCommonsNetworkGraphDivInnerCloned sapSuiteUiCommonsNetworkGraphDivInner"
				}));

			} else {
				this.$("wrapperwithbuttons").find(".sapSuiteUiCommonsNetworkGraphDivInnerCloned").detach();
			}
			return;
		}

		this.$().css("opacity", bSet ? 0.3 : "");
	};

	Node.prototype._getContentRect = function() {
		var oCirclePos = this._getCirclePosition(),
			bIsCircle = this._isCircle();

		var iX = bIsCircle ? oCirclePos.x : this.getX(),
			iY = bIsCircle ? oCirclePos.y : this.getY(),
			iHeight = bIsCircle ? this._iCircleSize : this._iHeight,
			iWidth = bIsCircle ? this._iCircleSize : this._iWidth;

		return {
			p1: {
				x: iX,
				y: iY
			},
			p2: {
				x: iX + iWidth,
				y: iY + iHeight
			}
		};
	};

	Node.prototype._setFocus = function(bFocus) {
		ElementBase.prototype._setFocus.apply(this, arguments);

		var sType = bFocus ? "Selected" : "";
		this.$("focus").css("border-color", this._getColor(ElementBase.ColorType[sType + "Focus"]));
	};

	/* =========================================================== */
	/* Public methods */
	/* =========================================================== */
	/**
	 * Returns header checkbox object
	 *
	 * @public
	 */
	Node.prototype.getHeaderCheckbox = function() {
		return this._getHeaderCheckbox();
	};

	/**
	 * Returns an object that includes an array of text lines and the height of a single line.
	 *
	 * @param {Object} [mArguments] Arguments passed to the method
	 * @param {Object} [mArguments.attributes] Additional attributes appended to the text
	 * @param {int} [mArguments.width] Width of the text is trimmed to
	 * @param {string} [mArguments.text] Text to trim
	 *
	 * @returns {text: Array with text lines, lineHeight: Single line height*}
	 *
	 * @public
	 */
	Node.prototype.computeTextDimensions = function(mArguments) {
		var oDomRef = this.getDomRef(),
			oText, aText, iHeight;

		if (oDomRef) {
			oText = this._createElement("text", mArguments.attributes);
			oDomRef.appendChild(oText);

			try {
				aText = this._createLineText(mArguments.text, mArguments.width, oText, mArguments.maxLines);
				iHeight = oText.getBBox().height;
			} catch (e) {
				// nothing
			}

			jQuery(oText).detach();

			return {
				text: aText,
				lineHeight: iHeight
			};
		}
	};

	/**
	 * Renders the text of the node as SVG. Either text or lines of text must be passed to this method as an argument.
	 *
	 * @param {Object} [mArguments] Arguments passed to the method
	 * @param {string} [mArguments.text] Text to render, available only for single-line text. Rendered as it is, cannot
	 * be used for trim or any other similar operation
	 * @param {Array} [mArguments.lines] Array with lines of text. Words are spread across multiple lines
	 * @param {int} [mArguments.x] X coordinate that is added to the node's top left x coordinate
	 * @param {int} [mArguments.y] Y coordinate that is added to the node's top left y coordinate
	 * @param {int} [mArguments.lineSize] Line size for the node, if not set, the default line size is used
	 * @param {Object} [mArguments.attributes] Additional attributes rendered with the text
	 *
	 * @returns {string} Text string rendered as SVG
	 *
	 * @public
	 */
	Node.prototype.renderText = function(mArguments) {
		var DEFAULT_LINE_SIZE = 16;

		var sHtml = "",
			aLines = mArguments.lines;

		if (!aLines) {
			if (mArguments.text) {
				aLines = [mArguments.text.split(" ")];
			} else {
				return "";
			}
		}

		for (var i = 0; i < aLines.length; i++) {
			sHtml += this._renderText({
				attributes: Object.assign({
					x: mArguments.x + this.getX(),
					y: this.getY() + mArguments.y + (i * (mArguments.lineSize || DEFAULT_LINE_SIZE))
				}, mArguments.attributes),
				close: false
			});

			sHtml += aLines[i].join(" ");
			sHtml += "</text>";
		}

		return sHtml;
	};

	/**
	 * Creates an SVG icon string.
	 *
	 * @param {Object} [mArguments] Arguments passed to the method
	 * @param {string} [mArguments.icon] Icon name, based on the SAP icon font
	 * @param {int} [mArguments.x] X coordinate that is added to node's top left x coordinate.
	 * @param {int} [mArguments.y] Y coordinate that is added to node's top left y coordinate.
	 * @param {Object} [mArguments.attributes] Additional attributes rendered with the text
	 *
	 * @returns {string} SVG icon string
	 *
	 * @public
	 */
	Node.prototype.renderIcon = function(mArguments) {
		mArguments.attributes = mArguments.attributes || {};

		Object.assign(mArguments.attributes, {
			"font-family": "SAP-icons"
		});

		mArguments.attributes.x = this.getX() + (mArguments.x || 0);
		mArguments.attributes.y = this.getY() + (mArguments.y || 0);

		return this._renderIcon({
			attributes: mArguments.attributes,
			icon: mArguments.icon
		});
	};

	/**
	 * Creates HTML representation of an icon.
	 * @param sIcon icon to render
	 * @returns {string} HTML icon
	 * @param {Object} [mOptions] Options passed to the method (optional).
	 * @public
	 */
	Node.prototype.renderHtmlIcon = function(sIcon, mOptions) {
		if (mOptions && mOptions.renderManager) {
			this._renderHtmlIcon(sIcon, "sapSuiteUiCommonsNetworkGraphDivNodeIcon", null, null, null, mOptions.renderManager);
		} else {
			return this._renderHtmlIcon(sIcon, "sapSuiteUiCommonsNetworkGraphDivNodeIcon");
		}
	};

	/**
	 * Renders wrappers for HTML action buttons. Used for custom rendering.
	 *
	 * @param {Object} [mOptions] Options passed to the method (optional).
	 * @param {string} [mOptions.idSufix] Suffix (optional). When the suffix is specified,
	 * it is added to the IDs of the wrappers.
	 *
	 * @returns {string}
	 * @public
	 */
	Node.prototype.renderHtmlActionButtons = function(mOptions) {
		mOptions = mOptions || {};
		var sRightId = this._getElementId(mOptions.idSufix) + "-rightdivbuttons",
			sLeftId = this._getElementId(mOptions.idSufix) + "-leftdivbuttons",
			oRm = mOptions.renderManager;

		oRm.openStart("div").attr("id", sLeftId).class("sapSuiteUiCommonsNetworkGraphDivActionButtons").class("sapSuiteUiCommonsNetworkGraphDivActionButtonsLeft").openEnd().close("div");
		oRm.openStart("div").attr("id", sRightId).class("sapSuiteUiCommonsNetworkGraphDivActionButtons").class("sapSuiteUiCommonsNetworkGraphDivActionButtonsRight").openEnd().close("div");
	};

	/**
	 * Renders custom info icon for HTML rendering.
	 * @param oStyle {object} Object with additional style appended to info icon
	 * @param {Object} [mOptions] Options passed to the method (optional).
	 * @public
	 */
	Node.prototype.renderHtmlInfoIcon = function(oStyle, mOptions) {
		return this._renderHtmlInfoIcon(oStyle, mOptions);
	};

	/**
	 * This method can only be overridden when custom rendering is used. It must never be called directly.
	 *
	 * @param {Object} [mOptions] Options passed to the method
	 * @param {boolean} [mOptions.sizeDetermination] If <code>true</code>, the size is determined for
	 * the purposes of text trimming and other resizing operations that are performed later, just before
	 * the final rendering of the graph, not when the method is called.<br>
	 * If you don't plan to trim text or resize the node, skip the rendering if you set this property to
	 * <code>true</code>.
	 *
	 * @returns {*}
	 *
	 * @public
	 */
	Node.prototype.renderContent = function(mOptions) {
		return this._isHtml() ? this._renderHtmlContent(mOptions) : this._renderSvgContent(mOptions);
	};

	/**
	 * This method can only be overridden when custom rendering is used. It must never be called directly.
	 *
	 * @param {Object} [mOptions] Options passed to the method
	 * @param {boolean} [mOptions.sizeDetermination] If <code>true</code>, the size is determined for
	 * the purposes of text trimming and other resizing operations that are performed later, just before
	 * the final rendering of the graph, not when the method is called.<br>
	 * If you don't plan to trim text or resize the node, skip the rendering if you set this property to
	 * <code>true</code>.
	 *
	 * @returns {*}
	 *
	 * @public
	 */
	Node.prototype.renderItemContent = function(mOptions) {
		if (this._isHtml()) {
			return this._isBox() ? this._renderHtmlBoxContent(mOptions) : this._renderHtmlCircleContent(mOptions);
		}

		return this._isBox() ? this._renderBoxContent(mOptions) : this._renderCircleContent(mOptions);
	};

	/**
	 * Determines node sizes, applies text trimming, arranges the text into lines, and makes other necessary adjustments.<br>
	 *
	 * This method can only be overridden when custom rendering is used. It must never be called directly.
	 *
	 * @returns {*}
	 *
	 * @public
	 */
	Node.prototype.calculateSizes = function() {
		this._setupMaxWidth();

		this._createMultilineTitle();
		this._createDescription();

		this._resetDimensions();
		this._applyMaxWidth();
	};

	/**
	 * Creates an SVG element string.
	 *
	 * @param {string} [name] Name of the element
	 * @param {string} [mAttributes] Attributes of the element.
	 * @param {boolean} [bClose] Indicates whether to close the element. If set to <code>false</code>, the caller
	 * is responsible for adding a closing tag.
	 *
	 * @returns {string} SVG icon string
	 *
	 * @public
	 */
	Node.prototype.renderElement = function(sName, mAttributes, bClose) {
		return this._renderControl(sName, mAttributes, bClose);
	};

	/**
	 * Renders the status icon. Can be called directly or overridden when custom rendering is used.
	 * @param {Object} [mParameters] Options passed to the method
	 * @param {number} [mOptions.x] Offset value added to the x coordinate of the top left corner of the node to get the x coordinate of the status icon.
	 * @param {number} [mOptions.y] Offset value added to the y coordinate of the top left corner of the node to get the y coordinate of the status icon.
	 * @param {number} [mOptions.size] Size of the icon box
	 * @param {number} [mOptions.iconSize] Icon size
	 *
	 * @public
	 */
	Node.prototype.renderStatusIcon = function(mParameters) {
		return this._renderInfoIcon(this.getX() + mParameters.x, this.getY() + mParameters.y, mParameters.size, mParameters.iconSize);
	};

	/**
	 * Sets the width and height of the node.<br>
	 * If you don't want to change the <code>height</code> and <code>width</code> properties, use this
	 * method to change the internal width and height.
	 *
	 * @param {Object} mArguments Arguments passed to the method
	 *
	 * @public
	 */
	Node.prototype.setSize = function(mArguments) {
		if (mArguments) {
			if (mArguments.width) {
				this._iWidth = mArguments.width;
			}

			if (mArguments.height) {
				this._iHeight = mArguments.height;
			}

			if (mArguments.titleHeight) {
				this._iTitleHeight = mArguments.titleHeight;
			}
		}
	};

	/**
	 * Checks whether the node has visible action buttons
	 * @returns {boolean} Returns true if node has action buttons displayed.
	 * @public
	 */
	Node.prototype.hasVisibleActionButtons = function() {
		return this.$("actionButtons").hasClass(this.VISIBLE_ACTIONS_BUTTONS_CLASS) ||
			this.$().find(".sapSuiteUiCommonsNetworkGraphDivActionButtons").hasClass(this.VISIBLE_ACTIONS_BUTTONS_CLASS);
	};

	/**
	 * Gets the node's action buttons that are enabled.
	 * @returns {Array} Returns an array of enabled action buttons.
	 * @public
	 */
	Node.prototype.getEnabledActionButtons = function() {
		return this.$().find(".sapSuiteUiCommonsNetworkNodeActionButton, .sapSuiteUiCommonsNetworkGraphDivActionButton:not(.sapSuiteUiCommonsNetworkGraphDivActionButtonDisabled)").parent().toArray();
	};

	/**
	 * Shows or hides the node's action buttons.
	 * @param {boolean} bShow Indicates whether to hide or to show buttons
	 * @public
	 */
	Node.prototype.showActionButtons = function(bShow) {
		if (!this.getParent()) {
			return;
		}

		var iRealButtonCount,
			aActionButtonPositions,
			that = this, iButtonIndex = 0, iButtonLeft = 0,
			bIsRtl = this.getParent()._bIsRtl,
			oWrapper, oExpandElements, iStartX, iStartLeftX, iStartY,
			oMenuElements, oLinksElements; // eslint-disable-line no-unused-vars

		if (this._isHtml()) {
			this._showDivActionButtons(bShow);
			return;
		}

		var fnCreateButtonPositions = function() {
			var iStartX = this.getParent()._bIsRtl ? -Size.ActionButtons.RADIUS - Size.ActionButtons.MARGIN : Size.ActionButtons.RADIUS + Size.ActionButtons.MARGIN,
				iStartY = Size.ActionButtons.RADIUS,
				aPoints = [[iStartX, iStartY]];
			for (var i = 1; i < iRealButtonCount; i++) {
				aPoints.push([iStartX, iStartY + Size.ActionButtons.RADIUS * 2 * i + Size.ActionButtons.OFFSET * i]);
			}

			return aPoints;
		}.bind(this);

		var fnGetRealButtonCount = function() {
			var iCount = this.getActionButtons().length;
			if (this.getShowExpandButton()) {
				iCount++;
			}

			if (this.getShowDetailButton()) {
				iCount++;
			}

			if (this.getShowActionLinksButton()) {
				iCount++;
			}

			return iCount;
		}.bind(this);

		var fnCreateIcon = function(mArguments) {
			var IE_ICON_OFFSET = 13,
				FOCUS_SIZE = 2,
				bIsPositionLeft = mArguments.position && mArguments.position === ActionButtonPosition.Left,
				bIsLeft = (bIsPositionLeft && !bIsRtl) || (!bIsPositionLeft && bIsRtl);

			mArguments.x = mArguments.x + (bIsLeft ? iStartLeftX : iStartX);

			var oCircleOptions = {
					cx: mArguments.x,
					cy: mArguments.y,
					id: mArguments.id + "-circle",
					"class": "sapSuiteUiCommonsNetworkNodeActionButton",
					r: Size.ActionButtons.RADIUS
				}, oIconOptions = {
					"class": "sapSuiteUiCommonsNetworkGraphIcon sapSuiteUiCommonsNetworkNodeActionIcon " + (mArguments.class ? mArguments.class : ""),
					x: mArguments.x,
					y: mArguments.y
				},
				oFocus, oTitle, oCircle, oIcon, oButtonWrapper, $button;

			if (!mArguments.enable) {
				oCircleOptions.class = "sapSuiteUiCommonsNetworkNodeActionButtonDisabledBackground";
				oWrapper.appendChild(this._createElement("circle", oCircleOptions));
				oCircleOptions.class = "sapSuiteUiCommonsNetworkNodeActionButtonDisabled";
				oIconOptions.class += " sapSuiteUiCommonsNetworkNodeActionButtonDisabled";
			}

			oButtonWrapper = this._createElement("g", {
				id: mArguments.id
			});
			oFocus = this._createElement("circle", {
				id: mArguments.id + "-circle",
				cx: mArguments.x,
				cy: mArguments.y,
				r: Size.ActionButtons.RADIUS - FOCUS_SIZE,
				"class": "sapSuiteUiCommonsNetworkActionButtonFocusCircle"
			});
			oCircle = this._createElement("circle", oCircleOptions);
			oIcon = this._createIcon(oIconOptions, mArguments.icon, IE_ICON_OFFSET);

			if (mArguments.title) {
				oTitle = this._createElement("title");
				oTitle.textContent = mArguments.title;
				oCircle.appendChild(oTitle);
			}

			oButtonWrapper.appendChild(oCircle);
			oButtonWrapper.appendChild(oIcon);
			oButtonWrapper.appendChild(oFocus);

			oWrapper.appendChild(oButtonWrapper);

			$button = jQuery(oCircle);

			if (mArguments.enable) {
				$button.on("click", function() {
					// remove focus from node and add focus to clicked action button
					this._setActionButtonFocus(oButtonWrapper, true);
					this._setFocus(false);
					if (this.getParent()) {
						this.getParent().setFocus({ item: this, button: oButtonWrapper });
					}
				}.bind(this));
				jQuery(oCircle).on("click", mArguments.click);
			}

			bIsPositionLeft ? iButtonLeft++ : iButtonIndex++;

			return {
				icon: oIcon,
				wrapper: oCircle
			};
		}.bind(this);

		iRealButtonCount = fnGetRealButtonCount();
		aActionButtonPositions = fnCreateButtonPositions();

		if (iRealButtonCount === 0) {
			return;
		}

		if (bShow && !this._bActionButtonsRendered) {
			iStartY = this.getY();

			if (this._isCircle()) {
				iStartX = this.getX() + (this._iWidth / 2 + this._iCircleSize / 2);
				iStartLeftX = this.getX() + (this._iWidth / 2 - this._iCircleSize / 2);
			} else {
				iStartX = this.getX() + this._iWidth;
				iStartLeftX = this.getX();
			}

			var oWrapper = this.$("actionButtons")[0];
			if (!oWrapper) {
				oWrapper = this._createElement("g", {
					"class": "sapSuiteUiCommonsNetworkNodeActionButtonWrapper",
					id: this._getDomId("actionButtons")
				});
			} else {
				jQuery(oWrapper).children().remove();
			}

			if (this.getParent()._isUseNodeHtml()) {
				this.getParent().$("actiionbuttons")[0].appendChild(oWrapper);
			} else {
				this.$()[0].appendChild(oWrapper);
			}

			// expand
			if (this.getShowExpandButton()) {
				oExpandElements = fnCreateIcon({
					x: aActionButtonPositions[iButtonIndex][0],
					y: iStartY + aActionButtonPositions[iButtonIndex][1],
					icon: this._getExpandIcon(true),
					"class": "sapSuiteUiCommonsNetworkNodeActionCollapseIcon",
					enable: this._hasVisibleChildren(),
					title: oResourceBundle.getText("NETWORK_GRAPH_EXPAND_COLLAPSE"),
					id: this._getDomId("actionCollapse"),
					click: this._expandClick.bind(this)
				});

				this._expandIcon = oExpandElements.icon;
			}

			// detail
			if (this.getShowDetailButton()) {
                var sNodeTitle = this.getTitle();
				oMenuElements = fnCreateIcon({
					x: aActionButtonPositions[iButtonIndex][0],
					y: iStartY + aActionButtonPositions[iButtonIndex][1],
					icon: "sap-icon://menu",
					enable: this._hasDetailData() || (sNodeTitle ? sNodeTitle : this.getAltText()),
					id: this._getDomId("actionDetail"),
					title: oResourceBundle.getText("NETWORK_GRAPH_NODE_DETAILS"),
					click: function() {
						this._detailClick(oMenuElements.wrapper);
					}.bind(this)
				});
			}

			// links
			if (this.getShowActionLinksButton()) {
				oLinksElements = fnCreateIcon({
					x: aActionButtonPositions[iButtonIndex][0],
					y: iStartY + aActionButtonPositions[iButtonIndex][1],
					icon: "sap-icon://chain-link",
					enable: this._hasActionLinks(),
					title: oResourceBundle.getText("NETWORK_GRAPH_NODE_LINKS"),
					id: this._getDomId("actionLinks"),
					click: function() {
						this._linksClick(oLinksElements.wrapper);
					}.bind(this)
				});
			}

			// render missing action buttons
			for (var i = 0; (iButtonIndex + iButtonLeft) < (MAX_ACTION_BUTTONS * 2) && i < this.getActionButtons().length; i++) {
				(function(oButton) {  // eslint-disable-line
					var sPosition = oButton.getPosition(),
						iIndex = sPosition === ActionButtonPosition.Right ? iButtonIndex : iButtonLeft;

					// switch lanes if there is more then 4 items on the line
					if (iIndex >= MAX_ACTION_BUTTONS) {
						sPosition = sPosition === ActionButtonPosition.Left ? ActionButtonPosition.Right : ActionButtonPosition.Left;
						iIndex = sPosition === ActionButtonPosition.Right ? iButtonIndex : iButtonLeft;
					}

					var oButtonElements = fnCreateIcon({
						x: aActionButtonPositions[iIndex][0],
						y: iStartY + aActionButtonPositions[iIndex][1],
						icon: oButton.getIcon(),
						title: oButton.getTitle(),
						id: oButton.getId(),
						click: function(oEvent) { // eslint-disable-line no-loop-func
							oButton.firePress({
								buttonElement: oButtonElements.wrapper
							});
						},
						enable: oButton.getEnabled(),
						position: sPosition
					});
				})(this.getActionButtons()[i]);
			}

			this._bActionButtonsRendered = true;
		} else if (this._expandIcon) {
			this._expandIcon.textContent = that._getExpandIcon();
			// remove action button focus
			this.$().find("." + this.FOCUS_CLASS).removeClass(this.FOCUS_CLASS);
		}

		var sFnAction = bShow ? "addClass" : "removeClass";
		this.$("actionButtons")[sFnAction](this.VISIBLE_ACTIONS_BUTTONS_CLASS);
	};

	/**
	 * Returns all child nodes.
	 * @returns {Array} Array with child nodes
	 * @public
	 */
	Node.prototype.getChildNodes = function() {
		this._checkForProcessData();
		return this.aChildren;
	};

	/**
	 * Returns all lines connected to the child nodes.
	 * @returns {Array} Array of lines connecting this node with its child nodes
	 * @public
	 */
	Node.prototype.getChildLines = function() {
		this._checkForProcessData();
		return this.aLines;
	};

	/**
	 * Returns all parent nodes.
	 * @returns {Array} Array with all parent nodes
	 * @public
	 */
	Node.prototype.getParentNodes = function() {
		this._checkForProcessData();
		return this.aParents;
	};

	/**
	 * Returns all lines connected to the parent nodes.
	 * @returns {Array} Array with lines connecting this node with its parent nodes
	 * @public
	 */
	Node.prototype.getParentLines = function() {
		this._checkForProcessData();
		return this.aParentLines;
	};

	/**
	 * Indicates whether the node is hidden by collapsing any of its parent nodes.
	 * @returns {boolean|*} <code>true</code> if the node is hidden
	 * @public
	 */
	Node.prototype.isHidden = function() {
		return this._bIsHidden;
	};

	/**
	 * Hides the node and any lines that lead to it.
	 * @param bValue value
	 *
	 * @public
	 */
	Node.prototype.setHidden = function(bValue) {
		var that = this;

		var fnProcessLines = function(aLines) {
			aLines.forEach(function(oLine) {
				var oTargetNode = oLine.getFromNode() === that ? oLine.getToNode() : oLine.getFromNode();
				oLine.setHidden(bValue || oTargetNode.isHidden());
			});
		};

		fnProcessLines(this.getChildLines());
		fnProcessLines(this.getParentLines());

		this.$()[bValue ? "hide" : "show"]();
		this._bIsHidden = bValue;

		// group
		if (this._oGroup) {
			this._oGroup.setHidden(!this._oGroup._hasVisibleNodes());
		}
	};

	/**
	 * Returns center position of the node.
	 * @returns {Object} Object with X and Y coordinates of the center of the node.
	 * For circular nodes, this method returns the center of the circle.
	 * @public
	 */
	Node.prototype.getCenterPosition = function() {
		var oCirclePos, oCircleHalfSize;
		if (this._isBox()) {
			return {
				x: this.getX() + this._iWidth / 2,
				y: this.getY() + this._iHeight / 2
			};
		}

		oCirclePos = this._getCirclePosition();
		oCircleHalfSize = this._getCircleSize() / 2;

		return {
			x: oCirclePos.x + oCircleHalfSize,
			y: oCirclePos.y + oCircleHalfSize
		};
	};

	/* =========================================================== */
	/* Getters & setters*/
	/* =========================================================== */
	Node.prototype.setHeaderCheckBoxState = function(sValue) {
		this._setHeaderCheckBoxState(sValue);
		return this;
	};

	Node.prototype.setX = function(fX) {
		this.setProperty("x", fX, true);
		return this;
	};

	Node.prototype.setY = function(fY) {
		this.setProperty("y", fY, true);
		return this;
	};

	Node.prototype.setSelected = function(bSelected) {
		var oParent = this.getParent(),
			sFnName = bSelected ? "addClass" : "removeClass",
			sKey = this.getKey();

		this.setProperty("selected", bSelected, true);

		if (oParent) {
			this._setStatusColors(bSelected ? "Selected" : "");

			this.$()[sFnName](this.SELECT_CLASS);

			if (bSelected) {
				oParent._mSelectedNodes[sKey] = this;
			} else {
				delete oParent._mSelectedNodes[sKey];
			}
		}

		return this;
	};

	Node.prototype.setCollapsed = function(bCollapse) {
		var oChildren = {},
			aChildrenKeys,
			oParent,
			sFnName = bCollapse ? "addClass" : "removeClass",
			$icon = this.$().find(".sapSuiteUiCommonsNetworkGraphDivActionButtons, .sapSuiteUiCommonsNetworkNodeActionButtonWrapper")
				.find(".sapSuiteUiCommonsNetworkNodeActionCollapseIcon");

		this.setProperty("collapsed", bCollapse, true);
		this._oExpandState = bCollapse ? ExpandState.COLLAPSED : ExpandState.EXPANDED;

		this.aChildren.forEach(function(oNode) {
			oNode._getAllChildren(bCollapse, this.getKey(), oChildren);
		}, this);

		aChildrenKeys = Object.keys(oChildren);

		aChildrenKeys.forEach(function(sKey) {
			oChildren[sKey]._hideShow(bCollapse, this.getKey());
		}, this);

		aChildrenKeys.forEach(function(sKey) {
			oChildren[sKey]._processHideShowParents(bCollapse, this.getKey(), oChildren);
		}, this);

		this.aLines.forEach(function(oLine) {
			oLine._hideShow(bCollapse);
		});

		if ($icon[0]) {
			$icon[0].textContent = this._getExpandIcon();
		}

		this.$().removeClass("sapSuiteUiCommonsNetworkNodePartialCollapsed");
		this.$()[sFnName]("sapSuiteUiCommonsNetworkNodeCollapsed");

		oParent = this.getParent();
		if (oParent) {
			oParent._setupKeyboardNavigation();
			if (bCollapse && !(oParent.getFocus() && oParent.getFocus().item === this)) {
				oParent.setFocus({ item: this });
			}
		}

		return this;
	};

	Node.prototype.setGroup = function(sGroup) {
		this.setProperty("group", sGroup, true);
		this._invalidateParent();

		return this;
	};

	Node.prototype.setShape = function(sShape) {
		this.setProperty("shape", sShape, true);
		this._invalidateParent();

		return this;
	};

	Node.prototype.setWidth = function(iWidth) {
		this.setProperty("width", iWidth, true);
		if (this.getParent() && this.getParent()._bPreventInvalidation) {
			this._iWidth = iWidth;
		} else {
			this._iWidth = 0;
		}
		this._invalidateParent();

		return this;
	};

	Node.prototype.setHeight = function(iHeight) {
		this.setProperty("height", iHeight, true);
		if (this.getParent() && this.getParent()._bPreventInvalidation) {
			this._iHeight = iHeight;
		} else {
			this._iHeight = 0;
		}
		this._invalidateParent();

		return this;
	};

	Node.prototype.setMaxWidth = function(iMaxWidth) {
		this.setProperty("maxWidth", iMaxWidth, true);
		this._invalidateParent();

		return this;
	};

	Node.prototype.setTitleLineSize = function(iTitleLineSize) {
		this.setProperty("titleLineSize", iTitleLineSize, true);
		this._invalidateParent();

		return this;
	};

	/* =========================================================== */
	/* Overriding auto generated methods */
	/* =========================================================== */

	Node.prototype.addAttribute = function() {
		ElementBase.prototype.addAttribute.apply(this, arguments);
		this._invalidateParent();
		return this;
	};

	Node.prototype.insertAttribute = function() {
		ElementBase.prototype.insertAttribute.apply(this, arguments);
		this._invalidateParent();
		return this;
	};

	Node.prototype.removeAllAttributes = function() {
		ElementBase.prototype.removeAllAttributes.apply(this, arguments);
		this._invalidateParent();
		return this;
	};

	Node.prototype.removeAttribute = function() {
		ElementBase.prototype.removeAttribute.apply(this, arguments);
		this._invalidateParent();
		return this;
	};

	/* =========================================================== */
	/* Overrides of auto generated methods */
	/* =========================================================== */
	Node.prototype.addAttribute = function() {
		ElementBase.prototype.addAttribute.apply(this, arguments);
		this._invalidateParent();
		return this;
	};

	Node.prototype.insertAttribute = function() {
		ElementBase.prototype.insertAttribute.apply(this, arguments);
		this._invalidateParent();
		return this;
	};

	Node.prototype.removeAllAttributes = function() {
		ElementBase.prototype.removeAllAttributes.apply(this, arguments);
		this._invalidateParent();
	};

	Node.prototype.removeAttribute = function() {
		ElementBase.prototype.removeAttribute.apply(this, arguments);
		this._invalidateParent();
	};

	/* =========================================================== */
	/* Helper methods */
	/* =========================================================== */
	Node.prototype.getHeaderCheckBoxState = function() {
		if (this.getProperty("headerCheckBoxState") === HeaderCheckboxState.Hidden) {
			return HeaderCheckboxState.Hidden;
		}

		return this.getHeaderCheckbox().getSelected() ? HeaderCheckboxState.Checked : HeaderCheckboxState.Unchecked;
	};

	Node.prototype._hasAdditionalContent = function() {
		return this._displayAttributes() || this._displayDescription() || this.getContent();
	};
	Node.prototype._hasHeaderContent = function() {
		return (this.getIcon() || this.getTitle() || this.getImage());
	};
	Node.hasNativeLineClamp = typeof document.documentElement.style.webkitLineClamp != "undefined" && Device.browser.chrome;

	Node.prototype._invalidateParent = function() {
		var oParent = this.getParent();
		if (oParent) {
			oParent.invalidate();
		}
	};

	Node.prototype._isIgnored = function() {
		var oParent = this.getParent(),
			bSwimLane = oParent && oParent._isSwimLane(),
			bIsInCollapsedGroup = this._isInCollapsedGroup();

		// swim lanes always render nodes even in collapsed group due to the layouter needs
		if (bSwimLane && this._isHtml()) {
			bIsInCollapsedGroup = false;
		}

		return bIsInCollapsedGroup || this._isInIgnoredGroup() || !this._useInLayout();
	};

	Node.prototype._getImageSize = function() {
		var fnReturn = function(iWidth, iHeight) {
			return {
				width: iWidth ? parseInt(iWidth, 10) : 0,
				height: iHeight ? parseInt(iHeight, 10) : 0
			};
		};

		var sType = this._isBox() ? "Box" : "Circle",
			oImage = this.getImage();

		if (!this._displayImage(oImage)) {
			return fnReturn();
		}

		return fnReturn(oImage.getWidth() ? oImage.getWidth() : Size.Image[sType],
			oImage.getHeight() ? oImage.getHeight() : Size.Image[sType]);
	};

	Node.prototype._displayImage = function(oImage) {
		oImage = oImage || this.getImage();
		return oImage && oImage.getSrc();
	};

	Node.prototype._isHtml = function() {
		return this.getParent() && this.getParent()._isUseNodeHtml();
	};

	Node.prototype._isInCollapsedGroup = function() {
		return this._oGroup && this._oGroup._isCollapsed();
	};

	Node.prototype._isInIgnoredGroup = function() {
		return this._oGroup && this._oGroup._isIgnored();
	};

	Node.prototype._displayAttributes = function() {
		return this.getVisibleAttributes().length !== 0 && this._isBox();
	};

	Node.prototype._displayDescription = function() {
		return this.getDescriptionLineSize() !== -1 && this.getDescription();
	};

	Node.prototype._hasTitle = function() {
		return this.getTitle() || this.getIcon();
	};

	Node.prototype._isBox = function() {
		return this.getShape() === Shape.Box && this.getParent()._isLayered();
	};

	Node.prototype._isCircle = function() {
		return this.getShape() === Shape.Circle;
	};

	Node.prototype._isCustom = function() {
		return this.getShape() === Shape.Custom;
	};

	Node.prototype._hasChildren = function() {
		return this.aChildren.length > 0;
	};

	Node.prototype._showHeaderCheckBox = function() {
		return this.getHeaderCheckBoxState() !== HeaderCheckboxState.Hidden && this._isBox();
	};

	Node.prototype._hasVisibleChildren = function() {
		// at least one node has to be visible and outside invisible group
		return this.aChildren.some(function(oNode) {
			return !(oNode._oGroup && !oNode._oGroup.getVisible()) && oNode.getVisible();
		});
	};

	Node.prototype._hasDetailData = function() {
		return this.getDescription() || this.getAttributes().length > 0;
	};

	Node.prototype._hasActionLinks = function() {
		return this.getActionLinks().some(function(oLink) {
			return oLink.getVisible();
		});
	};

	Node.prototype._useAutomaticSize = function() {
		return !this.getWidth() && this.getMaxWidth() > 0;
	};

	Node.prototype._getShapeSize = function(bHorizontal) {
		if (this._isCircle()) {
			return this._getCircleSize();
		}

		var iCoreNodeSize = this._isCustom() ? this.getCoreNodeSize() : 0;
		return iCoreNodeSize || (bHorizontal ? this._iWidth : this._iHeight);
	};

	Node.prototype._getCircleSize = function() {
		return this._isBox() ? undefined : this._iCircleSize;
	};

	Node.prototype._hasMultiLineTitle = function() {
		return this._aTitleLines && this._aTitleLines.length > 1;
	};

	Node.prototype._getCirclePosition = function() {
		return this._isBox() ? undefined : {
			x: this.getX() + (this._iWidth - this._getCircleSize()) / 2,
			y: this.getY()
		};
	};

	Node.prototype._isOnScreen = function(iLeft, iRight, iTop, iBottom) {
		var iX = this.getX(),
			iY = this.getY();
		return ElementBase._isRectOnScreen(iX, iX + this._iWidth, iY, iY + this._iHeight, iLeft, iRight, iTop, iBottom);
	};

	Node.prototype.getFocusDomRef = function() {
		return this.getDomRef("wrapper");
	};

	Node.prototype.setVisible = function(sValue) {
		this.setProperty("visible", sValue);

		var oParent = this.getParent();
		if (oParent && oParent._bIsLayedOut) {
			this.getParentNodes().forEach(function(oNode) {
				oNode._bActionButtonsRendered = false;
			});
		}

		return this;
	};

	Node.prototype.setStatusIcon = function(sIcon) {
		var icon = this.$("statusicon")[0],
			oIconObj = IconPool.getIconInfo(sIcon),
			sIconText = oIconObj && oIconObj.content;

		this.$("statusiconwrapper")[sIcon ? "addClass" : "removeClass"]("sapSuiteUiCommonsNetworkNodeInfoWrapperCustomIcon");

		icon && (icon.textContent = sIconText);

		this.setProperty("statusIcon", sIcon, true);

		return this;
	};

	return Node;
});
