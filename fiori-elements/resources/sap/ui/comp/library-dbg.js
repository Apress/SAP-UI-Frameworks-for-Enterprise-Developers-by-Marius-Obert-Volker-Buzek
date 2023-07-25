/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

/**
 * Initialization Code and shared classes of library sap.ui.comp.
 */
sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library', 'sap/m/library'], function(Core, library1, library2) {
	"use strict";

	/**
	 * SAPUI5 library with smart controls.<br>
	 * <b>Note:</b> The controls in this library only support OData V2 (see {@link sap.ui.model.odata.v2.ODataModel}) and a default model (named <code>undefined</code>).
	 * <br/>
	 * <b>Note:</b> Properties of a complex type (used in an OData entity type) cannot be bound by or used with controls of this library.
	 * <br/>
	 * <b>Note:</b> Most controls in this library do not support key user adaptation. Please see {@link topic:f1430c0337534d469da3a56307ff76af Key User Adaptation: Enable Your App} for a list of supported controls.
	 *
	 * @namespace
	 * @alias sap.ui.comp
	 * @public
	 */
	var thisLib = sap.ui.getCore().initLibrary({
		name: "sap.ui.comp",
		version: "1.113.0",
		dependencies: [
			"sap.ui.core",
			"sap.m"
		],
		designtime: "sap/ui/comp/designtime/library.designtime",
		types: [
			"sap.ui.comp.smartfield.ControlProposalType",
			"sap.ui.comp.smartfield.ControlContextType",
			"sap.ui.comp.smartfield.ControlType",
			"sap.ui.comp.smartchart.SelectionMode",
			"sap.ui.comp.smartfield.DisplayBehaviour",
			"sap.ui.comp.smartfield.JSONType",
			"sap.ui.comp.smartfield.CriticalityRepresentationType",
			"sap.ui.comp.smartfield.TextInEditModeSource",
			"sap.ui.comp.smartfield.Importance",
			"sap.ui.comp.TextArrangementType",
			"sap.ui.comp.smarttable.TableType",
			"sap.ui.comp.smarttable.ExportType",
			"sap.ui.comp.smartlist.ListType",
			"sap.ui.comp.personalization.AggregationRole",
			"sap.ui.comp.personalization.ResetType",
			"sap.ui.comp.personalization.ChangeType",
			"sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation",
			"sap.ui.comp.smartfilterbar.SelectOptionSign",
			"sap.ui.comp.smartfilterbar.DisplayBehaviour",
			"sap.ui.comp.smartform.SmartFormValidationMode"
		],
		interfaces: [
			"sap.ui.comp.smartform.SmartFormLayout",
			"sap.ui.comp.IFormGroupElement",
			"sap.ui.comp.IDropDownTextArrangement"
		],
		controls: [
			"sap.ui.comp.filterbar.FilterBar",
			"sap.ui.comp.navpopover.NavigationPopover",
			"sap.ui.comp.navpopover.SmartLink",
			"sap.ui.comp.smartchart.SmartChart",
			"sap.ui.comp.smartfield.SmartField",
			"sap.ui.comp.smartfield.SmartLabel",
			"sap.ui.comp.smartfilterbar.SmartFilterBar",
			"sap.ui.comp.smartform.SmartForm",
			"sap.ui.comp.smartmultiedit.Field",
			"sap.ui.comp.smartmultiedit.Container",
			"sap.ui.comp.smartmicrochart.SmartAreaMicroChart",
			"sap.ui.comp.smartmicrochart.SmartLineMicroChart",
			"sap.ui.comp.smartmicrochart.SmartBulletMicroChart",
			"sap.ui.comp.smartmicrochart.SmartDeltaMicroChart",
			"sap.ui.comp.smartmicrochart.SmartRadialMicroChart",
			"sap.ui.comp.smartmicrochart.SmartStackedBarMicroChart",
			"sap.ui.comp.smartmicrochart.SmartComparisonMicroChart",
			"sap.ui.comp.smartmicrochart.SmartColumnMicroChart",
			"sap.ui.comp.smartmicrochart.SmartHarveyBallMicroChart",
			"sap.ui.comp.smartmicrochart.SmartMicroChart",
			"sap.ui.comp.smarttable.SmartTable",
			"sap.ui.comp.smartlist.SmartList",
			"sap.ui.comp.smartvariants.SmartVariantManagement",
			"sap.ui.comp.smartvariants.SmartVariantManagementUi2",
			"sap.ui.comp.transport.TransportDialog",
			"sap.ui.comp.valuehelpdialog.ValueHelpDialog",
			"sap.ui.comp.variants.EditableVariantItem",
			"sap.ui.comp.variants.VariantManagement"
		],
		elements: [
			"sap.ui.comp.filterbar.FilterGroupItem",
			"sap.ui.comp.filterbar.FilterItem",
			"sap.ui.comp.navpopover.LinkData",
			"sap.ui.comp.navpopover.SemanticObjectController",
			"sap.ui.comp.smartfield.Configuration",
			"sap.ui.comp.smartfield.ControlProposal",
			"sap.ui.comp.smartfield.ObjectStatus",
			"sap.ui.comp.smartfilterbar.ControlConfiguration",
			"sap.ui.comp.smartfilterbar.GroupConfiguration",
			"sap.ui.comp.smartfilterbar.SelectOption",
			"sap.ui.comp.smartform.Group",
			"sap.ui.comp.smartform.GroupElement",
			"sap.ui.comp.smartform.SemanticGroupElement",
			"sap.ui.comp.smartform.Layout",
			"sap.ui.comp.smartvariants.PersonalizableInfo",
			"sap.ui.comp.variants.VariantItem",
			"sap.ui.comp.navpopover.NavigationContainer",
			"sap.ui.comp.smartvariants.SmartVariantManagementAdapter"
		],
		extensions: {
			flChangeHandlers: {
				"sap.ui.comp.smartform.SmartForm": "sap/ui/comp/smartform/flexibility/SmartForm",
				"sap.ui.comp.smartform.Group": {
					"hideControl": "default",
					"unhideControl": "default",
					"renameGroup": "sap/ui/comp/smartform/flexibility/changes/RenameGroup",
					"addField": "sap/ui/comp/smartform/flexibility/changes/AddField",
					"addFields": "sap/ui/comp/smartform/flexibility/changes/AddFields",
					"addMultiEditField": "sap/ui/comp/smartmultiedit/flexibility/changes/AddMultiEditFields"
				},
				"sap.ui.comp.smartform.GroupElement": {
					"hideControl": "default",
					"unhideControl": "sap/ui/comp/smartform/flexibility/changes/UnhideControl",
					"renameField": "sap/ui/comp/smartform/flexibility/changes/RenameField"
				},
				"sap.ui.comp.navpopover.NavigationContainer": {
					"addLink": {
						"changeHandler": "sap/ui/comp/navpopover/flexibility/changes/AddLink",
						"layers": {
							"USER": true
						}
					},
					"removeLink": {
						"changeHandler": "sap/ui/comp/navpopover/flexibility/changes/RemoveLink",
						"layers": {
							"USER": true
						}
					}
				},
				"sap.ui.comp.smartfield.SmartField": "sap/ui/comp/smartfield/flexibility/SmartField",
				"sap.ui.comp.smarttable.SmartTable": {
					"ToolbarContentMove": "sap/ui/comp/smarttable/flexibility/ToolbarContentMove"
				}
			},
			//Configuration used for rule loading of Support Assistant
			"sap.ui.support": {
				publicRules: true
			}
		}
	}) || thisLib;

	thisLib.DEFAULT_DISPLAY_BEHAVIOUR = "descriptionAndId";

	thisLib.ANALYTICAL_PARAMETER_PREFIX = "$Parameter.";

	thisLib.STANDARD_VARIANT_NAME = "STANDARD";

	thisLib.smartform = thisLib.smartform || {};

	/**
	 * Determines if given <code>CustomData</code> should be inherited from <code>SmartForm</code> to the content <code>SmartField</code>
	 * controls.
	 *
	 * @param {sap.ui.core.CustomData} oCustomData <code>CustomData</code> to be checked
	 * @return {boolean} If <code>true</code> the <code>CustomData</code> should be inherited
	 * @private
	 * @function
	 */
	thisLib.smartform.inheritCostomDataToFields = function(oCustomData) {
		var sKey = oCustomData.getKey();
		var oBlockList = {
			startsWith: {
				strings: [
					"sap.ui.fl"
				],
				compareFunction: function(sBlockListString) {
					return sKey.startsWith(sBlockListString);
				}
			},
			wholeString: {
				strings: [
					"sap-ui-custom-settings"
				],
				compareFunction: function(sBlockListString) {
					return sKey == sBlockListString;
				}
			}
		};

		var bReturn = true;
		Object.keys(oBlockList).forEach(function(sType) {
			if (bReturn && oBlockList[sType].strings.some(oBlockList[sType].compareFunction)) {
				bReturn = false;
				return true;
			}
		});

		return bReturn;
	};

	/**
	 * Enumeration of text arrangement types.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.60
	 */
	thisLib.TextArrangementType = {

		/**
		 * Text comes first, followed by the ID.
		 * @public
		 */
		TextFirst: "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst",

		/**
		 * ID comes first, followed by the description.
		 * @public
		 */
		TextLast: "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast",

		/**
		 * ID and description are represented separately.
		 * @public
		 */
		TextSeparate: "com.sap.vocabularies.UI.v1.TextArrangementType/TextSeparate",

		/**
		 * Only description is represented, ID is hidden (for example, for <code>UUIDs</code>).
		 * @public
		 */
		TextOnly: "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly"
	};

	thisLib.smartchart = thisLib.smartchart || {};

	/**
	 * Enumeration for supported selection mode in SmartChart
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.ui.comp.smartchart.SelectionMode
	 */
	thisLib.smartchart.SelectionMode = {
		/**
		 * Multi selection mode, multiple sets of data points can be selected at once.
		 * @public
		 */
		Multi: "MULTIPLE",
		/**
		 * Single selection mode, only one set of data points can be selected at once.
		 * @public
		 */
		Single: "SINGLE",
		/**
		 * None selection mode, no data points can be selected.
		 * @public
		 */
		None: "NONE"
	};

	thisLib.smartfield = thisLib.smartfield || {};

	/**
	 * The available control types to configure the internal control selection of a SmartField control.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.smartfield.ControlType = {

		/**
		 * The <code>SmartField</code> control chooses the control to be displayed.
		 *
		 * @public
		 */
		auto: "auto",

		/**
		 * The <code>SmartField</code> control displays a combo box control.
		 *
		 * @public
		 */
		dropDownList: "dropDownList",

		/**
		 * The <code>SmartField</code> control displays a text input field control.
		 *
		 * @public
		 */
		input: "input",

		/**
		 * The <code>SmartField</code> control displays a date picker control.
		 *
		 * @public
		 */
		datePicker: "datePicker",

		/**
		 * The <code>SmartField</code> control displays a check box control.
		 *
		 * @public
		 */
		checkBox: "checkBox",

		/**
		 * The <code>SmartField</code> control displays a select control.
		 *
		 * @public
		 */
		selection: "selection"
	};

	/**
	 * The different options to define display behavior for the value help of a SmartField control.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.smartfield.DisplayBehaviour = {

		/**
		 * The SmartField chooses the display behavior.
		 *
		 * @public
		 */
		auto: "auto",

		/**
		 * Only the description of the available values is displayed.
		 *
		 * @public
		 */
		descriptionOnly: "descriptionOnly",

		/**
		 * Description and ID are displayed for available values.
		 *
		 * @public
		 */
		descriptionAndId: "descriptionAndId",

		/**
		 * ID and description are displayed for available values.
		 *
		 * @public
		 */
		idAndDescription: "idAndDescription",

		/**
		 * Shows the ID only.
		 *
		 * @public
		 */
		idOnly: "idOnly",

		/**
		 * Shows Boolean value as True/False
		 *
		 * @public
		 */
		TrueFalse: "TrueFalse",

		/**
		 * Shows Boolean value as On/Off
		 *
		 * @public
		 */
		OnOff: "OnOff",

		/**
		 * Shows Boolean value as Yes/No
		 *
		 * @public
		 */
		YesNo: "YesNo"

	};
	/**
	 * Enumeration of the different data types supported by the SmartField control, if it is using a JSON model.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.smartfield.JSONType = {

		/**
		 * The JavaScript primary type String
		 *
		 * @public
		 */
		String: "String",

		/**
		 * The JavaScript Date Object
		 *
		 * @public
		 */
		Date: "Date",

		/**
		 * Float type
		 *
		 * @public
		 */
		Float: "Float",

		/**
		 * Integer type
		 *
		 * @public
		 */
		Integer: "Integer",

		/**
		 * Boolean Type
		 *
		 * @public
		 */
		Boolean: "Boolean",

		/**
		 * Date Time Type
		 *
		 * @public
		 */
		DateTime: "DateTime"

	};

	/**
	 * Enumeration of the different contexts supported by the SmartField, if it is using an OData model.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.smartfield.ControlContextType = {
		/**
		 * No special context is selected. The Smart Field applies its internal defaults.
		 *
		 * @public
		 */
		None: "",

		/**
		 * Also the UoM layout is influenced.
		 *
		 * @public
		 */
		ResponsiveTable: "responsiveTable",

		/**
		 * Behaves currently exactly like <code>sap.ui.comp.smartfield.ControlContextType.None</code>.
		 *
		 * @public
		 */
		Form: "form",

		/**
		 * If this is selected the UoM layout is influenced.
		 *
		 * @public
		 */
		Table: "table",

		/**
		 * If this is selected the UoM layout is influenced.
		 *
		 * @public
		 */
		SmartFormGrid: "smartFormGrid"
	};

	/**
	 * Enumeration of the different control proposals supported by the Smart Field, if it is using an OData model.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.smartfield.ControlProposalType = {
		/**
		 * No special context is selected. The Smart Field applies its internal defaults.
		 *
		 * @public
		 */
		None: "",

		/**
		 * If this is selected, the sap.m.ObjectNumber control is used to display units of measure. If the value property of the Smart Field is not
		 * bound to a unit of measure, the property is ignored.
		 *
		 * @public
		 */
		ObjectNumber: "ObjectNumber",

		/**
		 * If this is selected, the sap.m.ObjectIdentifier control is used to display IDs, if they are not editable. The current OData property is
		 * assumed to have a text annotation. Otherwise the configuration is ignored.
		 *
		 * @public
		 */
		ObjectIdentifier: "ObjectIdentifier"

		/**
		 * If this is selected, the sap.m.ObjectStatus control is used to display values, if they are not editable.
		 *
		 * @public
		 */
		// ObjectStatus: "ObjectStatus"
	};

	/**
	 * The different options to visualize the ObjectStatus control.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.smartfield.CriticalityRepresentationType = {
		/**
		 * If this is selected, the sap.m.ObjectStatus control does not visualize the criticality using an icon.
		 *
		 * @public
		 */
		WithoutIcon: "WithoutIcon",

		/**
		 * If this is selected, the sap.m.ObjectStatus control visualizes the criticality using an icon.
		 *
		 * @public
		 */
		WithIcon: "WithIcon"
	};

	thisLib.smarttable = thisLib.smarttable || {};

	/**
	 * Provides enumeration sap.ui.comp.smarttable.TableType. A subset of table types that fit to a simple API returning one string.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.smarttable.TableType = {

		/**
		 * A table (sap.ui.table.Table) control shall be created as the content of the SmartTable, if no table already exists (default)
		 *
		 * @public
		 */
		Table: "Table",

		/**
		 * A responsive table (sap.m.Table) control that can be used on mobile devices shall be created as the content of the SmartTable, if no table
		 * already exists
		 *
		 * @public
		 */
		ResponsiveTable: "ResponsiveTable",

		/**
		 * An analytical table (sap.ui.table.AnalyticalTable) control shall be created as the content of the SmartTable, if no table already exists
		 *
		 * @public
		 */
		AnalyticalTable: "AnalyticalTable",

		/**
		 * A tree table (sap.ui.table.TreeTable) control shall be created as the content of the SmartTable, if no table already exists
		 *
		 * @public
		 */
		TreeTable: "TreeTable"

	};

	/**
	 * Enumeration <code>sap.ui.comp.smarttable.InfoToolbarBehavior</code> determines the behavior of the info toolbar in the <code>SmartTable</code> control.
	 *
	 * The info toolbar represents the filters that are applied using the table personalization dialog.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.70
	 */
	thisLib.smarttable.InfoToolbarBehavior = {

		/**
		 * The info toolbar is rendered for the <code>SmartTable</code> control of table type <code>ResponsiveTable</code> only.
		 *
		 * @public
		 */
		Auto: "Auto",

		/**
		 * The info toolbar is rendered for the <code>SmartTable</code> control regardless of the table type.
		 *
		 * <b>Note:</b> Currently the info toolbar is only rendered for table type <code>ResponsiveTable</code>.
		 *
		 * @public
		 */
		On: "On",

		/**
		 * The info toolbar is not rendered.
		 *
		 * @public
		 */
		Off: "Off"
	};

	/**
	 * Enumeration of sources from which text values for <code>Codes</code>/<code>IDs</code> are fetched in edit mode. The text is usually
	 * visualized as description/text value for IDs, for example, for LT (Laptop).
	 *
	 * @enum {string}
	 * @public
	 * @since 1.54
	 */
	thisLib.smartfield.TextInEditModeSource = {

		/**
		 * The <code>com.sap.vocabularies.UI.v1.TextArrangement</code> annotation and the value of the <code>displayBehaviour</code> property of
		 * the <code>configuration</code> aggregation are not evaluated.
		 *
		 * @public
		 */
		None: "None",

		/**
		 * The text is fetched from the OData model property specified in the <code>Path</code> attribute of the
		 * <code>com.sap.vocabularies.Common.v1.Text</code> annotation.
		 *
		 * @public
		 */
		NavigationProperty: "NavigationProperty",

		/**
		 * The text is fetched from the OData model property specified in the <code>Path</code> attribute of the
		 * <code>com.sap.vocabularies.Common.v1.Text</code> annotation of the associated value list entity.
		 *
		 * @public
		 */
		ValueList: "ValueList",

		/**
		 * The text is fetched from the OData model property specified in the <code>Path</code> attribute of the
		 * <code>com.sap.vocabularies.Common.v1.Text</code> annotation. Could be a value which is not included in the associated value list entity.
		 *
		 *  <b>Note</b> Note that a scenario where more than one <code>SmartField</code> is bound to the same property could raise a performance issue depending on the
		 *  number of the smart fields.
		 * @public
		 */
		ValueListNoValidation: "ValueListNoValidation",

		/**
		 * The same behavior as ValueListNoValidation but for values that are
		 * considered invalid a warning message will be created.
		 *
		 * NOTE: In this mode when the value is sent to the backend there might
		 * be 2 messages for the same field from both frontend and backend
		 * validation.
		 *
		 * @public
		 */
		ValueListWarning: "ValueListWarning"
	};

	/**
	 * Provides information about the importance of the field
	 *
	 * @enum {string}
	 * @public
	 * @since 1.87
	 */
	thisLib.smartfield.Importance = {
		/**
		 * <code>SmartField</code> with high importance
		 * @public
		 */
		High: "High",

		/**
		 * <code>SmartField</code> with medium importance
		 * @public
		 */
		Medium: "Medium",

		/**
		 * <code>SmartField</code> with low importance
		 * @public
		 */
		Low: "Low"
	};

	/**
	 * Provides the type of services available for export in the <code>SmartTable</code> control.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.smarttable.ExportType = {

		/**
		 * Gateway backend spreadsheet export service is used
		 *
		 * @public
		 */
		GW: "GW",

		/**
		 * UI5 client-side spreadsheet export service is used (default as of UI5 version 1.52)
		 *
		 * @public
		 */
		UI5Client: "UI5Client",

		/**
		 * UI5 client-side spreadsheet export service is used along with
		 * Gateway backend PDF export service.
		 *
		 * @public
		 */
		UI5ClientPDF: "UI5ClientPDF"
	};

	thisLib.smartlist = thisLib.smartlist || {};

	/**
	 * Provides enumeration sap.ui.comp.smartlist.ListType. A subset of list types that fit to a simple API returning one string.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.48
	 */
	thisLib.smartlist.ListType = {

		/**
		 * A list (sap.m.List) control shall be created as the content of the SmartList, if no list already exists (default)
		 *
		 * @public
		 */
		List: "List",

		/**
		 * A tree (sap.m.Tree) control shall be created as the content of the SmartList, if no list/tree already exists
		 *
		 * @public
		 */
		Tree: "Tree"
	};

	thisLib.personalization = thisLib.personalization || {};

	/**
	 * Provides enumeration sap.ui.comp.personalization.ResetType. A subset of reset types used in table personalization.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.personalization.ResetType = {

		/**
		 * Reset back to Restore (i.e. the version of the table with which the controller was instantiated or via setter updated) was triggered
		 * (either via API or via reset button)
		 *
		 * @public
		 */
		ResetFull: "ResetFull",

		/**
		 * Reset back to the CurrentVariant was triggered
		 *
		 * @public
		 */
		ResetPartial: "ResetPartial"
	};

	/**
	 * Provides enumeration sap.ui.comp.personalization.AggregationRole. A subset of aggregation roles used in table personalization.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.personalization.AggregationRole = {

		/**
		 * Dimension role.
		 *
		 * @public
		 */
		Dimension: "Dimension",

		/**
		 * Measure role.
		 *
		 * @public
		 */
		Measure: "Measure",

		/**
		 * Role which is neither dimension nor measure.
		 *
		 * @public
		 */
		NotDimeasure: "NotDimeasure"
	};

	/**
	 * Provides enumeration sap.ui.comp.personalization.ChangeType. A subset of changes done during table personalization.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.personalization.ChangeType = {

		/**
		 * Not changed
		 *
		 * @public
		 */
		Unchanged: "Unchanged",

		/**
		 * Change is applied to model but not applied to table
		 *
		 * @public
		 */
		ModelChanged: "ModelChanged",

		/**
		 * Change is applied to model and to table
		 *
		 * @public
		 */
		TableChanged: "TableChanged"
	};

	/**
	 * Provides enumeration sap.ui.comp.personalization.TableType. A subset of table types that fit for table personalization.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.personalization.TableType = {

		/**
		 * Represents <code>sap.m.Table</code>.
		 *
		 * @public
		 */
		ResponsiveTable: "ResponsiveTable",

		/**
		 * Represents <code>sap.ui.table.Table</code>.
		 *
		 * @public
		 */
		Table: "Table",

		/**
		 * Represents <code>sap.ui.table.AnalyticalTable</code>.
		 *
		 * @public
		 */
		AnalyticalTable: "AnalyticalTable",

		/**
		 * Represents <code>sap.ui.table.TreeTable</code>.
		 *
		 * @public
		 */
		TreeTable: "TreeTable",

		/**
		 * Represents <code>sap.ui.comp.personalization.ChartWrapper</code>.
		 *
		 * @public
		 */
		ChartWrapper: "ChartWrapper",

		/**
		 * Represents <code>sap.ui.comp.personalization.SelectionWrapper</code>.
		 *
		 * @public
		 */
		SelectionWrapper: "SelectionWrapper"
	};

	/**
	 * Provides enumeration sap.ui.comp.personalization.ColumnType. A subset of column types that fit for table personalization.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.personalization.ColumnType = {

		/**
		 * Represents <code>sap.m.Column</code>.
		 *
		 * @public
		 */
		ResponsiveColumn: "ResponsiveColumn",

		/**
		 * Represents <code>sap.ui.table.Column</code>.
		 *
		 * @public
		 */
		TableColumn: "TableColumn",

		/**
		 * Represents <code>sap.ui.comp.personalization.ColumnWrapper</code>.
		 *
		 * @public
		 */
		ColumnWrapper: "ColumnWrapper"
	};

	thisLib.smartfilterbar = thisLib.smartfilterbar || {};

	/**
	 * The available filter types to configure the internal control of a SmartFilterBar control.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.smartfilterbar.FilterType = {
		/**
		 * Restrict filter based on metadata.
		 *
		 * @public
		 */
		auto: "auto",
		/**
		 * Restrict filter to a single entry.
		 *
		 * @public
		 */
		single: "single",
		/**
		 * Restrict filter to multiple entries.
		 *
		 * @public
		 */
		multiple: "multiple",
		/**
		 * Restrict filter to an interval.
		 *
		 * @public
		 */
		interval: "interval",
		/**
		 * Restrict filter to be used as first operand in startswith, endswith, and contains clauses.
		 * @since 1.107
		 * @public
		 */
		 searchExpression: "searchExpression"
	};

	/**
	 * The available control types to configure the internal control selection of a SmartFilterBar control.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.smartfilterbar.ControlType = {
		/**
		 * Shows field based on metadata.
		 *
		 * @public
		 */
		auto: "auto",

		/**
		 * Shows an input field.
		 *
		 * @public
		 */
		input: "input",

		/**
		 * Shows a drop down list field.
		 *
		 * @public
		 */
		dropDownList: "dropDownList",

		/**
		 * Shows a date picker field.
		 *
		 * @public
		 */
		date: "date",

		/**
		 * Shows a date time picker field.
		 *
		 * @public
		 */
		dateTimePicker: "dateTimePicker"

	};

	/**
	 * The different options to define mandatory state for fields in the SmartFilter control.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.smartfilterbar.MandatoryType = {
		/**
		 * Shows values based on metadata.
		 *
		 * @public
		 */
		auto: "auto",
		/**
		 * Shows field as mandatory.
		 *
		 * @public
		 */
		mandatory: "mandatory",
		/**
		 * Shows field as not mandatory.
		 *
		 * @public
		 */
		notMandatory: "notMandatory"
	};

	/**
	 * The different options to define display behavior for fields in the SmartFilter control.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.smartfilterbar.DisplayBehaviour = {
		/**
		 * Shows values based on metadata.
		 *
		 * @public
		 */
		auto: "auto",

		/**
		 * Shows only the description for values.
		 *
		 * @public
		 */
		descriptionOnly: "descriptionOnly",

		/**
		 * Shows description and then an id in values.
		 *
		 * @public
		 */
		descriptionAndId: "descriptionAndId",

		/**
		 * Shows id and then a description in values.
		 *
		 * @public
		 */
		idAndDescription: "idAndDescription",

		/**
		 * Shows only the id for values.
		 *
		 * @public
		 */
		idOnly: "idOnly"
	};

	/**
	 * The different options to define Sign for Select Options used in SmartFilter control.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.smartfilterbar.SelectOptionSign = {
		/**
		 * Sign Include
		 *
		 * @public
		 */
		I: "I",
		/**
		 * Sign Include
		 *
		 * @public
		 */
		include: "I",
		/**
		 * Sign Exclude
		 *
		 * @public
		 */
		E: "E",
		/**
		 * Sign Exclude
		 *
		 * @public
		 */
		exclude: "E"
	};

	thisLib.navpopover = thisLib.navpopover || {};

	/**
	 * Type of change handler type for link personalization.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.navpopover.ChangeHandlerType = {
		/**
		 * Change handler creating a change for an added link.
		 *
		 * @public
		 */
		addLink: "addLink",
		/**
		 * Change handler creating a change for a removed link.
		 *
		 * @public
		 */
		removeLink: "removeLink",
		/**
		 * Change handler creating a change for a moved link.
		 *
		 * @public
		 */
		moveLink: "moveLink"
	};

	thisLib.smartvariants = thisLib.smartvariants || {};

	/**
	 * Enumeration for changes for personalization of variant favorites.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.smartvariants.ChangeHandlerType = {
		/**
		 * Change handler creating a change for an added favorite.
		 *
		 * @public
		 */
		addFavorite: "addFavorite",
		/**
		 * Change handler creating a change for a removed favorite.
		 *
		 * @public
		 */
		removeFavorite: "removeFavorite"
	};

	thisLib.valuehelpdialog = thisLib.valuehelpdialog || {};

	/**
	 * The range operations supported by the <code>ValueHelpDialog</code> control.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.valuehelpdialog.ValueHelpRangeOperation = {
		/**
		 * The Between operation for the ranges.
		 *
		 * @public
		 */
		BT: "BT",
		/**
		 * The Equals operation for the ranges.
		 *
		 * @public
		 */
		EQ: "EQ",
		/**
		 * The Contains operation for the ranges.
		 *
		 * @public
		 */
		Contains: "Contains",
		/**
		 * The StartsWith operation for the ranges.
		 *
		 * @public
		 */
		StartsWith: "StartsWith",
		/**
		 * The EndsWith operation for the ranges.
		 *
		 * @public
		 */
		EndsWith: "EndsWith",
		/**
		 * The Less operation for the ranges.
		 *
		 * @public
		 */
		LT: "LT",
		/**
		 * The Less or equals operation for the ranges.
		 *
		 * @public
		 */
		LE: "LE",
		/**
		 * The Greater operation for the ranges.
		 *
		 * @public
		 */
		GT: "GT",
		/**
		 * The Between or equals operation for the ranges.
		 *
		 * @public
		 */
		GE: "GE",
		/**
		 * The Initial operation for the ranges.
		 *
		 * @private
		 */
		Initial: "Initial",
		/**
		 *
		 * The Empty operation for the ranges.
		 * @private
		 */
		Empty: "Empty"
	};

	/**
	 * Enumeration of SmartForm validation mode.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.81
	 */
	thisLib.smartform.SmartFormValidationMode = {

		/**
		 * Standard validation mode which handles the validation only of nested <code>SmartField</code> with synchronous
		 * validation.
		 * @public
		 */
		Standard: "Standard",

		/**
		 * Async validation mode. This mode handles all types of <code>SmartField</code> controls both with sync and
		 * async validation.
		 *
		 * Note: This is the recommended validation mode.
		 *
		 * @public
		 */
		Async: "Async"
	};

	/**
	 * Enumeration of SmartForm Importance types
	 *
	 * @enum {string}
	 * @public
	 * @since 1.87
	 */
	thisLib.smartform.Importance = {
		/**
		 * Shows fields that are annotated with UI.ImportanceType/High or have importance property set to High
		 * @public
		 */
		High: "High",

		/**
		 * Shows fields that are annotated with <code>UI.ImportanceType/Medium</code> or <code>UI.ImportanceType/High</code> or have the <code>importance</code> property set to <code>medium</code> or <code>high</code>.
		 * @public
		 */
		Medium: "Medium",

		/**
		 * Shows all fields
		 * @public
		 */
		Low: "Low"
	};

	thisLib.filterbar = thisLib.filterbar || {};

	/**
	 * Marker interface for SmartForm layouts.
	 *
	 * @since 1.56.0
	 * @name sap.ui.comp.smartform.SmartFormLayout
	 * @interface
	 * @public
	 */

	/**
	 * Marker interface for SmartForm GroupElements.
	 *
	 * @since 1.88.0
	 * @name sap.ui.comp.IFormGroupElement
	 * @interface
	 * @public
	 */
	return thisLib;

});
