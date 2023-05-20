/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/Object",
	"./Group",
	"./Node",
	"./Line",
	"sap/ui/events/KeyCodes",
	"sap/ui/dom/containsOrEquals",
	"sap/base/Log"
], function (jQuery, BaseObject, Group, Node, Line, KeyCodes, containsOrEquals, Log) {
	"use strict";

	var mDirections = {
		LEFT: "left",
		RIGHT: "right",
		UP: "up",
		DOWN: "down"
	};

	var rWrapMethod = /^on.*|setFocus|setItems$/;

	function wrapPublicMethods(oKeyboardNavigatorClass) {
		var sKey,
			oPrototype = oKeyboardNavigatorClass.prototype;
		for (sKey in oPrototype) {
			if (oPrototype.hasOwnProperty(sKey) && (typeof oPrototype[sKey] === "function") && rWrapMethod.test(sKey)) {
				oPrototype[sKey] = wrapMethod(oPrototype[sKey]);
			}
		}
	}

	function wrapMethod(fnOriginal) {
		return function () {
			try {
				return fnOriginal.apply(this, arguments);
			} catch (oError) {
				this._handleError(oError);
			}
			return undefined;
		};
	}

	/**
	 * Constructor for a new KeyboardNavigator.
	 *
	 * @class
	 * Holds information about a keyboard navigator.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @constructor
	 * @private
	 * @since 1.50
	 * @alias sap.suite.ui.commons.networkgraph.KeyboardNavigator
	 */
	var KeyboardNavigator = BaseObject.extend("sap.suite.ui.commons.networkgraph.KeyboardNavigator", {
		constructor: function (oGraph) {
			BaseObject.apply(this, arguments);
			this._oGraph = oGraph;
			this._aItems = [[]];
			this._iRows = 0;
			this._iColumns = 0;
			this._iPageSize = 5;
			this._oFocus = null;
			this._oFocusPosition = null;
			this._oWrapperDom = null;
		}
	});

	/* =========================================================== */
	/* Public API */
	/* =========================================================== */

	KeyboardNavigator.prototype.getFocus = function () {
		var oGraphFocus = this._oGraph.getFocus();
		if (this._oFocus !== oGraphFocus) {
			this._oFocus = oGraphFocus ? {item: oGraphFocus.item, button: oGraphFocus.button} : null;
			this._oFocusPosition = null;
		}
		if (this._oFocus != null && this._oFocus.item === null && this._oFocus.button === null) {
			return null;
		}
		return this._oFocus ? {item: this._oFocus.item, button: this._oFocus.button} : null;
	};

	KeyboardNavigator.prototype.getFocusPosition = function () {
		var oFocus = this.getFocus();
		if (!this._oFocusPosition) {
			var iX, iY;

			this._oFocusPosition = {iX: null, iY: null};
			if (!oFocus) {
				return this._oFocusPosition;
			}

			for (iY = 0; iY < this._aItems.length; iY++) {
				for (iX = 0; iX < this._aItems[iY].length; iX++) {
					if (this._aItems[iY][iX] === oFocus.item) {
						this._oFocusPosition = {iX: iX, iY: iY};
						return this._oFocusPosition;
					}
				}
			}
		}
		return this._oFocusPosition;
	};

	KeyboardNavigator.prototype.setItems = function (aItems) {
		this._aItems = aItems;
		this._iRows = aItems.length;
		this._iColumns = 0;
		aItems.forEach(function (aRow) {
			if (this._iColumns < aRow.length) {
				this._iColumns = aRow.length;
			}
		}, this);
	};

	KeyboardNavigator.prototype.setWrapperDom = function (oDom) {
		this._oWrapperDom = oDom;
	};

	KeyboardNavigator.prototype.setPageSize = function (iSize) {
		this._iPageSize = iSize;
	};

	/* =========================================================== */
	/* Events */
	/* =========================================================== */

	KeyboardNavigator.prototype.onsapend = function (oEvent) {
		this._moveThroughMatrix(oEvent, true, true);
	};

	KeyboardNavigator.prototype.onsaphome = function (oEvent) {
		this._moveThroughMatrix(oEvent, true, false);
	};

	KeyboardNavigator.prototype.onsapendmodifiers = function (oEvent) {
		if (oEvent.ctrlKey) {
			this._moveThroughMatrix(oEvent, false, true);
		}
	};

	KeyboardNavigator.prototype.onsaphomemodifiers = function (oEvent) {
		if (oEvent.ctrlKey) {
			this._moveThroughMatrix(oEvent, false, false);
		}
	};

	KeyboardNavigator.prototype.onsappagedown = function (oEvent) {
		this._moveThroughMatrix(oEvent, false, true, this._iPageSize);
	};

	KeyboardNavigator.prototype.onsappageup = function (oEvent) {
		this._moveThroughMatrix(oEvent, false, false, this._iPageSize);
	};

	KeyboardNavigator.prototype.onsappagedownmodifiers = function (oEvent) {
		if (oEvent.altKey) {
			this._moveThroughMatrix(oEvent, true, true, this._iPageSize);
		}
	};

	KeyboardNavigator.prototype.onsappageupmodifiers = function (oEvent) {
		if (oEvent.altKey) {
			this._moveThroughMatrix(oEvent, true, false, this._iPageSize);
		}
	};

	KeyboardNavigator.prototype.onsapspace = function (oEvent) {
		this._handleEnter();
		if (this._oGraph.getFocusDomRef() === document.activeElement) {
			oEvent.stopPropagation();
			oEvent.preventDefault();
		}
	};

	KeyboardNavigator.prototype.onsapspacemodifiers = function (oEvent) {
		if (oEvent.ctrlKey && this._oGraph.getFocusDomRef() === document.activeElement) {
			this._selectElement(true);
			oEvent.stopPropagation();
			oEvent.preventDefault();
		}
	};

	KeyboardNavigator.prototype.onsapenter = function (oEvent) {
		this._handleEnter();
	};

	KeyboardNavigator.prototype.onsaptabnext = function (oEvent) {
		this._handleTab(oEvent, mDirections.RIGHT);
	};

	KeyboardNavigator.prototype.onsaptabprevious = function (oEvent) {
		this._handleTab(oEvent, mDirections.LEFT);
	};

	KeyboardNavigator.prototype.onsapleft = function (oEvent) {
		this._handleArrow(oEvent, mDirections.LEFT);
	};

	KeyboardNavigator.prototype.onsapright = function (oEvent) {
		this._handleArrow(oEvent, mDirections.RIGHT);
	};

	KeyboardNavigator.prototype.onsapup = function (oEvent) {
		this._handleArrow(oEvent, mDirections.UP);
	};

	KeyboardNavigator.prototype.onsapdown = function (oEvent) {
		this._handleArrow(oEvent, mDirections.DOWN);
	};

	KeyboardNavigator.prototype.onkeydown = function (oEvent) {
		var oItem, oBtn,
			oFocus = this.getFocus();
		if (!oFocus) {
			return;
		}

		oItem = oFocus.item;
		oBtn = oFocus.button;

		if (oEvent.ctrlKey && oEvent.keyCode === KeyCodes.A) {
			this._onCtrlA(oEvent);
		} else if (oEvent.keyCode === KeyCodes.F2) {
			if (oItem instanceof Node) {
				if (oItem.hasVisibleActionButtons() && oItem.getShowDetailButton()) {
					oItem._detailClick(oItem.getDomRef().querySelector("#" + oItem.getId() + "-actionDetail").querySelector(".sapSuiteUiCommonsNetworkGraphDivActionButton"));
				}
			} else if (oItem instanceof Line) {
				oItem.getParent()._tooltip.openDetail({
					item: oItem,
					point: oItem._getArrowFragmentVector().apex
				});
			} else if (oItem instanceof Group) {
				oItem._openDetail();
			}
			oEvent.stopPropagation();
		} else if (oEvent.keyCode === KeyCodes.F6) {
			if (oItem && oBtn) {
				oFocus.button = null;
				this._oGraph.setFocus(oFocus);
			}
			this._handleArrow(oEvent, oEvent.shiftKey ? mDirections.LEFT : mDirections.RIGHT);
		} else if (oEvent.keyCode === KeyCodes.F7 && !oEvent.shiftKey) {
			if (oItem && oBtn) {
				oFocus.button = null;
				this._oGraph.setFocus(oFocus);
			}
		} else if (oEvent.ctrlKey && (oEvent.keyCode === KeyCodes.DIGIT_0 || oEvent.keyCode === KeyCodes.NUMPAD_0)) {
			this._onCtrl0(oEvent);
		} else if (oEvent.ctrlKey && (oEvent.keyCode === KeyCodes.PLUS || oEvent.keyCode === KeyCodes.NUMPAD_PLUS)) {
			this._onCtrlPlus(oEvent);
		} else if (oEvent.ctrlKey && (oEvent.keyCode === KeyCodes.SLASH || oEvent.keyCode === KeyCodes.NUMPAD_MINUS)) {
			this._onCtrlMinus(oEvent);
		}
	};

	/* =========================================================== */
	/* Private methods */
	/* =========================================================== */

	KeyboardNavigator.prototype._handleEnter = function () {
		var oItem, oBtn,
			oFocus = this.getFocus();

		if (!oFocus) {
			return;
		}

		if (oFocus.button == "menu") {
			oFocus.item._setMenuButtonFocus(false);
		}

		oItem = oFocus.item;
		oBtn = oFocus.button;
		if (oItem instanceof Node) {
			if (oBtn) {
				this._oGraph._isUseNodeHtml() ? jQuery(oBtn).trigger("click") : jQuery(oBtn).children().first().trigger("click");
			} else {
				oItem._onClick(false);

				if (!oItem.getSelected()) {
					oItem.$().removeClass(oItem.HIGHLIGHT_CLASS);
					oItem._setStatusColors("");
				}
			}
		} else if (oItem instanceof Line) {
			var oCoord = oItem._getArrowFragmentVector();

			oItem._click({
				ctrlKey: false,
				clientX: oCoord.apex.x,
				clientY: oCoord.apex.y,
				skipConversion: true
			});
		} else if (oItem instanceof Group) {
			if (oBtn === Group.BUTTONS.MENU) {
				oItem._openDetail();
			} else if (oBtn === Group.BUTTONS.COLLAPSE) {
				oItem._collapse();
			} else {
				oItem._openDetail(); // Open detail even if only the header (and no button) has focus
			}
		}
	};

	KeyboardNavigator.prototype._handleTab = function (oEvent, sDirection) {
		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
		this._oWrapperDom.setAttribute("aria-live","assertive");
		this._oGraph._setAriaLabelForWrapper(oResourceBundle.getText("NETWORK_GRAPH_ACCESSIBILITY_LABEL"));
		if (this._ignoreEvent(oEvent)) {
			this._oWrapperDom.setAttribute("aria-live","off");
			this._oWrapperDom.classList.remove("sapSuiteUiCommonsNetworkGraphContentFocusHidden");
			return;
		} else {
			this._oWrapperDom.classList.add("sapSuiteUiCommonsNetworkGraphContentFocusHidden");
		}

		if (this._handleTabOverNodeWithButtons(oEvent, sDirection)
			|| this._handleTabOverGroupWithButtons(oEvent, sDirection)) {
			oEvent.preventDefault();
			oEvent.stopPropagation();
			return;
		}

		this._moveItemFocus(oEvent, sDirection);
	};

	KeyboardNavigator.prototype._handleTabOverNodeWithButtons = function (oEvent, sDirection) {
		var oFocus = this.getFocus(),
			oItem, $btn,
			aBtns,
			bActionHandled = false,
			idx;

		if (!oFocus) {
			return false;
		}

		oItem = oFocus.item;
		$btn = oFocus.button;
		aBtns = oItem && oItem.getEnabledActionButtons ? oItem.getEnabledActionButtons() : [];
		if (!(oItem instanceof Node) || !oItem.hasVisibleActionButtons() || aBtns.length === 0) {
			return false;
		}

		if ($btn) {
			idx = 0;
			for (var i = 0; i < aBtns.length; i++) {
				if (aBtns[i].isEqualNode($btn)) {
					idx = i;
					break;
				}
			}

			if (sDirection === mDirections.RIGHT) {
				if (idx === (aBtns.length - 1)) { // Move to the next node from the last button
					return false;
				} else {
					this._setActionButtonFocus(aBtns[idx + 1]);
				}
				bActionHandled = true;
			} else if (sDirection === mDirections.LEFT) {
				if (idx === 0) {
					this._moveItemFocus(oEvent, this.getFocusPosition());
				} else {
					// Move to the previous enabled button
					this._setActionButtonFocus(aBtns[idx - 1]);
				}
				bActionHandled = true;
			}
		} else if (sDirection === mDirections.RIGHT) {
			// Move to the first enabled button
			this._setActionButtonFocus(aBtns[0]);
			bActionHandled = true;
		}

		return bActionHandled;
	};

	KeyboardNavigator.prototype._handleTabOverGroupWithButtons = function (oEvent, sDirection) {
		var oFocus = this.getFocus(),
			oItem, oBtn;

		if (!oFocus) {
			return false;
		}

		oItem = oFocus.item;
		oBtn = oFocus.button;

		if (oItem instanceof Group) {
			if (!oBtn) {
				oBtn = Group.BUTTONS.MENU;
			}

			if (oBtn) {
				if (oBtn === Group.BUTTONS.MENU) {
					if (sDirection === mDirections.RIGHT) {
						oFocus.button = Group.BUTTONS.COLLAPSE;
						this._oGraph.setFocus(oFocus);
						return true;
					} else if (sDirection === mDirections.LEFT) {
						return false;
					}
				} else if (oBtn === Group.BUTTONS.COLLAPSE) {
					if (sDirection === mDirections.RIGHT) {
						return false;
					} else if (sDirection === mDirections.LEFT) {
						oFocus.button = Group.BUTTONS.MENU;
						this._oGraph.setFocus(oFocus);
						return true;
					}
				}
			}
		}

		return false;
	};

	KeyboardNavigator.prototype._setActionButtonFocus = function (oActionButton) {
		var oFocus = this.getFocus();
		if (!oFocus) {
			return;
		}

		oFocus.button = oActionButton;
		this._oGraph.setFocus(oFocus);
	};

	KeyboardNavigator.prototype._selectElement = function (bCtrl) {
		var oFocus = this.getFocus(),
			oItem;
		if (!oFocus) {
			return;
		}

		oItem = oFocus.item;
		if (oItem instanceof Node) {
			oItem.getParent()._selectNode({
				element: oItem,
				setFocus: false,
				renderActionButtons: false,
				preventDeselect: bCtrl
			});
		} else if (oItem instanceof Line) {
			oItem.getParent()._selectLine({
				element: oItem,
				setFocus: false,
				preventDeselect: bCtrl
			});
		}
	};

	KeyboardNavigator.prototype._moveThroughMatrix = function (oEvent, bRow, bTowardEnd, iThreshold) {
		var oFocus = this.getFocus(),
			oItem,
			oCandidate, iCandidatesFound,
			oNewItem,
			iActiveColumn = this.getFocusPosition().iX,
			iActiveRow = this.getFocusPosition().iY;

		if (this._ignoreEvent(oEvent) || !oFocus) {
			return;
		}

		oItem = oFocus.item;
		// find the last/first (see bTowardEnd) in row/columns (see bRow), if different then move focus there
		iCandidatesFound = 0;
		iThreshold = iThreshold || Number.POSITIVE_INFINITY;
		do {
			for (var i = (bRow ? iActiveColumn : iActiveRow) + (bTowardEnd ? 1 : -1);
				 (bTowardEnd && i < (bRow ? this._iColumns : this._iRows)) || (!bTowardEnd && i >= 0);
				 i += (bTowardEnd ? 1 : -1)) {

				oCandidate = (bRow && iActiveRow >= 0 && iActiveRow < this._iRows) || (!bRow && iActiveColumn >= 0 && iActiveColumn < this._iColumns)
					? this._aItems[bRow ? iActiveRow : i][bRow ? i : iActiveColumn]
					: null;
				if (oCandidate && iCandidatesFound < iThreshold) {
					oNewItem = oCandidate;
					iCandidatesFound++;
					if (iCandidatesFound >= iThreshold) {
						break;
					}
				}
			}

			// We are going over the edge only when threshold is specified, since threshold means "page" operation
			if (iThreshold < Number.POSITIVE_INFINITY && iCandidatesFound < iThreshold) {
				if (bRow) {
					if (bTowardEnd) {
						iActiveColumn = -1;
						iActiveRow++;
					} else {
						iActiveColumn = this._iColumns;
						iActiveRow--;
					}
				} else if (bTowardEnd) {
					iActiveColumn++;
					iActiveRow = -1;
				} else {
					iActiveColumn--;
					iActiveRow = this._iRows;
				}
			}
		} while (iThreshold < Number.POSITIVE_INFINITY && iCandidatesFound < iThreshold
		&& iActiveRow >= -1 && iActiveRow <= this._iRows
		&& iActiveColumn >= -1 && iActiveColumn <= this._iColumns);

		if (oNewItem && oNewItem !== oItem) {
			oFocus.item = oNewItem;
			oFocus.button = null;
			this._oGraph.setFocus(oFocus);
			oEvent.stopPropagation();
		}
	};

	KeyboardNavigator.prototype._handleArrow = function (oEvent, sDirection) {
		if (this._ignoreEvent(oEvent) || !this.getFocus()) {
			return;
		}

		this._moveItemFocus(oEvent, sDirection, true);
	};

	KeyboardNavigator.prototype._moveItemFocus = function (oEvent, sDirection, bStopOnLast) {
		var oFocus,
			bBackTab = (sDirection === mDirections.LEFT && oEvent.key === "Tab"),
			oPosition,
			oNewItem,
			aBtns;

		if (typeof sDirection === "string") {
			oPosition = this._findNextPosition(sDirection);
		} else {
			oPosition = sDirection;
		}
		oNewItem = this._getItemAtPosition(oPosition);
		oFocus = {item: oNewItem, button: null};

		if (bBackTab && oNewItem !== null) {
			// If the new focused item is a node with visible enabled buttons AND we came from another element, then go to the last of them
			if (oNewItem instanceof Node && oNewItem.hasVisibleActionButtons()) {
				aBtns = oNewItem.getEnabledActionButtons();
				if (aBtns.length > 0) {
					oFocus.button = aBtns[aBtns.length - 1];
				}
				// Returning to a group means focusing its rightmost - collapse - button
			} else if (oNewItem instanceof Group) {
				oFocus.button = Group.BUTTONS.COLLAPSE;
			}
		}

		if (oNewItem || !bStopOnLast) {
			this._oGraph.setFocus(oFocus);
		}
		if (oEvent && oNewItem) {
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	KeyboardNavigator.prototype._getItemAtPosition = function (oPosition) {
		var a;
		if (!oPosition || oPosition.iX === null) {
			return null;
		} else {
			a = this._aItems[oPosition.iY];
			return a ? a[oPosition.iX] : null;
		}
	};

	KeyboardNavigator.prototype._findNextPosition = function (sDirection) {
		var x, y;
		if (this.getFocusPosition().iX === null) {
			if (sDirection === mDirections.LEFT) {
				x = this._iColumns - 1;
				y = this._iRows - 1;
			} else {
				x = 0;
				y = 0;
			}
			if (this._aItems[y][x] !== null) {
				return {
					iX: x,
					iY: y
				};
			}
		} else {
			x = this.getFocusPosition().iX;
			y = this.getFocusPosition().iY;
		}
		do {
			switch (sDirection) {
				case mDirections.RIGHT:
					x += 1;
					if (x >= this._iColumns) {
						y += 1;
						x = 0;
					}
					break;
				case mDirections.LEFT:
					x -= 1;
					if (x < 0) {
						y -= 1;
						x = this._iColumns - 1;
					}
					break;
				case mDirections.UP:
					y -= 1;
					if (y < 0 && x > 0) {
						x -= 1;
						y = this._iRows - 1;
					}
					break;
				case mDirections.DOWN:
					y += 1;
					if (y >= this._iRows && x < this._iColumns - 1) {
						x += 1;
						y = 0;
					}
					break;
				default:
					throw new Error("Unexpected direction: " + sDirection);
			}
		} while (y >= 0 && y < this._iRows && this._aItems[y][x] === null);
		if (y < 0 || y >= this._iRows) {
			return null;
		} else {
			return {
				iX: x,
				iY: y
			};
		}
	};

	KeyboardNavigator.prototype._onCtrlA = function (oEvent) {
		if (this._ignoreEvent(oEvent)) {
			return;
		}

		var bAllSelected = true;
		this._forEach(function (oItem) {
			if (oItem instanceof Group) {
				return false;
			}
			if (!oItem.getSelected()) {
				bAllSelected = false;
				return true;
			}
			return false;
		});

		bAllSelected = !bAllSelected;
		this._forEach(function (oItem) {
			if (!(oItem instanceof Group)) {
				oItem.setSelected(bAllSelected);
			}
		});
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	KeyboardNavigator.prototype._forEach = function (fnCallback) {
		var x, y, oItem, bBreak;
		for (y = 0; y < this._iRows; y++) {
			for (x = 0; x < this._iColumns; x++) {
				oItem = this._aItems[y][x];
				if (oItem) {
					bBreak = fnCallback.call(this, oItem, x, y);
					if (bBreak) {
						return;
					}
				}
			}
		}
	};

	KeyboardNavigator.prototype._onCtrl0 = function (oEvent) {
		this._oGraph._zoom({
			zoomLevel: this._oGraph.ZOOM_100
		});
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	KeyboardNavigator.prototype._onCtrlPlus = function (oEvent) {
		this._oGraph._zoom({
			deltaY: 1
		});
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	KeyboardNavigator.prototype._onCtrlMinus = function (oEvent) {
		this._oGraph._zoom({
			deltaY: -1
		});
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	KeyboardNavigator.prototype._ignoreEvent = function (oEvent) {
		return !containsOrEquals(this._oWrapperDom, oEvent.target);
	};

	KeyboardNavigator.prototype._handleError = function (oError) {
		Log.error("An error in KeyboardNavigator: " + oError);
	};

	// This call must be the last thing in the function.
	wrapPublicMethods(KeyboardNavigator);

	return KeyboardNavigator;
});
