/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define("sap/suite/ui/commons/TimelineRenderManagerTimestamp", [
	"sap/ui/base/ManagedObject",
	"sap/m/RadioButtonGroup",
	"sap/m/RadioButton",
	"sap/m/Panel",
	"sap/m/DateTimePicker",
	"sap/m/Label",
	"sap/ui/core/library"
], function (
	Parent,
	RadioButtonGroup,
	RadioButton,
	Panel,
	DateTimePicker,
	Label,
	coreLibrary
) {
	"use strict";
	var ValueState = coreLibrary.ValueState;

	var PICKER_VIEW = {
		"RANGE": 0,
		"START": 1,
		"END": 2
	};

	var TimelineRenderManagerTimestamp = Parent.extend("sap.suite.ui.commons.TimelineRenderManagerTimestamp", {
		"constructor": function (sId, mSettings, oScope, oResourceBundle,oObject) {

			var oTimestampPanelPicker;
			var oTimestampPanelRadio;

			this.getText = oResourceBundle.getText.bind(oResourceBundle);
			this.oObject = oObject;

			this.getTimestampPanelPicker = function () {
				if (!oTimestampPanelPicker) {
					oTimestampPanelPicker = this._createTimestampPanelPicker();
				}
				return oTimestampPanelPicker;

			};

			this.getTimestampPanelRadio = function () {
				if (!oTimestampPanelRadio) {
					oTimestampPanelRadio = this._createTimestampPanelRadio();
				}
				return oTimestampPanelRadio;
			};

			Parent.call(this, sId, mSettings, oScope);

			// visibility check is used for building conditions
			// first time load without entering the time page (where visibility is handled) causes incorrect conditions
			this.setVisible(false);
		},
		metadata: {
			events:{
				/**
				 * This event is fired when either the start date or the end date is changed.
				 * @since 1.64
				 */
				dateChanged: {}
			}
		}
	});

	/**
	 * An area with date and time pickers for timestamp selection
	 *
	 * @private
	 *
	 * @return {sap.m.Panel} panel that contains date and time pickers
	 */
	TimelineRenderManagerTimestamp.prototype._createTimestampPanelPicker = function () {
		var sId = this.getId() + "-timestamp-panel-picker";
		var aContent;
		/* eslint-disable quote-props */
		var oFromTextLabel = new Label({
			text: this.getText("TIMELINE_FROM") + ":"
		});
		var oToTextLabel = new Label({
			text: this.getText("TIMELINE_TO") + ":"
		});
		var oPanel = new Panel({
			id: sId,
			content: [
				oFromTextLabel,
				new Label({
					text: this.getText("TIMELINE_NOW"),
					visible: false
				}),
				new DateTimePicker({
					width: "auto",
					ariaLabelledBy: [oFromTextLabel],
					change: this._handlerTimePickerRange.bind(this)
				}),
				oToTextLabel,
				new Label({
					text: this.getText("TIMELINE_NOW"),
					visible: false
				}),
				new DateTimePicker({
					width: "auto",
					ariaLabelledBy: [oToTextLabel],
					change: this._handlerTimePickerRange.bind(this)
				})
			]
		});
		/* eslint-enable quote-props */

		oPanel.addStyleClass("sapSuiteUiCommonsTimelineRangeFilterPanel");
		aContent = oPanel.getContent();
		aContent[1].addStyleClass("sapSuiteUiCommonsTimelineRangeLabelNow");
		aContent[2].addStyleClass("sapSuiteUiCommonsTimelineRangeDatePicker");
		aContent[4].addStyleClass("sapSuiteUiCommonsTimelineRangeLabelNow");
		aContent[5].addStyleClass("sapSuiteUiCommonsTimelineRangeDatePicker");
		return oPanel;
	};

	/**
	 * An area with a data type picker for timestamp selection
	 *
	 * @private
	 *
	 * @returns {sap.m.Panel} panel that contains radio buttons with the types of timestamp ranges
	 */
	TimelineRenderManagerTimestamp.prototype._createTimestampPanelRadio = function () {
		var sId = this.getId() + "-timestamp-panel-radio";
		/* eslint-disable quote-props */
		return new Panel({
			"id": sId,
			"content": [
				new RadioButtonGroup({
					columns: 3,
					select: this.handlerSelectRadioButton.bind(this),
					buttons: [
						new RadioButton({
							id: sId + "-range-of-dates",
							text: this.getText("TIMELINE_TIMESTAMP_RANGE_OF_DATES")
						}),
						new RadioButton({
							id: sId + "-starting-date",
							text: this.getText("TIMELINE_TIMESTAMP_STARTING_DATE")
						}),
						new RadioButton({
							id: sId + "-ending-date",
							text: this.getText("TIMELINE_TIMESTAMP_ENDING_DATE")
						})
					]
				})
			]
		});
		/* eslint-enable quote-props */
	};

	/**
	 * Enlarges dialog for timestamp selection controls
	 *
	 * @public
	 *
	 * @param {sap.suite.ui.commons.util.ManagedObjectRegister} objects is control container used by parent Timeline as control cache
	 */
	TimelineRenderManagerTimestamp.prototype.resizeDialog = function (objects) {
		objects.getFilterContent()._getDialog().setContentWidth("50em");
	};

	/**
	 * Shows or hides the timestamp part of the control
	 *
	 * @public
	 *
	 * @param {Boolean} visible show (true) or hide (false)
	 */
	TimelineRenderManagerTimestamp.prototype.setVisible = function (visible) {
		this.getTimestampPanelPicker().setVisible(visible);
		this.getTimestampPanelRadio().setVisible(visible);
	};

	/**
	 * Sets the current view of the custom range selection.<br/>
	 * Available views include select both timestamps, select only the end timestamp, select only the start timestamp.
	 *
	 * @public
	 *
	 * @param {Number} pickerView is the definition of the view from the constant PICKER_VIEW
	 * @param {sap.m.Panel} pickerPanel is control panel with the date time pickers
	 */
	TimelineRenderManagerTimestamp.prototype.setPickerView = function (pickerView, pickerPanel) {
		pickerPanel.getContent()[1].setVisible(pickerView === PICKER_VIEW.END); //Label TIMESTAMP_NOW
		pickerPanel.getContent()[2].setVisible(pickerView === PICKER_VIEW.START || pickerView === PICKER_VIEW.RANGE); //DateTimePicker from
		pickerPanel.getContent()[4].setVisible(pickerView === PICKER_VIEW.START); //Label TIMESTAMP_NOW
		pickerPanel.getContent()[5].setVisible(pickerView === PICKER_VIEW.END || pickerView === PICKER_VIEW.RANGE); //DateTimePicker to
	};

	/**
	 * Handles the selection of the time range type
	 *
	 * @public
	 *
	 * @param {sap.ui.base.Event} ev is the select event of sap.m.RadioButtonGroup
	 */
	TimelineRenderManagerTimestamp.prototype.handlerSelectRadioButton = function (ev) {
		this.setPickerView(ev.getParameter("selectedIndex"), this.getTimestampPanelPicker());
	};

	/**
	 * Determines the current picker filter visiblity
	 *
	 * @public
	 *
	 * @return {Boolean} returns true if the custom range panels are visible
	 */
	TimelineRenderManagerTimestamp.prototype.getVisible = function () {
		return this.getTimestampPanelPicker().getVisible() && this.getTimestampPanelRadio().getVisible();
	};

	/**
	 * Determines the start date of a custom range
	 *
	 * @public
	 *
	 * @return {Date} start date of the time range
	 */
	TimelineRenderManagerTimestamp.prototype.getStartDate = function () {
		var dStartDate;
		var oPickerFrom = this.getTimestampPanelPicker().getContent()[2];

		if (oPickerFrom.getVisible()) {
			dStartDate = oPickerFrom.getDateValue();
		} else {
			dStartDate = function () {
				return new Date();
			};
		}
		return dStartDate;
	};

	/**
	 * Clears the start and the end dates and enables the ok button on the dialog box.
	 *
	 * @since 1.64
	 *
	 * @public
	 */
	TimelineRenderManagerTimestamp.prototype.clearDates = function () {
		var oPickerFrom = this.getTimestampPanelPicker().getContent()[2],
			oPickerTo = this.getTimestampPanelPicker().getContent()[5];
		var oDialog = this.oObject.getFilterContent()._getDialog();
		var oBeginButton = oDialog.getBeginButton();
		oPickerFrom.setValueState(ValueState.None);
		oPickerTo.setValueState(ValueState.None);
		oBeginButton.setEnabled(true);

		oPickerFrom.setDateValue();
		oPickerTo.setDateValue();
	};

	/**
	 * Determines the end date of a custom range
	 *
	 * @public
	 *
	 * @return {Date} end date of the range
	 */
	TimelineRenderManagerTimestamp.prototype.getEndDate = function () {
		var dEndDate;
		var oPickerTo = this.getTimestampPanelPicker().getContent()[5];

		if (oPickerTo.getVisible()) {
			dEndDate = oPickerTo.getDateValue();
		} else {
			dEndDate = function () {
				return new Date();
			};
		}
		return dEndDate;
	};

	/**
	 * Destroys sub-controls
	 *
	 * @public
	 */
	TimelineRenderManagerTimestamp.prototype.destroy = function () {
		this.getTimestampPanelPicker().destroy();
		this.getTimestampPanelRadio().destroy();
		Parent.prototype.destroy.call(this);
	};

	/**
	 * Sets the selectable range for DateTimePicker
	 *
	 * @public
	 *
	 * @param {sap.ui.base.Event} oEvent is the select event of sap.m.DateTimePicker
	 */
	TimelineRenderManagerTimestamp.prototype._handlerTimePickerRange = function (oEvent) {
		var oPickerFrom = this.getTimestampPanelPicker().getContent()[2],
			oPickerTo = this.getTimestampPanelPicker().getContent()[5];
		var oPickerSelected = oEvent.getSource();
		var oDateSelected = oPickerSelected.getDateValue();
		var bValid = oEvent.getParameter("valid");
		var oDialog = this.oObject.getFilterContent()._getDialog();
		var oBeginButton = oDialog.getBeginButton();
		var sState = (bValid) ? ValueState.None : ValueState.Error;
		if (oPickerSelected === oPickerFrom) {
			if (oPickerTo.getDateValue() < oDateSelected) {
				oPickerTo.setInitialFocusedDateValue(oDateSelected);
			}
			oPickerTo.setMinDate(oDateSelected);
		} else if (oPickerSelected === oPickerTo) {
			if (oPickerFrom.getDateValue() > oDateSelected) {
				oPickerFrom.setInitialFocusedDateValue(oDateSelected);
			}
			oPickerFrom.setMaxDate(oDateSelected);
		}
		//sets the status of the date pickers
		if (oEvent.oSource.sId === oPickerFrom.getId()) {
			oPickerFrom.setValueState(sState);
		} else if (oEvent.oSource.sId === oPickerTo.getId()) {
			oPickerTo.setValueState(sState);
		}
		//sets the status of the ok button
		if (oPickerFrom.getValueState() === ValueState.None && oPickerTo.getValueState() === ValueState.None) {
			oBeginButton.setEnabled(true);
		} else {
			oBeginButton.setEnabled(false);
		}
	};

	/**
	 * Sets the state of the button according to the two date time pickers
	 *
	 * @private
	 */
	TimelineRenderManagerTimestamp.prototype._checkDatePickerStatus = function() {
		var oPickerFrom = this.getTimestampPanelPicker().getContent()[2],
			oPickerTo = this.getTimestampPanelPicker().getContent()[5];
		var oDialog = this.oObject.getFilterContent()._getDialog();
		var oBeginButton = oDialog.getBeginButton();
		if (oPickerFrom.getValueState() === ValueState.None && oPickerTo.getValueState() === ValueState.None) {
			oBeginButton.setEnabled(true);
		} else {
			oBeginButton.setEnabled(false);
		}
	};

	return TimelineRenderManagerTimestamp;

});
