/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
// -------------------------------------------------------------------------------
// Generates the view metadata required for a field using SAP-Annotations metadata
// -------------------------------------------------------------------------------
sap.ui.define([
	'sap/m/CheckBox', 'sap/m/DatePicker', 'sap/m/TimePicker', 'sap/m/HBox', 'sap/m/Input', 'sap/m/Text', 'sap/m/ObjectIdentifier', 'sap/m/ObjectStatus', 'sap/m/Image', 'sap/m/Link', 'sap/m/VBox', 'sap/m/FlexItemData', 'sap/m/library', 'sap/ui/comp/navpopover/SmartLink', 'sap/ui/comp/odata/MetadataAnalyser', 'sap/ui/comp/smartfield/ODataHelper', 'sap/ui/comp/smartfield/SmartField', 'sap/ui/comp/odata/ODataType', 'sap/ui/comp/odata/FiscalMetadata', 'sap/ui/comp/odata/CalendarMetadata', 'sap/ui/comp/odata/CriticalityMetadata', 'sap/ui/comp/util/FormatUtil', 'sap/ui/comp/util/MultiUnitUtil', 'sap/ui/core/Control', 'sap/ui/comp/navpopover/SemanticObjectController', 'sap/ui/comp/navpopover/NavigationPopoverHandler', './ValueHelpProvider', './ValueListProvider', 'sap/ui/comp/library'
], function(CheckBox, DatePicker, TimePicker, HBox, Input, Text, ObjectIdentifier, ObjectStatus, Image, Link, VBox, FlexItemData, MobileLibrary, SmartLink, MetadataAnalyser, ODataHelper, SmartField, ODataType, FiscalMetadata, CalendarMetadata, CriticalityMetadata, FormatUtil, MultiUnitUtil, Control, SemanticObjectController, NavigationPopoverHandler, ValueHelpProvider, ValueListProvider, compLibrary) {
	"use strict";

	var SmartToggle;

	/**
	 * Constructs a class to generate the view/data model metadata for the controls - that can be used in table/forms etc.
	 *
	 * @constructor
	 * @experimental This module is only for internal/experimental use!
	 * @public
	 * @param {object} mPropertyBag - PropertyBag having members model, entitySet
	 * @author SAP SE
	 */
	var ControlProvider = function(mPropertyBag) {
		if (mPropertyBag) {
			this._oParentODataModel = mPropertyBag.model;
			this._oMetadataAnalyser = mPropertyBag.metadataAnalyser;
			this._aODataFieldMetadata = mPropertyBag.fieldsMetadata;
			this._oLineItemAnnotation = mPropertyBag.lineItemAnnotation;
			this._oSemanticKeyAnnotation = mPropertyBag.semanticKeyAnnotation;
			this._smartTableId = mPropertyBag.smartTableId;
			this._bProcessDataFieldDefault = mPropertyBag.processDataFieldDefault;
			this._isAnalyticalTable = mPropertyBag.isAnalyticalTable;
			this._isMobileTable = mPropertyBag.isMobileTable;
			this._oDateFormatSettings = mPropertyBag.dateFormatSettings;
			this._useUTCDateTime = mPropertyBag.useUTCDateTime;
			this._bEnableDescriptions = mPropertyBag.enableDescriptions;
			this._oCurrencyFormatSettings = mPropertyBag.currencyFormatSettings;
			this._oDefaultDropDownDisplayBehaviour = mPropertyBag.defaultDropDownDisplayBehaviour || "descriptionAndId";
			this.useSmartField = mPropertyBag.useSmartField === "true";
			this.useSmartToggle = mPropertyBag.useSmartToggle === "true";
			this._sEntitySet = mPropertyBag.entitySet;
			this._oSemanticKeyAdditionalControl = mPropertyBag._semanticKeyAdditionalControl;
			this._oSemanticObjectController = mPropertyBag.semanticObjectController;
			this._bPreserveDecimals = mPropertyBag.preserveDecimals;
			this._oCustomizeConfigTextInEditModeSource = mPropertyBag.textInEditModeSource;
			this._oCustomizeConfigIgnoreInsertRestrictions = mPropertyBag.ignoreInsertRestrictions;
			this._oCustomizeConfigClientSideMandatoryCheck = mPropertyBag.clientSideMandatoryCheck;
		}

		if (!this._oMetadataAnalyser && this._oParentODataModel) {
			this._oMetadataAnalyser = new MetadataAnalyser(this._oParentODataModel);
			this._intialiseMetadata();
		}

		this._mSmartField = {};
		this._oHelper = new ODataHelper(this._oMetadataAnalyser.oModel);

		this._aValueListProvider = [];
		this._aValueHelpProvider = [];
		this._aLinkHandlers = [];
	};

	/**
	 * Initialises the necessary metadata
	 *
	 * @private
	 */
	ControlProvider.prototype._intialiseMetadata = function() {
		if (!this._aODataFieldMetadata) {
			this._aODataFieldMetadata = this._oMetadataAnalyser.getFieldsByEntitySetName(this.sEntity);
		}
	};

	/**
	 * Get the field metadata
	 *
	 * @param {object} oFieldODataMetadata - OData metadata for the field
	 * @param {boolean} isEditable - specifies if the control shall be editable
	 * @returns {Object} the field view metadata object
	 * @public
	 */
	ControlProvider.prototype.getFieldViewMetadata = function(oFieldODataMetadata, isEditable) {
		var oFieldViewMetadata = this._createFieldMetadata(oFieldODataMetadata);
		// Create and set the template
		this._createFieldTemplate(oFieldViewMetadata, isEditable);
		return oFieldViewMetadata;
	};

	ControlProvider.prototype._getTextInEditModeSource = function(oViewField) {
		if (!this._oCustomizeConfigTextInEditModeSource) {
			return compLibrary.smartfield.TextInEditModeSource.None;
		}

		return this._oCustomizeConfigTextInEditModeSource[oViewField.name] || this._oCustomizeConfigTextInEditModeSource["*"] || compLibrary.smartfield.TextInEditModeSource.None;
	};

	ControlProvider.prototype._getIgnoreInsertRestrictions = function(oViewField) {
		if (!this._oCustomizeConfigIgnoreInsertRestrictions) {
			return false;
		}

		if (this._oCustomizeConfigIgnoreInsertRestrictions.hasOwnProperty(oViewField.name)) {
			return this._oCustomizeConfigIgnoreInsertRestrictions[oViewField.name];
		}

		return this._oCustomizeConfigIgnoreInsertRestrictions["*"] || false;
	};

	ControlProvider.prototype._getClientSideMandatoryCheck = function(oViewField) {
		if (!this._oCustomizeConfigClientSideMandatoryCheck) {
			return true;
		}

		if (this._oCustomizeConfigClientSideMandatoryCheck.hasOwnProperty(oViewField.name)) {
			return this._oCustomizeConfigClientSideMandatoryCheck[oViewField.name];
		}

		return this._oCustomizeConfigClientSideMandatoryCheck["*"] || false;
	};

	/**
	 * Creates and extends the field view with a template for the UI content
	 *
	 * @param {object} oViewField - the view field metadata
	 * @param {boolean} isEditable - specifies if the control shall be editable
	 * @private
	 */
	ControlProvider.prototype._createFieldTemplate = function(oViewField, isEditable) {
		// Create SmartField template - if useSmartField is set
		if (this.useSmartField) {
			oViewField.template = new SmartField({
				textInEditModeSource: this._getTextInEditModeSource(oViewField),
				value: {
					path: oViewField.name
				},
				entitySet: this._sEntitySet,
				contextEditable: {
					path: "sm4rtM0d3l>/editable",
					mode: "OneWay"
				},
				controlContext: this._isMobileTable ? "responsiveTable" : "table",
				wrapping: this._isMobileTable,
				clientSideMandatoryCheck: this._getClientSideMandatoryCheck(oViewField)
			});

			if (ODataType.isNumeric(oViewField.type) || ODataType.isDateOrTime(oViewField.type) || CalendarMetadata.isCalendarValue(oViewField) || FiscalMetadata.isFiscalValue(oViewField)) {
				oViewField.template.setTextAlign("Right");
				oViewField.template.setWidth("100%");
			}
			this._completeSmartField(oViewField);

			oViewField.template._setPendingEditState(isEditable);
		}
		// Check if SmartToggle is set - if so, create both display and edit controls (use SmartField for edit if useSmartField is set)
		if (this.useSmartToggle) {
			oViewField.template = new SmartToggle({
				editable: {
					path: "sm4rtM0d3l>/editable",
					mode: "OneWay"
				},
				edit: this.useSmartField ? oViewField.template : this._createEditableTemplate(oViewField),
				display: this._createDisplayOnlyTemplate(oViewField)
			});
		} else if (!this.useSmartField) {
			// create controls as before
			oViewField.template = isEditable ? this._createEditableTemplate(oViewField) : this._createDisplayOnlyTemplate(oViewField);
		}
	};

	/**
	 * Completes the Smart Field template, adds especially meta data.
	 *
	 * @param {object} oViewField The current meta data
	 * @private
	 */
	ControlProvider.prototype._completeSmartField = function(oViewField) {
		var oData = {
				annotations: {},
				path: oViewField.name,
				ignoreInsertRestrictions: this._getIgnoreInsertRestrictions(oViewField)
			},
			oPVLAnnotation,
			oValueListData;

		if (!this._mSmartField.entitySetObject) {
			this._mSmartField.entitySetObject = this._oHelper.oMeta.getODataEntitySet(this._sEntitySet);
			this._mSmartField.entityType = this._oHelper.oMeta.getODataEntityType(this._mSmartField.entitySetObject.entityType);
		}

		oData.modelObject = this._oParentODataModel;
		oData.entitySetObject = this._mSmartField.entitySetObject;
		// ODataHelper expects entitySet and not entitySetObject!
		oData.entitySet = this._mSmartField.entitySetObject;
		oData.entityType = this._mSmartField.entityType;
		this._oHelper.getProperty(oData);

		oViewField.fieldControlProperty = this._oHelper.oAnnotation.getFieldControlPath(oData.property.property);
		if (oViewField.fieldControlProperty && oViewField.parentPropertyName) {
			oViewField.fieldControlProperty = oViewField.parentPropertyName + "/" + oViewField.fieldControlProperty;
		}

		oData.annotations.uom = this._oHelper.getUnitOfMeasure2(oData);
		oData.annotations.text = this._oHelper.getTextProperty2(oData);
		oData.annotations.lineitem = this._oLineItemAnnotation;
		oData.annotations.semantic = MetadataAnalyser.getSemanticObjectsFromProperty(oData.property.property);
		this._oHelper.getUOMTextAnnotation(oData);
		if (oData.property.property["sap:value-list"] || oData.property.property["com.sap.vocabularies.Common.v1.ValueList"]) {
			oData.annotations.valuelist = this._oHelper.getValueListAnnotationPath(oData);
			if (oData.property.property["sap:value-list"]) {
				oData.annotations.valuelistType = oData.property.property["sap:value-list"];
			} else {
				oData.annotations.valuelistType = this._oMetadataAnalyser.getValueListSemantics(oData.property.property["com.sap.vocabularies.Common.v1.ValueList"]);
			}
		}
		// check for available V4 annotation for fixed list and override if necessary
		if (oData.property.property["com.sap.vocabularies.Common.v1.ValueListWithFixedValues"]) {
			oData.annotations.valuelistType = MetadataAnalyser.getValueListMode(oData.property.property);
		}
		this._oHelper.getUOMValueListAnnotationPath(oData);
		delete oData.entitySet;

		if (typeof oData.annotations.valuelist === "string") {
			oValueListData  = this._oHelper.getAnalyzer().getValueListAnnotation(oData.annotations.valuelist);
			oPVLAnnotation = oValueListData.primaryValueListAnnotation;
			if (oPVLAnnotation) {
				oData.property.valueListAnnotation = oPVLAnnotation;
				oData.property.valueListKeyProperty = this._oHelper.getODataValueListKeyProperty(oPVLAnnotation);
				oData.property.valueListEntitySet = this._oHelper.oMeta.getODataEntitySet(oPVLAnnotation.valueListEntitySetName);
				oData.property.valueListEntityType = this._oHelper.oMeta.getODataEntityType(
					this._oHelper.oMeta.getODataEntitySet(oPVLAnnotation.valueListEntitySetName).entityType
				);
				oData.annotations.valueListData = oPVLAnnotation;
			}
		}

		oViewField.template.data("configdata", {
			"configdata": oData
		});

		oViewField.template.data("dateFormatSettings", this._oDateFormatSettings);
		oViewField.template.data("currencyFormatSettings", this._oCurrencyFormatSettings);
		oViewField.template.data("defaultDropDownDisplayBehaviour", this._oDefaultDropDownDisplayBehaviour);
		oViewField.template.data("defaultInputFieldDisplayBehaviour", oViewField.displayBehaviour);

		if (oData.annotations.uom || ODataType.isNumeric(oViewField.type) || ODataType.isDateOrTime(oViewField.type) || CalendarMetadata.isCalendarValue(oViewField) || FiscalMetadata.isFiscalValue(oViewField)) {
			var sAlign = oViewField.template.getTextAlign();

			if (sAlign === "Initial") {
				sAlign = "Right";
			}
			// Don't right align numeric fields with description (except unit). As numeric with "text" should behave like "text"!
			if (ODataType.isNumeric(oViewField.type) && !oViewField.unit && oViewField.description && oViewField.displayBehaviour !== "idOnly") {
				sAlign = undefined;
			}
			oViewField.align = sAlign;
		}
		ControlProvider._createModelTypeInstance(oViewField, this._oDateFormatSettings, this._useUTCDateTime, this._bPreserveDecimals);
	};

	/**
	 * Creates and extends the field view with a template for editable UI content
	 *
	 * @param {object} oViewField - the view field
	 * @param {boolean} bBlockSmartLinkCreation - if true, no SmartLink is created independent of the semanitcObject notation
	 * @returns {sap.ui.core.Control} the template control
	 * @private
	 */
	ControlProvider.prototype._createEditableTemplate = function(oViewField, bBlockSmartLinkCreation) {
		var oTemplate = null, oType = ControlProvider._createModelTypeInstance(oViewField, this._oDateFormatSettings, this._useUTCDateTime, this._bPreserveDecimals);

		var bIsDateFromTypeAndDisplayFormat = oViewField.type === "Edm.DateTime" && oViewField.displayFormat === "Date";
		if (bIsDateFromTypeAndDisplayFormat || oViewField.isCalendarDate) {
			// Create DatePicker for Date display fields
			oTemplate = new DatePicker({
				value: {
					path: oViewField.name,
					type: oType
				}
			});
		} else if (oViewField.type === "Edm.Boolean") {
			oTemplate = new CheckBox({
				selected: {
					path: oViewField.name
				}
			});
		}

		// semantic link
		if (oViewField.semanticObjects && (!bBlockSmartLinkCreation)) {
			oTemplate = this._createSmartLinkFieldTemplate(oViewField, oType, function() {
				return this._createEditableTemplate(oViewField, true);
			}.bind(this));
		}

		// TODO: ComboBox handling!

		// Default ==> sap.m.Input
		if (!oTemplate) {
			if (oViewField.type === "Edm.Time") {
				oTemplate = new TimePicker({
					value: {
						path: oViewField.name,
						type: oType
					}
				});
			} else {
				oTemplate = new Input({
					value: {
						path: oViewField.name,
						type: oType
					}
				});

				if (oViewField.unit) {
					oTemplate.bindProperty("description", {
						path: oViewField.unit
					});
					oTemplate.setTextAlign("Right");
					oTemplate.setTextDirection("LTR");
					oTemplate.setFieldWidth("80%");
				} else if (this._bEnableDescriptions && oViewField.description) {
					oTemplate.bindProperty("description", {
						path: oViewField.description
					});
				} else if (ODataType.isNumeric(oViewField.type) || ODataType.isDateOrTime(oViewField.type) || CalendarMetadata.isCalendarValue(oViewField) || FiscalMetadata.isFiscalValue(oViewField)) {
					oViewField.align = "Right";
					oTemplate.setTextAlign("Right");
					oTemplate.setTextDirection("LTR");
				}

				if (oViewField.hasValueListAnnotation) {
					this._associateValueHelpAndSuggest(oTemplate, oViewField);
				}
			}
		}
		return oTemplate;
	};

	/**
	 * Associates the control with a ValueHelp Dialog and suggest using the details retrieved from the metadata (annotation)
	 *
	 * @param {object} oControl - The control
	 * @param {object} oFieldViewMetadata - The metadata merged from OData metadata and additional control configuration
	 * @private
	 */
	ControlProvider.prototype._associateValueHelpAndSuggest = function(oControl, oFieldViewMetadata) {
		// F4 Help with selection list
		oControl.setShowValueHelp(true);
		this._aValueHelpProvider.push(new ValueHelpProvider({
			fieldName: oFieldViewMetadata.fieldName,
			control: oControl,
			model: this._oParentODataModel,
			dateFormatSettings: this._oDateFormatSettings,
			displayFormat: oFieldViewMetadata.displayFormat,
			displayBehaviour: oFieldViewMetadata.displayBehaviour,
			// fieldViewMetadata: oFieldViewMetadata,
			loadAnnotation: true,
			fullyQualifiedFieldName: oFieldViewMetadata.fullName,
			metadataAnalyser: this._oMetadataAnalyser,

			title: oFieldViewMetadata.label,
			preventInitialDataFetchInValueHelpDialog: true,
			takeOverInputValue: false,
			type: oFieldViewMetadata.type,
			maxLength: oFieldViewMetadata.maxLength
		}));

		oControl.setShowSuggestion(true);
		oControl.setFilterSuggests(false);
		this._aValueListProvider.push(new ValueListProvider({
			fieldName: oFieldViewMetadata.fieldName,
			control: oControl,
			model: this._oParentODataModel,
			displayFormat: oFieldViewMetadata.displayFormat,
			dateFormatSettings: this._oDateFormatSettings,
			displayBehaviour: oFieldViewMetadata.displayBehaviour,
			// fieldViewMetadata: oFieldViewMetadata,
			loadAnnotation: true,
			fullyQualifiedFieldName: oFieldViewMetadata.fullName,
			metadataAnalyser: this._oMetadataAnalyser,

			aggregation: "suggestionRows",
			typeAheadEnabled: true
		}));
	};

	/**
	 * Creates and extends the field view with a template for display only UI content
	 *
	 * @param {object} oViewField - the view field
	 * @param {boolean} bBlockSmartLinkCreation - if true, no SmartLink is created independent of the semanitcObject notation
	 * @returns {sap.ui.core.Control} the template control
	 * @private
	 */
	ControlProvider.prototype._createDisplayOnlyTemplate = function(oViewField, bBlockSmartLinkCreation) {
		var oTemplate = null, oType = null, sAlign, oBindingInfo, iSemanticKeyIndex;
		oType = ControlProvider._createModelTypeInstance(oViewField, this._oDateFormatSettings, this._useUTCDateTime, this._bPreserveDecimals);

		if (ODataType.isNumeric(oViewField.type) || ODataType.isDateOrTime(oViewField.type) || CalendarMetadata.isCalendarValue(oViewField) || FiscalMetadata.isFiscalValue(oViewField)) {
			sAlign = "Right";
			// Don't right align numeric fields with description (except unit). As numeric with "text" should behave like "text"!
			if (ODataType.isNumeric(oViewField.type) && !oViewField.unit && oViewField.description && oViewField.displayBehaviour !== "idOnly") {
				sAlign = undefined;
			}
		}

		// Valid for all tables
		if (oViewField.urlInfo) {
			oTemplate = this._createLink(oViewField, oType, oViewField.urlInfo);
		} else if (oViewField.criticalityInfo) {
			oTemplate = this._createObjectStatusTemplate(oViewField, oType, oViewField.criticalityInfo);
		}

		// Only relevant for ResponsiveTable use case
		if (this._isMobileTable && !oTemplate) {
			if (oViewField.isImageURL) {
				oTemplate = new Image({
					src: {
						path: oViewField.name
					},
					width: "3em",
					height: "3em"
				});
			} else {
				iSemanticKeyIndex = ControlProvider._getSemanticKeyIndex(oViewField, this._oSemanticKeyAnnotation);
				if (iSemanticKeyIndex > -1) {
					oTemplate = this._createObjectIdentifierTemplate(oViewField, oType, iSemanticKeyIndex === 0);
				}
			}
		}

		if (!oTemplate) {
			if (oViewField.semanticObjects && (!bBlockSmartLinkCreation)) {
				oTemplate = this._createSmartLinkFieldTemplate(oViewField, oType, function() {
					return this._createDisplayOnlyTemplate(oViewField, true);
				}.bind(this));
			} else if (oViewField.unit) {
				oTemplate = this._createMeasureFieldTemplate(oViewField, oType);
			} else if (oViewField.isEmailAddress || oViewField.isPhoneNumber) {
				oTemplate = this._createEmailOrPhoneLink(oViewField, oType);
			} else {
				oBindingInfo = this._getDefaultBindingInfo(oViewField, oType, true /* bReplaceWhitespace */);
				oTemplate = new Text({
					wrapping: this._isMobileTable,
					textAlign: sAlign,
					text: oBindingInfo
				});
			}
		}
		oViewField.align = sAlign;
		return oTemplate;
	};

	/**
	 * Gets the index of the relevant semantic key for the provided field
	 *
	 * @param {object} oViewField The view field
	 * @returns {int} iIndex The index
	 * @private
	 */
	ControlProvider._getSemanticKeyIndex = function(oViewField, oSemanticKeyAnnotation) {
		var iIndex = -1, sEditableFieldForPath;
		// Check if SemanticKey annotation exists and has key fields
		if (oSemanticKeyAnnotation && oSemanticKeyAnnotation.semanticKeyFields) {
			// Check if the field part of SemanticKey
			iIndex = oSemanticKeyAnnotation.semanticKeyFields.indexOf(oViewField.name);
			if (iIndex < 0) {
				// Check if the field is an editable field for a readonly field (e.g. keys)
				sEditableFieldForPath = MetadataAnalyser.resolveEditableFieldFor(oViewField);
				// Check if the relevant field is part of SemanticKey
				iIndex = sEditableFieldForPath ? oSemanticKeyAnnotation.semanticKeyFields.indexOf(sEditableFieldForPath) : -1;
			}
		}

		return iIndex;
	};

	/**
	 * Creates and extends the field view with a modelType
	 *
	 * @param {object} oViewField - the view field
	 * @param {object} oDateFormatSettings - the dateFormatSettings object
	 * @param {boolean} bUseUTCDateTime - specifies whether UTC=true is used in format options for the odata.DateTime type
	 * @param {boolean} bPreserveDecimals format option to preserve decimals
	 * @returns {sap.ui.model.SimpleType} the type instance
	 * @private
	 */
	ControlProvider._createModelTypeInstance = function(oViewField, oDateFormatSettings, bUseUTCDateTime, bPreserveDecimals) {
		var oFormatOptions, oConstraints, oSettings = {};

		// Create Date type for Date display fields
		var bIsDateFromTypeAndDisplayFormat = oViewField.type === "Edm.DateTime" && oViewField.displayFormat === "Date";
		if (bIsDateFromTypeAndDisplayFormat || oViewField.isCalendarDate) {
			oFormatOptions = oDateFormatSettings;
			oConstraints = {
				displayFormat: "Date"
			};
		} else if (oViewField.type === "Edm.DateTime" && bUseUTCDateTime) {
			oFormatOptions = {
				UTC: true
			};
		} else if (oViewField.type === "Edm.Decimal") {
			oConstraints = {
				precision: oViewField.precision,
				scale: oViewField.scale
			};
			oFormatOptions = {
				preserveDecimals: bPreserveDecimals
			};
		} else if (oViewField.type === "Edm.String") {
			oConstraints = {
				isDigitSequence: oViewField.isDigitSequence
			};
		}

		if (oViewField.isCalendarDate) {
			oSettings.isCalendarDate = true;
		}

		if (oViewField.isFiscalDate) {
			oSettings.isFiscalDate = true;
			oSettings.fiscalType = FiscalMetadata.getFiscalAnotationType(oViewField);
		}

		oConstraints = Object.assign({}, oConstraints, {
			maxLength: oViewField.maxLength
		});

		// Only used for P13NPanel (for P13N Dialog, ValueHelpDialog)
		if (oViewField.type == "Edm.DateTime") {
			oViewField.modelType = ODataType.getType(oViewField.type, oFormatOptions, oConstraints, oSettings);
			oViewField.modelType.formatValue(new Date(), "string");
			oViewField.modelType.oFormat.oFormatOptions.UTC = false;
			return ODataType.getType(oViewField.type, oFormatOptions, oConstraints, oSettings);
		}

		oViewField.modelType = ODataType.getType(oViewField.type, oFormatOptions, oConstraints, oSettings);
		return oViewField.modelType;
	};

	/**
	 * Creates and extends the field view with a modelType
	 *
	 * @param {object} oViewField - the view field
	 * @returns {sap.ui.model.SimpleType} the type instance
	 * @protected
	 * @since 1.86
	 */
	ControlProvider.prototype.createModelTypeInstance = function(oViewField) {
		return ControlProvider._createModelTypeInstance(oViewField, this._oDateFormatSettings, this._useUTCDateTime, this._bPreserveDecimals);
	};

	/**
	 * Create link to open the email client or trigger phone call.
	 *
	 * @param {object} oViewField - the view field
	 * @param {object} oType - the odata binding data type
	 * @private
	 * @returns {Object} the template
	 */
	ControlProvider.prototype._createEmailOrPhoneLink = function(oViewField, oType) {
		var oTemplate = new Link({
			text: this._getDefaultBindingInfo(oViewField, oType, true /* bReplaceWhitespace */),
			wrapping: this._isMobileTable,
			press: function(oEvent) {
				var sText = oEvent.getSource().getText();
				if (oViewField.isEmailAddress) {
					MobileLibrary.URLHelper.triggerEmail(sText);
				} else if (oViewField.isPhoneNumber) {
					MobileLibrary.URLHelper.triggerTel(sText);
				}
			}
		});

		return oTemplate;
	};

	/**
	 * Returns the default binding info object
	 *
	 * @param {object} oViewField - the view field
	 * @param {object} oType - the odata binding data type
	 * @param {boolean} bReplaceWhitespace - define whether whitespace characters should be replaced with special character.
	 * @private
	 * @returns {Object} the default binding info that considers description
	 */
	ControlProvider.prototype._getDefaultBindingInfo = function(oViewField, oType, bReplaceWhitespace) {
		var oBindingInfo = {
			path: oViewField.name,
			type: oType,
			formatter: FormatUtil.getWhitespaceReplacer(bReplaceWhitespace)
		};
		if (oViewField.type === "Edm.DateTimeOffset" && oViewField.timezone) {
			oBindingInfo = {
				parts: [
					{
						path: oViewField.name,
						type: oType
					},
					{
						path: oViewField.timezone
					}
				],
				formatter: FormatUtil.getDateTimeWithTimezoneFormatter(),
				// the formatter function requires the Date object and not the formatted string from DateTimeOffset type, hence useRawValues: true
				useRawValues: true
			};
		} else if (this._bEnableDescriptions && oViewField.description) {
			oBindingInfo = {
				parts: [
					{
						path: oViewField.name,
						type: oType
					}, {
						path: oViewField.description
					}
				],
				formatter: FormatUtil.getFormatterFunctionFromDisplayBehaviour(oViewField.displayBehaviour, bReplaceWhitespace)
			};
			if (oType && oType.getName() === "sap.ui.comp.odata.type.NumericText" && this._bEnableDescriptions && oViewField.description) {
				var fnFormatterFunctionFromDisplayBehaviour = oBindingInfo.formatter;
				// In the case of table with isDigitSequence equal to true and text arrangement enabled for the column
				// should format null as empty string
				oBindingInfo.formatter = function(sId, sDescription, bPreventProcessing) {
					if (sId === null && sDescription) {
						sId = "";
					}
					return fnFormatterFunctionFromDisplayBehaviour(sId, sDescription, bPreventProcessing);
				};
			}
		}

		return oBindingInfo;
	};

	/**
	 * Creates and extends the field view with a template for Link
	 *
	 * @param {object} oViewField - the view field
	 * @param {object} oType - the odata binding data type
	 * @param {Object} oLinkInfo - contains Apply part of the DataFieldWithUrl annotation
	 * @private
	 * @returns {Object} the template
	 */
	ControlProvider.prototype._createLink = function(oViewField, oType, oLinkInfo) {
		var mHrefInfo = null;
		// add link properties to view field so that this can be added to additionalProperties for $select
		oViewField.linkProperties = oLinkInfo.parameters || oLinkInfo.urlPath;
		// create link binding info - if needed
		if (oLinkInfo.urlPath) {
			mHrefInfo = {
				path: oLinkInfo.urlPath
			};
		} else if (oLinkInfo.urlTarget) {
			mHrefInfo = oLinkInfo.urlTarget;
		}

		// Create link from link info
		return new Link({
			text: this._getDefaultBindingInfo(oViewField, oType, true /* bReplaceWhitespace */),
			wrapping: this._isMobileTable,
			href: mHrefInfo
		});
	};
	/**
	 * Creates and extends the field view with a template for ObjectIdentifier
	 *
	 * @param {object} oViewField - the view field
	 * @param {object} oType - the odata binding data type
	 * @param {boolean} bFirstKeyField - specifies whether this is the first Key field (optional)
	 * @private
	 * @returns {Object} the template
	 */
	ControlProvider.prototype._createObjectIdentifierTemplate = function(oViewField, oType, bFirstKeyField) {
		var oObjectIdentifier, sTitle, sText, oText, oTitle, oLinkHandler;
		var that = this;

		var fnIsBinding = function(sProperty) {
			return (sProperty.startsWith("{") && sProperty.endsWith("}"));
		};

		var fnGetPath = function(sBinding) {
			return sBinding.replace("{", "").replace("}", "");
		};

		var fnIsTitleActive = function(oSemanticObjects, sSemanticObject) {
			var aAdditionalSemanticObjects = oViewField.semanticObjects.additionalSemanticObjects;
			if (that._oSemanticObjectController && that._oSemanticObjectController.getForceLinkRendering() && that._oSemanticObjectController.getForceLinkRendering()[oViewField.name]) {
				return true;
			}
			sSemanticObject = sSemanticObject ? sSemanticObject : oViewField.semanticObjects.defaultSemanticObject;
			return SemanticObjectController.hasDistinctSemanticObject(aAdditionalSemanticObjects.concat(sSemanticObject), oSemanticObjects);
		};
		if (oViewField.semanticObjects) {
			SemanticObjectController.getDistinctSemanticObjects().then(function(oSemanticObjects) {
				if (fnIsBinding(oViewField.semanticObjects.defaultSemanticObject) || fnIsTitleActive(oSemanticObjects)) {
					oLinkHandler = new NavigationPopoverHandler({
						semanticObject: oViewField.semanticObjects.defaultSemanticObject,
						additionalSemanticObjects: oViewField.semanticObjects.additionalSemanticObjects,
						semanticObjectLabel: oViewField.label,
						fieldName: oViewField.name,
						semanticObjectController: that._oSemanticObjectController,
						navigationTargetsObtained: function(oEvent) {
							var oObjectIdentifier = sap.ui.getCore().byId(oEvent.getSource().getControl());
							var oMainNavigation = oEvent.getParameters().mainNavigation;
							// 'mainNavigation' might be undefined
							if (oMainNavigation) {
								oMainNavigation.setDescription(oObjectIdentifier.getText());
							}
							oEvent.getParameters().show(oObjectIdentifier.getTitle(), oMainNavigation, undefined, undefined);
						}
					});
					that._aLinkHandlers.push(oLinkHandler);
				}
			});
		}
		// Show title and text based on TextArrangement or displayBehaviour
		if (oViewField.description) {
			switch (oViewField.displayBehaviour) {
				case "descriptionAndId":
					oViewField.vertical = true; // properties displayed vertically
					sTitle = oViewField.description;
					sText = oViewField.name;
					oText = oType;
					break;
				case "idAndDescription":
					oViewField.vertical = true; // properties displayed vertically
					sTitle = oViewField.name;
					sText = oViewField.description;
					oTitle = oType;
					break;
				case "idOnly":
					sTitle = oViewField.name;
					oText = oType;
					break;
				default:
					sTitle = oViewField.description;
					break;

			}
		} else {
			// fallback to idOnly when there is no description field (Text annotation)
			sTitle = oViewField.name;
			oTitle = oType;
		}
		oObjectIdentifier = new ObjectIdentifier({
			title: sTitle ? {
				path: sTitle,
				type: oTitle,
				formatter: FormatUtil.getWhitespaceReplacer(true /* bReplaceWhitespace */)
			} : undefined,
			text: sText ? {
				path: sText,
				type: oText,
				formatter: FormatUtil.getWhitespaceReplacer(true /* bReplaceWhitespace */)
			} : undefined,
			titleActive: oViewField.semanticObjects ? {
				parts: fnIsBinding(oViewField.semanticObjects.defaultSemanticObject) ? [
					{ path: "$sapuicompcontrolprovider_distinctSO>/distinctSemanticObjects" },
					{ path: fnGetPath(oViewField.semanticObjects.defaultSemanticObject) }
				] : [ { path: "$sapuicompcontrolprovider_distinctSO>/distinctSemanticObjects" } ],
				formatter: function(oSemanticObjects, sSemanticObject) {
					return fnIsTitleActive(oSemanticObjects, sSemanticObject);
				}
			} : false,
			titlePress: function(oEvent) {
				if (oLinkHandler) {
					oLinkHandler.setControl(oEvent.getSource());
					oLinkHandler.setBindingContext(oEvent.getSource().getBindingContext());
					oLinkHandler.openPopover(oEvent.getParameter("domRef"));
				}
			}
		});
		oObjectIdentifier.attachEvent("ObjectIdentifier.designtime", function(oEvent) {
			if (oLinkHandler) {
				oLinkHandler.setControl(oEvent.getSource());
				oEvent.getParameters().registerNavigationPopoverHandler(oLinkHandler);
			}
		});
		oObjectIdentifier.setModel(SemanticObjectController.getJSONModel(), "$sapuicompcontrolprovider_distinctSO");
		if (this._oSemanticKeyAdditionalControl && bFirstKeyField) {
			this._bSemanticKeyAdditionalControlUsed = true;
			return new VBox({
				renderType: "Bare",
				items: [
					oObjectIdentifier, this._oSemanticKeyAdditionalControl
				]
			}).addStyleClass("sapUiTinyMarginTopBottom");
		}
		return oObjectIdentifier;
	};

	/**
	 * Creates and extends the field view with a template for ObjectStatus
	 *
	 * @param {object} oViewField - the view field
	 * @param {object} oType - the odata binding data type
	 * @param {object} oCriticalityInfo - the criticality metadata
	 * @private
	 * @returns {Object} the template
	 */
	ControlProvider.prototype._createObjectStatusTemplate = function(oViewField, oType, oCriticalityInfo) {
		var oStateBinding, oStateIconBinding, bShowIcon, oBindingInfo;
		bShowIcon = CriticalityMetadata.getShowCriticalityIcon(oCriticalityInfo.criticalityRepresentationType);
		// add criticality path to view field so that this can be added to additionalProperties for $select
		if (oCriticalityInfo.path) {
			oViewField.criticality = oCriticalityInfo.path;
			oStateBinding = {
				path: oCriticalityInfo.path,
				formatter: CriticalityMetadata.getCriticalityState
			};
			if (oCriticalityInfo.criticalityRepresentationPath) {
				oViewField.criticalityRepresentation = oCriticalityInfo.criticalityRepresentationPath;
				oStateIconBinding = {
					parts: [
						{
							path: oCriticalityInfo.path
						}, {
							path: oCriticalityInfo.criticalityRepresentationPath
						}
					],
					formatter: function(sCriticality, sCriticalityRepresentationType) {
						return CriticalityMetadata.getShowCriticalityIcon(sCriticalityRepresentationType) ? CriticalityMetadata.getCriticalityIcon(sCriticality) : undefined;
					}
				};
			} else if (bShowIcon) {
				oStateIconBinding = {
					path: oCriticalityInfo.path,
					formatter: CriticalityMetadata.getCriticalityIcon
				};
			}
		} else {
			oStateBinding = CriticalityMetadata.getCriticalityState(oCriticalityInfo.criticalityType);
			if (oCriticalityInfo.criticalityRepresentationPath) {
				oViewField.criticalityRepresentation = oCriticalityInfo.criticalityRepresentationPath;
				oStateIconBinding = {
					path: oCriticalityInfo.criticalityRepresentationPath,
					formatter: function(sCriticalityRepresentationType) {
						return CriticalityMetadata.getShowCriticalityIcon(sCriticalityRepresentationType) ? CriticalityMetadata.getCriticalityIcon(oCriticalityInfo.criticalityType) : undefined;
					}
				};
			} else if (bShowIcon) {
				oStateIconBinding = CriticalityMetadata.getCriticalityIcon(oCriticalityInfo.criticalityType);
			}
		}
		if (oViewField.unit) {
			oBindingInfo = {
				parts: [
					{
						path: oViewField.name,
						type: oType
					}, {
						path: oViewField.unit
					}, {
						mode: "OneTime",
						path: oViewField.isCurrencyField ? "/##@@requestCurrencyCodes" : "/##@@requestUnitsOfMeasure",
						targetType: "any"
					}
				],
				formatter: oViewField.isCurrencyField ? FormatUtil.getInlineAmountFormatter(this._bPreserveDecimals) : FormatUtil.getInlineMeasureUnitFormatter(this._bPreserveDecimals),
				useRawValues: true
			};
		} else {
			// Get BindingInfo considering TextArrangement/displayBehaviour
			oBindingInfo = this._getDefaultBindingInfo(oViewField, oType, true /* bReplaceWhitespace */);
		}
		return new ObjectStatus({
			text: oBindingInfo,
			state: oStateBinding,
			icon: oStateIconBinding
		});
	};

	/**
	 * Creates and extends the field view with a template for currency (display only) content
	 *
	 * @param {object} oViewField - the view field
	 * @param {object} oType - the binding data type
	 * @param {function} fCreateControl - callback function which creates the control which would have been created instead of the SmartLink
	 * @returns {Object} the template
	 * @private
	 */
	ControlProvider.prototype._createSmartLinkFieldTemplate = function(oViewField, oType, fCreateControl) {
		// semantic link
		var oBindingInfo = oViewField.unit ? {
			parts: [
				{
					path: oViewField.name,
					type: oType
				}, {
					path: oViewField.unit
				}, {
					mode: "OneTime",
					path: oViewField.isCurrencyField ? "/##@@requestCurrencyCodes" : "/##@@requestUnitsOfMeasure",
					targetType: "any"
				}
			],
			formatter: oViewField.isCurrencyField ? FormatUtil.getAmountCurrencyFormatter(this._bPreserveDecimals) : FormatUtil.getMeasureUnitFormatter(this._bPreserveDecimals),
			useRawValues: true
		} : this._getDefaultBindingInfo(oViewField, oType, true /* bReplaceWhitespace */);
		var oTemplate = new SmartLink({
			semanticObject: oViewField.semanticObjects.defaultSemanticObject,
			additionalSemanticObjects: oViewField.semanticObjects.additionalSemanticObjects,
			semanticObjectLabel: oViewField.label,
			fieldName: oViewField.name,
			text: oBindingInfo,
			uom: oViewField.unit ? {
				path: oViewField.unit
			} : undefined,
			wrapping: this._isMobileTable,
			beforeNavigationCallback: this._oSemanticObjectController ? this._oSemanticObjectController.getBeforeNavigationCallback() : undefined,
			navigationTargetsObtained: function(oEvent) {
				var oBinding = this.getBinding("text");
				if (!oBinding || !Array.isArray(oBinding.getValue()) || oViewField.unit) {
					oEvent.getParameters().show();
					return;
				}
				var aValues = oBinding.getValue();
				var oTexts = FormatUtil.getTextsFromDisplayBehaviour(oViewField.displayBehaviour, aValues[0], aValues[1]);
				var oMainNavigation = oEvent.getParameters().mainNavigation;
				// 'mainNavigation' might be undefined
				if (oMainNavigation) {
					oMainNavigation.setDescription(oTexts.secondText);
				}
				oEvent.getParameters().show(oTexts.firstText, oMainNavigation, undefined, undefined);
			}
		});

		oTemplate.setSemanticObjectController(this._oSemanticObjectController);
		oTemplate.setCreateControlCallback(fCreateControl);

		return oTemplate;
	};

	/**
	 * Creates and extends the field view with a template for currency (display only) content
	 *
	 * @param {object} oViewField - the view field
	 * @param {object} oType - the odata binding data type
	 * @private
	 * @returns {Object} the template
	 */
	ControlProvider.prototype._createMeasureFieldTemplate = function(oViewField, oType) {
		var oTemplate, oAnalyticalMultiUnitLink, oAnalyticalMultiUnitControl, oValueText, oUnitText, bEnableCurrencySymbol = false;

		bEnableCurrencySymbol = !!(oViewField.isCurrencyField && this._oCurrencyFormatSettings && this._oCurrencyFormatSettings.showCurrencySymbol);

		oValueText = new Text({
			layoutData: this._isMobileTable ? undefined : new FlexItemData({
				growFactor: 1,
				baseSize: "0%"
			}),
			textDirection: "LTR",
			wrapping: false,
			textAlign: "End",
			text: {
				parts: [
					{
						path: oViewField.name,
						type: oType
					}, {
						path: oViewField.unit
					},
					{
						mode: "OneTime",
						path: oViewField.isCurrencyField ? "/##@@requestCurrencyCodes" : "/##@@requestUnitsOfMeasure",
						targetType: "any"
					}
				],
				formatter: oViewField.isCurrencyField ? FormatUtil.getAmountCurrencyFormatter(this._bPreserveDecimals) : FormatUtil.getMeasureUnitFormatter(this._bPreserveDecimals),
				useRawValues: true
			}
		}).addStyleClass("sapUiCompCurrency").addStyleClass("sapUiCompCurrencyTabNums");
		oUnitText = new Text({
			layoutData: new FlexItemData({
				shrinkFactor: 0
			}),
			textDirection: "LTR",
			wrapping: false,
			textAlign: "End",
			width: "3em",
			text: {
				path: oViewField.unit,
				formatter: bEnableCurrencySymbol ? FormatUtil.getCurrencySymbolFormatter() : undefined
			}
		}).addStyleClass("sapUiCompUoMPart").addStyleClass("sapUiCompCurrencyMonoFont");

		// Create measure format using HBox --> we need to 2 controls to properly align the value and unit part
		oTemplate = new HBox({
			renderType: "Bare",
			justifyContent: "End",
			wrap: this._isMobileTable ? "Wrap" : undefined,
			items: [
				oValueText, oUnitText
			]
		});

		oTemplate.addStyleClass("sapUiCompDirectionLTR");

		if (this._isAnalyticalTable) {
			// Get Actual UoM control
			oAnalyticalMultiUnitControl = oTemplate;
			oAnalyticalMultiUnitControl.bindProperty("visible", {
				path: oViewField.unit,
				formatter: MultiUnitUtil.isNotMultiUnit
			});

			// Create the MultiUnit Link
			oAnalyticalMultiUnitLink = new Link({
				text: sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("SMARTTABLE_MULTI_LINK_TEXT") || "Show Details",
				visible: {
					path: oViewField.unit,
					formatter: MultiUnitUtil.isMultiUnit
				},
				press: [
					{
						value: oViewField.name,
						unit: oViewField.unit,
						additionalParent: this.useSmartToggle,
						smartTableId: this._smartTableId,
						template: oAnalyticalMultiUnitControl
					}, MultiUnitUtil.openMultiUnitPopover
				]
			});
			// Add multi-unit content in a VBox
			oTemplate = new VBox({
				renderType: "Bare",
				items: [
					oAnalyticalMultiUnitLink, oAnalyticalMultiUnitControl
				]
			});
		}

		return oTemplate;
	};

	/**
	 * Calculates and sets additional flags and attributes for a field
	 *
	 * @param {object} oFieldODataMetadata - OData metadata for the field
	 * @returns {object} the field view metadata
	 * @private
	 */
	ControlProvider.prototype._createFieldMetadata = function(oFieldODataMetadata) {
		var oFieldViewMetadata = Object.assign({}, oFieldODataMetadata);

		oFieldViewMetadata.label = oFieldODataMetadata.fieldLabel || oFieldODataMetadata.name;

		oFieldViewMetadata.quickInfo = oFieldODataMetadata.quickInfo;

		oFieldViewMetadata.displayBehaviour = oFieldViewMetadata.displayBehaviour || this._oDefaultDropDownDisplayBehaviour;
		oFieldViewMetadata.filterType = this._getFilterType(oFieldODataMetadata);
		this._updateValueListMetadata(oFieldViewMetadata);
		this._setAnnotationMetadata(oFieldViewMetadata);
		// Update DataField relevant annotations from LineItem if field is part of LineItem
		if (this._oLineItemAnnotation && this._oLineItemAnnotation.fields && this._oLineItemAnnotation.fields.indexOf(oFieldODataMetadata.name) > -1) {
			oFieldViewMetadata.urlInfo = this._oLineItemAnnotation.urlInfo && this._oLineItemAnnotation.urlInfo[oFieldODataMetadata.name];
			oFieldViewMetadata.criticalityInfo = this._oLineItemAnnotation.criticality && this._oLineItemAnnotation.criticality[oFieldODataMetadata.name];
		} else if (this._bProcessDataFieldDefault) {
			// Update DataFieldDefault relevant information when field is not part of LineItem
			this._oMetadataAnalyser.updateDataFieldDefault(oFieldViewMetadata);
		}
		return oFieldViewMetadata;
	};

	/**
	 * Update the metadata for ValueList annotation
	 *
	 * @param {Object} oFieldViewMetadata - view metadata for the field
	 * @private
	 */
	ControlProvider.prototype._updateValueListMetadata = function(oFieldViewMetadata) {
		// First check for "sap:value-list" annotation
		oFieldViewMetadata.hasValueListAnnotation = oFieldViewMetadata["sap:value-list"] !== undefined;
		if (oFieldViewMetadata.hasValueListAnnotation) {
			oFieldViewMetadata.hasFixedValues = oFieldViewMetadata["sap:value-list"] === "fixed-values";
		} else if (oFieldViewMetadata["com.sap.vocabularies.Common.v1.ValueList"]) {
			// Then check for "com.sap.vocabularies.Common.v1.ValueList", and retrieve the semantics
			oFieldViewMetadata.hasValueListAnnotation = true;
			oFieldViewMetadata.hasFixedValues = this._oMetadataAnalyser.getValueListSemantics(oFieldViewMetadata["com.sap.vocabularies.Common.v1.ValueList"]) === "fixed-values";

			if (!oFieldViewMetadata.hasFixedValues) {
				oFieldViewMetadata.hasFixedValues = MetadataAnalyser.isValueListWithFixedValues(oFieldViewMetadata);
			}
		}
	};

	/**
	 * Set any annotation(s) metadata on the control
	 *
	 * @param {Object} oFieldViewMetadata - the field view metadata
	 * @private
	 */
	ControlProvider.prototype._setAnnotationMetadata = function(oFieldViewMetadata) {
		if (oFieldViewMetadata && oFieldViewMetadata.fullName) {
			oFieldViewMetadata.semanticObjects = this._oMetadataAnalyser.getSemanticObjectsFromAnnotation(oFieldViewMetadata.fullName);
		}
	};
	/**
	 * Returns the filterType of the field based on metadata, else undefined
	 *
	 * @param {object} oField - OData metadata for the field
	 * @returns {string} the filter type for the field
	 * @private
	 */
	ControlProvider.prototype._getFilterType = function(oField) {
		return FormatUtil._getFilterType(oField);
	};

	/**
	 * Destroys the object
	 *
	 * @public
	 */
	ControlProvider.prototype.destroy = function() {
		var fDestroy = function(aArray) {
			var i;
			if (aArray) {
				i = aArray.length;
				while (i--) {
					aArray[i].destroy();
				}
			}
		};

		if (this._oMetadataAnalyser && this._oMetadataAnalyser.destroy) {
			this._oMetadataAnalyser.destroy();
		}
		this._oMetadataAnalyser = null;

		if (!this._bSemanticKeyAdditionalControlUsed && this._oSemanticKeyAdditionalControl && this._oSemanticKeyAdditionalControl.destroy) {
			this._oSemanticKeyAdditionalControl.destroy();
		}

		fDestroy(this._aValueHelpProvider);
		this._aValueHelpProvider = null;

		fDestroy(this._aValueListProvider);
		this._aValueListProvider = null;

		fDestroy(this._aLinkHandlers);
		this._aLinkHandlers = null;

		if (this._oHelper) {
			this._oHelper.destroy();
		}

		this._oHelper = null;
		this._mSmartField = null;
		this._aODataFieldMetadata = null;
		this._oDateFormatSettings = null;
		this._oCurrencyFormatSettings = null;
		this._oDefaultDropDownDisplayBehaviour = null;
		this._oLineItemAnnotation = null;
		this._oSemanticKeyAnnotation = null;
		this._oParentODataModel = null;
		this.bIsDestroyed = true;
	};

	SmartToggle = Control.extend("sap.ui.comp.SmartToggle", {
		metadata: {
			library: "sap.ui.comp",
			properties: {
				editable: {
					type: "boolean",
					defaultValue: false
				}
			},
			aggregations: {
				edit: {
					type: "sap.ui.core.Control",
					multiple: false
				},
				display: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			associations: {
				ariaLabelledBy: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "ariaLabelledBy"
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(rm, oControl) {
				rm.openStart("span", oControl).class("sapUiCompSmartToggle").openEnd();
				rm.renderControl(oControl.getEditable() ? oControl.getEdit() : oControl.getDisplay());
				rm.close("span");
			}
		}
	});

	/**
	 * @see sap.ui.core.Element#getFocusDomRef
	 * @protected
	 * @return {Element} Returns the DOM Element that should get the focus
	 */
	SmartToggle.prototype.getFocusDomRef = function() {
		// get and return the accessibility info of the control that is rendered currently
		var oControl = this.getEditable() ? this.getEdit() : this.getDisplay();
		if (oControl) {
			return oControl.getFocusDomRef();
		}
		return Control.prototype.getFocusDomRef.call(this);
	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 * @returns {Object} Accessibility Info
	 */
	SmartToggle.prototype.getAccessibilityInfo = function() {
		// get and return the accessibility info of the control that is rendered currently
		var oControl = this.getEditable() ? this.getEdit() : this.getDisplay();
		if (oControl && oControl.getAccessibilityInfo) {
			return oControl.getAccessibilityInfo();
		}

		return null;
	};

	/**
	 * @see sap.ui.base.ManagedObject#addAssociation
	 * @protected
	 * @returns {Object} Forwards the association of the inner control to the <code>SmartToggle</code> control for adding association.
	 */
	SmartToggle.prototype.addAssociation = function(sAssociationName, sId, bSuppressInvalidate) {
		if (sAssociationName === "ariaLabelledBy") {
			// get both, edit and display controls
			var oEditControl = this.getEdit(), oDisplayControl = this.getDisplay();
			// forward the ariaLabelledBy association of the inner control to the SmartToggle control
			oEditControl && oEditControl.addAssociation(sAssociationName, sId, bSuppressInvalidate);
			oDisplayControl && oDisplayControl.addAssociation(sAssociationName, sId, bSuppressInvalidate);
		}
		return Control.prototype.addAssociation.apply(this, arguments);
	};

	/**
	 * @see sap.ui.base.ManagedObject#removeAssociation
	 * @protected
	 * @returns {Object} Forwards the association of the inner control to the <code>SmartToggle</code> control for removing the specified
	 *          association.
	 */
	SmartToggle.prototype.removeAssociation = function(sAssociationName, vObject, bSuppressInvalidate) {
		if (sAssociationName === "ariaLabelledBy") {
			// get both, edit and display controls
			var oEditControl = this.getEdit(), oDisplayControl = this.getDisplay();
			// forward the ariaLabelledBy association of the inner control to the SmartToggle control
			oEditControl && oEditControl.removeAssociation(sAssociationName, vObject, bSuppressInvalidate);
			oDisplayControl && oDisplayControl.removeAssociation(sAssociationName, vObject, bSuppressInvalidate);
		}
		return Control.prototype.removeAssociation.apply(this, arguments);
	};

	/**
	 * @see sap.ui.base.ManagedObject#removeAllAssociation
	 * @protected
	 * @returns {Object} Forwards the association of the inner control to the <code>SmartToggle</code> control for removing all association.
	 */
	SmartToggle.prototype.removeAllAssociation = function(sAssociationName, bSuppressInvalidate) {
		if (sAssociationName === "ariaLabelledBy") {
			// get both, edit and display controls
			var oEditControl = this.getEdit(), oDisplayControl = this.getDisplay();
			// forward the ariaLabelledBy association of the inner control to the SmartToggle control
			oEditControl && oEditControl.removeAllAssociation(sAssociationName, bSuppressInvalidate);
			oDisplayControl && oDisplayControl.removeAllAssociation(sAssociationName, bSuppressInvalidate);
		}
		return Control.prototype.removeAllAssociation.apply(this, arguments);
	};

	return ControlProvider;

}, /* bExport= */true);
