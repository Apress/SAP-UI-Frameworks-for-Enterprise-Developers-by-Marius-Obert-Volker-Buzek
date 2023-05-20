/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define(['sap/ui/comp/library'], function(library) {
	"use strict";

	/**
	 * @public
	 * @constructor
	 */
	var AdditionalConfigurationHelper = function(aControlConfiguration, aGroupConfiguration) {
		this.controlConfiguration = [];
		this.groupConfiguration = [];
		this._initialize(aControlConfiguration, aGroupConfiguration);
	};

	/**
	 * Fills the internal structures
	 *
	 * @private
	 */
	AdditionalConfigurationHelper.prototype._initialize = function(aControlConfiguration, aGroupConfiguration) {
		var i, length, oGroupConfiguration, oControlConfiguration, o, aDefaultFilterValues, oDefaultFilterValue, j, length2, oo;

		if (!aControlConfiguration) {
			aControlConfiguration = [];
		}

		if (!aGroupConfiguration) {
			aGroupConfiguration = [];
		}

		// Control Configuration
		length = aControlConfiguration.length;
		for (i = 0; i < length; i++) {
			oControlConfiguration = aControlConfiguration[i];
			o = {};
			o.key = oControlConfiguration.getKey();
			o.groupId = oControlConfiguration.getGroupId();
			o.index = oControlConfiguration.getIndex();
			o.label = oControlConfiguration.getLabel();
			o.isVisible = oControlConfiguration.getVisible();
			o.mandatory = oControlConfiguration.getMandatory();
			o.width = oControlConfiguration.getWidth();
			o.hasValueHelpDialog = oControlConfiguration.getHasValueHelpDialog();
			o.hasTypeAhead = oControlConfiguration.getHasTypeAhead();
			o.controlType = oControlConfiguration.getControlType();
			o.filterType = oControlConfiguration.getFilterType();
			o.customControl = oControlConfiguration.getCustomControl();
			o.visibleInAdvancedArea = oControlConfiguration.getVisibleInAdvancedArea();
			o.preventInitialDataFetchInValueHelpDialog = oControlConfiguration.getPreventInitialDataFetchInValueHelpDialog();
			o.isSetPreventInitialDataFetchInValueHelpDialog = oControlConfiguration.isPropertyInitial("preventInitialDataFetchInValueHelpDialog");
			o.displayBehaviour = oControlConfiguration.getDisplayBehaviour();
			o.defaultFilterValues = [];
			o.conditionType = oControlConfiguration.getConditionType();
			o.historyEnabled = oControlConfiguration.getHistoryEnabled();
			o.historyEnabledInitial = oControlConfiguration.isPropertyInitial("historyEnabled");
			o.disableNewDateRangeControl = oControlConfiguration.getDisableNewDateRangeControl();
			o.conditionPanelDefaultOperation = !oControlConfiguration.isPropertyInitial("conditionPanelDefaultOperation")
			&& library.valuehelpdialog.ValueHelpRangeOperation[oControlConfiguration.getConditionPanelDefaultOperation()] ?
			oControlConfiguration.getConditionPanelDefaultOperation() : null;
			o.timezone = oControlConfiguration.getTimezone();
			aDefaultFilterValues = oControlConfiguration.getDefaultFilterValues();
			if (aDefaultFilterValues && aDefaultFilterValues.length) {
				length2 = aDefaultFilterValues.length;
				for (j = 0; j < length2; j++) {
					oDefaultFilterValue = aDefaultFilterValues[j];
					oo = {};
					oo.sign = oDefaultFilterValue.getSign();
					oo.operator = oDefaultFilterValue.getOperator();
					oo.low = oDefaultFilterValue.getLow();
					oo.high = oDefaultFilterValue.getHigh();
					o.defaultFilterValues.push(oo);
				}
			}
			this.controlConfiguration.push(o);
		}

		// Group Configuration
		length = aGroupConfiguration.length;
		for (i = 0; i < length; i++) {
			oGroupConfiguration = aGroupConfiguration[i];
			o = {
				key: oGroupConfiguration.getKey(),
				index: oGroupConfiguration.getIndex(),
				label: oGroupConfiguration.getLabel()
			};
			this.groupConfiguration.push(o);
		}
	};

	/**
	 * Returns the control configuration for a specified key. Returns undefined, if there is no configuration.
	 *
	 * @public
	 */
	AdditionalConfigurationHelper.prototype.getControlConfigurationByKey = function(sKey) {
		var i, length;

		length = this.controlConfiguration.length;
		for (i = 0; i < length; i++) {
			if (this.controlConfiguration[i].key === sKey) {
				return this.controlConfiguration[i];
			}
		}
		return undefined;
	};

	/**
	 * Returns all control configurations
	 *
	 * @public
	 */
	AdditionalConfigurationHelper.prototype.getControlConfiguration = function() {
		return this.controlConfiguration;
	};

	/**
	 * Returns all group configurations
	 *
	 * @public
	 */
	AdditionalConfigurationHelper.prototype.getGroupConfiguration = function() {
		return this.groupConfiguration;
	};

	/**
	 * Returns the control configuration for a specified key. Returns undefined, if there is no configuration.
	 */
	AdditionalConfigurationHelper.prototype.getGroupConfigurationByKey = function(sKey) {
		var i, length;

		length = this.groupConfiguration.length;
		for (i = 0; i < length; i++) {
			if (this.groupConfiguration[i].key === sKey) {
				return this.groupConfiguration[i];
			}
		}
		return undefined;
	};

	return AdditionalConfigurationHelper;

}, /* bExport= */true);
