sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"./library",
	"./CalculationBuilderItem",
	"sap/ui/core/Control",
	"sap/ui/core/Popup",
	"sap/ui/core/delegate/ItemNavigation",
	"sap/m/MessageBox",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarToggleButton",
	"sap/m/OverflowToolbarButton",
	"sap/m/ToolbarSpacer",
	"sap/m/Title",
	"sap/m/Button",
	"sap/m/FlexBox",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/library",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/StepInput",
	"sap/m/Input",
	"sap/m/Page",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/NavContainer",
	"sap/m/SearchField",
	"sap/m/Label",
	"sap/m/Panel",
	"sap/m/ResponsivePopover",
	"sap/m/Toolbar",
	"sap/m/MessageStrip",
	"./CalculationBuilderValidationResult",
	"sap/suite/ui/commons/ControlProxy",
	"sap/ui/core/Icon",
	"sap/ui/core/library",
	"sap/ui/thirdparty/jqueryui/jquery-ui-core",
	"sap/ui/thirdparty/jqueryui/jquery-ui-widget",
	"sap/ui/thirdparty/jqueryui/jquery-ui-mouse",
	"sap/ui/thirdparty/jqueryui/jquery-ui-draggable",
	"sap/ui/thirdparty/jqueryui/jquery-ui-droppable",
	"sap/ui/thirdparty/jqueryui/jquery-ui-selectable"
], function (jQuery, library, CalculationBuilderItem, Control, Popup, ItemNavigation, MessageBox,
			 OverflowToolbar, OverflowToolbarToggleButton, OverflowToolbarButton, ToolbarSpacer, Title,
			 Button, FlexBox, HBox, VBox, MobileLibrary, SegmentedButton, SegmentedButtonItem,
			 StepInput, Input, Page, List, StandardListItem, NavContainer, SearchField,
			 Label, Panel, ResponsivePopover, Toolbar, MessageStrip, ValidationResult, ControlProxy, Icon, coreLibrary) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = MobileLibrary.PlacementType;

	// shortcut for sap.m.ListType
	var ListType = MobileLibrary.ListType;

	// shortcut for sap.m.ListMode
	var ListMode = MobileLibrary.ListMode;

	// shortcut for sap.m.FlexRendertype
	var FlexRendertype = MobileLibrary.FlexRendertype;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	var ItemType = library.CalculationBuilderItemType,
		OperatorType = library.CalculationBuilderOperatorType,
		ComparisonOperatorType = library.CalculationBuilderComparisonOperatorType,
		LogicalOperatorType = library.CalculationBuilderLogicalOperatorType,
		LayoutTypes = library.CalculationBuilderLayoutType,
		FlexDirection = MobileLibrary.FlexDirection;

	var Ids = Object.freeze({
		PAGE_MAIN: "-pagemain",
		PAGE_OPERATORS: "-pageoperators",
		PAGE_VARIABLE: "-pagevariable",
		PAGE_FUNCTIONS: "-pagefunctions",
		LABEL_LITERALS: "-literalInput-label",
		INPUT_LITERALS: "-literalInput-field"
	});

	var Icons = Object.freeze({
		OPERATORS_CATEGORY: "sap-icon://attachment-html",
		LITERALS_CATEGORY: "sap-icon://grid",
		VARIABLES_CATEGORY: "sap-icon://notes",
		FUNCTIONS_CATEGORY: "sap-icon://chalkboard",
		DELETE: "sap-icon://delete"
	});

	var Directions = Object.freeze({
		KEY_PREVIOUS: "previous",
		KEY_NEXT: "next",
		MOUSE: "mouse"
	});

	var DEFAULT_GROUP_KEY = "##DEFAULT##";

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

	/**
	 * Constructor for a new expression.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The expression entered into the calculation builder.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.56.0
	 *
	 * @constructor
	 * @alias sap.suite.ui.commons.CalculationBuilderExpression
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel.
	 */
	var CalculationBuilderExpression = Control.extend("sap.suite.ui.commons.CalculationBuilderExpression", /** @lends sap.suite.ui.commons.CalculationBuilder.prototype */ {
		metadata: {
			library: "sap.suite.ui.commons",
			defaultAggregation: "items",
			aggregations: {
				/**
				 * Holds the items included in the expression.
				 */
				items: {
					type: "sap.suite.ui.commons.CalculationBuilderItem",
					multiple: true,
					singularName: "item",
					bindable: "bindable"
				},
				/**
				 * Holds the variables used in the expression.
				 */
				variables: {
					type: "sap.suite.ui.commons.CalculationBuilderVariable",
					multiple: true,
					singularName: "Variable"
				},
				/**
				 * Holds the functions used in the expression.
				 */
				functions: {
					type: "sap.suite.ui.commons.CalculationBuilderFunction",
					multiple: true,
					singularName: "Function"
				},
				/**
				 * Additional application defined operators. These operators are not validated.
				 */
				operators: {
					type: "sap.ui.core.Item",
					multiple: true,
					singularName: "operator"
				},
				/**
				 * Variables can be separated to multiple groups for better orientation among different types of variables.
				 */
				groups: {
					type: "sap.suite.ui.commons.CalculationBuilderGroup",
					multiple: true,
					singularName: "Group"
				}
			},
			events: {
				/**
				 * This event is fired when the order of items changes, or when some items are added or removed.
				 */
				change: {}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oCalculationBuilderExpression) {
			oRm.openStart("div", oCalculationBuilderExpression);
			oRm.class("sapCalculationBuilderInner");
			oRm.openEnd();
			oCalculationBuilderExpression._renderDelimiter(oRm, 0);

			oCalculationBuilderExpression.getItems().forEach(function (oItem, i) {
				oItem._iIndex = i;
				oItem._bReadOnly = oCalculationBuilderExpression._bReadOnly;
				oRm.renderControl(oItem);
				 oCalculationBuilderExpression._renderDelimiter(oRm, i + 1);
			}, this);

			if (!oCalculationBuilderExpression._bReadOnly) {
				oRm.renderControl(oCalculationBuilderExpression._getNewItem());
			}
			oRm.openStart("div");
			oRm.class("sapCalculationBuilderSelected");
			oRm.openEnd();
			oRm.close("div");
			oRm.close("div");

			oRm.openStart("div",oCalculationBuilderExpression.getId() + "-erroricon");
			oRm.class("sapCalculationBuilderExpressionErrorIcon");
			oRm.openEnd();
			oRm.renderControl(oCalculationBuilderExpression._getErrorIcon());
			oRm.close("div");
		}
		}
	});

	/* =========================================================== */
	/* Init & events	    									   */
	/* =========================================================== */
	CalculationBuilderExpression.prototype.init = function () {
		// collection of syntax errors
		this._aErrors = [];

		// Indicates whether selected items are deleting by Delete key
		this._bAreSelectedItemsDeleting = false;

		// dragging indicator
		this._bDragging = false;

		// indicator to check whether builder is just being rendered (prevents never empty loops)
		this._bIsCalculationBuilderRendering = false;
	};

	CalculationBuilderExpression.prototype._renderDelimiter = function (oRm, iIndex) {
		oRm.openStart("div");
		oRm.attr("index", iIndex);
		oRm.class("sapCalculationBuilderDelimiter").class("sapCalculationBuilderDroppable");
		oRm.openEnd();
		oRm.openStart("div");
		oRm.class("sapCalculationBuilderDroppableLine");
		oRm.openEnd();
		oRm.close("div");
		oRm.openStart("div");
		oRm.class("sapCalculationBuilderDroppableCircle");
		oRm.openEnd();
		oRm.close("div");
		oRm.openStart("div");
		oRm.class("sapCalculationBuilderDelimiterNewButton");
		oRm.openEnd();
		oRm.openStart("span");
		oRm.attr("role", "presentation");
		oRm.attr("aria-hidden", "true");
		oRm.attr("data-sap-ui-icon-content", "");
		oRm.class("sapUiIcon").class("sapUiIconMirrorInRTL").class("sapCalculationBuilderDelimiterNewButtonIcon").class("sapCalculationBuilderExpressionSAPFont");
		oRm.openEnd();
		oRm.close("span");
		oRm.close("div");
		oRm.close("div");
	};


	CalculationBuilderExpression.prototype.onBeforeRendering = function () {
		// variables or function aggregations may be changed in the runtime (so we need to reset all items' marks (as there are based on variables and function collections))
		// also we need to recreate the popup to show correct data
		// default example of such issue is async loading of model -> popover is made with 0 data as they are not loaded in first run
		if (!this.getParent()._oInput._aVariables.length) {
			this._createVariablesMap();
			this.getParent()._oInput._aVariables = this.getParent().getVariables();
		}

		this._reset();
		this._createPopup();

		this.getParent()._enableOrDisableExpandAllButton();

		this._aErrors = this._validateSyntax();
		this._fireAfterValidation();

		this._bIsCalculationBuilderRendering = true;

		this._bRendered = false;
	};

	CalculationBuilderExpression.prototype.onAfterRendering = function () {
		this._bIsCalculationBuilderRendering = false;
		if (!this._bReadOnly) {
			this._setupDroppable();
			this._setupSelectable();
			this._setupNewButtonEvents();
		}
		this._setupKeyboard();
		this._bRendered = true;

		// if changed via aggregation changes (addItems...) we need to recreate text as agg. functions doesn't trigger
		// invalidation of whole control due to the aggregation forwarding
		var oParent = this.getParent();
		if (oParent._bRendered) {
			oParent._setExpression(oParent._oInput._itemsToString({
				items: this.getItems(),
				errors: this._aErrors
			}));
			oParent._oInput._displayError(this._aErrors.length !== 0);
		}
	};

	CalculationBuilderExpression.prototype.onsapfocusleave = function () {
		if (!this._bAreSelectedItemsDeleting) {
			this._deselect();
		}
	};

	CalculationBuilderExpression.prototype.onsapenter = function (oEvent) {
		this._handleEnter(oEvent);
	};

	CalculationBuilderExpression.prototype.onsapspace = function (oEvent) {
		if (jQuery(oEvent.target).hasClass("sapCalculationBuilderItem")) {
			this._handleSpace(oEvent);
		}
	};

	CalculationBuilderExpression.prototype.onsappreviousmodifiers = function (oEvent) {
		if (oEvent.ctrlKey) {
			this._handleCtrlPrevious(oEvent);
		}
	};

	CalculationBuilderExpression.prototype.onsapnextmodifiers = function (oEvent) {
		if (oEvent.ctrlKey) {
			this._handleCtrlNext(oEvent);
		}
	};

	CalculationBuilderExpression.prototype.onsapdelete = function (oEvent) {
		this._handleDelete(oEvent);
	};

	CalculationBuilderExpression.prototype.exit = function () {
		if (this._oPopover) {
			this._oPopover.destroy();
		}

		if (this._oItemNavigation) {
			this.removeDelegate(this._oItemNavigation);
			this._oItemNavigation.destroy();
		}

		if (this._oErrorIcon) {
			this._oErrorIcon.destroy();
			this._oErrorIcon = null;
		}
	};

	/* =========================================================== */
	/* Controls initialization									   */
	/* =========================================================== */
	CalculationBuilderExpression.prototype._getErrorIcon = function () {
		if (!this._oErrorIcon) {
			this._oErrorIcon = new Icon({
				src: "sap-icon://message-error",
				useIconTooltip: false,
				size: "20px"
			});
		}

		return this._oErrorIcon;
	};

	CalculationBuilderExpression.prototype._createPopup = function () {
		var oPopoverItems = {
			footerButtons: []
		};

		this._createPopoverLayout(oPopoverItems);
		this._createPopoverFunctionsItems(oPopoverItems);
		this._createPopoverOperatorsItems(oPopoverItems);
		this._createPopoverNavContainer(oPopoverItems);

		this._createPopover(oPopoverItems);
	};

	CalculationBuilderExpression.prototype._reset = function () {
		this.getItems().forEach(function (oItem) {
			oItem._reset();
		});

		if (this._oPopover) {
			this._oPopover.destroy();
			this._oPopover = null;
		}
	};

	CalculationBuilderExpression.prototype._createPopoverLayout = function (oPopoverItems) {
		var fnCreateButton = function (sLabel) {
			return new Button({
				text: sLabel,
				press: this._updateOrCreateItem.bind(this, {
					type: ItemType.Operator,
					key: sLabel
				})
			}).addStyleClass("sapUiTinyMarginEnd");
		}.bind(this);


		var oOperatorsBox = new HBox({
			renderType: FlexRendertype.Div,
			width: "100%"
		});
		oOperatorsBox.addStyleClass("sapCalculationBuilderItemPopupOperators");
		oOperatorsBox.addStyleClass("sapCalculationBuilderItemPopupOptionItem");
		Object.keys(OperatorType).forEach(function (sKey) {
			if (this.getParent()._isTokenAllowed(sKey)) {
				var oButton = fnCreateButton(OperatorType[sKey]);

				if (sKey === OperatorType[","]) {
					this._attachAriaLabelToButton(oButton, oResourceBundle.getText("CALCULATION_BUILDER_COMMA_ARIA_LABEL"));
				} else if (sKey === OperatorType["-"]) {
					this._attachAriaLabelToButton(oButton, oResourceBundle.getText("CALCULATION_BUILDER_MINUS_ARIA_LABEL"));
				}
				oOperatorsBox.addItem(oButton);
			}
		}.bind(this));

		var oLiteralLabelAndInput = this._createPopoverLiteralLabelAndInput(oPopoverItems);

		var oLayout = new VBox({
			items: [oOperatorsBox, oLiteralLabelAndInput],
			alignItems: "Start"
		});
		oLayout.addStyleClass("sapCalculationBuilderItemPopupOperatorsAndInputWrapper");

		oPopoverItems.layout = oLayout.getItems().length > 0 ? oLayout : null;
	};

	CalculationBuilderExpression.prototype._createPopoverLiteralLabelAndInput = function (oPopoverItems) {
		var oLiteralLabel = new Label({
			id: this.getId() + Ids.LABEL_LITERALS,
			text: oResourceBundle.getText("CALCULATION_BUILDER_LITERAL_INPUT_LABEL")
		});

		var oLiteralInput;
		if (this.getParent().getAllowStringLiterals()) {
			oLiteralInput = new Input({
				id: this.getId() + Ids.INPUT_LITERALS,
				width: "100%",
				placeholder: oResourceBundle.getText("CALCULATION_BUILDER_ADD_LITERAL_FIELD_PLACEHOLDER_ANY_STRING"),
				valueStateText: oResourceBundle.getText("CALCULATION_BUILDER_ADD_LITERAL_FIELD_PLACEHOLDER_ERROR"),
				liveChange: function (oEvent) {
					var oSource = oEvent.getSource(),
						sValue = oEvent.getParameter("value"),
						bIsCorrect = sValue.indexOf("\"") === -1;

					oSource.setValueState(bIsCorrect ? ValueState.None : ValueState.Error);
					oPopoverItems.footerButtons.okButton.setEnabled(bIsCorrect);
				},
				submit: function (oEvent) {
					this._submitLiteralInput(oLiteralInput);
				}.bind(this)

			});
		} else {
			oLiteralInput = new StepInput({
				width: "100%",
				placeholder: oResourceBundle.getText("CALCULATION_BUILDER_ADD_LITERAL_FIELD_PLACEHOLDER"),
				textAlign: TextAlign.Right,
				valueStateText: oResourceBundle.getText("CALCULATION_BUILDER_ADD_LITERAL_FIELD_ERROR_TEXT"),
				displayValuePrecision: 3,
				change: function () {
					oPopoverItems.footerButtons.okButton.setEnabled(true);
				}
			});
			// a bit of a hack because stepinput itself does not have a submit event, but its inner input does
			if (oLiteralInput._getInput) {
				var oInternalNumericInput = oLiteralInput._getInput();
				if (oInternalNumericInput) {
					oInternalNumericInput.attachSubmit(
						function (oEvent) {
							this._submitLiteralInput(oLiteralInput);
						},
						this
					);
				}
			}
		}
		oLiteralInput.addAriaLabelledBy(oLiteralLabel);
		oPopoverItems.literalInput = oLiteralInput;

		// wrapper
		var oLiteralLabelAndInput = new VBox({
			renderType: FlexRendertype.Div,
			items: [oLiteralLabel, oLiteralInput],
			width: "100%"
		});
		oLiteralLabelAndInput.addStyleClass("sapCalculationBuilderItemPopupOptionItem");
		oLiteralLabelAndInput.addStyleClass("sapCalculationBuilderItemPopupLiteralLabelAndInput");

		return oLiteralLabelAndInput;
	};

	CalculationBuilderExpression.prototype._createPopoverVariablesItems = function (aAggItems) {
		if (!aAggItems) {
			return [];
		}

		var aItems = [];
		aAggItems.forEach(function (oItem) {
			var oListItem = new StandardListItem({
				title: oItem._getLabel()
			});
			oListItem._calculationBuilderKey = oItem.getKey();
			aItems.push(oListItem);
		}, this);

		aItems = aItems.sort(function (o1, o2) {
			return o1.getTitle().localeCompare(o2.getTitle());
		});

		var oList = new List({
			mode: ListMode.SingleSelectMaster,
			selectionChange: function (oEvent) {
				this._updateOrCreateItem({
					type: ItemType.Variable,
					key: oEvent.getParameter("listItem")._calculationBuilderKey
				});
			}.bind(this),
			items: aItems
		});

		this._oSearchField = new SearchField({
			placeholder: oResourceBundle.getText("CALCULATION_BUILDER_SEARCH_VARIABLE"),
			liveChange: function (oEvent) {
				var sQuery = oEvent.getSource().getValue();

				if (sQuery || sQuery === "") {
					oList.removeAllItems();
					aItems.forEach(function (oItem) {
						if (oItem.getTitle().toLowerCase().indexOf(sQuery.toLowerCase()) !== -1) {
							oList.addItem(oItem);
						}
					});
				}
			}
		});

		this._aVariableLists.push(oList);

		return [this._oSearchField, oList];
	};

	CalculationBuilderExpression.prototype._createPopoverFunctionsItems = function (oPopoverItems) {
		var that = this,
			oParent = this.getParent();

		var fnCreateItem = function (mParameters) {
			return new StandardListItem({
				title: mParameters.title,
				description: mParameters.description,
				type: ListType.Active,
				customData: [{
					key: "functionKey",
					value: mParameters.key
				}],
				press: mParameters.press
			});
		};

		oPopoverItems.functionList = new List({
			mode: ListMode.SingleSelectMaster,
			itemPress: function () {
				this.getSelectedItem().firePress();
			}
		});

		oParent._getAllFunctions().forEach(function (oItem) {
			oPopoverItems.functionList.addItem(fnCreateItem({
				key: oItem.key,
				title: oItem.title,
				description: oItem.description,
				press: that._updateOrCreateItem.bind(that, {
					key: oItem.key,
					type: oItem.type,
					functionObject: oItem.functionObject
				})
			}));
		});
	};

	CalculationBuilderExpression.prototype._createPopoverOperatorsItems = function (oPopoverItems) {
		var oParent = this.getParent();
		var fnGetOperatorsButtons = function (oOperators, sType) {
			var aButtons = [];

			Object.keys(oOperators).forEach(function (sKey) {
				var sItemKey, sText,
					oKey = oOperators[sKey];

				if (oParent._isTokenAllowed(sKey)) {
					if (typeof oKey === "object") {
						sText = oKey.getText();
						sItemKey = oKey.getKey();
					} else {
						sItemKey = sText = oKey;
					}

					var oButton = new Button({
						text: sText,
						press: this._updateOrCreateItem.bind(this, {
							type: sType,
							key: sItemKey
						})
					}).addStyleClass("sapCalculationBuilderPopoverOperatorsButton").addStyleClass("sapUiTinyMarginEnd");

					if (sKey === ComparisonOperatorType["!="]) {
						this._attachAriaLabelToButton(oButton, oResourceBundle.getText("CALCULATION_BUILDER_NOT_EQUAL_ARIA_LABEL"));
					}
					aButtons.push(oButton);
				}
			}.bind(this));

			return aButtons;
		}.bind(this);

		var fnGetPanel = function (sTitle, oOperatorTypes, sType) {
			var aButtons = fnGetOperatorsButtons(oOperatorTypes, sType);
			if (aButtons.length > 0) {
				return new Panel({
					content: [
						new Label({
							width: "100%",
							text: sTitle
						}).addStyleClass("sapUiTinyMarginBottom"),
						aButtons
					]
				});
			}
			return null;
		};

		oPopoverItems.operatorsItems = [];

		if (this.getParent().getAllowComparisonOperators()) {
			var oComparisonPanel = fnGetPanel(oResourceBundle.getText("CALCULATION_BUILDER_COMPARISON_TITLE_SELECT"), ComparisonOperatorType, ItemType.Operator);
			oComparisonPanel && oPopoverItems.operatorsItems.push(oComparisonPanel);
		}

		if (this.getParent().getAllowLogicalOperators()) {
			var oLogicalPanel = fnGetPanel(oResourceBundle.getText("CALCULATION_BUILDER_LOGICAL_TITLE_SELECT"), LogicalOperatorType, ItemType.Operator);
			oLogicalPanel && oPopoverItems.operatorsItems.push(oLogicalPanel);
		}

		var aCustomOperators = this.getParent().getOperators();
		if (aCustomOperators.length > 0) {
			oPopoverItems.operatorsItems.push(fnGetPanel(oResourceBundle.getText("CALCULATION_BUILDER_OPERATORS_TITLE"), aCustomOperators, ItemType.CustomOperator));
		}
	};

	CalculationBuilderExpression.prototype._createPopoverNavContainer = function (oPopoverItems) {
		var fnNavToPage = function (sId) {
			var oPage = oNavContainer.getPage(sId);
			oNavContainer.to(oPage);
		};

		var fnCreateMessageStrip = function () {
			var oStrip = new MessageStrip({
				type: "Error",
				showIcon: true
			}).addStyleClass("sapUiTinyMarginBegin sapUiTinyMarginEnd sapUiTinyMarginTop");

			this._aStrips.push(oStrip);

			return oStrip;
		}.bind(this);

		this._aStrips = [];
		var aPages = [];

		var aDefaultItems = this._createPopoverVariablesItems(this._mGroups[DEFAULT_GROUP_KEY]);
		if (aDefaultItems.length > 0) {
			aPages.push(new StandardListItem({
				title: oResourceBundle.getText("CALCULATION_BUILDER_VARIABLES_TITLE"),
				description: oResourceBundle.getText("CALCULATION_BUILDER_VARIABLES_CATEGORY_DESCRIPTION"),
				wrapping: true,
				icon: Icons.VARIABLES_CATEGORY,
				press: fnNavToPage.bind(this, this.getId() + Ids.PAGE_VARIABLE),
				type: ListType.Active
			}));
		}

		var aFunctions = oPopoverItems.functionList.getItems();
		if (aFunctions.length > 0) {
			aPages.push(new StandardListItem({
				title: oResourceBundle.getText("CALCULATION_BUILDER_FUNCTIONS_TITLE"),
				type: ListType.Active,
				description: oResourceBundle.getText("CALCULATION_BUILDER_FUNCTIONS_CATEGORY_DESCRIPTION"),
				wrapping: true,
				icon: Icons.FUNCTIONS_CATEGORY,
				press: fnNavToPage.bind(this, this.getId() + Ids.PAGE_FUNCTIONS)
			}));
		}

		if (oPopoverItems.operatorsItems.length > 0) {
			aPages.unshift(new StandardListItem({
				title: oResourceBundle.getText("CALCULATION_BUILDER_OPERATORS_TITLE"),
				type: ListType.Active,
				description: oResourceBundle.getText("CALCULATION_BUILDER_OPERATORS_CATEGORY_DESCRIPTION"),
				wrapping: true,
				icon: Icons.OPERATORS_CATEGORY,
				press: fnNavToPage.bind(this, this.getId() + Ids.PAGE_OPERATORS)
			}));
		}

		this.getGroups().forEach(function (oGroup) {
			aPages.push(new StandardListItem({
				title: oGroup._getTitle(),
				type: ListType.Active,
				description: oGroup.getDescription(),
				icon: oGroup.getIcon(),
				press: fnNavToPage.bind(this, this.getId() + oGroup.getKey())
			}));
		}.bind(this));

		var oMainPage = new Page({
			id: this.getId() + Ids.PAGE_MAIN,
			title: oResourceBundle.getText("CALCULATION_BUILDER_DIALOG_TITLE"),
			content: [
				fnCreateMessageStrip(),
				oPopoverItems.layout,
				new FlexBox({
					direction: FlexDirection.Column,
					items: [new List({
						items: aPages
					})]
				}).addStyleClass("sapUiSmallMarginBeginEnd").addStyleClass("sapUiTinyMarginTop").addStyleClass("sapCalculationBuilderNavMainPage")
			]
		});
		oMainPage.setFooter(this._getPageFooter(oMainPage.getId(), oPopoverItems));

		var oNavContainer = new NavContainer({
			defaultTransitionName: "show",
			navigate: function (oEvent) {
				var oActualPage = oEvent.getParameters().to;
				oActualPage.setFooter(this._getPageFooter(oActualPage.getId(), oPopoverItems));
			}.bind(this),
			pages: [oMainPage]
		});

		if (oPopoverItems.operatorsItems.length > 0) {
			oNavContainer.addPage(new Page({
				id: this.getId() + Ids.PAGE_OPERATORS,
				content: [
					fnCreateMessageStrip(),
					new FlexBox({
						direction: FlexDirection.Column,
						items: [oPopoverItems.operatorsItems]
					}).addStyleClass("sapUiSmallMarginBeginEnd").addStyleClass("sapUiTinyMarginTop")
				],
				showNavButton: true,
				title: oResourceBundle.getText("CALCULATION_BUILDER_OPERATORS_PAGE_TITLE"),
				navButtonPress: fnNavToPage.bind(this, this.getId() + Ids.PAGE_MAIN)
			}));
		}

		if (aDefaultItems.length > 0) {
			oNavContainer.addPage(new Page({
				id: this.getId() + Ids.PAGE_VARIABLE,
				content: [
					fnCreateMessageStrip(),
					new FlexBox({
						direction: FlexDirection.Column,
						items: aDefaultItems
					}).addStyleClass("sapUiSmallMarginBeginEnd").addStyleClass("sapUiTinyMarginTop")
				],
				showNavButton: true,
				title: oResourceBundle.getText("CALCULATION_BUILDER_VARIABLES_PAGE_TITLE"),
				navButtonPress: fnNavToPage.bind(this, this.getId() + Ids.PAGE_MAIN)
			}));
		}

		if (aFunctions.length > 0) {
			oNavContainer.addPage(
				new Page({
					id: this.getId() + Ids.PAGE_FUNCTIONS,
					content: [
						fnCreateMessageStrip(),
						new FlexBox({
							direction: FlexDirection.Column,
							items: [oPopoverItems.functionList]
						}).addStyleClass("sapUiSmallMarginBeginEnd").addStyleClass("sapUiTinyMarginTop")
					],
					showNavButton: true,
					title: oResourceBundle.getText("CALCULATION_BUILDER_FUNCTIONS_PAGE_TITLE"),
					navButtonPress: fnNavToPage.bind(this, this.getId() + Ids.PAGE_MAIN)
				}));
		}

		this.getGroups().forEach(function (oGroup) {
			var oPage = new Page({
				id: this.getId() + oGroup.getKey(),
				showNavButton: true,
				title: oGroup._getTitle(),
				navButtonPress: fnNavToPage.bind(this, this.getId() + Ids.PAGE_MAIN),
				content: fnCreateMessageStrip()
			});

			var oGroupControl = oGroup.getCustomView();
			if (oGroupControl) {
				var oProxy = new ControlProxy();

				oProxy.setAssociation("control", oGroupControl);
				oPage.addContent(oProxy);
			} else {
				oPage.addContent(
					new FlexBox({
						direction: FlexDirection.Column,
						items: this._createPopoverVariablesItems(this._mGroups[oGroup.getKey()])
					}).addStyleClass("sapUiSmallMarginBeginEnd").addStyleClass("sapUiTinyMarginTop")
				);
			}

			oNavContainer.addPage(oPage);
		}.bind(this));

		oPopoverItems.navContainer = oNavContainer;
	};

	CalculationBuilderExpression.prototype._callFunctionFireSelection = function (sKey) {
		this.getGroups().forEach(function (oGroup) {
			if (oGroup.getCustomView()) {
				oGroup.fireSetSelection({
					key: sKey
				});
			}
		});
	};

	CalculationBuilderExpression.prototype._clearVariableLists = function () {
		this._aVariableLists.forEach(function (oList) {
			var oSelectedItemInVariablesList = oList.getSelectedItem();
			if (oSelectedItemInVariablesList) {
				oList.setSelectedItem(oSelectedItemInVariablesList, false);
			}
		});

		this._callFunctionFireSelection();
	};

	CalculationBuilderExpression.prototype._setVariableListSelection = function (sKey) {
		for (var i = 0; i < this._aVariableLists.length; i++) {
			var oList = this._aVariableLists[i],
				aItems = this._aVariableLists[i].getItems();

			for (var k = 0; k < aItems.length; k++) {
				if (aItems[k]._calculationBuilderKey === sKey) {
					oList.setSelectedItem(aItems[k], true);
					return;
				}
			}
		}

		this._callFunctionFireSelection(sKey);
	};

	CalculationBuilderExpression.prototype._sanitizeStringLiteral = function (sValue) {
		if (this.getParent()._isStringLiteral(sValue)) {
			sValue = sValue.substring(1, sValue.length - 1);
		}

		return sValue;
	};

	//Method to Clears Search field in PopOver and Trigger LiveChange of the SearchField to update the Search List.
	CalculationBuilderExpression.prototype._clearSearchField = function(){
		if (this._oSearchField) {
			this._oSearchField.setValue("");
			this._oSearchField.fireLiveChange();
		}
	};

	CalculationBuilderExpression.prototype._createPopover = function (oPopoverItems) {
		var fnShowCorrectPage = function () {
			var oItem = this._oCurrentItem,
				sCurrentPageId = oPopoverItems.navContainer.getCurrentPage().getId(),
				oSelectedItemInFunctionList = oPopoverItems.functionList.getSelectedItem(),
				sShowPageId, aFunctionListItems, sFunctionKey;

			var sDefaultLiteralValue = this.getParent().getAllowStringLiterals() ? "" : 0;
			oPopoverItems.literalInput.setValue(sDefaultLiteralValue);
			this._clearVariableLists();
			this._clearSearchField(); //Method to clear Search Filed for the popOver

			// Reset selected item in Variable List and Function List
			if (oSelectedItemInFunctionList) {
				oPopoverItems.functionList.setSelectedItem(oSelectedItemInFunctionList, false);
			}

			if (!oItem) {
				sShowPageId = this.getId() + Ids.PAGE_MAIN;
			} else {
				if (oItem._isFunction()) {
					sFunctionKey = oItem.getKey();
					sShowPageId = this.getId() + Ids.PAGE_FUNCTIONS;

					// Setup selected item in Function List
					aFunctionListItems = oPopoverItems.functionList.getItems();
					for (var i = 0; i < aFunctionListItems.length; i++) {
						var sKey = aFunctionListItems[i].data("functionKey");

						if ((sKey && sKey.toLowerCase()) === sFunctionKey.toLowerCase()) {
							oPopoverItems.functionList.setSelectedItem(aFunctionListItems[i], true);
							break;
						}
					}
				} else if (oItem._isLiteral()) {
					// Setup for Literals
					var sSanitizedKey = this._sanitizeStringLiteral(oItem.getKey());
					oPopoverItems.literalInput.setValue(sSanitizedKey);
					oPopoverItems.literalInput.setValueState(ValueState.None);

					sShowPageId = this.getId() + Ids.PAGE_MAIN;
				} else if (oItem._isVariable()) {
					this._setVariableListSelection(oItem.getKey());

					var oVariable = oItem._oVariable || oItem.getVariable(),
						sGroup = (oVariable && oVariable.getGroup()) || Ids.PAGE_VARIABLE;

					sShowPageId = this.getId() + sGroup;
				} else if (oItem._isSecondaryOperator()) {
					sShowPageId = this.getId() + Ids.PAGE_OPERATORS;
				} else {
					sShowPageId = this.getId() + Ids.PAGE_MAIN;
				}
			}

			if (sShowPageId !== sCurrentPageId) {
				if (sShowPageId !== this.getId() + Ids.PAGE_MAIN) {
					// Set correct previous page
					oPopoverItems.navContainer.backToPage(this.getId() + Ids.PAGE_MAIN);
				}
				oPopoverItems.navContainer.to(oPopoverItems.navContainer.getPage(sShowPageId), "show");
			} else {
				// Set correct footer when navigation event of NavContainer is not triggered
				oPopoverItems.navContainer.getCurrentPage().setFooter(this._getPageFooter(sCurrentPageId, oPopoverItems));
			}

			var oError = this._oCurrentItem && this._oCurrentItem._getItemError(),
				sText = oError && (" " + oError.title);

			this._aStrips.forEach(function (oStrip) {
				oStrip.setVisible(!!oError);
				oStrip.setText(sText ? oResourceBundle.getText("CALCULATION_BUILDER_INCORRECT_SYNTAX") + sText : "");
			});
		}.bind(this);

		// we expect that popover is not yet created or was destroyed (_reset function)
		this._oPopover = new ResponsivePopover({
			showHeader: false,
			resizable: true,
			placement: PlacementType.PreferredBottomOrFlip,
			contentWidth: "400px",
			contentHeight: "450px",
			content: [oPopoverItems.navContainer],
			beforeOpen: fnShowCorrectPage,
			afterClose: function () {
				this._bDragging = false;
				this._clearNewButtonPositions();
			}.bind(this)
		});
	};

	CalculationBuilderExpression.prototype._submitLiteralInput = function(oLiteralInput) {
		var sValue = oLiteralInput.getValue();
		if (this.getParent() && this.getParent().getAllowStringLiterals() && !jQuery.isNumeric(sValue)) {
			sValue = "\"" + sValue + "\"";
		}
		this._updateOrCreateItem({
			type: ItemType.Literal,
			key: sValue
		});
		oLiteralInput.setValueState(ValueState.None);
	};

	CalculationBuilderExpression.prototype._getPageFooter = function (sPageId, oPopoverItems) {
		var bEnabledConfirm = false,
			bEnabledDelete = false,
			bIsLiteral = false;

		if (this._oCurrentItem && !this._oCurrentItem._bIsNew) {
			bEnabledDelete = true;
			bIsLiteral = this._oCurrentItem._isLiteral();
		}

		bEnabledConfirm = oPopoverItems.literalInput.getValueState() === ValueState.None && sPageId === this.getId() + Ids.PAGE_MAIN && bIsLiteral;

		oPopoverItems.footerButtons.okButton = new Button({
			enabled: bEnabledConfirm,
			text: oResourceBundle.getText("CALCULATION_BUILDER_CONFIRM_BUTTON"),
			press: function (oEvent) {
				this._submitLiteralInput(oPopoverItems.literalInput);
			}.bind(this)
		});

		oPopoverItems.footerButtons.deleteButton = new Button({
			enabled: bEnabledDelete,
			text: oResourceBundle.getText("CALCULATION_BUILDER_DELETE_BUTTON"),
			press: this._deleteItem.bind(this)
		});

		oPopoverItems.footerButtons.closeButton = new Button({
			text: oResourceBundle.getText("CALCULATION_BUILDER_CLOSE_BUTTON"),
			press: this._instantClose.bind(this)
		});

		return new Toolbar({
			content: [
				new ToolbarSpacer(),
				oPopoverItems.footerButtons.okButton,
				oPopoverItems.footerButtons.deleteButton,
				oPopoverItems.footerButtons.closeButton
			]
		});
	};

	/* =========================================================== */
	/* Private methods	    									   */
	/* =========================================================== */
	CalculationBuilderExpression.prototype._insertFunctionItems = function (aNewItems, aItems) {
		var fnAppend = function (sKey) {
			aNewItems.push(sKey);
		};

		if (aItems && aItems.length > 0) {
			aItems.forEach(function (sKey) {
				fnAppend(sKey);
			});
		} else {
			// no template just empty single parameter
			fnAppend("");
		}

		fnAppend(")");
	};

	CalculationBuilderExpression.prototype._updateOrCreateItem = function (mArguments) {
		var bIsNewItem = !this._oCurrentItem || this._oCurrentItem._bIsNew,
			bIsTemplate = this._oCurrentItem && !this._oCurrentItem.getKey(),
			oParent = this.getParent(),
			oFunction = mArguments.functionObject,
			aItems = this.getItems();

		var fnProcessFunction = function () {
			var aItems = mArguments.type === ItemType.Function ? oFunction.template : oParent._convertToTemplate(oFunction.getItems());
			this._insertFunctionItems(aNewItems, aItems);
		}.bind(this);

		var fnRender = function () {
			var iItemIndex = isNaN(this._iCurrentIndex) ? this.getItems().length : this._iCurrentIndex,
				aKeys = this._getKeys();

			this._smartRender(aKeys.slice(0, iItemIndex).concat(aNewItems, aKeys.slice(iItemIndex)));
		}.bind(this);

		var fnFindCurrentItem = function () {
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i] === this._oCurrentItem) {
					return i + 1;
				}
			}

			return null;
		}.bind(this);

		if (bIsNewItem) {
			var aNewItems = [mArguments.key];

			if (oFunction) {
				fnProcessFunction();
			}

			fnRender();
		} else {
			// updating current item or creating new item from function "empty" item
			this._oCurrentItem.setKey(mArguments.key);

			if (mArguments.type) {
				this._oCurrentItem._sType = mArguments.type;
			}

			if (bIsTemplate && oFunction) {
				var aNewItems = [];
				this._iCurrentIndex = fnFindCurrentItem();
				fnProcessFunction();
				fnRender();
			}
		}

		this._instantClose();
		this._fireChange();
	};

	CalculationBuilderExpression.prototype._expandAllVariables = function () {
		this.getItems().forEach(function (oItem) {
			if (oItem.isExpandable()) {
				oItem._expandVariable(false);
			}
		});

		this._fireChange();
	};

	CalculationBuilderExpression.prototype._handleDelete = function (oEvent) {
		if (this._isEmptySelected()) {
			return;
		}
		this._bAreSelectedItemsDeleting = true;

		MessageBox.show(oResourceBundle.getText("CALCULATION_BUILDER_DELETE_MESSAGE_TEXT"), {
				icon: MessageBox.Icon.WARNING,
				title: oResourceBundle.getText("CALCULATION_BUILDER_DELETE_MESSAGE_TITLE"),
				actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
				onClose: function (sAction) {
					if (sAction === MessageBox.Action.YES) {
						var aItems = this.$().find(".sapCalculationBuilderSelected .sapCalculationBuilderItem"),
							iLength = aItems.length,
							$first = aItems.first(),
							oItem = sap.ui.getCore().byId($first.attr("id"));

						if (oItem) {
							var aKeys = this._getKeys();
							aKeys.splice(oItem._iIndex, iLength);
							this._smartRender(aKeys);

							this._fireChange();
						}
					}
					this._bAreSelectedItemsDeleting = false;
				}.bind(this)
			}
		);
	};

	CalculationBuilderExpression.prototype._handleEnter = function (oEvent) {
		var $item = jQuery(oEvent.target),
			oItem;

		if (this._oItemNavigation && !this._bReadOnly) {
			if ($item.hasClass("sapCalculationBuilderNewItem")) {
				oItem = this._getNewItem();

				if (oItem) {
					oItem._buttonPress(oEvent);
				}
			} else if ($item.hasClass("sapCalculationBuilderItem")) {
				oItem = this._getItemById($item[0].id);

				if (oItem) {
					oItem._buttonPress(oEvent);
				}
			} else if ($item.hasClass("sapCalculationBuilderItemExpandButton")) {
				oItem = this._getItemById($item.closest(".sapCalculationBuilderItem")[0].id);

				if (oItem) {
					oItem._expandButtonPress(oEvent);
				}
			}
		}
	};

	CalculationBuilderExpression.prototype._createVariablesMap = function () {
		this._mGroups = {};
		this._aVariableLists = [];

		this.getVariables().forEach(function (oVariable) {
			var sGroup = oVariable.getGroup() || DEFAULT_GROUP_KEY;
			if (!this._mGroups[sGroup]) {
				this._mGroups[sGroup] = [];
			}

			this._mGroups[sGroup].push(oVariable);
		}.bind(this));
	};

	CalculationBuilderExpression.prototype._handleSpace = function (oEvent) {
		this._selectItem(oEvent.target);
	};

	CalculationBuilderExpression.prototype._handleCtrlNext = function (oEvent) {
		this._moveItems(Directions.KEY_NEXT);
	};

	CalculationBuilderExpression.prototype._handleCtrlPrevious = function (oEvent) {
		this._moveItems(Directions.KEY_PREVIOUS);
	};

	CalculationBuilderExpression.prototype._getVariableByKey = function (sKey) {
		var aVariables = this.getVariables();

		if (!sKey) {
			return null;
		}

		sKey = sKey.toLowerCase();

		for (var i = 0; i < aVariables.length; i++) {
			if (aVariables[i].getKey().toLowerCase() === sKey) {
				return aVariables[i];
			}
		}

		return null;
	};

	/* =========================================================== */
	/* Setters & getters, helper methods 						   */
	/* =========================================================== */
	CalculationBuilderExpression.prototype.setTitle = function (sTitle) {
		var oTitle = this._oToolbarTitle;

		if (oTitle) {
			oTitle.setText(sTitle);
			oTitle.setVisible(!!sTitle);
		}
		this.setProperty("title", sTitle);
	};

	CalculationBuilderExpression.prototype._getKeys = function () {
		return this.getItems().map(function (oItem) {
			return oItem.getKey();
		});
	};

	CalculationBuilderExpression.prototype._deleteItem = function () {
		var aKeys = this._getKeys();
		aKeys.splice(this._oCurrentItem._iIndex, 1);
		this._smartRender(aKeys);

		this._instantClose();
		this._fireChange();
	};

	CalculationBuilderExpression.prototype._openDialog = function (mArguments) {
		this._oCurrentItem = mArguments.currentItem;
		this._iCurrentIndex = mArguments.index;
		this._oPopover.openBy(mArguments.opener);
	};

	CalculationBuilderExpression.prototype._setupDroppable = function (aItems) {
		var that = this;

		aItems = aItems || this.$().find(".sapCalculationBuilderDroppable");

		aItems.droppable({
			scope: that.getId() + "-scope",
			tolerance: "pointer",
			activeClass: "sapCalculationBuilderDroppableActive",
			hoverClass: "sapCalculationBuilderDroppableActive",
			drop: function (oEvent, ui) {
				if (!ui.draggable.hasClass("sapCalculationBuilderSelected")) {
					that._selectItem(ui.draggable[0]);
				}
				that._moveItems(Directions.MOUSE, parseInt(jQuery(this).attr("index"), 10));
				that._bDragging = false;
			},
			over: function (event, ui) {
				that._bDragging = true;
			}
		});
	};

	CalculationBuilderExpression.prototype._clearNewButtonPositions = function () {
		var $this = this.$();

		$this.find(".sapCalculationBuilderDelimiterNewButton").hide(200);
		$this.find(".sapCalculationBuilderItem").animate({
			"left": 0
		}, 300);
	};

	CalculationBuilderExpression.prototype._setupNewButtonEvents = function () {
		var OFFSET = 13,
			TIMEOUT = 300;

		var aItems = this.$().find(".sapCalculationBuilderDelimiter[data-events!='bound']"),
			aButtons = this.$().find(".sapCalculationBuilderDelimiterNewButton[data-events!='bound']"),
			that = this,
			bExecute, oTimeout;

		var fnAnimate = function ($el, iOffset) {
			$el.prev().animate({
				"left": -iOffset
			}, TIMEOUT);
			$el.next().animate({
				"left": iOffset
			}, TIMEOUT);
		};

		aButtons.on("click", function (ev) {
			var $this = jQuery(this),
				iIndex = parseInt($this.parent().attr("index"), 10);

			$this.css("opacity", 1);
			that._oCurrentItem = null;
			that._iCurrentIndex = iIndex;
			that._openDialog({
				opener: this,
				index: iIndex
			});
		});
		aButtons.attr("data-events", "bound");

		aItems.on("mouseover", function (ev) {
			var $this = jQuery(this);
			if (!that._bDragging && !that._oPopover.isOpen()) {

				bExecute = true;
				oTimeout = setTimeout(function () {
					if (bExecute) {
						bExecute = false;
						fnAnimate($this, OFFSET);
						$this.find(".sapCalculationBuilderDelimiterNewButton").show(200);
					}

				}, 400);
			}
		});

		aItems.on("mouseout", function (ev) {
			var $btn = jQuery(this).find(".sapCalculationBuilderDelimiterNewButton"),
				$this = jQuery(this);

			if (ev.target === $btn[0] && ev.relatedTarget === $this[0]) {
				return;
			}

			bExecute = false;
			clearTimeout(oTimeout);

			if (that._bDragging || that._oPopover.isOpen()) {
				return;
			}

			if (!$btn.is(':hover')) {
				fnAnimate($this, 0);
				$btn.hide(200);
			}
		});

		aItems.attr("data-events", "bound");
	};

	CalculationBuilderExpression.prototype._setupSelectable = function () {
		this.$().selectable({
			cancel: ".sapCalculationBuilderCancelSelectable",
			distance: 5,
			start: function () {
				this._deselect();
				this._instantClose();
			}.bind(this),
			stop: function () {
				this._selectItems(this.$().find(".sapCalculationBuilderItem.ui-selected"));
			}.bind(this)
		});
	};

	CalculationBuilderExpression.prototype._selectItemsTo = function ($selectedItem) {
		var $selectedItemDelimiter = jQuery($selectedItem.next(".sapCalculationBuilderDelimiter")[0]),
			iSelectedIndex = $selectedItemDelimiter.attr("index") - 1,
			$this = this.$(),
			iFrom, iTo, aDomItems, $delimiterFrom, $delimiterTo;

		if ($selectedItem.parent().hasClass("sapCalculationBuilderSelected") || this._isEmptySelected()) {
			this._selectItem($selectedItem);
			return;
		}

		if (iSelectedIndex > this._iLastSelectedIndex) {
			iFrom = this._iFirstSelectedIndex;
			iTo = iSelectedIndex + 1;
		} else {
			iFrom = iSelectedIndex;
			iTo = this._iLastSelectedIndex + 1;
		}

		this._deselect();
		$delimiterFrom = $this.find(".sapCalculationBuilderDelimiter[index=\"" + iFrom + "\"]");
		$delimiterTo = $this.find(".sapCalculationBuilderDelimiter[index=\"" + iTo + "\"]");

		aDomItems = $delimiterFrom.nextUntil($delimiterTo, ".sapCalculationBuilderItem");
		this._selectItems(aDomItems);
	};

	CalculationBuilderExpression.prototype._selectItems = function (aDomSelectedItems) {
		for (var i = 0; i < aDomSelectedItems.length; i++) {
			this._selectItem(aDomSelectedItems[i]);
		}
	};

	CalculationBuilderExpression.prototype._selectItem = function (oDomSelectedItem) {
		var $selected = this.$().find(".sapCalculationBuilderSelected"),
			$selectedItem = jQuery(oDomSelectedItem),
			$selectedItemDelimiter = jQuery($selectedItem.next(".sapCalculationBuilderDelimiter")[0]),
			nSelectedLength = $selected[0].children.length,
			iSelectedIndex = $selectedItemDelimiter.attr("index") - 1,
			bAppToEnd = true;

		if (!this._oItemNavigation || !this._getItemById($selectedItem[0].id) || this._bReadOnly) {
			return;
		}

		if (nSelectedLength === 0) {
			this._iFirstSelectedIndex = iSelectedIndex;
			this._iLastSelectedIndex = iSelectedIndex;
		} else {
			if ($selectedItem.parent().hasClass("sapCalculationBuilderSelected")) {
				if (this._iFirstSelectedIndex === iSelectedIndex) {
					this._iFirstSelectedIndex++;
					this._deselectItem($selectedItem, false);
				} else if (this._iLastSelectedIndex === iSelectedIndex) {
					this._iLastSelectedIndex--;
					this._deselectItem($selectedItem, true);
				} else {
					this._deselect();
				}
				this._setCorrectFocus();
				return;
			}

			if ((this._iFirstSelectedIndex - iSelectedIndex) === 1) {
				// If next selected item is on left side
				this._iFirstSelectedIndex = iSelectedIndex;
				bAppToEnd = false;
			} else if ((iSelectedIndex - this._iLastSelectedIndex) === 1) {
				// If next selected item is on right side
				this._iLastSelectedIndex = iSelectedIndex;
				bAppToEnd = true;
			} else {
				this._iFirstSelectedIndex = iSelectedIndex;
				this._iLastSelectedIndex = iSelectedIndex;
				this._deselect();
			}
		}

		var $this = this.$();

		if (this._isEmptySelected()) {
			$selected.detach().insertBefore($selectedItem);
			$selected.draggable({
				revert: "invalid",
				cursor: "move",
				axis: "x",
				scope: this.getId() + "-scope",
				helper: function (event) {
					var $item = $selected.clone();
					$item.removeClass("sapCalculationBuilderSelected");
					$item.addClass("sapCalculationBuilderDraggingSelectedClone");
					return $item;
				},
				start: function () {
					$selected.addClass("sapCalculationBuilderDragging");
					$this.find(".sapCalculationBuilderItemContent").css("cursor", "move");

				},
				stop: function () {
					$selected.removeClass("sapCalculationBuilderDragging");
					$this.find(".sapCalculationBuilderItemContent").css("cursor", "pointer");
				}

				// handle: ".sapCalculationBuilderDraggable"
			});
		}

		if (bAppToEnd) {
			$selectedItem.detach().appendTo($selected);
			$selectedItemDelimiter.detach().appendTo($selected);
		} else {
			$selectedItemDelimiter.detach().prependTo($selected);
			$selectedItem.detach().prependTo($selected);
		}

		if ($selectedItem.hasClass("sapCalculationBuilderItem")) {
			$selectedItem.draggable("disable");
			$selectedItem.addClass("ui-selected");
		}
		this._setCorrectFocus();
	};

	CalculationBuilderExpression.prototype._isEmptySelected = function () {
		var $selected = this.$().find(".sapCalculationBuilderSelected");

		if ($selected) {
			return $selected.is(":empty");
		}
		return true;
	};

	CalculationBuilderExpression.prototype._deselectItem = function ($item, bInsertAfter) {
		var $selected = this.$().find(".sapCalculationBuilderSelected"),
			$selectedItemDelimiter = jQuery($item.next(".sapCalculationBuilderDelimiter")[0]);

		if (!$item.hasClass("ui-selected")) {
			return;
		}

		if (bInsertAfter) {
			$selectedItemDelimiter.detach().insertAfter($selected);
			$item.detach().insertAfter($selected);
		} else {
			$item.detach().insertBefore($selected);
			$selectedItemDelimiter.detach().insertBefore($selected);
		}
		$item.draggable("enable");
		$item.removeClass("ui-selected");
	};

	CalculationBuilderExpression.prototype._deselect = function () {
		var $selected = this.$().find(".sapCalculationBuilderSelected");

		if (this._isEmptySelected()) {
			return;
		}

		this.$().find(".sapCalculationBuilderSelected .ui-selected").removeClass("ui-selected");
		$selected.children().each(function () {
			var $this = jQuery(this);

			if ($this.hasClass("sapCalculationBuilderItem")) {
				$this.draggable("enable");
			}
			$this.detach().insertBefore($selected);
		});
	};

	CalculationBuilderExpression.prototype._setupKeyboard = function () {
		var oFocusRef = this.getDomRef(),
			aDomRefs = [];

		this.getItems().forEach(function (oItem) {
			aDomRefs.push(oItem.getFocusDomRef());
			if (oItem.isExpandable()) {
				aDomRefs.push(oItem.$("expandbutton"));
			}
		});
		aDomRefs.push(this._getNewItem().getFocusDomRef());

		if (!this._oItemNavigation) {
			this._oItemNavigation = new ItemNavigation();
			this.addDelegate(this._oItemNavigation);
		}

		this._oItemNavigation.setRootDomRef(oFocusRef);
		this._oItemNavigation.setItemDomRefs(aDomRefs);
		this._oItemNavigation.setCycling(true);
		this._oItemNavigation.setPageSize(250);
	};

	CalculationBuilderExpression.prototype._setCorrectFocus = function () {
		jQuery(this._oItemNavigation.getFocusedDomRef()).focus();
	};

	CalculationBuilderExpression.prototype._getItemById = function (sId) {
		return this.getItems().filter(function (oItem) {
			return oItem.getId() === sId;
		})[0];
	};

	CalculationBuilderExpression.prototype._getNewItem = function () {
		if (!this._oNewItem) {
			this._oNewItem = new CalculationBuilderItem();
			this._oNewItem._bIsNew = true;
			this._oNewItem.setParent(this, null, true);
		}

		return this._oNewItem;
	};

	CalculationBuilderExpression.prototype._instantClose = function () {
		var oPopover = this._oPopover.getAggregation("_popup");
		if (oPopover && oPopover.oPopup && oPopover.oPopup.close) {
			oPopover.oPopup.close(0);

			// Set focus to correct item
			this._setCorrectFocus();
		}
	};

	CalculationBuilderExpression.prototype._attachAriaLabelToButton = function (oButton, sAriaLabel) {
		oButton.addEventDelegate({
			onAfterRendering: function (oEv) {
				// Add aria-label to button for screen reader otherwise button is not read correct
				oEv.srcControl.$("content").attr("aria-label", sAriaLabel);
			}
		});
	};

	CalculationBuilderExpression.prototype._printErrors = function () {
		this.getItems().forEach(function (oItem) {
			var oError = oItem._getItemError(),
				$this = oItem.$(),
				sFnName = !!oError ? "addClass" : "removeClass";

			$this[sFnName]("sapCalculationBuilderItemErrorSyntax");
		});

		if (this.getParent().getLayoutType() === LayoutTypes.VisualOnly) {
			this._showErrorIcon();
		}
	};

	CalculationBuilderExpression.prototype._validateSyntax = function (mParameters) {
		var fnValidateFirstSymbol = function () {
			var oFirst = this.getItems()[iFrom],
				sKey = oFirst.getKey();

			return !oFirst._isOperator() || sKey === "(" || sKey === "+" || sKey === "-" || sKey.toLowerCase() === "not";
		}.bind(this);

		var fnValidateLastSymbol = function () {
			var aItems = this.getItems(),
				oLast = aItems[iTo - 1];

			return !oLast._isOperator() || oLast.getKey() === ")";
		}.bind(this);

		var fnGetCode = function (oItem) {
			var sKey = oItem.getKey().toLowerCase();
			if (oItem._isOperator()) {
				return sKey === "not" || sKey === "(" || sKey === ")" ? sKey : "#op#";
			}

			return oItem._isFunction() ? "#fun#" : "#col#";
		};

		var fnCreateFunctionItem = function (oItem) {
			return {
				index: i,
				item: oItem,
				items: [],
				text: oItem.getKey() + (oItem._isFunction() ? "(" : "")
			};
		};

		var fnGetFunctionDefinition = function (oFunction) {
			var iBracketCount = 1,
				iFunctionIndex = i;

			i++;
			for (; i < aItems.length; i++) {
				var oItem = aItems[i],
					sKey = oItem.getKey(),
					oFunctionItem = fnCreateFunctionItem(oItem);

				oFunction.items.push(oFunctionItem);

				switch (sKey) {
					case ")":
						iBracketCount--;
						break;
					case "(":
						iBracketCount++;
						break;
					case ",":
						iBracketCount = 1;
						break;
				}

				if (oItem._isFunction()) {
					fnGetFunctionDefinition(oFunctionItem);
					oFunction.text += oFunctionItem.text;
				} else {
					oFunction.text += sKey;
				}

				if (iBracketCount === 0) {
					// End function
					return oFunction;
				}
			}

			aErrors.push({
				index: iFunctionIndex,
				title: oResourceBundle.getText("CALCULATION_BUILDER_CLOSING_BRACKET_ERROR_TEXT")
			});

			return oFunction;
		};

		var fnValidateFunctionParameters = function (oFunction) {
			var nAllowParametersCount = this.getParent()._getFunctionAllowParametersCount(oFunction.item.getKey()),
				aParameters = [], aParameterItems = [];

			// Split function to parameters
			oFunction.items.forEach(function (oItem) {
				if (oItem.item._isComma()) {
					aParameters.push(aParameterItems);
					aParameterItems = [];
				} else {
					aParameterItems.push(oItem);
				}
			});

			if (aParameterItems.length > 0 && aParameterItems[aParameterItems.length - 1].text === ")") {
				aParameterItems.pop();
			}

			aParameters.push(aParameterItems);

			if (aParameters.length !== nAllowParametersCount) {
				aErrors.push({
					index: oFunction.index,
					title: oResourceBundle.getText(aParameters.length < nAllowParametersCount ? "CALCULATION_BUILDER_TOO_LITTLE_PARAMETERS" : "CALCULATION_BUILDER_TOO_MANY_PARAMETERS")
				});
			}

			if (aParameters.length > 0) {
				aParameters.forEach(function (aPartGroup) {
					if (aPartGroup.length > 0) {
						jQuery.merge(aErrors, this._validateSyntax({
							from: aPartGroup[0].index,
							to: aPartGroup[aPartGroup.length - 1].index + 1
						}));
					} else {
						aErrors.push({
							index: oFunction.index,
							title: oResourceBundle.getText("CALCULATION_BUILDER_EMPTY_PARAMETER")
						});
					}
				}.bind(this));
			}
		}.bind(this);

		var iPlusMinusCount = 0;

		var fnValidatePlusMinusCount = function () {
			var bIsPlusMinus = oItem.getKey() === "+" || oItem.getKey() === "-";
			if (bIsPlusMinus) {
				iPlusMinusCount++;

				if (iPlusMinusCount > 2) {
					aErrors.push({
						index: i,
						title: oResourceBundle.getText("CALCULATION_BUILDER_SYNTAX_ERROR_TEXT")
					});
				}
			} else {
				iPlusMinusCount = 0;
			}
		};

		var oAllowed = {
			"#op#": ["(", "#col#", "#fun#", "not", "+", "-"],
			"(": ["(", "+", "-", "#col#", "#fun#", "not"],
			")": ["#op#", ")"],
			"#col#": ["#op#", ")"],
			"#fun#": ["(", "+", "-", "#col#", "#fun#"],
			"not": ["#col#", "#fun#", "not", "("]
		};

		mParameters = mParameters || {};

		var aItems = mParameters.items || this.getItems(),
			sCurrent, sNext, oItem, oNextItem, sNextKey,
			iFrom = mParameters.from || 0,
			iTo = mParameters.to || aItems.length,
			bIsRoot = (iFrom === 0 && iTo === aItems.length),
			aBrackets = [], aErrors = [];

		if (aItems.length > 0) {
			if (!fnValidateFirstSymbol()) {
				aErrors.push({
					index: iFrom,
					title: oResourceBundle.getText("CALCULATION_BUILDER_FIRST_CHAR_ERROR_TEXT")
				});
			}

			if (!fnValidateLastSymbol()) {
				aErrors.push({
					index: iTo - 1,
					title: oResourceBundle.getText("CALCULATION_BUILDER_LAST_CHAR_ERROR_TEXT")
				});
			}
		}

		for (var i = iFrom; i < iTo; i++) {
			oItem = aItems[i];

			if (oItem._getType() === ItemType.Error) {
				aErrors.push({
					index: i,
					title: oResourceBundle.getText("CALCULATION_BUILDER_SYNTAX_ERROR_TEXT")
				});
				continue;
			}

			fnValidatePlusMinusCount();

			if (!mParameters.skipCustomValidation && oItem._isFunction()) {
				var oCustomFunction = oItem._getCustomFunction(),
					oFunction = fnGetFunctionDefinition(fnCreateFunctionItem(oItem));

				if (oCustomFunction && !oCustomFunction.getUseDefaultValidation()) {
					var oResult = new ValidationResult();
					this.getParent().fireValidateFunction({
						definition: oFunction,
						customFunction: oCustomFunction,
						result: oResult
					});

					jQuery.merge(aErrors, oResult.getErrors());
				} else {
					fnValidateFunctionParameters(oFunction);
				}
			}

			if (i < iTo - 1) {
				oNextItem = aItems[i + 1];
				sCurrent = fnGetCode(aItems[i]);
				sNext = fnGetCode(oNextItem);
				sNextKey = oNextItem ? oNextItem.getKey().toLowerCase() : "";

				var bIsCustomOperator = oNextItem._isCustomOperator() || oItem._isCustomOperator();

				if (oAllowed[sCurrent].indexOf(sNext) === -1 &&
					oAllowed[sCurrent].indexOf(sNextKey) === -1 &&
					!bIsCustomOperator) {
					var oData = {index: i + 1};

					if (oItem._isOperator() && oNextItem._isOperator()) {
						oData.title = oResourceBundle.getText("CALCULATION_BUILDER_BEFORE_OPERATOR_ERROR_TEXT", oNextItem.getKey());
					} else if (!oItem._isOperator() && !oNextItem._isOperator()) {
						oData.title = oResourceBundle.getText("CALCULATION_BUILDER_BETWEEN_NOT_OPERATORS_ERROR_TEXT", [oItem.getKey(), oNextItem.getKey()]);
					} else if (oItem.getKey() === ")" && !oNextItem._isOperator()) {
						oData.title = oResourceBundle.getText("CALCULATION_BUILDER_AFTER_CLOSING_BRACKET_ERROR_TEXT");
					} else if (!oItem._isOperator() && (oNextItem.getKey() === "(")) {
						oData.title = oResourceBundle.getText("CALCULATION_BUILDER_BEFORE_OPENING_BRACKET_ERROR_TEXT");
					} else {
						oData.title = oResourceBundle.getText("CALCULATION_BUILDER_CHAR_ERROR_TEXT");
					}
					aErrors.push(oData);
				}
			}

			if (oItem._isFunction()) {
				continue;
			}

			if (bIsRoot && oItem.getKey() === ",") {
				aErrors.push({
					index: i,
					title: oResourceBundle.getText("CALCULATION_BUILDER_WRONG_PARAMETER_MARK")
				});
			}

			if ((oItem._isOperator() && oItem.getKey() === "(") || oItem._isFunction()) {
				aBrackets.push(i);
			}

			if (oItem._isOperator() && oItem.getKey() === ")") {
				if (aBrackets.length === 0) {
					aErrors.push({
						index: i,
						title: oResourceBundle.getText("CALCULATION_BUILDER_OPENING_BRACKET_ERROR_TEXT")
					});
				} else {
					aBrackets.pop();
				}
			}
		}

		for (i = 0; i < aBrackets.length; i++) {
			aErrors.push({
				index: aBrackets[i],
				title: oResourceBundle.getText("CALCULATION_BUILDER_CLOSING_BRACKET_ERROR_TEXT")
			});
		}

		return aErrors;
	};

	CalculationBuilderExpression.prototype._getType = function (sKey) {
		return this.getParent() && this.getParent()._getType(sKey);
	};

	CalculationBuilderExpression.prototype._moveItems = function (sDirection, iNewIndex) {
		var aNewItems = [],
			$this = this.$(),
			aItems = this.getItems(),
			$selected = $this.find(".sapCalculationBuilderSelected"),
			$start, iIndex, oItem, $selectedItems;

		if (this._isEmptySelected()) {
			return;
		}

		$selectedItems = ($selected.length > 1) ? jQuery($selected[0]).children() : $selected.children();

		if (sDirection === Directions.KEY_PREVIOUS) {
			iIndex = this._iFirstSelectedIndex - 1;
		} else if (sDirection === Directions.KEY_NEXT) {
			iIndex = this._iLastSelectedIndex + 2;
		} else if (sDirection === Directions.MOUSE) {
			iIndex = iNewIndex;
		}

		if (iIndex < 0 || iIndex === (aItems.length + 1)) {
			return;
		}

		$start = this.$().find(".sapCalculationBuilderDelimiter[index=\"" + iIndex + "\"]");

		// Multi select dropping
		for (var i = 0; i < aItems.length + 1; i++) {
			oItem = aItems[i];

			// Indicating where put dragging items
			if (iIndex === i) {
				$selectedItems.each(function () { // eslint-disable-line
					var $this = jQuery(this),
						oItem;

					// Append only items not delimiters
					if ($this.hasClass("sapCalculationBuilderItem")) {
						oItem = sap.ui.getCore().byId(jQuery(this)[0].id);
						aNewItems.push(oItem);
						oItem._bMovingItem = true;
						$this.draggable("enable");
					}

					$this.css("left", 0 + "px");
					$this.detach().insertAfter($start).removeClass("");
					$start = $this;
				});
			}

			// Just copy items that are not dragging
			if (oItem && !oItem.$().parent().hasClass("sapCalculationBuilderSelected") && !oItem._bMovingItem) {
				aNewItems.push(oItem);
			}
		}

		$selected.css("left", "");

		$this.find(".sapCalculationBuilderDelimiter").each(function (i) {
			jQuery(this).attr("index", i);
		});

		this.removeAllAggregation("items", true);
		aNewItems.forEach(function (oItem, i) {
			oItem._bMovingItem = false;
			oItem._iIndex = i;
			this.addAggregation("items", oItem, true);
		}.bind(this));

		this._setupKeyboard();
		this._selectItems($selectedItems.filter(function (i, el) {
			return jQuery(el).hasClass("sapCalculationBuilderItem");
		}));

		this._fireChange();
	};

	CalculationBuilderExpression.prototype._fireAfterValidation = function () {
		this.getParent().fireAfterValidation();
	};

	CalculationBuilderExpression.prototype._setItems = function (aItems) {
		this.removeAllAggregation("items", true);
		(aItems || []).forEach(function (oItem) {
			this.addAggregation("items", this._convertFromNewItem(oItem), true);
		}.bind(this));
	};

	CalculationBuilderExpression.prototype._getKeyFromCreatedItem = function (oItem) {
		return typeof oItem === "object" ? oItem.getKey() : oItem;
	};

	CalculationBuilderExpression.prototype._convertFromNewItem = function (oItem) {
		return typeof oItem === "object" ? oItem :
			new CalculationBuilderItem({
				key: oItem
			});
	};

	CalculationBuilderExpression.prototype._showErrorIcon = function () {
		var $error = this.$("erroricon"),
			oParent = this.getParent(),
			sText = oParent._createErrorText(null, true);

		if (sText) {
			$error.show();
			$error.attr("title", oParent._createErrorText(null, true));
		} else {
			$error.hide();
		}
	};


	CalculationBuilderExpression.prototype._smartRender = function (aNewItems) {
		var i,
			$this = this.$(),
			aAddedItems = [],
			aItems = this.getItems(),
			iOriginalLength = aItems.length,
			oRm = sap.ui.getCore().createRenderManager();

		var fnAddNew = function (oNewItem) {
			oNewItem = this._convertFromNewItem(oNewItem);

			this.addAggregation("items", oNewItem, true);
			oNewItem._iIndex = i;
			if ($this[0]) {
				oNewItem._render(oRm);
				this._renderDelimiter(oRm, i + 1);
			}

			oNewItem.bOutput = true;
			aAddedItems.push(oNewItem);
		}.bind(this);


		if (!this.getParent()._isExpressionVisible()) {
			this._setItems(aNewItems);
			return;
		}

		this._bRendered = false;
		this._bIsCalculationBuilderRendering = true;
		this._deselect();

		for (var i = 0; i < aNewItems.length; i++) {
			var oItem = aItems[i],
				oNewItem = aNewItems[i],
				sKey = typeof oNewItem === "object" && oNewItem.getKey ? oNewItem.getKey() : oNewItem,
				sType = oNewItem._sType ? oNewItem._sType : "";

			if (!oItem) {
				fnAddNew(aNewItems[i]);
			} else if (oItem.getKey() !== sKey || oItem._sType !== sType) {
				oItem.setKey(sKey, true);

				oItem._sType = sType;

				var $item = oItem.$();

				oItem._innerRender(oRm, $item[0]);
				$item.attr("class", oItem._getClass(null, oRm, true));
				$item.attr("title", oItem._getTooltip());

				oItem._setEvents();
			}
		}

		if (aNewItems.length < iOriginalLength) {
			for (var i = aNewItems.length; i < aItems.length; i++) {
				var $item = aItems[i].$();
				$item.next().remove();
				$item.remove();

				this.removeAggregation("items", aItems[i], true);
			}
		}

		if ($this[0] && aAddedItems.length > 0) {
			oRm.flush($this[0], false, $this.children().index( $this.find(".sapCalculationBuilderDelimiter").last()[0] ) + 1);

			aAddedItems.forEach(function (oItem) {
				oItem._afterRendering();
			});

			this._setupDroppable($this.find(".sapCalculationBuilderDroppable").filter(function () {
				return parseInt(jQuery(this).attr("index"), 10) > iOriginalLength;
			}));
		}
		this._bRendered = true;
		this._setupKeyboard();
		this._setupNewButtonEvents();
		this._bIsCalculationBuilderRendering = false;
	};

	CalculationBuilderExpression.prototype._fireChange = function () {
		this.fireEvent("change");
	};

	return CalculationBuilderExpression;

});
