// Provides control MicroProcessFlowItem.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'./library',
	"sap/ui/core/library",
	'sap/ui/core/Control',
	'sap/suite/ui/commons/MicroProcessFlow'
], function (jQuery, library, CoreLibrary, Control, MicroProcessFlow) {
	"use strict";

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons"),
		DefaultIcons = {
			"Error": "sap-icon://message-error",
			"None": null,
			"Success": "sap-icon://message-success",
			"Warning": "sap-icon://message-warning",
			"Information": "sap-icon://message-information"
		},
		ValueState = CoreLibrary.ValueState;

	/**
	 * Constructor for a new MicroProcessFlowItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Holds information about one node in the micro process flow.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.MicroProcessFlowItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MicroProcessFlowItem = Control.extend("sap.suite.ui.commons.MicroProcessFlowItem", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * Key of the node.
				 */
				key: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Icon that is displayed inside the node.
				 * <br>By default, an icon that corresponds to the node's <code>state</code> is used.
				 */
				icon: {
					type: "string", group: "Appearance", defaultValue: null
				},
				/**
				 * Title associated with this node.
				 * <br>The title is displayed as a tooltip when the user hovers over the node.
				 * This title can also be used by screen reader software.
				 */
				title: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * State associated with this node.<br>The state defines the semantic color applied to
				 * the node. Available states include <code>Standard</code> (neutral), <code>Error</code>
				 * (negative), <code>Success</code> (positive), and <code>Warning</code> (critical).
				 */
				state: {
					type: "sap.ui.core.ValueState", group: "Appearance", defaultValue: ValueState.Standard
				},
				/**
				 * Defines whether an object should be displayed between this node and the following node.
				 * <br>When set to <code>true</code>, a vertical red bar is displayed by default.
				 * To define custom objects, use the <code>intermediary</code> aggregation.
				 */
				showIntermediary: {
					type: "boolean", group: "Appearance", defaultValue: false
				},
				/**
				 * Distance between this node and the following node.<br>When set to a percentage value,
				 * the distance is calculated based on the height of the parent container.
				 */
				stepWidth: {
					type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: null
				},
				/**
				 * Defines whether a connector line should be displayed between this node and the node
				 * that follows it.
				 */
				showSeparator: {
					type: "boolean", group: "Appearance", defaultValue: true
				}
			},
			aggregations: {
				/**
				 * Holds custom controls to be used as process flow nodes.
				 */
				customControl: {
					type: "sap.ui.core.Control", multiple: false, singularName: "customControl"
				},
				/**
				 * Holds objects to be displayed between the process flow nodes.
				 */
				intermediary: {
					type: "sap.ui.core.Control", multiple: false, singularName: "intermediary"
				}
			},
			events: {
				/**
				 * This event is fired when the user clicks or taps a node.
				 */
				press: {
					allowPreventDefault : true,
					parameters: {
						item: "object"
					}
				}
			}
		},
		onAfterRendering: function () {
			this._setupEvents();
			this._setAccessibility();
		},
		renderer: {
			apiVersion: 2,
			render: function (oRM, oMicroProcessFlowItem) {
			var fnRenderSeparator = function () {
				// wrapper
				oRM.openStart("div");
				oRM.attr("id", oMicroProcessFlowItem.getId() + "-separator");
				oRM.class("sapSuiteUiCommonsMicroProcessFlowItemSeparatorWrapper");
				oRM.style("width", oMicroProcessFlowItem._getStepWidth());
				oRM.openEnd();

				// separator
				oRM.openStart("div");
				oRM.class("sapSuiteUiCommonsMicroProcessFlowItemSeparator");
				// last item doesn't have visible separator, but can have intermediary
				if (!oMicroProcessFlowItem.getShowSeparator() || bIsLast) {
					oRM.class("sapSuiteUiCommonsMicroProcessFlowItemHiddenSeparator");
				}
				oRM.openEnd();
				oRM.close("div");

				if (bShowIntermediary) {
					fnRenderIntermediary();
				}

				oRM.close("div");
			};

			var fnRenderIntermediary = function () {
				var oIntermediary = oMicroProcessFlowItem.getIntermediary();

				oRM.openStart("div");
				oRM.class("sapSuiteUiCommonsMicroProcessFlowItemIntermediary");
				oRM.openEnd();
				if (oIntermediary) {
					oRM.renderControl(oIntermediary);
				} else {
					oRM.openStart("div");
					oRM.class("sapSuiteUiCommonsMicroProcessFlowItemOnHoldElement");
					oRM.openEnd();
					oRM.close("div");
				}
				oRM.close("div");
			};

			var sIcon = oMicroProcessFlowItem.getIcon() || oMicroProcessFlowItem._getIconByState(),
				bIsLast = oMicroProcessFlowItem.getParent()._isLastItem(oMicroProcessFlowItem),
				sId = oMicroProcessFlowItem.getId(),
				bShowIntermediary = oMicroProcessFlowItem.getShowIntermediary(),
				oCustomControl = oMicroProcessFlowItem.getCustomControl(),
				sTitle = oMicroProcessFlowItem.getTitle();

			oRM.openStart("div", oMicroProcessFlowItem);
			oRM.class("sapSuiteUiCommonsMicroProcessFlowItemWrapper");
			oRM.openEnd();

			oRM.openStart("div");
			oRM.attr("id", sId + "-item");
			if (sTitle) {
				oRM.attr("title", sTitle);
			}
			oRM.class("sapSuiteUiCommonsMicroProcessFlowItemContent");
			oRM.openEnd();

			if (oCustomControl) {
				oRM.renderControl(oCustomControl);
			} else {
				oRM.openStart("div");
				oRM.attr("id", sId + "-itemContent");
				oRM.attr("tabindex", "0");
				oRM.class("sapSuiteUiCommonsMicroProcessFlowItem").class("sapSuiteUiCommonsMicroProcessFlowItem" + oMicroProcessFlowItem.getState());
				oRM.attr("aria-label", oMicroProcessFlowItem._getAriaText());
				oRM.attr("role", "option");
				oRM.attr("aria-selected", "false");
				oRM.openEnd();

				if (sIcon) {
					oRM.renderControl(new sap.ui.core.Icon({
						tooltip: oMicroProcessFlowItem.getTitle(),
						src: sIcon
					}).addStyleClass("sapSuiteUiCommonsMicroProcessFlowItemIcon"));
				}
				oRM.close("div");
			}
			oRM.close("div");

			if (!bIsLast || bShowIntermediary) {
				fnRenderSeparator();
			}

			oRM.close("div");
		}
		}
	});

	MicroProcessFlowItem.prototype.getFocusDomRef = function () {
		var oCustomControl = this.getCustomControl();

		return oCustomControl ? oCustomControl.getFocusDomRef() : this.getDomRef("itemContent");
	};

	/* =========================================================== */
	/* Private methods */
	/* =========================================================== */
	MicroProcessFlowItem.prototype._setAccessibility = function () {
		var $item = this._getAccessibleItem(),
			sAriaLabel = this._getAriaText();
		if ($item.attr("tabindex") !== "0") {
			$item.attr("tabindex", 0);
		}
		$item.attr("aria-label", sAriaLabel);
		$item.attr("role", "option");
		$item.attr("aria-posinset", this._iIndex);
		$item.attr("aria-setsize", this._iItemsCount);
	};

	MicroProcessFlowItem.prototype._getAccessibleItem = function () {
		var $item = jQuery(this.getFocusDomRef());

		// if there is not tabindex for custom control
		// use our wrapper $item and set tab index to it
		return $item.attr("tabindex") === "0" ? $item : this.$("item");
	};

	MicroProcessFlowItem.prototype._setupEvents = function () {
		var $item = this.$("item"),
			bHasPressEvent = this.hasListeners("press");

		$item.on("touchstart click", this._click.bind(this));

		if (bHasPressEvent) {
			$item.on("mousedown", function (oEvent) {
				jQuery(this).addClass("sapSuiteUiCommonsMicroProcessFlowItemPressed");
			});

			$item.on("mouseup", function (oEvent) {
				jQuery(this).removeClass("sapSuiteUiCommonsMicroProcessFlowItemPressed");
			});
		}

		if (bHasPressEvent) {
			$item.css("cursor", "pointer");
			$item.attr("role", "button");
			$item.attr("aria-hidden", "true");
		}
	};

	MicroProcessFlowItem.prototype._getAriaText = function () {
		var sText = oResourceBundle.getText("MICRO_PROCESS_FLOW_ITEM");

		switch (this.getState()) {
			case ValueState.Error:
				sText += " - " + oResourceBundle.getText("MICRO_PROCESS_FLOW_ERROR");
				break;

			case ValueState.Warning:
				sText += " - " + oResourceBundle.getText("MICRO_PROCESS_FLOW_WARNING");
				break;

			case ValueState.Success:
				sText += " - " + oResourceBundle.getText("MICRO_PROCESS_FLOW_SUCCESS");
				break;

			case ValueState.Information:
				sText += " - " + oResourceBundle.getText("MICRO_PROCESS_FLOW_INFORMATION");
				break;
		}

		if (this.getTitle()) {
			sText += " - " + this.getTitle();
		}

		return sText;
	};

	MicroProcessFlowItem.prototype._isCompact = function () {
		return jQuery("body").hasClass("sapUiSizeCompact") || this.$().is(".sapUiSizeCompact") || this.$().closest(".sapUiSizeCompact").length > 0;
	};

	MicroProcessFlowItem.prototype._getStepWidth = function () {
		var oWidth = this.getStepWidth();

		if (!oWidth) {
			oWidth = this._isCompact() ? "1rem" : "1.5rem";
		}

		return oWidth;
	};

	MicroProcessFlowItem.prototype._setAccessibilityData = function (iIndex, iItemsCount) {
		this._iIndex = iIndex;
		this._iItemsCount = iItemsCount;
	};

	MicroProcessFlowItem.prototype._click = function (oEvent) {
		var oParent = this.getParent();

		if (oParent) {
			oParent._bKeyBoard = false;
		}

		this._firePress(oEvent);
	};

	MicroProcessFlowItem.prototype._firePress = function (oEvent) {
		if (this.hasListeners("press")) {
			this.firePress({
				item: this.getFocusDomRef()
			});
			if (oEvent.preventDefault) {
				oEvent.preventDefault();
			}
			if (oEvent.stopPropagation) {
				oEvent.stopPropagation();
			}
		}

		var selectedItem = document.getElementsByClassName('sapSuiteMicroProcessFlowItemSelected')[0];
		var item = this._getAccessibleItem()[0];
		if (selectedItem) {
			selectedItem.setAttribute("aria-selected", false);
			selectedItem.classList.remove("sapSuiteMicroProcessFlowItemSelected");
		}
		if (item.tabIndex == "0") {
			item.setAttribute("aria-selected", true);
			item.classList.add("sapSuiteMicroProcessFlowItemSelected");
		}
	};

	MicroProcessFlowItem.prototype._getIconByState = function () {
		return DefaultIcons[this.getState()];
	};

	return MicroProcessFlowItem;

});
