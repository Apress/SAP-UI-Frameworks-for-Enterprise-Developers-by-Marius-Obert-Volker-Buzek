sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"./library",
	"sap/ui/core/Control",
	"./CalculationBuilderItem",
	"./CalculationBuilderExpression",
	"./CalculationBuilderInput",
	"./CalculationBuilderFunction",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarToggleButton",
	"sap/m/OverflowToolbarButton",
	"sap/m/ToolbarSpacer",
	"sap/m/Title",
	"sap/m/MessageBox",
	"sap/base/Log",
	"sap/base/util/uid",
	"sap/ui/core/library",
	"sap/m/library",
	"sap/suite/ui/commons/util/FullScreenUtil"
], function (jQuery, library, Control, CalculationBuilderItem, CalculationBuilderExpression, CalculationBuilderInput, CalculationBuilderFunction, OverflowToolbar,
			 OverflowToolbarToggleButton, OverflowToolbarButton, ToolbarSpacer, Title, MessageBox, Log, uid, coreLibrary, mLibrary, FullScreenUtil) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mLibrary.ButtonType;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	var Icons = Object.freeze({
		SHOW_EXPRESSION: "sap-icon://notification-2",
		EXPAND_VARIABLE: "sap-icon://disconnected",
		FULL_SCREEN: "sap-icon://full-screen",
		EXIT_FULL_SCREEN: "sap-icon://exit-full-screen"
	});

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

	var OperatorType = library.CalculationBuilderOperatorType,
		LogicalOperatorType = library.CalculationBuilderLogicalOperatorType,
		ComparisonOperatorType = library.CalculationBuilderComparisonOperatorType,
		ItemType = library.CalculationBuilderItemType,
		FunctionType = library.CalculationBuilderFunctionType,
		LayoutTypes = library.CalculationBuilderLayoutType,
		ValidationMode = library.CalculationBuilderValidationMode;

	var oNbspReg = new RegExp(String.fromCharCode(160), "g");

	var FunctionsMap = {
		abs: {
			key: "ABS",
			title: "ABS - Absolute Value",
			allowed: true
		},
		round: {
			key: "Round",
			title: "Round",
			template: ["", ",", ""],
			allowed: true
		},
		roundup: {
			key: "RoundUp",
			title: "Round Up",
			template: ["", ",", ""],
			allowed: true
		},
		rounddown: {
			key: "RoundDown",
			title: "Round Down",
			template: ["", ",", ""],
			allowed: true
		},
		sqrt: {
			key: "SQRT",
			title: "SQRT",
			allowed: true
		},
		"case": {
			key: "Case",
			title: "Case",
			description: "CASE ( \"When\" Expression \"Then\" Expression \"Else\" Expression )",
			template: ["", ",", "", ",", ""]
		},
		ndiv0: {
			key: "NDIV0",
			title: "NDIV0"
		},
		nodim: {
			key: "NODIM",
			title: "NODIM",
			description: "NODIM ( Variable )"
		},
		sumct: {
			key: "SUMCT",
			title: "SUMCT",
			description: "SUMGT ( Variable )"
		},
		sumgt: {
			key: "SUMGT",
			title: "SUMGT",
			description: "SUMGT ( Variable )"
		},
		sumrt: {
			key: "SUMRT",
			title: "SUMRT",
			description: "SUMRT ( Variable )"
		}
	};

	/**
	 * Constructor for a new calculation builder.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Calculation Builder allows you to perform arithmetic calculations on literals and variables
	 * using standard arithmetic operators as well as most common logical operators and functions.<br>
	 * You can customize the sets of variables and functions that are visible in the calculation builder
	 * and introduce your own custom functions, as needed.<br>
	 * Arithmetic expressions can be entered using a touch-friendly visual editor or a textual editor that
	 * provides autocomplete suggestions for variables and checks the expression syntax as you type.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.56.0
	 *
	 * @constructor
	 * @public
	 *
	 * @alias sap.suite.ui.commons.CalculationBuilder
	 * @see {@link topic:1db504725155424a8dc9fabd4147dd28 Calculation Builder}
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel.
	 */
	var CalculationBuilder = Control.extend("sap.suite.ui.commons.CalculationBuilder", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * Holds the arithmetic expression.<br>
				 * Use either this property or aggregation <code>Items</code>. Not both.
				 */
				expression: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * The title of the calculation builder element.
				 */
				title: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Defines whether the toolbar is visible.
				 */
				showToolbar: {
					type: "boolean", group: "Misc", defaultValue: true
				},
				/**
				 * Defines whether the expression should be wrapped inside the calculation builder field.<br>
				 * If set to <code>false</code>, the expression is rearranged into a single scrollable row.
				 */
				wrapItemsInExpression: {
					type: "boolean", group: "Misc", defaultValue: true
				},
				/**
				 * Defines the layout type used for the calculation builder.<br>
				 * The layout may include a visual editor, a text editor, or both. In addition, you can set the
				 * text editor to be read-only.
				 */
				layoutType: {
					type: "string", group: "Misc", defaultValue: "Default"
				},
				/**
				 * Defines whether the input toolbar is visible.<br>
				 * The input toolbar contains operators and functions that can be used
				 * in the expression.
				 */
				showInputToolbar: {
					type: "boolean", group: "Misc", defaultValue: false
				},
				/**
				 * Defines whether the control is read-only.
				 */
				readOnly: {
					type: "boolean", group: "Misc", defaultValue: false
				},
				/**
				 * Defines whether comparison operators (<, >, <=, >=, =, !=) are allowed.
				 */
				allowComparisonOperators: {
					type: "boolean", group: "Misc", defaultValue: true
				},
				/**
				 * Defines whether logical operators (AND, OR, XOR, NOT) are allowed.
				 */
				allowLogicalOperators: {
					type: "boolean", group: "Misc", defaultValue: true
				},
				/**
				 * Defines whether autocomplete suggestions are shown when you type. Available only for desktop devices.
				 */
				allowSuggestions: {
					type: "boolean", group: "Misc", defaultValue: true
				},
				/**
				 * Defines whether string constants are allowed.<br>
				 * If set to <code>true</code>, the calculation builder doesn't validate custom strings as errors.
				 * @deprecated As of version 1.77.0, replaced by the <code>allowStringLiterals</code> property.
				 */
				allowStringConstants: {
					type: "boolean", group: "Misc", defaultValue: false
				},
				/**
				 * Defines whether string literals are allowed.<br>
				 * If set to <code>true</code>, the calculation builder doesn't validate strings as errors.<br>
				 * Number literals are also allowed regardless of this setting.
				 * @since 1.77.0
				 */
				allowStringLiterals: {
					type: "boolean", group: "Misc", defaultValue: false
				},
				/**
				 * Defines when the expression is validated.<br>
				 * <ul>
				 * <li>If set to <code>LiveChange</code>, the input is validated as you type.</li>
				 * <li>If set to <code>FocusOut</code>, the input is validated, once you press Enter or Tab.</li>
				 * </ul>
				 */
				validationMode: {
					type: "sap.suite.ui.commons.CalculationBuilderValidationMode",
					group: "Misc",
					defaultValue: ValidationMode.LiveChange
				},
				/**
				 * Default operators or functions that are disabled. Delimiter for multiple items is ';'.<br>
				 * Example of usage: +;-;sqrt
				 */
				disabledDefaultTokens: {
					type: "string", group: "Misc", defaultValue: ""
				}
			},
			defaultAggregation: "items",
			aggregations: {
				/**
				 * Holds the items (operators and operands) to be displayed in the calculation builder.
				 */
				items: {
					type: "sap.suite.ui.commons.CalculationBuilderItem",
					multiple: true,
					singularName: "item",
					bindable: "bindable",
					forwarding: {
						idSuffix: "-expression",
						aggregation: "items",
						forwardBinding: true
					}
				},
				/**
				 * Holds the variables that can be used in the calculation builder.
				 */
				variables: {
					type: "sap.suite.ui.commons.CalculationBuilderVariable",
					multiple: true,
					singularName: "Variable",
					forwarding: {
						idSuffix: "-expression",
						aggregation: "variables",
						forwardBinding: true
					}
				},
				/**
				 * Holds the custom functions that can be used in the calculation builder.
				 */
				functions: {
					type: "sap.suite.ui.commons.CalculationBuilderFunction",
					multiple: true,
					singularName: "Function",
					forwarding: {
						idSuffix: "-expression",
						aggregation: "functions",
						forwardBinding: true
					}
				},
				/**
				 * Holds additional operators defined by the application.<br>These operators are not validated.
				 */
				operators: {
					type: "sap.ui.core.Item",
					multiple: true,
					singularName: "Operator",
					forwarding: {
						idSuffix: "-expression",
						aggregation: "operators",
						forwardBinding: true
					}
				},
				/**
				 * Defines groups of variables.<br>
				 * Variables can be organized into multiple groups for better orientation among different types of variables.
				 */
				groups: {
					type: "sap.suite.ui.commons.CalculationBuilderGroup",
					multiple: true,
					singularName: "Group",
					forwarding: {
						idSuffix: "-expression",
						aggregation: "groups",
						forwardBinding: true
					}
				}
			},
			events: {
				/**
				 * This event is fired for each custom function included in the expression.<br>
				 * Custom functions can be defined using {@link sap.suite.ui.commons.CalculationBuilderFunction}
				 * and validated using {@link sap.suite.ui.commons.CalculationBuilderValidationResult}.
				 */
				validateFunction: {
					parameters: {
						definition: "object",
						customFunction: "object",
						result: "sap.suite.ui.commons.CalculationBuilderValidationResult"
					}
				},
				/**
				 * This event is fired when the order of items changes, or when some items are added or removed.
				 */
				change: {},
				/**
				 * This event is fired after the expression is validated.
				 */
				afterValidation: {}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oCalculationBuilder) {
			var sWrapItemsClass = oCalculationBuilder.getWrapItemsInExpression() ? "sapCalculationBuilderWrapItems" : "",
			bIsLayoutTextualOnly = oCalculationBuilder.getLayoutType() === LayoutTypes.TextualOnly,
			bDisplayInput = oCalculationBuilder._bShowInput || bIsLayoutTextualOnly,
			bIsExpressionVisible = oCalculationBuilder._isExpressionVisible(),
			bIsInputVisible = oCalculationBuilder._isInputVisible(),
			bIsReadOnly = oCalculationBuilder.getReadOnly();

		oRm.openStart("div",oCalculationBuilder);
		oRm.class("sapCalculationBuilder");
		if (oCalculationBuilder.getReadOnly()) {
			oRm.class("sapCalculationBuilderReadOnly");
		}
		oRm.class("oCalculationBuilder");
		oRm.openEnd();

		if (oCalculationBuilder.getShowToolbar() && !bIsLayoutTextualOnly) {
			oRm.renderControl(oCalculationBuilder.getToolbar());
		}

		if (bIsExpressionVisible) {
			oCalculationBuilder._oExpressionBuilder._bReadOnly = bIsReadOnly;
			oRm.openStart("div");
			oRm.class("sapCalculationBuilderInsideWrapper").class(sWrapItemsClass);
			oRm.openEnd();
			oRm.renderControl(oCalculationBuilder._oExpressionBuilder);
			oRm.close("div");
		}

		if (bIsExpressionVisible && bIsInputVisible) {
			oRm.openStart("div");
			oRm.class("sapCalculationBuilderDelimiterLine");
			oRm.openEnd();
			oRm.close("div");
		}

		if (bIsInputVisible) {
			oCalculationBuilder._oInput._bReadOnly = bIsReadOnly || (oCalculationBuilder.getLayoutType() === LayoutTypes.VisualTextualReadOnly);

			oRm.openStart("div");
			oRm.class("sapCalculationBuilderInputOuterWrapper");
			if (oCalculationBuilder._oInput._bReadOnly) {
				oRm.class("sapCalculationBuilderReadOnly");
			}

			if (oCalculationBuilder.getLayoutType() === LayoutTypes.Default || oCalculationBuilder.getLayoutType() === LayoutTypes.VisualTextualReadOnly) {
				oRm.class("sapCalculationBuilderInputOuterWrapperMargin");
			}

			if (!bDisplayInput) {
				oRm.class("sapCalculationBuilderDisplayNone");
			}

			oRm.openEnd();
			oRm.renderControl(oCalculationBuilder._oInput);
			oRm.close("div");
		}

		oRm.close("div");
		}
		}
	});

	CalculationBuilder.prototype.init = function () {

		// Hash map with disabled items
		this._mDisabledTokens = {};

		// Indicates whether the input is visible
		this._bShowInput = true;

		// Container for full screen mode
		this._oFullScreenContainer = null;

		// Indicates whether the control is in full screen mode
		this._bIsFullScreen = false;

		this._oExpressionBuilder = new CalculationBuilderExpression(this.getId() + "-expression", {
			change: function () {
				this._expressionChanged();
				this.fireChange();
			}.bind(this)
		});
		this.addDependent(this._oExpressionBuilder);

		this._oInput = new CalculationBuilderInput(this.getId() + "-input", {
			change: function (oEvent) {
				var sText = oEvent.getParameter("value"),
					aItems = this._oInput._stringToItems(sText),
					iPosition = oEvent.getParameter("position");

				this._oExpressionBuilder._smartRender(aItems);
				this._setExpression(this._oInput._convertEmptyHashes(sText));

				if (this.getValidationMode() !== ValidationMode.FocusOut) {
					this._validateInput(sText, iPosition);
				} else {
					this._oInput._recreateText({
						text: sText,
						position: iPosition,
						errors: this._oExpressionBuilder._aErrors
					});
				}

				this._enableOrDisableExpandAllButton();
				this.fireChange();
			}.bind(this)
		});
		this.addDependent(this._oInput);
	};

	CalculationBuilder.prototype._expressionChanged = function () {
		var sPlainText = "";

		this._oExpressionBuilder._aErrors = this._oExpressionBuilder._validateSyntax();

		sPlainText = this._oInput._itemsToString({
			items: this._oExpressionBuilder.getItems(),
			errors: this._oExpressionBuilder._aErrors
		});
		this._setExpression(sPlainText);

		// first set expression to handle correct value when user attach event
		this.fireAfterValidation();

		this._oInput._displayError(this._oExpressionBuilder._aErrors.length !== 0);
		this._oExpressionBuilder._printErrors();

		this._enableOrDisableExpandAllButton();
	};

	CalculationBuilder.prototype.clone = function(sIdSuffix) {
		// Since aggregations are forwarded to the dependent aggregation 'expression',
		// prevent cloning children to avoid duplication of child aggregation when cloned
		// BCP: 2170036064
		var oClone = Control.prototype.clone.apply(this, [sIdSuffix, undefined, {
			cloneChildren: false,
			cloneBindings: true
		}]);

		return oClone;
	};

	CalculationBuilder.prototype.onBeforeRendering = function () {
		this._resetItems();

		this._createToolbar();
		this._oExpressionBuilder._createVariablesMap();
		this._oInput._aVariables = this.getVariables();

		if (this._bExpressionSet) {
			this._oExpressionBuilder._setItems(this._oInput._stringToItems(this._sExpressionDirectValue));
		}
		this._bExpressionSet = false;
		this._sExpressionDirectValue = "";

		// for other cases errors are validated in ExpressionBuilder - on before rendering
		// which is not triggered if not visible
		if (!this._isExpressionVisible()) {
			this._oExpressionBuilder._aErrors = this._oExpressionBuilder._validateSyntax();
		}

		this._bRendered = false;
	};

	CalculationBuilder.prototype.onAfterRendering = function () {
		this._setExpression(this._oInput._itemsToString({
			items: this._oExpressionBuilder.getItems(),
			errors: this._oExpressionBuilder._aErrors
		}));
		this._bRendered = true;

		this._oInput._displayError(this._oExpressionBuilder._aErrors.length > 0);
	};

	CalculationBuilder.prototype.exit = function () {
		if (this._oFullScreenUtil) {
			this._oFullScreenUtil.cleanUpFullScreen(this);
		}
	};

	/* =========================================================== */
	/* Public API												   */
	/* =========================================================== */

	/**
	 * Returns the toolbar of the calculation builder.
	 *
	 * @returns {Object} Toolbar
	 * @public
	 */
	CalculationBuilder.prototype.getToolbar = function () {
		return this._oToolbar;
	};

	/**
	 * Returns the input toolbar of the calculation builder.
	 *
	 * @returns {Object} Input toolbar
	 * @public
	 */
	CalculationBuilder.prototype.getInputToolbar = function () {
		return this._oInput && this._oInput._oInputToolbar;
	};

	/**
	 * Checks if the expression syntax is valid.
	 *
	 * @returns {Array} aErrors Array of errors found.
	 * @public
	 */
	CalculationBuilder.prototype.validateParts = function (mParameters) {
		mParameters = mParameters || {};

		return this._oExpressionBuilder._validateSyntax({
			items: mParameters.items,
			from: mParameters.from,
			to: mParameters.to
		});
	};

	/**
	 * Records a new error detected in the expression.
	 *
	 * @param {object} oError Error object with contains following properties:
	 * @param {object} [oError.index] Index of the item that contains errors
	 * @param {number} [oError.title] Title of the error
	 *
	 * @public
	 */
	CalculationBuilder.prototype.appendError = function (oError) {
		this._oExpressionBuilder._aErrors.push(oError);
	};

	/**
	 * Displays errors detected in the expression.
	 *
	 * @returns {Array} aErrors Array of errors detected in the expression.
	 * @public
	 */
	CalculationBuilder.prototype.getErrors = function () {
		return this._oExpressionBuilder._aErrors;
	};

	/**
	 * Validates the current expression and displays errors.
	 * @public
	 */
	CalculationBuilder.prototype.validate = function () {
		this._resetItems();
		this._oExpressionBuilder._aErrors = this._oExpressionBuilder._validateSyntax();
		this.updateErrorsDisplay();
	};

	/**
	 * Updates the list of displayed errors <br> You can call this method when you change errors outside default calculation builder events.
	 * @public
	 */
	CalculationBuilder.prototype.updateErrorsDisplay = function () {
		var aErrors = this._oExpressionBuilder._aErrors;

		if (this._isInputVisible()) {
			this._oInput._recreateText({
				errors: aErrors
			});

			this._oInput._displayError(aErrors.length > 0);
		}

		if (this._isExpressionVisible()) {
			this._oExpressionBuilder._printErrors();
		}
	};


	/**
	 * Checks if the function is visible to the user.
	 * @param {sap.suite.ui.commons.CalculationBuilderFunctionType } sFunction Name of the function
	 * @param {boolean} bAllow True if the function should be visible to the user
	 *
	 * @public
	 */
	CalculationBuilder.prototype.allowFunction = function (sFunction, bAllow) {
		if (!sFunction) {
			return;
		}

		var oFunction = FunctionsMap[sFunction.toLowerCase()];
		if (oFunction) {
			oFunction.allowed = bAllow;
		}
	};

	/**
	 * Creates or updates the currently selected item. <br>
	 * Call this function only when using the <code>customView</code> aggregation in the {@link sap.suite.ui.commons.CalculationBuilderGroup}.
	 * @param sKey {string} New key for current item (new or old)
	 * @public
	 */
	CalculationBuilder.prototype.updateOrCreateItem = function (sKey) {
		this._oExpressionBuilder._updateOrCreateItem({
			key: sKey
		});
	};


	/**
	 * Returns syntax errors.
	 *
	 * @public
	 */
	CalculationBuilder.prototype.getErrors = function () {
		return this._oExpressionBuilder && this._oExpressionBuilder._aErrors;
	};

	/**
	 * Gets the current value of property <code>allowStringConstants</code>.
	 *
	 * @deprecated As of version 1.77.0, replaced by {@link sap.suite.ui.commons.CalculationBuilder#getAllowStringLiterals}.
	 * @public
	 * @returns {boolean} Value of property <code>allowStringConstants</code>
	 */
	CalculationBuilder.prototype.getAllowStringConstants = function () {
		Log.warning("This function is deprecated, please use getAllowStringLiterals instead");
		return this.getAllowStringLiterals();
	};

	/**
	 * Sets a new value for property <code>allowStringConstants</code>.
	 *
	 * @deprecated As of version 1.77.0, replaced by {@link sap.suite.ui.commons.CalculationBuilder#setAllowStringLiterals}.
	 * @public
	 * @param {boolean} bAllowStringConstants New value for property <code>allowStringConstants</code>.
	 * @returns {sap.suite.ui.commons.CalculationBuilder} Reference to <code>this</code> to allow method chaining
	 */
	CalculationBuilder.prototype.setAllowStringConstants = function (bAllowStringConstants) {
		Log.warning("This function is deprecated, please use setAllowStringLiterals instead");
		return this.setAllowStringLiterals(bAllowStringConstants);
	};


	/* =========================================================== */
	/* Private API												   */
	/* =========================================================== */
	CalculationBuilder.prototype._resetItems = function () {
		this.getItems().forEach(function (oItem) {
			oItem._reset();
		});
	};

	CalculationBuilder.prototype._validateInput = function (sText, position) {
		this._oExpressionBuilder._aErrors = this._oExpressionBuilder._validateSyntax();
		this.fireAfterValidation();

		this._oInput._recreateText({
			text: sText,
			position: position,
			errors: this._oExpressionBuilder._aErrors
		});
		this._oExpressionBuilder._printErrors();

		// after filling items by suggestion, no validation is done so we have to take this into consideration
		this._oInput._displayError(this._oExpressionBuilder._aErrors.length > 0);
	};

	CalculationBuilder.prototype._findInArray = function (sKey, aItems, sProperty) {
		return aItems.some(function (oItem) {
			var sValue = sProperty ? oItem["get" + sProperty]() : oItem;
			return sValue.toLowerCase() === sKey;
		});
	};

	CalculationBuilder.prototype._findInItems = function (sKey, aItems) {
		sKey = (sKey || "").toLowerCase();

		return aItems.some(function (oItem) {
			return oItem.getKey().toLowerCase() === sKey;
		});
	};

	CalculationBuilder.prototype._createErrorText = function (aErrors, bOnlyNonIndexErrors) {
		aErrors = aErrors || this.getErrors();

		var sTitle = "",
			iErrorCount = 0,
			TOP_ERROR_COUNT = 5;

		for (var i = 0; i < aErrors.length && iErrorCount < TOP_ERROR_COUNT; i++) {
			if ((aErrors[i].index < 0 || !jQuery.isNumeric(aErrors[i].index)) || !bOnlyNonIndexErrors) {
				iErrorCount++;
				sTitle += aErrors[i].title + "\n";
			}
		}

		return sTitle;
	};

	CalculationBuilder.prototype._getFunctionMap = function () {
		return FunctionsMap;
	};

	CalculationBuilder.prototype._getFunctionDefinition = function (sKey) {
		sKey = (sKey || "").toLowerCase();
		return FunctionsMap[sKey] || jQuery.grep(this.getFunctions(), function (oFunction) {
			return oFunction.getKey().toLowerCase() === sKey;
		})[0];
	};

	CalculationBuilder.prototype._getFunctionDescription = function (oFunction) {
		var sExpression;

		if (oFunction.description) {
			return oFunction.description;
		}
		sExpression = oResourceBundle.getText("CALCULATION_BUILDER_EXPRESSION_TITLE");

		if (oFunction.template) {
			var sDescription = (oFunction.key || "") + " ( ";
			oFunction.template.forEach(function (sKey) {
				sDescription += (sKey ? sKey : sExpression) + " ";
			});

			return sDescription + ")";
		}

		return (oFunction.key || "") + " ( " + sExpression + " )";
	};

	CalculationBuilder.prototype._getFunctionTemplateItems = function (oFunction) {
		if (!oFunction) {
			return [];
		}

		var sType = (oFunction instanceof CalculationBuilderFunction) ? ItemType.CustomFunction : ItemType.Function;

		return sType === ItemType.Function ? (oFunction.template || []) : this._convertToTemplate(oFunction.getItems());
	};

	CalculationBuilder.prototype._getFunctionAllowParametersCount = function (sKey) {
		var aTemplate = this._getFunctionTemplateItems(this._getFunctionDefinition(sKey)),
			sText = aTemplate.join("");

		return (sText.match(/,/g) || []).length + 1;
	};

	CalculationBuilder.prototype._convertToTemplate = function (aItems) {
		return aItems.map(function (oItem) {
			return oItem.getKey();
		});
	};

	CalculationBuilder.prototype._isOperator = function (sKey, bAllowLogicalOperator) {
		bAllowLogicalOperator = bAllowLogicalOperator !== false;

		sKey = (sKey || "").toLowerCase();

		if (!this._isTokenAllowed(sKey)) {
			return false;
		}

		return this._findInArray(sKey, Object.keys(OperatorType)) ||
			(bAllowLogicalOperator && this.getAllowLogicalOperators() && this._findInArray(sKey, Object.keys(LogicalOperatorType))) ||
			(this.getAllowComparisonOperators() && this._findInArray(sKey, Object.keys(ComparisonOperatorType)));
	};

	CalculationBuilder.prototype._isFunction = function (sKey) {
		return this._isTokenAllowed(sKey) && this._findInArray(sKey, Object.keys(FunctionType));
	};

	CalculationBuilder.prototype._isCustomOperator = function (sKey) {
		return this._findInItems(sKey, this.getOperators());
	};

	CalculationBuilder.prototype._isStringLiteral = function (sKey) {
		return sKey && sKey.length >= 2 && sKey[0] === "\"" && sKey[sKey.length - 1] === "\"";
	};

	CalculationBuilder.prototype._getType = function (sKey) {
		sKey = (sKey || "").toLowerCase();

		if (!sKey) {
			return ItemType.Empty;
		}

		if (this._isOperator(sKey)) {
			return ItemType.Operator;
		}

		if (this._isCustomOperator(sKey)) {
			return ItemType.CustomOperator;
		}

		if (this._findInArray(sKey, this.getVariables(), "Key")) {
			return ItemType.Variable;
		}

		if (this._isFunction(sKey)) {
			return ItemType.Function;
		}

		if (this._findInArray(sKey, this.getFunctions(), "Key")) {
			return ItemType.CustomFunction;
		}

		if (this.getAllowStringLiterals() && this._isStringLiteral(sKey)) {
			return ItemType.Literal;
		}

		if (!isNaN(sKey)) {
			return ItemType.Literal;
		}

		return ItemType.Error;
	};

	CalculationBuilder.prototype._createToolbar = function () {
		if (this._oToolbar) {
			this._oShowInputButton && this._oShowInputButton.setVisible(this._isInputVisible());

			// title update
			this._oToolbarTitle.setText(this.getTitle());
			this._oToolbarTitle.setVisible(!!this.getTitle());

			return;
		}

		this._oToolbarTitle = new Title({
			titleStyle: TitleLevel.H4,
			text: this.getTitle(),
			visible: !!this.getTitle()
		});

		this._oToolbar = new OverflowToolbar(this.getId() + "-toolbar", {
			content: [this._oToolbarTitle, new ToolbarSpacer()]
		}).addStyleClass("sapCalculationBuilderToolbar");

		// "Expression Output" toggle button
		this._oShowInputButton = new OverflowToolbarToggleButton({
			type: ButtonType.Transparent,
			icon: Icons.SHOW_EXPRESSION,
			tooltip: oResourceBundle.getText("CALCULATION_BUILDER_TOGGLE_EXPRESSION_BUTTON"),
			pressed: true,
			press: function () {
				this.$().find(".sapCalculationBuilderInputOuterWrapper").toggle();
				this._bShowInput = !this._bShowInput;
			}.bind(this)
		});

		this._oToolbar.addContent(this._oShowInputButton);

		// "Expand All Variables" button
		this._oToolbar.addContent(this._getExpandAllVariablesButton());

		// Full screen mode button
		this._oToolbar.addContent(new OverflowToolbarToggleButton({
			type: ButtonType.Transparent,
			icon: Icons.FULL_SCREEN,
			tooltip: oResourceBundle.getText("CALCULATION_BUILDER_ENTER_FULL_SCREEN_BUTTON"),
			press: function (oEvent) {
				var oToggleButton = oEvent.getSource();

				this._toggleFullScreen();
            oToggleButton.setAggregation("tooltip",
              this._bIsFullScreen
                ? oResourceBundle.getText(
                    "CALCULATION_BUILDER_EXIT_FULL_SCREEN_BUTTON"
                  )
                : oResourceBundle.getText(
                    "CALCULATION_BUILDER_ENTER_FULL_SCREEN_BUTTON"
                  ),
                  true
            );
            oToggleButton.setProperty("icon", this._bIsFullScreen ? Icons.EXIT_FULL_SCREEN : Icons.FULL_SCREEN, true);
            oToggleButton.focus();
		}.bind(this)
		}));

		this.addDependent(this._oToolbar);
	};

	CalculationBuilder.prototype._getExpandAllVariablesButton = function () {
		if (!this._oExpandAllVariablesButton) {
			this._oExpandAllVariablesButton = new OverflowToolbarButton({
				type: ButtonType.Transparent,
				icon: Icons.EXPAND_VARIABLE,
				tooltip: oResourceBundle.getText("CALCULATION_BUILDER_EXPAND_ALL_BUTTON"),
				press: function (oEvent) {
					MessageBox.show(
						oResourceBundle.getText("CALCULATION_BUILDER_EXPAND_ALL_MESSAGE_TEXT"), {
							icon: MessageBox.Icon.WARNING,
							title: oResourceBundle.getText("CALCULATION_BUILDER_EXPAND_ALL_MESSAGE_TITLE"),
							actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
							onClose: function (sAction) {
								if (sAction === MessageBox.Action.OK) {
									this._oExpressionBuilder._expandAllVariables();
								}
							}.bind(this)
						}
					);
				}.bind(this)
			});
		}
		return this._oExpandAllVariablesButton;
	};

	CalculationBuilder.prototype._enableOrDisableExpandAllButton = function () {
		var bIsReadOnly = this.getReadOnly() || this.getLayoutType() === LayoutTypes.VisualTextualReadOnly,
			$button = this._getExpandAllVariablesButton().$();

		// skip if button is not rendered
		if ($button[0]) {
			this._getExpandAllVariablesButton().setEnabled(!bIsReadOnly && this.getItems().some(function (oItem) {
				return oItem._isVariable() && oItem.isExpandable();
			}));
		}
	};

	CalculationBuilder.prototype.setExpression = function (sValue) {
		this.setProperty("expression", sValue);
		this._sExpressionDirectValue = sValue;

		// this prevents setting via default value binding
		if (this._bRendered || this._sExpressionDirectValue) {
			this._bExpressionSet = true;
		}
		this._oInput._setupAriaLabel();

		return this;
	};


	CalculationBuilder.prototype.getExpression = function () {
		if (this._bExpressionSet) {
			return this._sExpressionDirectValue;
		}

		return this._oInput._itemsToString({
			createInputText: false,
			items: this.getItems()
		});
	};

	CalculationBuilder.prototype._setExpression = function (sValue) {
		if (sValue) {
			// replace &nbsp; to " "
			sValue = sValue.replace(oNbspReg, " ");
		}

		this.setProperty("expression", sValue, true);
		this._oInput._setupAriaLabel();
	};

	CalculationBuilder.prototype._toggleFullScreen = function (oToggleButton) {
		this._oFullScreenButton = oToggleButton;
		this._bIsFullScreen = !this._bIsFullScreen;
		if (!this._oFullScreenUtil) {
			this._oFullScreenUtil = FullScreenUtil;
		}

		this._oFullScreenUtil.toggleFullScreen(this, this._bIsFullScreen, this._oFullScreenButton, this._toggleFullScreen);
	};

	CalculationBuilder.prototype._getGroupMap = function () {
		return this._oExpressionBuilder._mGroups;
	};

	CalculationBuilder.prototype._isExpressionVisible = function () {
		return this.getLayoutType() !== LayoutTypes.TextualOnly;
	};

	CalculationBuilder.prototype._isInputVisible = function () {
		return this.getLayoutType() !== LayoutTypes.VisualOnly;
	};

	CalculationBuilder.prototype._createFunctionObject = function (oFunction) {
		if (!oFunction) {
			return null;
		}

		return oFunction instanceof CalculationBuilderFunction ? {
			key: oFunction.getKey(),
			title: oFunction._getLabel(),
			description: this._getFunctionDescription({
				key: oFunction.getKey(),
				description: oFunction.getDescription(),
				template: this._convertToTemplate(oFunction.getItems())
			}),
			type: ItemType.CustomFunction,
			functionObject: oFunction
		} : {
			key: oFunction.key,
			title: oFunction.title,
			description: this._getFunctionDescription(oFunction),
			type: ItemType.Function,
			functionObject: oFunction
		};
	};

	CalculationBuilder.prototype._getAllFunctions = function () {
		var aFunctions = [];

		Object.keys(FunctionsMap).forEach(function (sKey) {
			if (FunctionsMap[sKey].allowed && this._isTokenAllowed(sKey)) {
				aFunctions.push(this._createFunctionObject(FunctionsMap[sKey]));
			}
		}.bind(this));

		this.getFunctions().forEach(function (oFunction) {
			aFunctions.push(this._createFunctionObject(oFunction));
		}.bind(this));

		return aFunctions.sort(function (o1, o2) {
			if (o1.title < o2.title) {
				return -1;
			} else {
				return 1;
			}
		});
	};

	CalculationBuilder.prototype._isTokenAllowed = function (sKey) {
		return !this._mDisabledTokens[(sKey || "").toLowerCase()];
	};

	CalculationBuilder.prototype.setDisabledDefaultTokens = function (sValue) {
		this._mDisabledTokens = {};
		this.setProperty("disabledDefaultTokens", sValue);

		if (sValue) {
			var aValues = sValue.split(";");

			aValues.forEach(function (sParsedValue) {
				if (sParsedValue) {
					this._mDisabledTokens[sParsedValue.toLowerCase()] = 1;
				}
			}.bind(this));
		}

		return this;
	};

	return CalculationBuilder;
});
