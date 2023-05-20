/*
* ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
*/
sap.ui.define(['sap/ui/core/Control', 'sap/m/List', 'sap/m/library', 'sap/m/ResponsivePopover', 'sap/ui/base/ManagedObject'],
	function(Control, List, mobileLibrary, ResponsivePopover, ManagedObject) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.m.ListMode
	var ListMode = mobileLibrary.ListMode;

	/**
	 * Constructor for a new Filter Popover Control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @alias sap.collaboration.components.controls.FilterPopover
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) design time metamodel
	 */

	var FilterPopover = Control.extend("sap.collaboration.components.controls.FilterPopover", /** @lends sap.collaboration.components.controls.FilterPopover.prototype */ {
		metadata : {
			interfaces : [],
			library : "sap.collaboration",
			properties : {

				/**
				 * The title text appears in the popover header.
				 */
				title : {type : "string", group : "Appearance", defaultValue : null},

				/**
				 * This is the text shown when the content has no data.
				 */
				noDataText : {type : "string", group : "Appearance", defaultValue : null},
			},
			events : {

				/**
				 * Event is fired when selection is changed via user interaction inside the list
				 */
				selectionChange : {
					parameters : {

						/**
						 * Returns the selected list item. When no item is selected, "null" is returned.
						 */
						listItem : {type : "sap.m.ListItemBase"},
					}
				},
			},
			defaultAggregation : "items",
			aggregations : {

				/**
				 * The items of the list.
				 */
				items : {type : "sap.m.ListItemBase", multiple : true, singularName : "item", bindable : "bindable"},
			}
		},
		renderer: null // this is a popup-like control, it has no renderer
	});

	/* ====================================  */
	/*           Protected Methods			 */
	/* ===================================== */
	/**
	*  Initializes the Control instance after creation. [borrowed from sap.ui.core.Control]
	* @protected
	* @memberOf sap.collaboration.components.controls.FilterPopover
	*/
	FilterPopover.prototype.init = function() {
		this._oList = new List(this.getId() + "-list", {
			mode: ListMode.SingleSelectMaster,
			includeItemInSelection: true,
			selectionChange: [this._selectionChange, this]
		});

		this._oResponsivePop = new ResponsivePopover(this.getId() + "-popover", {
			placement: PlacementType.Auto,
			contentWidth: "15rem",
			content: [this._oList]
		});
	};
	/**
	* Cleans up the control instance before destruction. [borrowed from sap.ui.core.Control]
	* @protected
	* @memberOf sap.collaboration.components.controls.FilterPopover
	*/
	FilterPopover.prototype.exit = function() {
		this._oList = null;

		if (this._oResponsivePop) {
			this._oResponsivePop.destroy();
			this._oResponsivePop = null;
		}
	};

	/* ====================================  */
	/*           Public Methods				 */
	/* ===================================== */
	/**
	* Opens the FilterPopover control.
	* @public
	* @param {object} oControl The control that will open the popover
	* @returns {FilterPopover}
	* @memberOf sap.collaboration.components.controls.FilterPopover
	*/
	FilterPopover.prototype.openBy = function(oControl) {
		this._oResponsivePop.openBy(oControl);
		return this;
	};

	/**
	 * Set the title of the internal popover
	 * @overwrite
	 * @public
	 * @param {string} sTitle the title text for the dialog
	 * @returns {FilterPopover} this pointer for chaining
	 * @memberOf sap.collaboration.components.controls.FilterPopover
	 */
	FilterPopover.prototype.setTitle = function(sTitle) {
		this.setProperty("title", sTitle, true);
		this._oResponsivePop.setTitle(sTitle);

		return this;
	};

	/**
	 * Set the no data text of the internal list
	 * @overwrite
	 * @public
	 * @param {string} sNoDataText the no data text for the list
	 * @returns {FilterPopover} this pointer for chaining
	 * @memberOf sap.collaboration.components.controls.FilterPopover
	 */
	FilterPopover.prototype.setNoDataText = function(sNoDataText) {
		this.setProperty("noDataText", sNoDataText, true);
		this._oList.setNoDataText(sNoDataText);

		return this;
	};

	/**
	 * Selects the given list item.
	 * @overwrite
	 * @public
	 * @param {object} oListItem The list item whose selection to be changed.
	 * @returns {FilterPopover} this pointer for chaining
	 * @memberOf sap.collaboration.components.controls.FilterPopover
	 */
	FilterPopover.prototype.setSelectedItem = function(oListItem) {
		this._oList.setSelectedItem(oListItem);

		return this;
	};

	/**
	 * Selects the given list item.
	 * @overwrite
	 * @public
	 * @returns {sap.m.ListBase} the selected item from the list
	 * @memberOf sap.collaboration.components.controls.FilterPopover
	 */
	FilterPopover.prototype.getSelectedItem = function() {
		return this._oList.getSelectedItem();
	};

	/**
	* Set the model for the controls
	* @overwrite
	* @public
	* @param {sap.ui.Model} oModel the model that holds the data for the list
	* @param {string} sName the optional model name
	* @returns {FilterPopover} this pointer for chaining
	* @memberOf sap.collaboration.components.controls.FilterPopover
	*/
	FilterPopover.prototype._setModel = FilterPopover.prototype.setModel;
	FilterPopover.prototype.setModel = function(oModel, sModelName) {
		var aArgs = Array.prototype.slice.call(arguments);

		// pass the model to the responsive popover and also to the local control to allow binding of own properties
		this._oResponsivePop.setModel(oModel, sModelName);
		FilterPopover.prototype._setModel.apply(this, aArgs);

		return this;
	};

	/**
	 * Forwards aggregations to the internal list.
	 * @overwrite
	 * @param {string} sAggregationName the name for the binding
	 * @param {object} oBindingInfo the configuration parameters for the binding
	 * @returns {FilterPopover} this pointer for chaining
	 * @memberOf sap.collaboration.components.controls.FilterPopover
	 */
	FilterPopover.prototype.bindAggregation = function() {
		var args = Array.prototype.slice.call(arguments);

		// propagate the bind aggregation function to list
		this._callMethodInManagedObject.apply(this, ["bindAggregation"].concat(args));
		return this;
	};

	FilterPopover.prototype.validateAggregation = function(sAggregationName, oObject, bMultiple) {
		return this._callMethodInManagedObject("validateAggregation", sAggregationName, oObject, bMultiple);
	};

	FilterPopover.prototype.setAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		this._callMethodInManagedObject("setAggregation", sAggregationName, oObject, bSuppressInvalidate);
		return this;
	};

	FilterPopover.prototype.getAggregation = function(sAggregationName, oDefaultForCreation) {
		return this._callMethodInManagedObject("getAggregation", sAggregationName, oDefaultForCreation);
	};

	FilterPopover.prototype.indexOfAggregation = function(sAggregationName, oObject) {
		return this._callMethodInManagedObject("indexOfAggregation", sAggregationName, oObject);
	};

	FilterPopover.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		this._callMethodInManagedObject("insertAggregation", sAggregationName, oObject, iIndex, bSuppressInvalidate);
		return this;
	};

	FilterPopover.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		this._callMethodInManagedObject("addAggregation", sAggregationName, oObject, bSuppressInvalidate);
		return this;
	};

	FilterPopover.prototype.removeAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		this._callMethodInManagedObject("removeAggregation", sAggregationName, oObject, bSuppressInvalidate);
		return this;
	};

	FilterPopover.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
		return this._callMethodInManagedObject("removeAllAggregation", sAggregationName, bSuppressInvalidate);
	};

	FilterPopover.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
		this._callMethodInManagedObject("destroyAggregation", sAggregationName, bSuppressInvalidate);
		return this;
	};

	/* ====================================  */
	/*           Private Methods			 */
	/* ===================================== */
	/*
	 * Forwards a function call to a managed object based on the aggregation name.
	 * If the name is items, it will be forwarded to the list, otherwise called locally
	 * @private
	 * @param {string} sFunctionName the name of the function to be called
	 * @param {string} sAggregationName the name of the aggregation associated
	 * @returns {mixed} the return type of the called function
	 * @memberOf sap.collaboration.components.controls.FilterPopover
	 */
	FilterPopover.prototype._callMethodInManagedObject = function(sFunctionName, sAggregationName) {
		var aArgs = Array.prototype.slice.call(arguments);

		if (sAggregationName === "items") {
			// apply to the internal list
			return this._oList[sFunctionName].apply(this._oList, aArgs.slice(1));
		} else {
			// apply to this control
			return ManagedObject.prototype[sFunctionName].apply(this, aArgs.slice(1));
		}
	};

	/**
	 * When the user select an item from the list
	 * @private
	 * @param {oControlEvent}
	 * @memberOf sap.collaboration.components.controls.FilterPopover
	 */
	FilterPopover.prototype._selectionChange = function(oControlEvent) {
		this._oResponsivePop.close();

		var oSelectedListItem = oControlEvent.getParameter("listItem");
		this.fireSelectionChange({
			listItem: oSelectedListItem
		});
	};

	return FilterPopover;
});