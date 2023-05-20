/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.ProcessFlowNode.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'sap/m/Text',
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/IconPool',
	'sap/ui/Device',
	'sap/ui/core/Icon',
	"sap/base/Log",
	"./ProcessFlowNodeRenderer"
], function (jQuery, Text, library, Control, IconPool, Device, Icon, Log, ProcessFlowNodeRenderer) {
	"use strict";

	/**
	 * Constructor for a new ProcessFlowNode.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control enables you to see documents (or other items) in respect to their statuses – positive, negative, neutral, planned, planned negative. In addition to the node title (which can be optionally a hyperlink) also two other text fields are provided and can be filled. The process flow nodes consider all styles depending on the status they are in. The user can update or change the content of the node. The content of the node can be also filtered according to updated data and specific parameters set. This means that also the node’s style is affected.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.ProcessFlowNode
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ProcessFlowNode = Control.extend("sap.suite.ui.commons.ProcessFlowNode", /** @lends sap.suite.ui.commons.ProcessFlowNode.prototype */ {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * The node title.
				 */
				title: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * Specifies if the node title is clickable.
				 * @deprecated Since version 1.26.
				 * According to the new requirement there should be only one click event for each node (click on the whole node – see Press event) that is why titlePress event should not be used any longer. Hence isTitleClickable should not be used either.
				 */
				isTitleClickable: {type: "boolean", group: "Behavior", defaultValue: false, deprecated: true},

				/**
				 * Specifies the assignment of the node to the respective lane.
				 */
				laneId: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * Node identifier.
				 */
				nodeId: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * State of the node.
				 */
				state: {
					type: "sap.suite.ui.commons.ProcessFlowNodeState",
					group: "Appearance",
					defaultValue: "Neutral"
				},

				/**
				 * Type of the node.
				 */
				type: {type: "sap.suite.ui.commons.ProcessFlowNodeType", group: "Appearance", defaultValue: "Single"},

				/**
				 * Defines an array of children of the node.
				 */
				children: {type: "any[]", group: "Misc", defaultValue: null},

				/**
				 * Title abbreviation is used in zoom level 'Three'.
				 */
				titleAbbreviation: {type: "string", group: "Data", defaultValue: null},

				/**
				 * Description of the state, for example "Status OK".
				 */
				stateText: {type: "string", group: "Data", defaultValue: null},

				/**
				 * The property contains the additional texts on the node. The expected type is array of strings. One array must not contain more than two strings. Additional strings in the array will be ignored.
				 */
				texts: {type: "string[]", group: "Misc", defaultValue: null},

				/**
				 * The parameter defines if the node should be displayed in highlighted state.
				 */
				highlighted: {type: "boolean", group: "Appearance", defaultValue: false},

				/**
				 * The parameter defines if the node should be displayed in focus state.
				 */
				focused: {type: "boolean", group: "Appearance", defaultValue: false},

				/**
				 * The user-defined object which is returned back to the user by a node click event.
				 */
				tag: {type: "object", group: "Misc", defaultValue: null},

				/**
				 * The parameter defines if the node should be displayed in selected state.
				 */
				selected: {type: "boolean", group: "Appearance", defaultValue: false}
			},
			aggregations: {
				/**
				 * The node's content used for zoom level 1.
				 * If this aggregation is set, no default content like title and texts is used.
				 * @since 1.50
				 */
				zoomLevelOneContent: {type: "sap.ui.core.Control", multiple: false, group: "Misc"},

				/**
				 * The node's content used for zoom level 2.
				 * If this aggregation is set, no default content like title and texts is used.
				 * @since 1.50
				 */
				zoomLevelTwoContent: {type: "sap.ui.core.Control", multiple: false, group: "Misc"},

				/**
				 * The node's content used for zoom level 3.
				 * If this aggregation is set, no default content like title and texts is used.
				 * @since 1.50
				 */
				zoomLevelThreeContent: {type: "sap.ui.core.Control", multiple: false, group: "Misc"},

				/**
				 * The node's content used for zoom level 4.
				 * If this aggregation is set, no default content like title and texts is used.
				 * @since 1.50
				 */
				zoomLevelFourContent: {type: "sap.ui.core.Control", multiple: false, group: "Misc"},

				/**
				 * ARIA-compliant properties to be added to the control.
				 */
				ariaProperties: {type: "sap.suite.ui.commons.AriaProperties", multiple: false, group: "Misc"}
			},
			associations: {

				/**
				 * Reference to ProcessFlowNodes which appears before this ProcessFlowNode.
				 */
				parents: {type: "sap.suite.ui.commons.ProcessFlowNode", multiple: true, singularName: "parent"}
			},
			events: {
				/**
				 * This event handler is executed when the user clicks the node title. This event is fired only when the title is clickable (isTitleClickable equals true).
				 * @deprecated Since version 1.26.
				 * Should not be used any longer, use Press event instead ( click on the node)
				 */
				titlePress: {
					deprecated: true,
					parameters: {
						/**
						 * The node identification.
						 */
						oEvent: {type: "object"}
					}
				},

				/**
				 * This event is fired when the user clicks on the node. However, this event is not fired if the titlePress event has been fired.
				 * @deprecated Since version 1.50.0. This event is deprecated, use <node>nodePress</code> event instead. See {@link sap.suite.ui.commons.ProcessFlow.html#event:nodePress}.
				 */
				press: {
					parameters: {
						/**
						 * The node identification.
						 */
						oEvent: {type: "object"}
					}
				}
			}
		}
	});

	/* This is a current zoom level for the node. The level of details on the node is derived from this value.*/
	ProcessFlowNode.prototype._zoomLevel = library.ProcessFlowZoomLevel.Two;
	/* The consumer defined object which is returned back to the consumer with node click event.*/
	ProcessFlowNode.prototype._tag = null;
	/* The display state of the node. This property dictates the regular, highlighted, dimmed visual style of the control */
	ProcessFlowNode.prototype._displayState = library.ProcessFlowDisplayState.Regular;
	/* resource bundle for the localized strings */
	ProcessFlowNode.prototype._oResBundle = null;
	/* This property defines the folded corners for the single node control. The values true - means folded corner
	 false/null/undefined - means normal corner
	 */

	ProcessFlowNode.prototype._mergedLaneId = null;
	ProcessFlowNode.prototype._foldedCorner = false;
	ProcessFlowNode.prototype._foldedCornerControl = null;
	ProcessFlowNode.prototype._parent = null;
	ProcessFlowNode.prototype._headerControl = null;
	ProcessFlowNode.prototype._stateTextControl = null;
	ProcessFlowNode.prototype._iconControl = null;
	ProcessFlowNode.prototype._text1Control = null;
	ProcessFlowNode.prototype._text2Control = null;
	ProcessFlowNode.prototype._navigationFocus = false;
	ProcessFlowNode.prototype._sMouseEvents = " mousedown mouseup mouseenter mouseleave ";
	ProcessFlowNode.prototype._sMouseTouchEvents = Device.support.touch ? 'saptouchstart saptouchcancel touchstart touchend' : '';

	ProcessFlowNode.prototype._grabCursorClass = "sapSuiteUiGrabCursorPF";
	ProcessFlowNode.prototype._grabbingCursorClass = "sapSuiteUiGrabbingCursorPF";
	ProcessFlowNode.prototype._nodeHoverClass = "sapSuiteUiCommonsProcessFlowNodeHover";
	ProcessFlowNode.prototype._nodeActiveClass = "sapSuiteUiCommonsProcessFlowNodeActive";
	ProcessFlowNode.prototype._nodePlannedClass = "sapSuiteUiCommonsProcessFlowNodeStatePlanned";
	ProcessFlowNode.prototype._nodePlannedClassIdentifier = "." + ProcessFlowNode.prototype._nodePlannedClass;
	ProcessFlowNode.prototype._nodeFCHoverClass = "sapSuiteUiCommonsProcessFlowFoldedCornerNodeHover";
	ProcessFlowNode.prototype._nodeFCActiveClass = "sapSuiteUiCommonsProcessFlowFoldedCornerNodeActive";
	ProcessFlowNode.prototype._nodeFCIconHoverClass = "sapSuiteUiCommonsProcessFlowFoldedCornerNodeIconHover";
	ProcessFlowNode.prototype._nodeAggregatedClass = "sapSuiteUiCommonsProcessFlowNodeAggregated";
	ProcessFlowNode.prototype._nodeAggregatedHoveredClass = "sapSuiteUiCommonsProcessFlowNodeAggregatedHovered";
	ProcessFlowNode.prototype._nodeAggregatedDimmedClass = "sapSuiteUiCommonsProcessFlowNodeAggregatedDimmed";
	ProcessFlowNode.prototype._nodeAggregatedFocusedClass = "sapSuiteUiCommonsProcessFlowNodeAggregatedFocused";
	ProcessFlowNode.prototype._nodeAggregatedPressedClass = "sapSuiteUiCommonsProcessFlowNodeAggregatedPressed";
	ProcessFlowNode.prototype._nodeAggregatedDimmedPressedClass = "sapSuiteUiCommonsProcessFlowNodeAggregatedDimmedPressed";
	ProcessFlowNode.prototype._nodeAggregatedDimmedHoveredClass = "sapSuiteUiCommonsProcessFlowNodeAggregatedDimmedHovered";
	ProcessFlowNode.prototype._nodeAggregatedClassZoomLevel4 = "sapSuiteUiCommonsProcessFlowNodeAggregatedZoomLevel4";
	ProcessFlowNode.prototype._nodeAggregatedHoveredClassZoomLevel4 = "sapSuiteUiCommonsProcessFlowNodeAggregatedHoveredZoomLevel4";
	ProcessFlowNode.prototype._nodeAggregatedPressedClassZoomLevel4 = "sapSuiteUiCommonsProcessFlowNodeAggregatedPressedZoomLevel4";
	ProcessFlowNode.prototype._nodeAggregatedDimmedClassZoomLevel4 = "sapSuiteUiCommonsProcessFlowNodeAggregatedDimmedZoomLevel4";
	ProcessFlowNode.prototype._nodeAggregatedFocusedClassZoomLevel4 = "sapSuiteUiCommonsProcessFlowNodeAggregatedFocusedZoomLevel4";
	ProcessFlowNode.prototype._nodeAggregatedDimmedPressedClassZoomLevel4 = "sapSuiteUiCommonsProcessFlowNodeAggregatedDimmedPressedZoomLevel4";
	ProcessFlowNode.prototype._nodeAggregatedDimmedHoveredClassZoomLevel4 = "sapSuiteUiCommonsProcessFlowNodeAggregatedDimmedHoveredZoomLevel4";

	/* =========================================================== */
	/* Life-cycle Handling                                         */
	/* =========================================================== */

	/**
	 * ProcessFlowNode initial function
	 */
	ProcessFlowNode.prototype.init = function () {
		IconPool.addIcon("context-menu", "businessSuite", "PFBusinessSuiteInAppSymbols", "e02b", true);
		if (!this._oResBundle) {
			this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
		}
	};

	/**
	 * Destroys all created controls.
	 */
	ProcessFlowNode.prototype.exit = function () {
		if (this._foldedCornerControl) {
			this._foldedCornerControl.destroy();
			this._foldedCornerControl = null;
		}
		if (this._headerControl) {
			this._headerControl.destroy();
			this._headerControl = null;
		}
		if (this._stateTextControl) {
			this._stateTextControl.destroy();
			this._stateTextControl = null;
		}
		if (this._iconControl) {
			this._iconControl.destroy();
			this._iconControl = null;
		}
		if (this._text1Control) {
			this._text1Control.destroy();
			this._text1Control = null;
		}
		if (this._text2Control) {
			this._text2Control.destroy();
			this._text2Control = null;
		}
		this.$().off(this._sMouseEvents, this._handleEvents);
		if (Device.support.touch) {
			this.$().off(this._sMouseTouchEvents, this._handleEvents);
		}
	};

	/**
	 * The event binding must be removed to avoid memory leaks
	 */
	ProcessFlowNode.prototype.onBeforeRendering = function () {
		this.$().off(this._sMouseEvents, this._handleEvents);
		if (Device.support.touch) {
			this.$().off(this._sMouseTouchEvents, this._handleEvents);
		}
	};

	/**
	 * Handles the onAfterRendering event.
	 */
	ProcessFlowNode.prototype.onAfterRendering = function () {
		this._sMouseEvents = this._sMouseEvents.concat(' ', this._sMouseTouchEvents);
		this.$().bind(this._sMouseEvents, jQuery.proxy(this._handleEvents, this));
	};

	/* =========================================================== */
	/* Event Handling                                              */
	/* =========================================================== */

	/**
	 * Handles the click event.
	 *
	 * @private
	 * @param {sap.ui.base.Event} oEvent The sap.ui.base event object.
	 */
	ProcessFlowNode.prototype._handleClick = function (oEvent) {
		if (this._parent && this._parent._bHighlightedMode &&
			this._getDisplayState() === library.ProcessFlowDisplayState.Dimmed ||
			this._getDisplayState() === library.ProcessFlowDisplayState.DimmedFocused) {
			Log.info("Event ignored, node in dimmed state.");
		} else if (this._parent) {
		// Changes the focus from previous node to the current one.
			this.getParent()._changeNavigationFocus(this.getParent()._getLastNavigationFocusElement(), this);
			// If the ID includes 'title', it is a title click event.
			if (oEvent.target.id.indexOf("title") >= 0 && this.getIsTitleClickable()) {
				this._parent.fireNodeTitlePress(this);
			} else {
				this._parent.fireNodePress(this);
			}

		}
		if (oEvent && !oEvent.isPropagationStopped()) {
			oEvent.stopPropagation();
		}
		if (oEvent && !oEvent.isImmediatePropagationStopped()) {
			oEvent.stopImmediatePropagation();
		}
	};


	/**
	 * Handles the onClick event.
	 *
	 * @private
	 * @param {sap.ui.base.Event} oEvent The sap.ui.base event object.
	 */
	ProcessFlowNode.prototype.onclick = function (oEvent) {
		if (oEvent && !oEvent.isDefaultPrevented()) {
			oEvent.preventDefault();
		}
		this._handleClick(oEvent);
	};

	/**
	 * General event handler.
	 *
	 * @private
	 * @param {sap.ui.base.Event} oEvent The sap.ui.base event object.
	 */
	ProcessFlowNode.prototype._handleEvents = function (oEvent) {
		var $ThisChildren = this.$().find('*');
		var $ThisAttribute = this.$().attr('id');
		var isFoldedCorner = this._getFoldedCorner();
		var oScrollContainer = this.getParent();
		var $ThisChildrenHoverBG = $ThisChildren.not('.sapUiIconTitle');

		if (oEvent && !oEvent.isDefaultPrevented()) {
			oEvent.preventDefault();
		}
		//If the node is dimmed and other nodes are highlighted, it should be inactive and should not get hover and active class
		if (this._parent && this._parent._bHighlightedMode && this._getDimmed()) {
			return;
		}
		// If the node is aggregated, adjust the CSS classes for aggregated nodes
		if (this.getType() === library.ProcessFlowNodeType.Aggregated) {
			this._adjustClassesForAggregation(oEvent);
		}

		var oProcessFlowClass = sap.ui.require("sap/suite/ui/commons/ProcessFlow");
		if (!oProcessFlowClass) {
			return;
		}

		function escapeId(sId) {
			return sId.replace(/([:.\[\],=@])/g, "\\$1");
		}

		switch (oEvent.type) {
			case oProcessFlowClass._mouseEvents.mouseDown:
			case "keydown":
				this.$().removeClass(this._nodeHoverClass).addClass(this._nodeActiveClass);
				$ThisChildren.removeClass(this._nodeHoverClass);
				$ThisChildrenHoverBG.addClass(this._nodeActiveClass);
				if (isFoldedCorner) {
					jQuery(document.getElementById($ThisAttribute)).removeClass(this._nodeFCHoverClass + ' ' + this._nodeActiveClass).addClass(this._nodeFCActiveClass);
					jQuery('div[id^=' + escapeId($ThisAttribute) + '][id$=-corner-container]').removeClass(this._nodeFCIconHoverClass + ' ' + this._nodeActiveClass).addClass(this._nodeFCActiveClass);
					jQuery('span[id^=' + escapeId($ThisAttribute) + '][id$=-corner-icon]').removeClass(this._nodeFCIconHoverClass + ' ' + this._nodeActiveClass).addClass(this._nodeFCActiveClass);
				}
				break;
			case oProcessFlowClass._mouseEvents.mouseUp:
				if (oScrollContainer.$().hasClass(this._grabbingCursorClass)) {
					oScrollContainer.$().removeClass(this._grabbingCursorClass);
				}
				this.$().removeClass(this._nodeActiveClass).addClass(this._nodeHoverClass);
				$ThisChildren.removeClass(this._nodeActiveClass).addClass(this._nodeHoverClass);
				if (isFoldedCorner) {
					jQuery(document.getElementById($ThisAttribute)).removeClass(this._nodeHoverClass + ' ' + this._nodeFCActiveClass).addClass(this._nodeFCHoverClass);
					jQuery('div[id^=' + escapeId($ThisAttribute) + '][id$=-corner-container]').removeClass(this._nodeHoverClass + ' ' + this._nodeFCActiveClass).addClass(this._nodeFCIconHoverClass);
					jQuery('span[id^=' + escapeId($ThisAttribute) + '][id$=-corner-icon]').removeClass(this._nodeHoverClass + ' ' + this._nodeFCActiveClass).addClass(this._nodeFCIconHoverClass);
				}
				break;
			case oProcessFlowClass._mouseEvents.mouseEnter:
				/* in case the cursor is in the "grabbing" state ( the user is scrolling and comes over the node) the cursor's state should not be changed to the pointer */
				if (!oScrollContainer.$().hasClass(this._grabbingCursorClass)) {
					this.$().addClass(this._nodeHoverClass);
					$ThisChildrenHoverBG.addClass(this._nodeHoverClass);
					this.$().find(this._nodePlannedClassIdentifier).find("*").addClass(this._nodePlannedClass);
					if (isFoldedCorner) {
						jQuery(document.getElementById($ThisAttribute)).removeClass(this._nodeHoverClass).addClass(this._nodeFCHoverClass);
						jQuery('div[id^=' + escapeId($ThisAttribute) + '][id$=-corner-container]').removeClass(this._nodeHoverClass).addClass(this._nodeFCIconHoverClass);
						jQuery('span[id^=' + escapeId($ThisAttribute) + '][id$=-corner-icon]').removeClass(this._nodeHoverClass).addClass(this._nodeFCIconHoverClass);
					}
				}
				break;
			case oProcessFlowClass._mouseEvents.mouseLeave:
			case "keyup":
				this.$().removeClass(this._nodeActiveClass + ' ' + this._nodeHoverClass);
				$ThisChildren.removeClass(this._nodeActiveClass + ' ' + this._nodeHoverClass);
				if (isFoldedCorner) {
					jQuery(document.getElementById($ThisAttribute)).removeClass(this._nodeFCActiveClass + ' ' + this._nodeFCHoverClass);
					jQuery('div[id^=' + escapeId($ThisAttribute) + '][id$=-corner-container]').removeClass(this._nodeFCActiveClass + ' ' + this._nodeFCIconHoverClass);
					jQuery('span[id^=' + escapeId($ThisAttribute) + '][id$=-corner-icon]').removeClass(this._nodeFCActiveClass + ' ' + this._nodeFCIconHoverClass);
				}
				if (!oScrollContainer.$().hasClass(this._grabbingCursorClass)) {
					oScrollContainer.$().addClass(this._grabCursorClass);
				}
				break;
			case oProcessFlowClass._mouseEvents.touchStart:
				if (Device.support.touch) {
					this.$().addClass(this._nodeActiveClass);
					$ThisChildrenHoverBG.addClass(this._nodeActiveClass);
					if (isFoldedCorner) {
						jQuery(document.getElementById($ThisAttribute)).removeClass(this._nodeActiveClass).addClass(this._nodeFCActiveClass);
						jQuery('div[id^=' + escapeId($ThisAttribute) + '][id$=-corner-container]').removeClass(this._nodeActiveClass).addClass(this._nodeFCActiveClass);
						jQuery('span[id^=' + escapeId($ThisAttribute) + '][id$=-corner-icon]').removeClass(this._nodeActiveClass).addClass(this._nodeFCActiveClass);
					}
				}
				break;
			case oProcessFlowClass._mouseEvents.sapTouchStart:
				this.$().removeClass(this._nodeHoverClass).addClass(this._nodeActiveClass);
				$ThisChildren.removeClass(this._nodeHoverClass);
				$ThisChildrenHoverBG.addClass(this._nodeActiveClass);
				if (isFoldedCorner) {
					jQuery(document.getElementById($ThisAttribute)).removeClass(this._nodeFCHoverClass + ' ' + this._nodeActiveClass).addClass(this._nodeFCActiveClass);
					jQuery('div[id^=' + escapeId($ThisAttribute) + '][id$=-corner-container]').removeClass(this._nodeFCIconHoverClass + ' ' + this._nodeActiveClass).addClass(this._nodeFCActiveClass);
					jQuery('span[id^=' + escapeId($ThisAttribute) + '][id$=-corner-icon]').removeClass(this._nodeFCIconHoverClass + ' ' + this._nodeActiveClass).addClass(this._nodeFCActiveClass);
				}
				break;
			case oProcessFlowClass._mouseEvents.touchEnd:
				if (Device.support.touch) {
					this.$().removeClass(this._nodeActiveClass + ' ' + this._nodeHoverClass);
					$ThisChildren.removeClass(this._nodeActiveClass + ' ' + this._nodeHoverClass);
					if (isFoldedCorner) {
						jQuery(document.getElementById($ThisAttribute)).removeClass(this._nodeFCActiveClass + ' ' + this._nodeFCHoverClass);
						jQuery('div[id^=' + escapeId($ThisAttribute) + '][id$=-corner-container]').removeClass(this._nodeFCActiveClass + ' ' + this._nodeFCIconHoverClass);
						jQuery('span[id^=' + escapeId($ThisAttribute) + '][id$=-corner-icon]').removeClass(this._nodeFCActiveClass + ' ' + this._nodeFCIconHoverClass);
					}
				}
				this._handleClick(oEvent);
				break;
			case oProcessFlowClass._mouseEvents.sapTouchCancel:
				this.$().removeClass(this._nodeActiveClass).addClass(this._nodeHoverClass);
				$ThisChildren.removeClass(this._nodeActiveClass).addClass(this._nodeHoverClass);
				if (isFoldedCorner) {
					jQuery(document.getElementById($ThisAttribute)).removeClass(this._nodeFCActiveClass + ' ' + this._nodeHoverClass).addClass(this._nodeFCHoverClass);
					jQuery('div[id^=' + escapeId($ThisAttribute) + '][id$=-corner-container]').removeClass(this._nodeFCActiveClass + ' ' + this._nodeHoverClass).addClass(this._nodeFCIconHoverClass);
					jQuery('span[id^=' + escapeId($ThisAttribute) + '][id$=-corner-icon]').removeClass(this._nodeFCActiveClass + ' ' + this._nodeHoverClass).addClass(this._nodeFCIconHoverClass);
				}
				break;
			default:
				break;
		}
	};

	/* =========================================================== */
	/* Getter/Setter private methods                               */
	/* =========================================================== */

	/**
	 * Sets the artificial laneId of a merged lane as hidden property. If it's not set here, the property is false.
	 *
	 * @private
	 * @param {string} laneId ID of the lane
	 */
	ProcessFlowNode.prototype._setMergedLaneId = function (laneId) {
		this._mergedLaneId = laneId;
	};

	/**
	 * Setter for the parent flow control. It is used to propagate the onNodeTitlePresses event.
	 *
	 * @private
	 * @param {sap.suite.ui.commons.ProcessFlow} oControl The parent ProcessFlow control instance
	 */
	ProcessFlowNode.prototype._setParentFlow = function (oControl) {
		this._parent = oControl;
	};

	/**
	 * Getter for folded corner
	 *
	 * @private
	 * @returns {sap.ui.core.Icon} The folded corner icon
	 */
	ProcessFlowNode.prototype._getFoldedCornerControl = function () {
		if (this._foldedCornerControl) {
			this._foldedCornerControl.destroy();
		}
		this._foldedCornerControl = new Icon({
			id: this.getId() + "-corner-icon",
			src: IconPool.getIconURI("context-menu", "businessSuite"),
			visible: true
		});
		if (this._parent && !this._parent._bHighlightedMode || !this._getDimmed()) {
			this._foldedCornerControl.addStyleClass("sapUiIconPointer");
		}

		switch (this._getZoomLevel()) {
			case library.ProcessFlowZoomLevel.One:
				this._foldedCornerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode1ZoomLevel1");
				break;
			case library.ProcessFlowZoomLevel.Two:
				this._foldedCornerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode1ZoomLevel2");
				break;
			case library.ProcessFlowZoomLevel.Three:
				this._foldedCornerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode1ZoomLevel3");
				break;
			case library.ProcessFlowZoomLevel.Four:
				this._foldedCornerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode1ZoomLevel4");
				break;
			default:
				break;
		}
		this._foldedCornerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode1");

		return this._foldedCornerControl;
	};

	/**
	 * Gets header control.
	 *
	 * @private
	 * @returns {sap.m.Text} The new header text instance
	 */
	ProcessFlowNode.prototype._getHeaderControl = function () { // EXC_SAP_006_1
		if (this._headerControl) {
			this._headerControl.destroy();
		}

		var iLinesCount = 0;
		var sWidth = "";
		var bVisible = true;
		var sText = this.getTitle();

		switch (this._getZoomLevel()) {
			case library.ProcessFlowZoomLevel.One:
				iLinesCount = 3;
				break;
			case library.ProcessFlowZoomLevel.Two:
				iLinesCount = 3;
				break;
			case library.ProcessFlowZoomLevel.Three:
				iLinesCount = 2;
				sText = this.getTitleAbbreviation();
				break;
			case library.ProcessFlowZoomLevel.Four:
				sText = "";
				iLinesCount = 0;
				sWidth = "0px";
				bVisible = false;
				break;
			default:
				break;
		}
		this._headerControl = new Text({
			id: this.getId() + "-nodeid-anchor-title",
			text: sText,
			visible: bVisible,
			wrapping: true,
			wrappingType: sap.m.WrappingType.Hyphenated,
			width: sWidth,
			maxLines: iLinesCount
		});
		if (this.getIsTitleClickable()) {
			this._headerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TitleClickable");
		}
		switch (this._getZoomLevel()) {
			case library.ProcessFlowZoomLevel.One:
				this._headerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TitleZoomLevel1");
				break;
			case library.ProcessFlowZoomLevel.Two:
				this._headerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TitleZoomLevel2");
				break;
			case library.ProcessFlowZoomLevel.Three:
				this._headerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TitleZoomLevel3");
				break;
			case library.ProcessFlowZoomLevel.Four:
				this._headerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TitleZoomLevel4");
				break;
			default:
				break;
		}
		this._headerControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3Title");
		return this._headerControl;
	};

	/**
	 * Gets icon control.
	 *
	 * @private
	 * @returns {sap.ui.core.Icon} The new icon instance
	 */
	ProcessFlowNode.prototype._getIconControl = function () { // EXC_SAP_006_1
		if (this._iconControl) {
			this._iconControl.destroy();
		}
		var sSrc = null;
		var bVisible = true;

		// request (Dec 2014): display icon even when there's no stateText
		switch (this.getState()) {
			case library.ProcessFlowNodeState.Positive:
				sSrc = "sap-icon://message-success";
				break;
			case library.ProcessFlowNodeState.Negative:
			case library.ProcessFlowNodeState.PlannedNegative:
				sSrc = "sap-icon://message-error";
				break;
			case library.ProcessFlowNodeState.Planned:
				sSrc = null; // latest request: do not display state icon, was "sap-icon://to-be-reviewed"
				break;
			case library.ProcessFlowNodeState.Neutral:
				sSrc = "sap-icon://process";
				break;
			case library.ProcessFlowNodeState.Critical:
				sSrc = "sap-icon://message-warning";
				break;
			default:
				break;
		}
		this._iconControl = new Icon({
			id: this.getId() + "-icon",
			src: sSrc,
			visible: bVisible
		});
		if (this._parent && !this._parent._bHighlightedMode || !this._getDimmed()) {
			this._iconControl.addStyleClass("sapUiIconPointer");
		}

		// correct RTL behaviour for state icon
		var bRtl = sap.ui.getCore().getConfiguration().getRTL();

		if (bRtl) {
			this._iconControl.addStyleClass("sapUiIconSuppressMirrorInRTL");
		}
		switch (this._getZoomLevel()) {
			case library.ProcessFlowZoomLevel.One:
			case library.ProcessFlowZoomLevel.Two:
				var sIconAlignStyle = "sapSuiteUiCommonsProcessFlowNode3StateIconLeft";

				if (bRtl) {
					sIconAlignStyle = "sapSuiteUiCommonsProcessFlowNode3StateIconRight";
				}
				this._iconControl.addStyleClass(sIconAlignStyle);
				break;
			case library.ProcessFlowZoomLevel.Three:
			case library.ProcessFlowZoomLevel.Four:
				this._iconControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateIconCenter");
				break;
			default:
				break;
		}
		switch (this._getZoomLevel()) {
			case library.ProcessFlowZoomLevel.One:
				this._iconControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateIconZoomLevel1");
				break;
			case library.ProcessFlowZoomLevel.Two:
				this._iconControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateIconZoomLevel2");
				break;
			case library.ProcessFlowZoomLevel.Three:
				this._iconControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateIconZoomLevel3");
				break;
			case library.ProcessFlowZoomLevel.Four:
				this._iconControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateIconZoomLevel4");
				break;
			default:
				break;
		}
		this._iconControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateIcon");
		return this._iconControl;
	};

	/**
	 * Gets state text control.
	 *
	 * @private
	 * @returns {sap.m.Text} The new state text instance
	 */
	ProcessFlowNode.prototype._getStateTextControl = function () { // EXC_SAP_006_1, EXC_JSHINT_047
		if (this._stateTextControl) {
			this._stateTextControl.destroy();
		}
		var iLinesCount = 2;
		var sWidth = "";
		var bVisible = true;
		var oState = this.getState();
		var sText = (oState === library.ProcessFlowNodeState.Planned) ? "" : this.getStateText(); // latest request: do not display state text for planned state
		if (oState === library.ProcessFlowNodeState.PlannedNegative && sText.length === 0) {
			//set default status text for status PlannedNegative when no text is provided
			sText = "Planned Negative";
		}
		// number of lines
		switch (this._getZoomLevel()) {
			case library.ProcessFlowZoomLevel.One:
			case library.ProcessFlowZoomLevel.Two:
			case library.ProcessFlowZoomLevel.Three:
				iLinesCount = 2;
				break;
			case library.ProcessFlowZoomLevel.Four:
				sText = "";
				iLinesCount = 0;
				sWidth = "0px";
				bVisible = false;
				break;
			default:
				break;
		}
		this._stateTextControl = new Text({
			id: this.getId() + "-stateText",
			text: sText,
			visible: bVisible,
			wrapping: true,
			wrappingType: sap.m.WrappingType.Hyphenated,
			width: sWidth,
			maxLines: iLinesCount
		});
		switch (oState) {
			case library.ProcessFlowNodeState.Positive:
				this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StatePositive");
				break;
			case library.ProcessFlowNodeState.Negative:
				this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNodeStateNegative");
				break;
			case library.ProcessFlowNodeState.Planned:
				this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StatePlanned");
				break;
			case library.ProcessFlowNodeState.Neutral:
				this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateNeutral");
				break;
			case library.ProcessFlowNodeState.PlannedNegative:
				this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StatePlanned");
				break;
			case library.ProcessFlowNodeState.Critical:
				this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateCritical");
				break;
			default:
				break;
		}
		switch (this._getZoomLevel()) {
			case library.ProcessFlowZoomLevel.One:
				this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateTextZoomLevel1");
				break;
			case library.ProcessFlowZoomLevel.Two:
				this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateTextZoomLevel2");
				break;
			case library.ProcessFlowZoomLevel.Three:
				this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateTextZoomLevel3");
				break;
			case library.ProcessFlowZoomLevel.Four:
				this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateTextZoomLevel4");
				break;
			default:
				break;
		}
		this._stateTextControl.addStyleClass("sapSuiteUiCommonsProcessFlowNode3StateText");
		return this._stateTextControl;
	};

	/**
	 * Gets zoom level.
	 *
	 * @private
	 * @returns {string} zoomLevel The node's zoom level
	 */
	ProcessFlowNode.prototype._getZoomLevel = function () {
		return this._zoomLevel;
	};

	/**
	 * Sets zoom level.
	 *
	 * @private
	 * @param {string} zoomLevel The new zoom level to be set
	 */
	ProcessFlowNode.prototype._setZoomLevel = function (zoomLevel) {
		this._zoomLevel = zoomLevel;
	};

	/**
	 * Sets zoom level.
	 *
	 * @private
	 * @param {Object} navigationFocus The new navigation focus
	 */
	ProcessFlowNode.prototype._setNavigationFocus = function (navigationFocus) {
		this._navigationFocus = navigationFocus;
	};

	/**
	 * Sets zoom level.
	 *
	 * @private
	 * @returns {Object} The navigation focus of the ProcessFlowNode
	 */
	ProcessFlowNode.prototype._getNavigationFocus = function () {
		return this._navigationFocus;
	};

	/**
	 * Sets folded corner.
	 *
	 * @private
	 * @param {boolean} foldedCorner Whether a folded corner is to be used or not
	 */
	ProcessFlowNode.prototype._setFoldedCorner = function (foldedCorner) {
		this._foldedCorner = foldedCorner;
	};

	/**
	 * Gets folded corner.
	 *
	 * @private
	 * @returns {boolean} True if folded corners are used, otherwise false
	 */
	ProcessFlowNode.prototype._getFoldedCorner = function () {
		return this._foldedCorner;
	};

	/**
	 * Sets tag.
	 *
	 * @private
	 * @param {object} newTag The new tag
	 */
	ProcessFlowNode.prototype._setTag = function (newTag) {
		this._tag = newTag;
	};

	/**
	 * Gets tag.
	 *
	 * @private
	 * @returns {object} The current tag
	 */
	ProcessFlowNode.prototype._getTag = function () {
		return this._tag;
	};

	/**
	 * Sets to dimmed state.
	 *
	 * @private
	 */
	ProcessFlowNode.prototype._setDimmedState = function () {
		var bIsFocused = this.getFocused();
		var bIsHighlighted = this.getHighlighted();
		var bIsSelected = this.getSelected();

		if (bIsHighlighted || bIsSelected) {
			throw new Error("Cannot set highlighed or selected node to dimmed state" + this.getNodeId());
		}
		this._displayState = library.ProcessFlowDisplayState.Dimmed;

		if (bIsFocused) {
			this._displayState = library.ProcessFlowDisplayState.DimmedFocused;
		}
	};

	/**
	 * Sets the highlighted nodes to the regular state.
	 *
	 * @private
	 */
	ProcessFlowNode.prototype._setRegularState = function () {
		this._displayState = library.ProcessFlowDisplayState.Regular;
	};

	/**
	 * Returns the lane of current ProcessFlowNode.
	 *
	 * @private
	 * @returns {sap.suite.ui.commons.ProcessFlowLaneHeader} lane of current node
	 */
	ProcessFlowNode.prototype._getLane = function () {
		var oProcessFlow = this.getParent();
		var oLane = null;
		if (oProcessFlow) {
			oLane = oProcessFlow._getLane(this.getLaneId());
		}
		return oLane;
	};

	/**
	 * Returns a value that indicates if the current node is dimmed or not.
	 *
	 * @private
	 * @returns {boolean} true if the current node is dimmed, false if the current node is not dimmed
	 */
	ProcessFlowNode.prototype._getDimmed = function () {
		return this._displayState === library.ProcessFlowDisplayState.Dimmed ||
			this._displayState === library.ProcessFlowDisplayState.DimmedFocused;
	};

	/* =========================================================== */
	/* Helper methods                                              */
	/* =========================================================== */

	/**
	 * Returns the ARIA details text for the current Process Flow Node.
	 *
	 * @private
	 * @returns {string} ARIA details
	 */
	ProcessFlowNode.prototype._getAriaText = function () {
		var iParentsCount = this.getParents().length;
		var oCustomContent = this._getCurrentZoomLevelContent();

		var iChildrenCount = 0;
		if (this._hasChildren()) {
			iChildrenCount = this.getChildren().length;
		}

		var sLaneText = "";
		var oLane = this._getLane();
		if (oLane) {
			sLaneText = oLane.getText();
			if (!sLaneText) {
				sLaneText = this._oResBundle.getText('PF_VALUE_UNDEFINED');
			}
		}

		var sContentText = "";
		var contentTexts = this.getTexts();
		if (contentTexts) {
			for (var i in contentTexts) {
				if (contentTexts[i]) {
					var valueText = contentTexts[i].concat(", ");
					sContentText = sContentText.concat(valueText);
				}
			}
			//Removes the last character which is a ' '
			sContentText = sContentText.slice(0, -1);
		}

		var sTitleText = this.getTitle();
		if (!sTitleText && !oCustomContent) {
			sTitleText = this._oResBundle.getText('PF_VALUE_UNDEFINED');
		}

		var sStateValueText = this.getState();
		if (!sStateValueText) {
			sStateValueText = this._oResBundle.getText('PF_VALUE_UNDEFINED');
		}

		var sStateText = this.getStateText();
		if (this.getState() === library.ProcessFlowNodeState.Planned) {
			sStateText = "";
		}

		var sAggregatedText = "";
		if (this.getType() === library.ProcessFlowNodeType.Aggregated) {
			sAggregatedText = this._oResBundle.getText("PF_ARIA_TYPE");
		}

		return this._oResBundle.getText('PF_ARIA_NODE', [sTitleText, sStateValueText, sStateText, sLaneText, sContentText, iParentsCount, iChildrenCount, sAggregatedText]);
	};

	/**
	 * Based on the focused and highlighted property, we define the display state.
	 *
	 * @private
	 * @returns {sap.suite.ui.commons.ProcessFlowDisplayState} The current display state of the node
	 */
	ProcessFlowNode.prototype._getDisplayState = function () {
		var bIsFocused = this.getFocused();
		var bIsHighlighted = this.getHighlighted();
		var bIsSelected = this.getSelected();

		//Dimmed is set externally via _setDimmedState function
		if (this._displayState === library.ProcessFlowDisplayState.Dimmed ||
			this._displayState === library.ProcessFlowDisplayState.DimmedFocused) {
			return this._displayState;
		}

		if (bIsSelected) {
			if (bIsHighlighted) {
				if (bIsFocused) {
					this._displayState = library.ProcessFlowDisplayState.SelectedHighlightedFocused;
				} else {
					this._displayState = library.ProcessFlowDisplayState.SelectedHighlighted;
				}
			} else if (bIsFocused) {
				this._displayState = library.ProcessFlowDisplayState.SelectedFocused;
			} else {
				this._displayState = library.ProcessFlowDisplayState.Selected;
			}
		} else if (bIsFocused && bIsHighlighted) {
			this._displayState = library.ProcessFlowDisplayState.HighlightedFocused;
		} else if (bIsFocused) {
			this._displayState = library.ProcessFlowDisplayState.RegularFocused;
		} else if (bIsHighlighted) {
			this._displayState = library.ProcessFlowDisplayState.Highlighted;
		} else if (this._displayState === library.ProcessFlowDisplayState.HighlightedFocused ||
			this._displayState === library.ProcessFlowDisplayState.RegularFocused ||
			this._displayState === library.ProcessFlowDisplayState.Highlighted ||
			this._displayState === library.ProcessFlowDisplayState.Selected) {
			// It cannot stay in focused or highlighted mode if there is no such flag.
			this._setRegularState();
		}

		return this._displayState;
	};

	/**
	 * creates internal text control.
	 *
	 * @private
	 * @param {string} textId The ID of the text control
	 * @param {string} textToDisplay The text to display
	 * @param {sap.m.Text} oControl A reference to an existing control instance
	 * @returns {sap.m.Text} The newly created control instance
	 */
	ProcessFlowNode.prototype._createTextControlInternal = function (textId, textToDisplay, oControl) {
		if (oControl) {
			oControl.destroy();
		}

		var iLinesCount = 2;
		var sWidth = "";
		var bVisible = true;
		var sText = textToDisplay;

		switch (this._getZoomLevel()) {
			case library.ProcessFlowZoomLevel.One:
			case library.ProcessFlowZoomLevel.Two:
				iLinesCount = 2;
				break;
			case library.ProcessFlowZoomLevel.Three:
				iLinesCount = 0;
				sWidth = "0px";
				bVisible = false;
				break;
			case library.ProcessFlowZoomLevel.Four:
				sText = "";
				iLinesCount = 0;
				sWidth = "0px";
				bVisible = false;
				break;
			default:
				break;
		}
		if (this.getState) {
			oControl = new Text({
				id: this.getId() + textId,
				text: sText,
				visible: bVisible,
				wrapping: true,
				wrappingType: sap.m.WrappingType.Hyphenated,
				width: sWidth,
				maxLines: iLinesCount
			});
		}
		return oControl;
	};

	/**
	 * creates text1 control.
	 *
	 * @private
	 * @returns {sap.m.Text} The internally created text control
	 */
	ProcessFlowNode.prototype._createText1Control = function () {
		var sTextToDisplay = this.getTexts();

		if (sTextToDisplay && sTextToDisplay.length > 0) {
			sTextToDisplay = sTextToDisplay[0];
		}
		this._text1Control = this._createTextControlInternal("-text1-control", sTextToDisplay, this._text1Control);

		switch (this._getZoomLevel()) {
			case library.ProcessFlowZoomLevel.One:
				this._text1Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextWithGapZoomLevel1");
				this._text1Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel1");
				break;
			case library.ProcessFlowZoomLevel.Two:
				this._text1Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextWithGapZoomLevel2");
				this._text1Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel2");
				break;
			case library.ProcessFlowZoomLevel.Three:
				this._text1Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel3");
				break;
			case library.ProcessFlowZoomLevel.Four:
				this._text1Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel4");
				break;
			default:
				break;
		}
		this._text1Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3Text");
		return this._text1Control;
	};

	/**
	 * creates text2 control.
	 *
	 * @private
	 * @returns {sap.m.Text} The internally created text control
	 */
	ProcessFlowNode.prototype._createText2Control = function () {
		var sTextToDisplay = this.getTexts();

		if (sTextToDisplay && sTextToDisplay.length > 1) {
			sTextToDisplay = sTextToDisplay[1];
		} else {
			sTextToDisplay = "";
		}
		this._text2Control = this._createTextControlInternal("-text2-control", sTextToDisplay, this._text2Control);

		switch (this._getZoomLevel()) {
			case library.ProcessFlowZoomLevel.One:
				this._text2Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel1");
				break;
			case library.ProcessFlowZoomLevel.Two:
				this._text2Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel2");
				break;
			case library.ProcessFlowZoomLevel.Three:
				this._text2Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel3");
				break;
			case library.ProcessFlowZoomLevel.Four:
				this._text2Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel4");
				break;
			default:
				break;
		}
		this._text2Control.addStyleClass("sapSuiteUiCommonsProcessFlowNode3Text");
		return this._text2Control;
	};

	/**
	 * Adds/removes the CSS classes for aggregated nodes for each type of event.
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The jQuery event object.
	 */
	ProcessFlowNode.prototype._adjustClassesForAggregation = function (oEvent) {
		// List with the focused states
		var aFocusedStates = [library.ProcessFlowDisplayState.RegularFocused,
			library.ProcessFlowDisplayState.HighlightedFocused,
			library.ProcessFlowDisplayState.DimmedFocused];
		// List with the dimmed states
		var aDimmedStates = [library.ProcessFlowDisplayState.DimmedFocused,
			library.ProcessFlowDisplayState.Dimmed];

		var oProcessFlowClass = sap.ui.require("sap/suite/ui/commons/ProcessFlow");
		if (!oProcessFlowClass) {
			return;
		}

		switch (oEvent.type) {
			case oProcessFlowClass._mouseEvents.mouseDown:
			case oProcessFlowClass._mouseEvents.touchStart:
			case oProcessFlowClass._mouseEvents.sapTouchStart:
				addAggregatedPressedClasses(this);
				break;
			case oProcessFlowClass._mouseEvents.mouseUp:
				removeAggregatedPressedClasses(this);
				break;
			case oProcessFlowClass._mouseEvents.sapTouchCancel:
			case oProcessFlowClass._mouseEvents.touchEnd:
				removeAggregatedPressedClasses(this);
				removeAggregatedHoveredClasses(this);
				break;
			case oProcessFlowClass._mouseEvents.mouseEnter:
				addAggregatedHoveredClasses(this);
				break;
			case oProcessFlowClass._mouseEvents.mouseLeave:
				removeAggregatedPressedClasses(this);
				removeAggregatedHoveredClasses(this);
				break;
			default:
				break;
		}

		/**
		 * Adds the CSS classes for pressed status (mouse down).
		 * @param {sap.ui.core.Control} that The instance the classes are to be added to
		 */
		function addAggregatedPressedClasses(that) {
			if (that._getZoomLevel() === library.ProcessFlowZoomLevel.Four) {
				// If the node is dimmed
				if (aDimmedStates && (Array.prototype.indexOf.call(aDimmedStates, that._getDisplayState())) >= 0) {
					that.$().removeClass(that._nodeAggregatedDimmedHoveredClassZoomLevel4).addClass(that._nodeAggregatedDimmedPressedClassZoomLevel4);
				} else {
					that.$().removeClass(that._nodeAggregatedClassZoomLevel4).removeClass(that._nodeAggregatedHoveredClassZoomLevel4).addClass(that._nodeAggregatedPressedClassZoomLevel4);
				}
				// If the node is dimmed
			} else if (aDimmedStates && (Array.prototype.indexOf.call(aDimmedStates, that._getDisplayState())) >= 0) {
				that.$().removeClass(that._nodeAggregatedDimmedHoveredClass).addClass(that._nodeAggregatedDimmedPressedClass);
			} else {
				that.$().removeClass(that._nodeAggregatedClass).removeClass(that._nodeAggregatedHoveredClass).addClass(that._nodeAggregatedPressedClass);
			}
		}

		/**
		 * Removes the CSS classes for pressed status (mouse up or mouse leave).
		 * @param {sap.ui.core.Control} that The instance the classes are to be removed from
		 */
		function removeAggregatedPressedClasses(that) {
			// If the node is focused
			if (aFocusedStates && (Array.prototype.indexOf.call(aFocusedStates, that._getDisplayState())) >= 0 && (that.$().hasClass(that._nodeAggregatedPressedClass) || that.$().hasClass(that._nodeAggregatedPressedClassZoomLevel4))) {
				if (that._getZoomLevel() === library.ProcessFlowZoomLevel.Four) {
					that.$().removeClass(that._nodeAggregatedPressedClassZoomLevel4).addClass(that._nodeAggregatedFocusedClassZoomLevel4);
				} else {
					that.$().removeClass(that._nodeAggregatedPressedClass).addClass(that._nodeAggregatedFocusedClass);
				}
			} else if (that.$().hasClass(that._nodeAggregatedDimmedPressedClass) || that.$().hasClass(that._nodeAggregatedDimmedPressedClassZoomLevel4)) {
				// If the node is dimmed
				if (that._getZoomLevel() === library.ProcessFlowZoomLevel.Four) {
					that.$().removeClass(that._nodeAggregatedDimmedPressedClassZoomLevel4).addClass(that._nodeAggregatedDimmedHoveredClassZoomLevel4);
				} else {
					that.$().removeClass(that._nodeAggregatedDimmedPressedClass).addClass(that._nodeAggregatedDimmedHoveredClass);
				}
			} else if (that.$().hasClass(that._nodeAggregatedPressedClass) || that.$().hasClass(that._nodeAggregatedPressedClassZoomLevel4)) {
				// If the node is in regular state
				if (that._getZoomLevel() === library.ProcessFlowZoomLevel.Four) {
					that.$().removeClass(that._nodeAggregatedPressedClassZoomLevel4).addClass(that._nodeAggregatedClassZoomLevel4);
				} else {
					that.$().removeClass(that._nodeAggregatedPressedClass).addClass(that._nodeAggregatedClass);
				}
			}
		}

		/**
		 * Adds the CSS classes for hovered status (mouse-enter).
		 * @param {sap.ui.core.Control} that The instance the classes are to be added to
		 */
		function addAggregatedHoveredClasses(that) {
			// If the node is dimmed
			if (aDimmedStates && (Array.prototype.indexOf.call(aDimmedStates, that._getDisplayState())) >= 0) {
				if (that._getZoomLevel() === library.ProcessFlowZoomLevel.Four) {
					that.$().removeClass(that._nodeAggregatedDimmedClassZoomLevel4).addClass(that._nodeAggregatedDimmedHoveredClassZoomLevel4);
				} else {
					that.$().removeClass(that._nodeAggregatedDimmedClass).addClass(that._nodeAggregatedDimmedHoveredClass);
				}
			} else if (that._getZoomLevel() === library.ProcessFlowZoomLevel.Four) {
				that.$().addClass(that._nodeAggregatedHoveredClassZoomLevel4);
			} else {
				that.$().addClass(that._nodeAggregatedHoveredClass);
			}
		}

		/**
		 * Removes the CSS classes for hovered status (mouse-leave).
		 * @param {sap.ui.core.Control} that The instance the classes are to be removed from
		 */
		function removeAggregatedHoveredClasses(that) {
			// If the node is dimmed
			if (aDimmedStates && (Array.prototype.indexOf.call(aDimmedStates, that._getDisplayState())) >= 0) {
				if (that._getZoomLevel() === library.ProcessFlowZoomLevel.Four) {
					that.$().removeClass(that._nodeAggregatedDimmedHoveredClassZoomLevel4).addClass(that._nodeAggregatedDimmedClassZoomLevel4);
				} else {
					that.$().removeClass(that._nodeAggregatedDimmedHoveredClass).addClass(that._nodeAggregatedDimmedClass);
				}
			} else if (that._getZoomLevel() === library.ProcessFlowZoomLevel.Four) {
				that.$().removeClass(that._nodeAggregatedHoveredClassZoomLevel4);
			} else {
				that.$().removeClass(that._nodeAggregatedHoveredClass);
			}
		}
	};

	/**
	 * Checks if current node contains children.
	 *
	 * @private
	 * @returns {boolean} Value which shows if the ProcessFlowNode has children or not
	 */
	ProcessFlowNode.prototype._hasChildren = function () {
		var aChildren = this.getChildren();
		return aChildren && aChildren.length > 0;
	};

	/**
	 * Checks if the current node contains a children with the specified nodeId.
	 *
	 * @private
	 * @param {string} childrenNodeId The children node Id which is looked for
	 * @returns {boolean} If the current node has a children with the specified node Id or not
	 */
	ProcessFlowNode.prototype._hasChildrenWithNodeId = function (childrenNodeId) {
		var aChildren = this.getChildren();
		if (aChildren && aChildren.length > 0) {
			for (var i = 0; i < aChildren.length; i++) {
				if ((typeof aChildren[i] === 'object' && aChildren[i].nodeId === childrenNodeId) ||
					aChildren[i] === childrenNodeId) {
					return true;
				}
			}
		}
		return false;
	};

	/* =========================================================== */
	/* Public methods                                              */
	/* =========================================================== */

	ProcessFlowNode.prototype.getLaneId = function () {
		if (this._mergedLaneId) {
			return this._mergedLaneId;
		} else {
			return this.getProperty("laneId");
		}
	};

	/**
	 * Retrieves the custom content of the aggregation that is associated with the current zoom level of the parent ProcessFlow.
	 * The correct content is taken from the zoomLevel*Content aggregations.
	 *
	 * @returns {sap.ui.core.Control} The control contained in the current zoom level's custom content aggregation, or null if the parent is not a ProcessFlow
	 * @private
	 */
	ProcessFlowNode.prototype._getCurrentZoomLevelContent = function () {
		var oParent = this.getParent();
		if (!oParent || oParent.getMetadata().getName() !== "sap.suite.ui.commons.ProcessFlow") {
			return null;
		}

		return this["getZoomLevel" + oParent.getZoomLevel() + "Content"]();
	};


	return ProcessFlowNode;

});
