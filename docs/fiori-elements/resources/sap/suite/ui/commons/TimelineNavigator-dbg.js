/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/delegate/ItemNavigation",
	"sap/base/assert",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/events/KeyCodes"
], function (jQuery, ItemNavigation, assert, containsOrEquals, KeyCodes) {
	"use strict";

	function stringEndsWith(sString, sPattern) {
		var iDiff = sString.length - sPattern.length;
		return iDiff >= 0 && sString.lastIndexOf(sPattern) === iDiff;
	}

	/**
	 * Creates an instance of TimelineNavigator.
	 * @class TimelineNavigator An extension of ItemNavigator for Timeline.
	 *
	 * @extends sap.ui.core.delegate.ItemNavigation
	 *
	 * @param {Element} oDomRef The root DOM reference that includes all items
	 * @param {Element[]} aItemDomRefs Array of DOM references representing the items for the navigation
	 * @param {boolean} [bNotInTabChain=false] Whether the selected element should be in the tab chain or not
	 * @param {Element[]} aRows 2D array of navigation items to navigate in. If not defined navigation will fallback to aItemDomRefs.
	 *
	 * @constructor
	 * @alias sap.suite.ui.commons.TimelineNavigator
	 * @public
	 */
	var TimelineNavigator = ItemNavigation.extend("sap.suite.ui.commons.TimelineNavigator", {
		constructor: function (oDomRef, aItemDomRefs, bNotInTabChain, aRows) {
			ItemNavigation.apply(this, arguments);
			this.setDisabledModifiers({
				sapnext: ["alt"],
				sapprevious: ["alt"]
			});
			this.setCycling(false);
			this._aRows = aRows;
			this.iActiveTabIndex = 0;
			this.iTabIndex = 0;
			this.bRefocusOnNextUpdate = false;
			this.oLastFocused = null;
		}
	});

	/**
	 * Update references to navigation objects.
	 * @param {Element} oDomRef The root DOM reference that includes all items
	 * @param {Element[]} aItemDomRefs Array of DOM references representing the items for the navigation
	 * @param {Element[]} aRows 2D array of navigation items to navigate in. If not defined navigation will fallback to aItemDomRefs.
	 * @public
	 */
	TimelineNavigator.prototype.updateReferences = function (oDomRef, aItemDomRefs, aRows) {
		this.oDomRef = oDomRef;
		this.setItemDomRefs(aItemDomRefs);
		this._aRows = aRows;
		if (this.bRefocusOnNextUpdate) {
			this._refocusItem();
			this.bRefocusOnNextUpdate = false;
		}
		this.setBeforeAfterTabIndex();
	};

	/**
	 * Sets a flag which will refocus new items on next reference update based on last selected index.
	 */
	TimelineNavigator.prototype.refocusOnNextUpdate = function () {
		this.bRefocusOnNextUpdate = true;
	};

	/**
	 * Refocuses item after references were updated. It tries to find first next visible element.
	 * @private
	 */
	TimelineNavigator.prototype._refocusItem = function () {
		var iItemToFocus = this.iFocusedIndex;
		if (iItemToFocus < 0) {
			return;
		}
		while (!jQuery(this.aItemDomRefs[iItemToFocus]).is(":visible")) {
			iItemToFocus++;
			if (iItemToFocus >= this.aItemDomRefs.length) {
				iItemToFocus = 0;
			}
			if (iItemToFocus === this.iFocusedIndex) {
				break;
			}
		}
		setTimeout(function () {
			if (this.aItemDomRefs) {
				this.focusItem(iItemToFocus);
			}
		}.bind(this), 0);
	};

	/**
	 * Sets the item DOM references as an array for the items
	 *
	 * @param {Element[]} aItemDomRefs Array of DOM references representing the items
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 */
	TimelineNavigator.prototype.setItemDomRefs = function (aItemDomRefs) {
		assert(Array.isArray(aItemDomRefs), "aItemDomRefs must be an array of DOM elements");
		this.aItemDomRefs = aItemDomRefs;

		if (this.iFocusedIndex > aItemDomRefs.length - 1) {
			this.iFocusedIndex = aItemDomRefs.length - 1;
		}

		// in nested ItemNavigation the tabindex must only be set if it's the focused item of the parent ItemNavigation
		for (var i = 0; i < this.aItemDomRefs.length; i++) {
			if (this.aItemDomRefs[i]) { // separators return null here
				var $Item = jQuery(this.aItemDomRefs[i]);

				// as this code can be executed even if the items are not visible (e.g. Popup is closed)
				// no focusable check can be performed. So only for the currently focused item
				// the tabindex is set to 0. For all items with tabindex 0 the tabindex is set to -1
				// Items without tabindex are checked for focusable on the first focusin on the root.
				if (i == this.iFocusedIndex && !$Item.data("sap.INRoot")) {
					$Item.attr("tabIndex", this.iActiveTabIndex);
				} else if ($Item.attr("tabindex") == "0") { // set tabindex to -1 only if already set to 0
					$Item.attr("tabIndex", this.iTabIndex);
				}

				$Item.data("sap.INItem", true);
				$Item.data("sap.InNavArea", true); //Item is in navigation area - allow navigation mode and edit mode

				if ($Item.data("sap.INRoot") && i != this.iFocusedIndex) {

					// item is root of an nested ItemNavigation -> set tabindexes from its items to -1
					$Item.data("sap.INRoot").setNestedItemsTabindex();
				}
			}
		}

		return this;
	};

	/**
	 * Sets the <code>tabindex</code> of the items.
	 *
	 * This cannot be done while setting items because at this point of time the items might
	 * be invisible (because e.g. a popup closed), meaning the focusable check will fail.
	 * So the items <code>tabindex</code>es are set if the rootDom is focused the first time.
	 *
	 * @return {sap.ui.core.delegate.ItemNavigation} <code>this</code> to allow method chaining
	 * @private
	 */
	TimelineNavigator.prototype.setItemsTabindex = function () {

		for (var i = 0; i < this.aItemDomRefs.length; i++) {
			if (this.aItemDomRefs[i]) { // separators return null here
				var $Item = jQuery(this.aItemDomRefs[i]);
				if ($Item.is(":sapFocusable")) {

					// not focusable items (like labels) must not get a tabindex attribute
					if (i == this.iFocusedIndex && !$Item.data("sap.INRoot")) {
						$Item.attr("tabIndex", this.iActiveTabIndex);
					} else {
						$Item.attr("tabIndex", this.iTabIndex);
					}
				}
			}
		}

		return this;
	};

	TimelineNavigator.prototype.setBeforeAfterTabIndex = function () {
		if (this.oDomRef){
			var sElementId = this.oDomRef.id + "-after";
			jQuery(window.document.getElementById(sElementId)).attr("tabindex", -1);
			sElementId = this.oDomRef.id + "-before";
			jQuery(window.document.getElementById(sElementId)).attr("tabindex", -1);
			jQuery(this.oDomRef).attr("tabindex", -1);
		}
	};

	/**
	 * Sets the focused index to the given index.
	 *
	 * @param {int} iIndex Index of the item
	 * @return {sap.ui.core.delegate.ItemNavigation} <code>this</code> to allow method chaining
	 * @private
	 */
	TimelineNavigator.prototype.setFocusedIndex = function (iIndex) {
		var $Item;

		if (this.aItemDomRefs.length < 0) {
			// no items -> don't change TabIndex
			this.iFocusedIndex = -1;
			return this;
		}

		if (iIndex < 0) {
			iIndex = 0;
		}

		if (iIndex > this.aItemDomRefs.length - 1) {
			iIndex = this.aItemDomRefs.length - 1;
		}

		if (this.iFocusedIndex !== -1 && this.aItemDomRefs.length > this.iFocusedIndex) {
			jQuery(this.aItemDomRefs[this.iFocusedIndex]).attr("tabIndex", this.iTabIndex);

			// if focus is in nested ItemNavigation but is moved to an other item, remove tabindex from nested item
			$Item = jQuery(this.aItemDomRefs[this.iFocusedIndex]);
			if ($Item.data("sap.INRoot") && iIndex != this.iFocusedIndex) {
				jQuery($Item.data("sap.INRoot").aItemDomRefs[$Item.data("sap.INRoot").iFocusedIndex]).attr("tabIndex", this.iTabIndex);
			}
		}

		this.iFocusedIndex = iIndex;
		var oFocusItem = this.aItemDomRefs[this.iFocusedIndex];

		$Item = jQuery(this.aItemDomRefs[this.iFocusedIndex]);
		if (!$Item.data("sap.INRoot")) {

			// in nested ItemNavigation the nested item gets the tabindex
			jQuery(oFocusItem).attr("tabIndex", this.iActiveTabIndex);
		}

		return this;
	};

	/**
	 * Calls a parent function if it's defined.
	 * @param {string} sFnName Name of the function.
	 * @param {[object]} aArguments Arguments to pass into the function.
	 * @private
	 */
	TimelineNavigator.prototype._callParent = function (sFnName, aArguments) {
		if (typeof ItemNavigation.prototype[sFnName] === "function") {
			ItemNavigation.prototype[sFnName].apply(this, aArguments);
		}
	};


	/**
	 * If an element inside an item has focus, the focus is returned to the item.
	 * @param {jQuery.Event} oEvent The original event object
	 * @private
	 */
	TimelineNavigator.prototype._onF7 = function (oEvent) {
		if (!containsOrEquals(this.oDomRef, oEvent.target)) {
			//Current element is not part of the navigation content
			return;
		}
		var focusedIndex = this.getFocusedIndex();
		if (focusedIndex >= 0) {
			this.focusItem(focusedIndex, oEvent);
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	/**
	 * See sapenter
	 * @param {jQuery.Event} oEvent The original event object
	 * @private
	 */
	TimelineNavigator.prototype.onsapspace = function (oEvent) {
		this.onsapenter(oEvent);
	};

	/**
	 * Activates the first action of an item.
	 * @param {jQuery.Event} oEvent The original event object
	 * @private
	 */
	TimelineNavigator.prototype.onsapenter = function (oEvent) {
		var id,
			$element;
		if (this._skipNavigation(oEvent, false, true)) {
			return;
		}
		$element = jQuery(this.getFocusedDomRef());
		id = $element.attr("id");
		if (stringEndsWith(id, "-outline")) { //We have enter on timeline item
			if ($element.hasClass("sapSuiteUiCommonsTimelineGroupHeaderMainWrapper")) {
				id = id.substr(0, id.length - "outline".length) + "groupCollapseIcon";
				$element.find("#" + id).keyup();
			} else {
				$element.find("div[role='toolbar']").children().first().mousedown().mouseup().click();
				this.fireEvent("Enter", {
					domRef: $element.get(0)
				});
			}
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	/**
	 * Handles the home key event.
	 *
	 * @param {jQuery.Event} oEvent The original event object
	 * @private
	 */
	TimelineNavigator.prototype.onsaphome = function (oEvent) {
		//Fixes bug in ItemNavigation when there are no selectable items.
		if (this.aItemDomRefs.length === 0) {
			return;
		}

		if (this._skipNavigation(oEvent, false, false)) {
			return;
		}

		this._callParent("onsaphome", arguments);
	};

	/**
	 * Makes sure that if tab leaves item, selected item changes as well. It also handles F7 key.
	 * @param {jQuery.Event} oEvent The original event object
	 * @private
	 */
	TimelineNavigator.prototype.onkeydown = function (oEvent) {
		this._callParent("onkeydown", arguments);

		if (oEvent.keyCode === KeyCodes.F7) {
			this._onF7(oEvent);
		}
	};

	/**
	 * Fixes ItemNavigation onmousedown. ItemNavigation expect the component to have only one top element and all sub elements to be
	 * part of aItemDomRef. Timeline has multiple sub elements that are not part of the array and so the mousedown of ItemNavigation
	 * brakes focus behaviour.
	 *
	 * @param {jQuery.Event} oEvent The original event object
	 * @private
	 */
	TimelineNavigator.prototype.onmousedown = function (oEvent) {
		// set the focus to the clicked element or back to the last
		var oSource = oEvent.target;
		var checkFocusableParent = function (oDomRef, oItem) {

			// as table cell might have focusable content that have not focusable DOM insinde
			// the table cell should not get the focus but the focusable element inside
			var bFocusableParent = false;
			var $CheckDom = jQuery(oDomRef);
			while (!$CheckDom.is(":sapFocusable") && $CheckDom.get(0) != oItem) {
				$CheckDom = $CheckDom.parent();
			}

			if ($CheckDom.get(0) != oItem) {
				// focusable Dom found inside item
				bFocusableParent = true;
			}

			return bFocusableParent;

		};

		if (containsOrEquals(this.oDomRef, oSource)) {
			// the mouse down occured inside the main dom ref
			for (var i = 0; i < this.aItemDomRefs.length; i++) {
				var oItem = this.aItemDomRefs[i];
				if (containsOrEquals(oItem, oSource)) {
					// only focus the items if the click did not happen on a
					// focusable element!
					if (oItem === oSource || !checkFocusableParent(oSource, oItem)) {
						this.focusItem(i, oEvent);

						// the table mode requires not to prevent the default
						// behavior on click since we want to allow text selection
						// click into the control, ...
					}
					return;
				}
			}

			// root DomRef of item navigation has been clicked
			// focus will also come in a moment - let it know that it was the mouse who caused the focus
			this._bMouseDownHappened = true;
			setTimeout(function () {
				this._bMouseDownHappened = false;
			}.bind(this), 20);
		}
	};

	/**
	 * Handles the onsapprevious event
	 * Sets the focus to the previous item
	 *
	 * @param {jQuery.Event} oEvent the browser event
	 * @private
	 */
	TimelineNavigator.prototype.onsapnext = function (oEvent) {
		var iIndex,
			bFirstTime = true,
			oCurrentPosition,
			oNextPosition,
			oItem;

		if (!this._aRows) {
			this._callParent("onsapnext", arguments);
			return;
		}

		// Sepcial hadling of sparce table when right key or down key was pressed.
		//debugger;
		if (this._skipNavigation(oEvent, true, false)) {
			return;
		}

		oEvent.preventDefault();
		oEvent.stopPropagation();

		if (this.getFocusedIndex() < 0) {
			// control doesn't have a focus
			return;
		}

		oCurrentPosition = this._findPosition(this.iFocusedIndex);

		if (oCurrentPosition === null) {
			throw new Error("TimelineNavigation cannot obtain a position of focused item and hance it cannot senect next.");
		}

		oNextPosition = Object.assign({}, oCurrentPosition);

		do {
			if (oEvent.keyCode === KeyCodes.ARROW_DOWN) {
				oNextPosition.iY++;
				if (oNextPosition.iY >= this._aRows.length) {
					if (oNextPosition.iX + 1 >= this._aRows[this._aRows.length - 1].length) {
						// We reached the end of navigation. We should stop.
						return;
					}
					oNextPosition.iY = 0;
					oNextPosition.iX++;
				}
			} else {
				oNextPosition.iX++;
				if (oNextPosition.iX >= this._aRows[oNextPosition.iY].length) {
					if (oNextPosition.iY + 1 >= this._aRows.length) {
						// We reached the end of navigation. We should stop.
						return;
					}
					oNextPosition.iX = 0;
					oNextPosition.iY++;
				}
			}

			if (oNextPosition.iX === oCurrentPosition.iX && oNextPosition.iY === oCurrentPosition.iY) {
				if (bFirstTime) {
					bFirstTime = false;
				} else {
					// There is no other element to focus in this direction.
					return;
				}
			}
			oItem = this._aRows[oNextPosition.iY][oNextPosition.iX];
		} while (!oItem || !jQuery(oItem).is(":sapFocusable"));

		iIndex = this._findIndex(oNextPosition);

		this.focusItem(iIndex, oEvent);
	};

	/**
	 * Handles the onsapprevious event
	 * Sets the focus to the previous item
	 *
	 * @param {jQuery.Event} oEvent The original event object
	 * @private
	 */
	TimelineNavigator.prototype.onsapprevious = function (oEvent) {
		var iIndex,
			bFirstTime = true,
			oCurrentPosition,
			oNextPosition,
			oItem;

		if (!this._aRows) {
			this._callParent("onsapprevious", arguments);
			return;
		}

		// Sepcial hadling of sparce table when right key or down key was pressed.
		if (this._skipNavigation(oEvent, true, false)) {
			return;
		}

		oEvent.preventDefault();
		oEvent.stopPropagation();

		if (this.getFocusedIndex() < 0) {
			// control doesn't have a focus
			return;
		}

		oCurrentPosition = this._findPosition(this.iFocusedIndex);

		if (oCurrentPosition === null) {
			throw new Error("TimelineNavigation cannot obtain a position of focused item and hance it cannot senect next.");
		}

		oNextPosition = Object.assign({}, oCurrentPosition);

		do {
			if (oEvent.keyCode === KeyCodes.ARROW_UP) {
				oNextPosition.iY--;
				if (oNextPosition.iY < 0) {
					if (oNextPosition.iX <= 0) {
						// We reached the beginning of navigation. We should stop.
						return;
					}
					oNextPosition.iY = this._aRows.length - 1;
					oNextPosition.iX--;
				}
			} else {
				oNextPosition.iX--;
				if (oNextPosition.iX < 0) {
					if (oNextPosition.iY <= 0) {
						// We reached the beginning of navigation. We should stop.
						return;
					}
					oNextPosition.iX = this._aRows[oNextPosition.iY].length - 1;
					oNextPosition.iY--;
				}
			}

			if (oNextPosition.iX === oCurrentPosition.iX && oNextPosition.iY === oCurrentPosition.iY) {
				if (bFirstTime) {
					bFirstTime = false;
				} else {
					// There is no other element to focus in this direction.
					return;
				}
			}
			oItem = this._aRows[oNextPosition.iY][oNextPosition.iX];
		} while (!oItem || !jQuery(oItem).is(":sapFocusable"));

		iIndex = this._findIndex(oNextPosition);

		this.focusItem(iIndex, oEvent);
	};

	/**
	 * Checks whether an element is in aItemDomRefs
	 *
	 * @param {Element} oElement Object to check
	 * @returns {boolean} Element is in this.DomRefs array
	 * @private
	 */
	TimelineNavigator.prototype._isInDomRefs = function (oElement) {
		return this.aItemDomRefs.indexOf(oElement) > -1;
	};

	/**
	 * Checks whether element is in timeline
	 *
	 * @param {HTMLElement} oElement Object to check
	 * @return {boolean} Whether oElement is in timeline
	 * @private
	 */
	TimelineNavigator.prototype._isInTimeline = function (oElement) {
		while (oElement){
			if (this._isInDomRefs(oElement)){
				return true;
			}
			oElement = oElement.parentElement;
		}
		return false;
	};

	/**
	 * Checks whether item has tabbable child elements in timeline
	 *
	 * @param {Object} oElement Object to check
	 * @returns {boolean} Whether oElement has tabbable children
	 * @private
	 */
	 TimelineNavigator.prototype._hasTabbableChildren = function (oElement) {
        var oTimelineTabbableItem = jQuery(oElement.closest(".sapSuiteUiCommonsTimelineItemOutline")).find(":sapTabbable");
        if (oTimelineTabbableItem && oTimelineTabbableItem.index(oElement) >= 0 )  {
            if (oTimelineTabbableItem.index(oElement) == oTimelineTabbableItem.length - 1) {
                return false;
            } else {
                return true;
            }
        } else if (oTimelineTabbableItem.length == 0) {
            return false;
        } else {
            return true;
        }
    };

	/**
	 * Checks whether element is last tabbable child in timeline
	 *
	 * @param {jQuery.Event} oEvent The original event object
	 * @returns {boolean} Whether target of the event is the last child in time line
	 * @private
	 */
	TimelineNavigator.prototype._isLastChildInTimeline = function (oEvent) {
		return this._isInTimeline(oEvent.target) && !this._hasTabbableChildren(oEvent.target);
	};

	/**
	 * Handles the onsaptabnext event
	 * Moves focus out of timeline when the target of event has no tabbable children
	 *
	 * @param {jQuery.Event} oEvent The original event object
	 * @private
	 */
	 TimelineNavigator.prototype.onsaptabnext = function (oEvent) {
        if (oEvent.target.id && this._isLastChildInTimeline(oEvent)){
            if (oEvent.target.closest(".sapSuiteUiCommonsTimelineItemOutline")) {
                oEvent.target.closest(".sapSuiteUiCommonsTimelineItemOutline").focus();
                oEvent.preventDefault();
            }
        }
    };

	/**
	 * Handles the onsaptabprevious event
	 * Moves the focus out of timeline when the target is a root element of timeline
	 *
	 * @param {jQuery.Event} oEvent The original event object
	 * @private
	 */
	 TimelineNavigator.prototype.onsaptabprevious = function(oEvent) {
        if ( this._isInDomRefs(oEvent.target)) {
            var oTimelineTabbableItem = jQuery(oEvent.target).find(":sapTabbable");
            if (this.aItemDomRefs.indexOf(oEvent.target) == 0 ) {
                var sElementId = this.oDomRef.id + "-before";
                jQuery(window.document.getElementById(sElementId)).focus();
                return;
            }
            if (oTimelineTabbableItem.length) {
                oTimelineTabbableItem[oTimelineTabbableItem.length - 1].focus();
                oEvent.preventDefault();
            } else {
                oEvent.target.focus();
                oEvent.preventDefault();
                return;
            }
        }
    };

	/**
	 * Handles the onfocusin event
	 * On focus back to the timeline the focus is moved to last focused timeline element
	 *
	 * @param {jQuery.Event} oEvent The original event object
	 * @private
	 */
	TimelineNavigator.prototype.onfocusin = function (oEvent) {
		if ( this._isInTimeline(oEvent.target)) {
			this.oLastFocused = oEvent.target;
		}
		if (!oEvent.relatedTarget || !this._isInTimeline(oEvent.relatedTarget) ){
			if ( this._isInTimeline(oEvent.target) && this.oLastFocused  && this.oLastFocused !== oEvent.target) {
				jQuery(this.oLastFocused).focus();
			}
		}

	};

	/**
	 * Finds position of item given by index in _aRows.
	 *
	 * @param {int} iIndex Index of item in aItemDomRefs
	 * @returns {Object} Object with iX, iY containing position of the item in the array.
	 * @private
	 */
	TimelineNavigator.prototype._findPosition = function (iIndex) {
		var iX,
			iY,
			oItem = this.aItemDomRefs[iIndex];

		for (iY = 0; iY < this._aRows.length; iY++) {
			for (iX = 0; iX < this._aRows[iY].length; iX++) {
				if (oItem === this._aRows[iY][iX]) {
					return {
						iX: iX,
						iY: iY
					};
				}
			}
		}
		return null;
	};

	/**
	 * Finds an index of item given by it's position in _aRows.
	 *
	 * @param {object} oPosition Position object containing iX, iY coordinates of item in _aRows.
	 * @returns {number|null} Position of item in aItemDomRefs or null if it is not found
	 * @private
	 */
	TimelineNavigator.prototype._findIndex = function (oPosition) {
		var oItem = this._aRows[oPosition.iY][oPosition.iX],
			i;

		for (i = 0; i < this.aItemDomRefs.length; i++) {
			if (oItem === this.aItemDomRefs[i]) {
				return i;
			}
		}
		return null;
	};

	/**
	 * Determines weather given event should be handled by navigator.
	 *
	 * @param {jQuery.Event} oEvent The original event object
	 * @param {boolean} bCheckNavigationMode Flag which determines if navigation mode should disable navigator.
	 * @param {boolean} bCheckItemSelected Flag which determines if no item selected should disable navigator.
	 * @returns {boolean} If true, navigator should not modify it's state for this event. False means navigation may continue.
	 * @private
	 */
	TimelineNavigator.prototype._skipNavigation = function (oEvent, bCheckNavigationMode, bCheckItemSelected) {
		return !containsOrEquals(this.oDomRef, oEvent.target) || //Current element is not part of the navigation content
			(this.getFocusedIndex() < 0 && bCheckItemSelected) || //No item selected
			this.aItemDomRefs && Array.prototype.indexOf.call(this.aItemDomRefs, oEvent.target) === -1 || //The selected element is not a timeline item. We don't want to block default element behavior in case of input fields etc.
			(jQuery(this.oDomRef).data("sap.InNavArea") && bCheckNavigationMode); // control is in navigation mode -> no ItemNavigation
	};

	return TimelineNavigator;
});
