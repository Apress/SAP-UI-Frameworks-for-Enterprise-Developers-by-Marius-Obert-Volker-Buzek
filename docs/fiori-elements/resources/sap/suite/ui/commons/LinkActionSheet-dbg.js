/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'sap/m/library',
	'sap/ui/core/Control',
	'sap/m/ActionSheet',
	"sap/ui/Device",
	"./LinkActionSheetRenderer"
], function (jQuery, MobileLibrary, Control, ActionSheet, Device, LinkActionSheetRenderer) {
	"use strict";

	/**
	 * Constructor for a new LinkActionSheet.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control contains one or more sap.m.Button controls or sap.ui.commons.Link controls. The LinkActionSheet control is closed if the user chooses one of the buttons or links. It looks similar to sap.m.Dialog in iPhone and Android, and to sap.m.Popover in iPad.
	 * @extends sap.m.ActionSheet
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. Object page should be used instead.
	 * @alias sap.suite.ui.commons.LinkActionSheet
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var LinkActionSheet = ActionSheet.extend("sap.suite.ui.commons.LinkActionSheet", /** @lends sap.suite.ui.commons.LinkActionSheet.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			aggregations: {

				/**
				 * These buttons or links are added to the content area in the LinkActionSheet control. If the user chooses a button or a link, the LinkActionSheet is closed before the event listener is called.
				 */
				items: {type: "sap.ui.core.Control", multiple: true, singularName: "item"}
			},
			events: {

				/**
				 * The event is fired when the user chooses any item.
				 */
				itemPress: {
					allowPreventDefault: true,
					parameters: {

						/**
						 * The object that initiated the event.
						 */
						item: {type: "sap.ui.core.Control"}
					}
				}
			}
		}
	});

	LinkActionSheet.prototype.init = function () {
		if (Device.system.desktop) {
			ActionSheet.prototype.init.apply(this);
			this.getButtons = this.getItems;
		} else {
			this._setItemNavigation = function () {
			};
			this.attachBeforeOpen(function () {
				this.onclick = function (e) {
					e.preventDefault();
				};
			}).attachAfterOpen(function () {
				this.onclick = function (e) {
				};
			});
		}
	};

	LinkActionSheet.prototype._preProcessActionItem = function (oItem) {
		if (oItem.getType && oItem.getType() !== MobileLibrary.ButtonType.Accept && oItem.getType() !== MobileLibrary.ButtonType.Reject) {
			oItem.setType(MobileLibrary.ButtonType.Transparent);
			oItem.addStyleClass("sapMBtnInverted"); // dark background
		}
		oItem.onsapenter = function () {
			this._bEnterWasPressed = true;
		};

		return this;
	};

	LinkActionSheet.prototype._itemSelected = function (event) {
		var oItem = event.getSource();

		if (this.fireItemPress({item: oItem})) {
			if (!(Device.os.ios && Device.system.ipad || (!Device.system.phone)) && this._parent) {
				this._parent._oCloseTrigger = this;
			}
			this.close();
		}
		oItem._bEnterWasPressed = undefined;
	};

	/* Override API methods */
	LinkActionSheet.prototype.addItem = function (oItem) {
		this.addAggregation("items", oItem, false);
		this._preProcessActionItem(oItem);
		oItem.attachPress(this._itemSelected, this);
		return this;
	};
	LinkActionSheet.prototype.insertItem = function (oItem, iIndex) {
		this.insertAggregation("items", oItem, iIndex, false);
		this._preProcessActionItem(oItem);
		oItem.attachPress(this._itemSelected, this);
		return this;
	};
	LinkActionSheet.prototype.removeItem = function (oItem) {
		var result = this.removeAggregation("items", oItem, false);
		if (result) {
			result.detachPress(this._itemSelected, this);
			oItem.onsapenter = undefined;
		}
		return result;
	};
	LinkActionSheet.prototype.removeAllItems = function () {
		var result = this.removeAllAggregation("items", false);
		jQuery.each(result, function (i, oItem) {
			oItem.detachPress(this._itemSelected, this);
			oItem.onsapenter = undefined;
		}.bind(this));
		return result;
	};
	LinkActionSheet.prototype.clone = function () {
		var aItems = this.getItems(),
			oItem,
			i;

		for (i = 0; i < aItems.length; i++) {
			oItem = aItems[i];
			oItem.detachPress(this._itemSelected, this);
		}

		var oClone = Control.prototype.clone.apply(this, arguments);

		for (i = 0; i < aItems.length; i++) {
			oItem = aItems[i];
			oItem.attachPress(this._itemSelected, this);
		}

		return oClone;
	};

	return LinkActionSheet;
});
