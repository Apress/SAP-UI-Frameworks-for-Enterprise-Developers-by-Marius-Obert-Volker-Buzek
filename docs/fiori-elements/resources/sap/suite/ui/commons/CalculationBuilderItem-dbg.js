sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"./library",
	"sap/ui/core/Control",
	"sap/m/MessageBox",
	"sap/base/security/encodeXML",
	"./Utils",
	"sap/ui/thirdparty/jqueryui/jquery-ui-core",
	"sap/ui/thirdparty/jqueryui/jquery-ui-widget",
	"sap/ui/thirdparty/jqueryui/jquery-ui-mouse",
	"sap/ui/thirdparty/jqueryui/jquery-ui-draggable"
], function (jQuery, library, Control, MessageBox, encodeXML, Utils) {
	"use strict";

	var ItemType = library.CalculationBuilderItemType,
		OperatorType = library.CalculationBuilderOperatorType,
		LogicalOperatorType = library.CalculationBuilderLogicalOperatorType;

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

	/**
	 * Constructor for a new item used in the expression.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Each of the items used as building blocks to create an arithmetic expression in the calculation builder.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.56.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.CalculationBuilderItem
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel.
	 */
	var CalculationBuilderItem = Control.extend("sap.suite.ui.commons.CalculationBuilderItem", /** @lends sap.suite.ui.commons.CalculationBuilderItem.prototype */ {
		constructor: function (sId, mSettings) {
			if (typeof sId !== "string" && sId !== undefined) {
				mSettings = sId;
			}

			if (mSettings && mSettings.key) {
				mSettings.key = this._sanitizeKey(mSettings.key);
			}

			Control.apply(this, arguments);
		},
		metadata: {
			library: "sap/suite/ui/commons",
			properties: {
				/**
				 * A key associated with the item. This property is mandatory.<br>
				 * The key is displayed in the text editor area of the calculation builder.
				 */
				key: {
					type: "string", group: "Misc", defaultValue: null
				}
			}
		},
		renderer: {
			apiVersion: 2,
		render: function (oRm, oItem) {
			oItem._render(oRm);
		}
	}
	});

	/* =========================================================== */
	/* Rendering	    										   */
	/* =========================================================== */
	CalculationBuilderItem.prototype._innerRender = function (oRm, item) {
			var sDisable = this._bReadOnly ? "sapMBtnDisabled" : "",
			sLabel = this._getLabel(),
			oItemsWithAriaLabel = {
				"!=": "NOT_EQUAL",
				"-": "MINUS",
				",": "COMMA"
			};

		var fnRenderFocus = function (oRm) {
			oRm.openStart("div");
			oRm.class("sapCalculationBuilderItemFocusWrapper");
			oRm.openEnd();
			oRm.openStart("div");
			oRm.class("sapCalculationBuilderItemFocus");
			oRm.openEnd();
			oRm.close("div");
			oRm.close("div");
		};

		var fnRenderExpandButton = function (oRm) {
			oRm.openStart("div");
			oRm.class("sapCalculationBuilderItemExpandButtonWrapper");
			oRm.attr("title",oResourceBundle.getText("CALCULATION_BUILDER_EXPAND_BUTTON_TITLE"));
			oRm.openEnd();
			oRm.openStart("div");
			oRm.attr("id",this.getId() + "-expandbutton");
			oRm.class("sapCalculationBuilderItemExpandButton").class(sDisable);
			oRm.attr("tabindex", "-1");
			oRm.openEnd();

			if (!this._bReadOnly) {
				oRm.openStart("div");
				oRm.class("sapCalculationBuilderItemExpandButtonFocus");
				oRm.openEnd();
				oRm.close("div");
			}

			// this is not empty icon, IDE may just not display the character
			fnRenderIcon(oRm,"");
			oRm.close("div");
			oRm.close("div");
		}.bind(this);

		var fnRenderIcon = function (oRm,sIcon) {
			oRm.openStart("span");
			oRm.attr("aria-hidden","true");
			oRm.attr("data-sap-ui-icon-content",sIcon);
			oRm.class("sapCalculationBuilderEmptyItemIcon").class("sapUiIcon").class("sapUiIconMirrorInRTL").class("sapCalculationBuilderExpressionSAPFont");
			oRm.openEnd();
			oRm.close("span");
		};

		var fnGetItemAriaLabel = function (oRm,sTextBundle) {
			oRm.attr("aria-label", oResourceBundle.getText(sTextBundle));
		};
		oRm.openStart("div");
		oRm.class("sapCalculationBuilderItemContentWrapper");
		oRm.openEnd();
		oRm.openStart("div");
		oRm.attr("id",this.getId() + "-content");
		oRm.class("sapCalculationBuilderItemContent");
		if (this._bIsNew || this._isEmpty()) {
			oRm.attr("title",oResourceBundle.getText("CALCULATION_BUILDER_NEW_ITEM_TITLE"));
		} else if (oItemsWithAriaLabel[sLabel]) {
			fnGetItemAriaLabel(oRm, "CALCULATION_BUILDER_" + oItemsWithAriaLabel[sLabel] + "_ARIA_LABEL");
		}
		oRm.attr("aria-haspopup","dialog");
		oRm.openEnd();
		fnRenderFocus(oRm);

		if (this._isEmpty()) {
			fnRenderIcon(oRm,"");
			oRm.close("div");
		} else if (this._bIsNew) {
			fnRenderIcon(oRm,"");
			oRm.close("div");
		} else if (this._isFunction()) {
			var oFunction = this._getFunction();
			oRm.openStart("span");
			oRm.class("sapCalculationBuilderItemLabel").class("sapCalculationBuilderItemFunctionLabel");
			oRm.openEnd();
			oRm.unsafeHtml(encodeXML(oFunction.title || this.getKey()));
			oRm.close("span");
			oRm.openStart("span");
			oRm.class("sapCalculationBuilderItemLabel").class("sapCalculationBuilderItemFunctionBracket");
			oRm.openEnd();
			oRm.unsafeHtml("(");
			oRm.close("span");
			oRm.close("div");
		} else {
			oRm.openStart("span");
			oRm.class("sapCalculationBuilderItemLabel");
			oRm.openEnd();
			oRm.unsafeHtml(encodeXML(sLabel));
			oRm.close("span");
			oRm.close("div");
		}
		oRm.close("div");

		if (this._isVariable() && this.isExpandable()) {
			fnRenderExpandButton(oRm);
		}
		if (item) {

			oRm.flush(item);
			}
	};

	CalculationBuilderItem.prototype._getClass = function (bHasError, oRm, bCreateExpression) {
		var sClass = '',
			bIsEmpty = this._isEmpty();

		sClass += this._bIsNew ? "sapCalculationBuilderNewItem  sapCalculationBuilderCancelSelectable" : "sapCalculationBuilderItem";

		if (bIsEmpty) {
			sClass += " sapCalculationBuilderNewItem ";
		}

		if (this._isBracket()) {
			sClass += " sapCalculationBuilderItemBracket ";
		} else if (this._isOperator()) {
			sClass += " sapCalculationBuilderItemOperator sapCalculationBuilderItemOperatorLength-" + this._getLabel().length + " ";
			if (this._isLogicalOperator()) {
				sClass += " sapCalculationBuilderItemLogicalOperator ";
			}
		} else if (this._isCustomOperator()) {
			sClass += " sapCalculationBuilderItemOperator sapCalculationBuilderItemCustomOperator ";
		} else if (this._isFunction()) {
			sClass += " sapCalculationBuilderItemFunction ";
		} else if (this._isLiteral()) {
			sClass += " sapCalculationBuilderItemLiteral ";
		} else if (this._isVariable()) {
			sClass += " sapCalculationBuilderItemVariable ";
			if (this.isExpandable()) {
				sClass += " sapCalculationBuilderItemVariableSeparator ";
			}
		} else {
			sClass += " sapCalculationBuilderUnknownItem ";
		}

		if (bHasError) {
			sClass += " sapCalculationBuilderItemErrorSyntax ";
		}
		if (bCreateExpression) {
			return sClass;
		}
		var classes = sClass.split(' '),i;
		for (i = 0; i < classes.length; i++){
			oRm.class(classes[i]);
		}
	};

	CalculationBuilderItem.prototype._render = function (oRm) {
		if (!this.getParent()) {
			return;
		}

		var bIsItemInBuilder = this._hasCorrectParent(),
			oError = this._getItemError(),
			sTooltip = this._getTooltip(),
			sTooltipAttr = sTooltip ? "\"" + sTooltip + "\"" : "",
			sRoleAttr = this._bIsNew ? "button" : "",
			sTabIndexAttr = bIsItemInBuilder ? "-1" : "0";
		oRm.openStart("div");
		this._getClass(!!oError, oRm);
		oRm.attr("id",this.getId());
		oRm.attr("tabindex",sTabIndexAttr);
		oRm.attr("title",sTooltipAttr);
		oRm.attr("role",sRoleAttr);
		oRm.openEnd();
		// for now we can't add data-sap-ui as it collide with dragging selected items (for unknown reason)
		//sHtml += "<div " + " class=\"" + this._getClass(!!oError) + "\" data-sap-ui=\"" + this.getId() + "\" id=\"" + this.getId() + "\" tabindex=\"" + (bIsItemInBuilder ? "-1" : "0") + "\"" + sTooltipAttr + ">";
		this._innerRender(oRm);
		oRm.close("div");
	};

	/* =========================================================== */
	/* Init & events	    									   */
	/* =========================================================== */
	CalculationBuilderItem.prototype.init = function () {
		// Indicates whether the item is NewItem
		this._bIsNew = false;
	};

	CalculationBuilderItem.prototype.onBeforeRendering = function () {
		this._oVariable = this.getVariable();
	};

	CalculationBuilderItem.prototype.onAfterRendering = function () {
		this._afterRendering();
	};

	CalculationBuilderItem.prototype._afterRendering = function () {
		var oParent = this.getParent();

		if (!oParent) {
			return;
		}

		this._setEvents();

		if (!this._bIsNew && !this._bReadOnly) {
			this._setupDraggable();
		}

		if (this._hasCorrectParent(oParent)) {
			if (!oParent._bIsCalculationBuilderRendering) {
				oParent._setupKeyboard();
				oParent.getParent()._enableOrDisableExpandAllButton();
			}
		}
	};

	CalculationBuilderItem.prototype._setEvents = function () {
		if (this.isExpandable()) {
			this.$("expandbutton").on("click", this._expandButtonPress.bind(this));

			// Show correct focus after click on Expand Button
			this.$("expandbutton").on("mousedown", function (oEvent) {
				oEvent.stopPropagation();
			});
		}

		if (!this._bReadOnly) {
			this.$("content").on("click", this._buttonPress.bind(this));
		}

		if (this._isBracket() || this._isFunction()) {
			this._setBracketHover();
		}
	};

	CalculationBuilderItem.prototype._buttonPress = function (oEvent) {
		var oParent = this.getParent();

		if (this._hasCorrectParent(oParent) && !oParent._bDragging) {
			if (oEvent.ctrlKey) {
				oParent._selectItem(this.$());
			} else if (oEvent.shiftKey) {
				oParent._selectItemsTo(this.$());
			} else {
				oParent._deselect();
				oParent._openDialog({
					opener: this,
					currentItem: this
				});
			}
		}
	};

	CalculationBuilderItem.prototype._expandButtonPress = function (oEvent) {
		if (!this._bReadOnly) {
			this._openExpandConfirmMessageBox();
		}
	};

	/* =========================================================== */
	/* Public API 						   						   */
	/* =========================================================== */
	/**
	 * Checks if the item is expandable.
	 * @public
	 * @returns {boolean} True if the item is expandable.
	 */
	CalculationBuilderItem.prototype.isExpandable = function () {
		var oVariable = this._oVariable ? this._oVariable : this.getVariable();
		return oVariable && oVariable.getItems().length > 0;
	};

	/**
	 * Checks if there is a variable object related to this item.
	 * @public
	 * @returns {sap.suite.ui.commons.CalculationBuilderVariable} Variable object paired with this item, if there is any.
	 */
	CalculationBuilderItem.prototype.getVariable = function () {
		var oParent = this.getParent();
		return this._hasCorrectParent(oParent) && oParent._getVariableByKey(this.getKey());
	};

	/**
	 * Returns the type of the item.<br>
	 * Available item types are defined in {@link sap.suite.ui.commons.CalculationBuilderItemType}.
	 * @public
	 * @returns {string} Type of the item
	 */
	CalculationBuilderItem.prototype.getType = function () {
		return this._getType();
	};


	/* =========================================================== */
	/* Setters & getters, helper methods 						   */
	/* =========================================================== */
	CalculationBuilderItem.prototype._setupDraggable = function () {
		var oParent = this.getParent(),
			$parent = oParent.$(),
			$this = this.$();

		$this.draggable({
			revert: "invalid",
			axis: "x",
			delay: 100,
			cursor: "move",
			helper: function (event) {
				var $item = $this.clone();
				$item.addClass("sapCalculationBuilderDragging");
				$item.css("pointer-events", "none");

				return $item;
			},
			scope: oParent.getId() + "-scope",
			// handle: ".sapCalculationBuilderDraggable",
			start: function () {
				// Remove bracket highlights when dragging
				$parent.find(".sapCalculationBuilderBracket").removeClass("sapCalculationBuilderBracket");
				$parent.find(".sapCalculationBuilderItemContent").css("cursor", "move");

				jQuery(this).addClass("sapCalculationBuilderDragging");

				oParent._bDragging = true;

				// Deselect other items if the moved item isn't selected
				if (!jQuery(this).hasClass("ui-selected")) {
					oParent._deselect();
				}
			},
			stop: function () {
				jQuery(this).removeClass("sapCalculationBuilderDragging");

				$parent.find(".sapCalculationBuilderItemContent").css("cursor", "pointer");
				oParent._bDragging = false;
			}
		});

		Utils._setupMobileDraggable($this);
	};

	CalculationBuilderItem.prototype._setBracketHover = function () {
		var $content = this.$("content"),
			sBracket = this._isFunction() ? OperatorType["("] : this.getKey(),
			bIsEndingBracket = sBracket === OperatorType[")"],
			sTargetBracket = bIsEndingBracket ? OperatorType["("] : OperatorType[")"],
			oTargetItem;

		$content.mouseenter(function (oEvent) {
			var oItem, bFoundItem, iBracketCount = 0,
				aItems = (this._hasCorrectParent() && this.getParent().getItems()) || [],
				i = bIsEndingBracket ? aItems.length : 0;

			for (; bIsEndingBracket ? i >= 0 : i < aItems.length; (bIsEndingBracket ? i-- : i++)) {
				oItem = aItems[i];

				// Find starting bracket
				if (oItem === this) {
					bFoundItem = true;
				}

				// Find ending bracket
				if (bFoundItem) {
					if ((oItem.getKey() === sTargetBracket) || (oItem._isFunction() && bIsEndingBracket)) {
						iBracketCount--;
						if (iBracketCount === 0) {
							oTargetItem = oItem;
							break;
						}
					} else if ((oItem.getKey() === sBracket) || (oItem._isFunction() && !bIsEndingBracket)) {
						iBracketCount++;
					}
				}
			}
			if (oTargetItem) {
				this.$().addClass("sapCalculationBuilderBracket");
				oTargetItem.$().addClass("sapCalculationBuilderBracket");
			}
		}.bind(this));

		$content.on("mouseleave", function (oEvent) {
			this.$().removeClass("sapCalculationBuilderBracket");
			if (oTargetItem) {
				oTargetItem.$().removeClass("sapCalculationBuilderBracket");
			}
		}.bind(this));
	};

	CalculationBuilderItem.prototype._expandVariable = function (bFireChange) {
		var oParent = this.getParent(),
			iThisIndex, oVariable;

		if (oParent) {
			iThisIndex = oParent.getItems().indexOf(this);
			oVariable = oParent._getVariableByKey(this.getKey());

			oParent.insertItem(new CalculationBuilderItem({
				"key": "("
			}), iThisIndex++);
			oVariable.getItems().forEach(function (oItem) {
				oParent.insertItem(oItem._cloneItem(), iThisIndex++);
			});
			oParent.insertItem(new CalculationBuilderItem({
				"key": ")"
			}), iThisIndex++);
			oParent.removeItem(this);

			if (bFireChange) {
				oParent._aErrors = oParent._validateSyntax();
				oParent._fireChange();
			}
		}
	};

	CalculationBuilderItem.prototype._cloneItem = function () {
		return new CalculationBuilderItem({
			key: this.getKey()
		});
	};

	CalculationBuilderItem.prototype._openExpandConfirmMessageBox = function () {
		MessageBox.show(
			oResourceBundle.getText("CALCULATION_BUILDER_EXPAND_MESSAGE_TEXT", this._getLabel()), {
				icon: MessageBox.Icon.WARNING,
				title: oResourceBundle.getText("CALCULATION_BUILDER_EXPAND_MESSAGE_TITLE"),
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				onClose: function (sAction) {
					var oParent;

					if (sAction === MessageBox.Action.OK) {
						this._expandVariable(true);
					} else {
						oParent = this.getParent();
						if (oParent) {
							// After close MassageBox set focus back to Expand Button
							oParent._setCorrectFocus();
						}
					}
				}.bind(this)
			}
		);
	};

	CalculationBuilderItem.prototype._getItemError = function () {
		var oParent = this.getParent(), oError;
		if (this._hasCorrectParent(oParent)) {
			oError = jQuery.grep(oParent._aErrors, function (oItem) {
				return oItem.index === this._iIndex;
			}.bind(this))[0];
		}

		return oError;
	};

	CalculationBuilderItem.prototype._getLabel = function () {
		var fnGetLabel = function () {

			// either custom function or variable
			var oItem = this._getItem();
			if (!oItem) {
				return this.getKey();
			}

			if (oItem.title) {
				return oItem.title;
			}

			if (oItem._getLabel) {
				return oItem._getLabel();
			}

			// custom operators
			return oItem.getText() || oItem.getKey();
		}.bind(this);

		if (!this._sLabel) {
			this._sLabel = fnGetLabel();

			if (this._isFunction()) {
				this._sLabel += " (";
			}
		}

		return this._sLabel;
	};

	CalculationBuilderItem.prototype._sanitizeKey = function (sKey) {
		if (!sKey || typeof sKey !== "string") {
			return sKey;
		}

		// manage '{' and '}'
		sKey = sKey.replace(/{/g, "&#125;");
		sKey = sKey.replace(/}/g, "&#123;");

		return sKey;
	};

	CalculationBuilderItem.prototype._reset = function () {
		this._sType = "";
		this._sLabel = "";
		this._oVariable = "";
	};

	CalculationBuilderItem.prototype.setKey = function (sKey, bSuppressInvalidation) {
		this._reset();

		this.setProperty("key", this._sanitizeKey(sKey), bSuppressInvalidation);

		// api change after all rendered, we need to recreate all items and input
		var oParent = this.getParent();
		if (oParent && oParent._bRendered) {
			oParent.getParent() && oParent.getParent()._expressionChanged();
		}

		return this;
	};

	CalculationBuilderItem.prototype.getKey = function () {
		var sKey = this.getProperty("key");

		sKey = sKey.replace(/&#125;/g, "{");
		sKey = sKey.replace(/&#123;/g, "}");


		return sKey;
	};


	CalculationBuilderItem.prototype._getType = function () {
		var oParent = this.getParent();
		if (!this._sType && oParent) {
			this._sType = oParent._getType(this.getKey());
		}

		return this._sType;
	};

	CalculationBuilderItem.prototype._isEmpty = function () {
		return !this._bIsNew && !this.getKey();
	};

	CalculationBuilderItem.prototype._isOperator = function () {
		return this._getType() === ItemType.Operator;
	};

	CalculationBuilderItem.prototype._isSecondaryOperator = function () {
		var sType = this._getType();
		if (this._getType() === ItemType.Operator) {
			return ["+", "-", "/", "*", "(", ")", ","].indexOf(this.getKey()) === -1;
		}

		return sType === ItemType.CustomOperator;
	};

	CalculationBuilderItem.prototype._isCustomOperator = function () {
		return this._getType() === ItemType.CustomOperator;
	};

	CalculationBuilderItem.prototype._isVariable = function () {
		return this._getType() === ItemType.Variable;
	};

	CalculationBuilderItem.prototype._isLiteral = function () {
		return this._getType() === ItemType.Literal;
	};

	CalculationBuilderItem.prototype._isFunction = function () {
		var sType = this._getType();
		return sType === ItemType.Function || sType === ItemType.CustomFunction;
	};

	CalculationBuilderItem.prototype._getFunction = function () {
		var sType = this._getType();
		if (sType === ItemType.Function || sType === ItemType.CustomFunction) {
			var oBuilder = this.getParent().getParent();
			return oBuilder._createFunctionObject(oBuilder._getFunctionDefinition(this.getKey()));
		}

		return null;
	};

	CalculationBuilderItem.prototype._getItemInstance = function (sType, sCollectionName) {
		if (this._getType() === sType) {
			var sKey = this.getKey(),
				aCollection = this.getParent()[sCollectionName]();

			return jQuery.grep(aCollection, function (oItem) {
				return oItem.getKey().toLowerCase() === sKey.toLowerCase();
			})[0];
		}

		return null;
	};

	CalculationBuilderItem.prototype._getItem = function () {
		var sType = this._getType();

		switch (sType) {
			case ItemType.Variable:
				return this._getVariable();
			case ItemType.CustomFunction:
				return this._getCustomFunction();
			case ItemType.CustomOperator:
				return this._getCustomOperator();
		}

		return null;
	};

	CalculationBuilderItem.prototype._getTooltip = function () {
		var oInstance = this._getItem();
		return oInstance && oInstance.getTooltip_AsString ? oInstance.getTooltip_AsString() : "";
	};

	CalculationBuilderItem.prototype._getVariable = function () {
		return this._getItemInstance(ItemType.Variable, "getVariables");
	};

	CalculationBuilderItem.prototype._getCustomFunction = function () {
		return this._getItemInstance(ItemType.CustomFunction, "getFunctions");
	};

	CalculationBuilderItem.prototype._getCustomOperator = function () {
		return this._getItemInstance(ItemType.CustomOperator, "getOperators");
	};

	CalculationBuilderItem.prototype._isBracket = function () {
		return this._isOperator() && (this.getKey() === "(" || this.getKey() === ")");
	};

	CalculationBuilderItem.prototype._isAddition = function () {
		return this._isOperator() && this.getKey() === "+";
	};

	CalculationBuilderItem.prototype._isSubtraction = function () {
		return this._isOperator() && this.getKey() === "-";
	};

	CalculationBuilderItem.prototype._isDivision = function () {
		return this._isOperator() && this.getKey() === "/";
	};

	CalculationBuilderItem.prototype._isMultiplication = function () {
		return this._isOperator() && this.getKey() === "*";
	};

	CalculationBuilderItem.prototype._isComma = function () {
		return this._isOperator() && this.getKey() === ",";
	};

	CalculationBuilderItem.prototype._isLogicalOperator = function () {
		return this._isOperator() && !!LogicalOperatorType[this.getKey()];
	};

	CalculationBuilderItem.prototype._hasCorrectParent = function (oParent) {
		oParent = oParent || this.getParent();
		return oParent instanceof sap.suite.ui.commons.CalculationBuilderExpression;
	};

	return CalculationBuilderItem;

});
