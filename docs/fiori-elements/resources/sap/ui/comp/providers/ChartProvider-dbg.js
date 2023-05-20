/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// -----------------------------------------------------------------------------
// Generates the view metadata required for SmartTable using SAP-Annotations metadata
// -----------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/comp/odata/MetadataAnalyser",
	"sap/ui/comp/odata/ChartMetadata",
	"sap/ui/comp/odata/FiscalMetadata",
	"sap/ui/comp/odata/CalendarMetadata",
	"sap/ui/comp/odata/ODataType",
	"./ControlProvider",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/date/UI5Date"
], function(
	MetadataAnalyser,
	ChartMetadata,
	FiscalMetadata,
	CalendarMetadata,
	ODataType,
	ControlProvider,
	DateFormat,
	UI5Date
) {
	"use strict";

	/**
	 * Constructs a class to generate the view/data model metadata for the SmartChart from the SAP-Annotations metadata
	 * @constructor
	 * @experimental This module is only for internal/experimental use!
	 * @public
	 * @param {object} mPropertyBag - PropertyBag having members model, entitySet
	 */
	var ChartProvider = function(mPropertyBag) {
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");

		if (mPropertyBag) {
			this._oParentODataModel = mPropertyBag.model;
			this.sEntitySet = mPropertyBag.entitySet;
			this._sIgnoredFields = mPropertyBag.ignoredFields;
			this._bSkipAnnotationParse = mPropertyBag.skipAnnotationParse === "true";
			this._sChartQualifier = mPropertyBag.chartQualifier;
			this._sPresentationVariantQualifier = mPropertyBag.presentationVariantQualifier;
			this._oDefaultDropDownDisplayBehaviour = mPropertyBag.defaultDropDownDisplayBehaviour;
			this._bUseTimeseries = mPropertyBag.useTimeSeries;
			this._sNotAssignedText = mPropertyBag.notAssignedText;
			try {
				this._oDateFormatSettings = mPropertyBag.dateFormatSettings ? JSON.parse(mPropertyBag.dateFormatSettings) : undefined;
				// Default to UTC true if nothing is provided --> as sap:display-format="Date" should be used without a timezone
				if (!this._oDateFormatSettings.hasOwnProperty("UTC")) {
					this._oDateFormatSettings["UTC"] = true;
				}
			} catch (ex) {
				// Invalid JSON provided!
			}

			if (mPropertyBag.chartLibrary) {
				ChartMetadata.feedWithChartLibrary(mPropertyBag.chartLibrary);
			}
		}

		this._aODataFieldMetadata = [];
		this._oChartViewMetadata = null;
		this._oChartDataPointMetadata = null;
		this._aIgnoredFields = [];
		this._oMetadataAnalyser = new MetadataAnalyser(this._oParentODataModel);
		this._intialiseMetadata();

	};

	/**
	 * Initializes the necessary chart metadata
	 * @private
	 */
	ChartProvider.prototype._intialiseMetadata = function() {
		var oChartViewField, aChartViewMetadata = [], oField, i, iLen = 0;
		this._aODataFieldMetadata = this._oMetadataAnalyser.getFieldsByEntitySetName(this.sEntitySet);
		this._sFullyQualifiedEntityTypeName = this._oMetadataAnalyser.getEntityTypeNameFromEntitySetName(this.sEntitySet);

		if (!this._bSkipAnnotationParse) {
			this._oPresentationVariant = this._oMetadataAnalyser.getPresentationVariantAnnotation(this._sFullyQualifiedEntityTypeName, this._sPresentationVariantQualifier);
			if (this._oPresentationVariant && this._oPresentationVariant.chartAnnotation) {
				this._oChartAnnotation = this._oPresentationVariant.chartAnnotation;
			} else {
				this._oChartAnnotation = this._oMetadataAnalyser.getChartAnnotation(this._sFullyQualifiedEntityTypeName, this._sChartQualifier);
			}
		}
		if (!this._oDefaultDropDownDisplayBehaviour) {
			this._oDefaultDropDownDisplayBehaviour = this._oMetadataAnalyser.getTextArrangementValue(this._sFullyQualifiedEntityTypeName);
		}

		this._generateIgnoredFieldsArray();

		this._oControlProvider = new ControlProvider({
			metadataAnalyser: this._oMetadataAnalyser,
			model: this._oParentODataModel,
			fieldsMetadata: this._aODataFieldMetadata,
			dateFormatSettings: this._oDateFormatSettings,
			defaultDropDownDisplayBehaviour: this._oDefaultDropDownDisplayBehaviour,
			enableDescriptions: false,
			entitySet: this.sEntitySet
		});

		if (this._aODataFieldMetadata) {
			this._prepareHierarchy();
			iLen = this._aODataFieldMetadata.length;
		}

		for (i = 0; i < iLen; i++) {
			oField = this._aODataFieldMetadata[i];
			// Ignore the fields in the ignored list -or- the one marked with visible="false"
			if (this._aIgnoredFields.indexOf(oField.name) > -1 || !oField.visible) {
				continue;
			}

			// Check if field is not a Primitive type --> only generate metadata for primitive/simple type fields
			if (oField.type.indexOf("Edm.") === 0) {
				oChartViewField = this._getFieldViewMetadata(oField);
				this._enrichWithChartViewMetadata(oField, oChartViewField);
				aChartViewMetadata.push(oField);
			}
		}

		if (this._oChartAnnotation) {
			this._oChartViewMetadata = Object.assign({}, this._oChartAnnotation);
			// Convert chart type to UI5 format
			this._oChartViewMetadata.chartType = ChartMetadata.getChartType(this._oChartViewMetadata.chartType);
			this._oChartViewMetadata.fields = aChartViewMetadata;
		}
	};

	ChartProvider.prototype._prepareHierarchy = function() {
		for (var i = 0; i < this._aODataFieldMetadata.length; i++) {
			if (this._aODataFieldMetadata[i].hierarchy) {
				for (var j = 0; j < this._aODataFieldMetadata.length; j++) {
					this._aODataFieldMetadata[j].hierarchy = this._aODataFieldMetadata[j].hierarchy || {};
					this._aODataFieldMetadata[j].hierarchy.up = this._aODataFieldMetadata[j].hierarchy.up || {};

					if (this._aODataFieldMetadata[i].hierarchy.field === this._aODataFieldMetadata[j].name) {
						this._aODataFieldMetadata[i].hierarchy.down = this._getFieldViewMetadata(this._aODataFieldMetadata[j]);
						this._aODataFieldMetadata[j].hierarchy.up[this._aODataFieldMetadata[i].hierarchy.type] = this._getFieldViewMetadata(this._aODataFieldMetadata[i]);
					}
				}
			}
		}
	};

	ChartProvider.prototype._setAnnotationMetadata = function(oFieldViewMetadata) {
		if (oFieldViewMetadata && oFieldViewMetadata.fullName) {
			var oSemanticObjects = this._oMetadataAnalyser.getSemanticObjectsFromAnnotation(oFieldViewMetadata.fullName);
			if (oSemanticObjects) {
				oFieldViewMetadata.semanticObjects = oSemanticObjects;
			}
		}
	};

	ChartProvider.prototype._getFieldViewMetadata = function(oField) {
		var oChartViewField = this._oControlProvider.getFieldViewMetadata(oField, false);
		this._setAnnotationMetadata(oChartViewField);

		return oChartViewField;
	};

	/**
	 * Generate an array of fields that need to be ignored in the SmartChart (if any)
	 * @private
	 */
	ChartProvider.prototype._generateIgnoredFieldsArray = function() {
		if (this._sIgnoredFields) {
			this._aIgnoredFields = this._sIgnoredFields.split(",");
		}
	};

	/**
	 * Calculates additional attributes for a field
	 * @param {object} oField - OData metadata for the chart field
	 * @param {object} oViewField - view metadata for the chart field
	 * @private
	 */
	ChartProvider.prototype._enrichWithChartViewMetadata = function(oField, oViewField) {
		function isRole(sRole, field, oChartAnnotation) {
			if (field.aggregationRole) {
				return field.aggregationRole === sRole;
			}

			if (oChartAnnotation) {
				var aRoleArray = sRole == "dimension" ? oChartAnnotation.dimensionFields : oChartAnnotation.measureFields;

				return aRoleArray && aRoleArray.indexOf(field.name) != -1;
			}
			return false;
		}

		oField.isMeasure = isRole("measure", oField, this._oChartAnnotation);
		oField.isDimension = isRole("dimension", oField, this._oChartAnnotation);

		oField.isHierarchyDimension = oField.hierarchy && oField.hierarchy.type === MetadataAnalyser.hierarchyType.nodeFor && isRole("dimension", oField.hierarchy.down, this._oChartAnnotation);

		oField.quickInfo = oViewField.quickInfo;
		oField.modelType = oViewField.modelType;

		oField.hasValueListAnnotation  = oViewField.hasValueListAnnotation;
		oField.fullName = oViewField.fullName;

		oField.timeUnitType = this._getTimeUnitType(oField);
		oField.dateFormatter = this._getDateFormatter(oField);
		oField.isTimeDimension = oField.timeUnitType !== undefined;

		oField.role = this._getRole(oField);
		oField.hierarchyLevel = this._getHierarchyLevel(oField);

		oField.dataPoint = this._getDataPoint(oField);
		oField.isNullable = MetadataAnalyser.isNullable(oField);

		oField.filterType = oViewField.filterType;
		if (oViewField.template) {
			oField.template = oViewField.template;
		}

		if (oField.isDimension) {
			oField.displayBehaviour = oViewField.displayBehaviour;
		} else if (oField.isHierarchyDimension) {
			// redirect the description from hierarchy
			var oReferenceField = oField.hierarchy.up[MetadataAnalyser.hierarchyType.nodeExternalKeyFor] || oViewField;

			oField.displayBehaviour = oReferenceField.displayBehaviour;
			oField.description = oReferenceField.description || oReferenceField.name;
		}

		oField.isSemanticObject = (oViewField.semanticObjects) ? true : false;

		// set the inResult from metadata
		this._setInResult(oField);

		// set the sortOrder from metadata
		this._setSortOrder(oField);
	};

	/**
	 * Determines the TimeUnit type for a possible TimeDimension
	 * @param {object} oField - OData metadata for the entity field
	 * @return {string|undefined} A <code>TimeUnit</code> type
	 * @private
	 */
	ChartProvider.prototype._getTimeUnitType = function(oField) {
		var sTimeUnitType;

		switch (oField.type) {

			case "Edm.Date":
				sTimeUnitType = "Date";
				break;

			case "Edm.DateTime":
			case "Edm.DateTimeOffset":

				if (oField.displayFormat === "Date") {
					sTimeUnitType = "Date";
				}

				break;

			case "Edm.String":

				if (oField.isCalendarDate) {
					sTimeUnitType = "yearmonthday";
					break;
				}

				if (CalendarMetadata.isYearWeek(oField)) {
					sTimeUnitType = "yearweek";
					break;
				}

				if (CalendarMetadata.isYearMonth(oField)) {
					sTimeUnitType = "yearmonth";
					break;
				}

				if (CalendarMetadata.isYearQuarter(oField)) {
					sTimeUnitType = "yearquarter";
					break;
				}

				if (FiscalMetadata.isFiscalYear(oField)) {
					sTimeUnitType = "fiscalyear";
					break;
				}

				if (FiscalMetadata.isFiscalYearPeriod(oField)) {
					sTimeUnitType = "fiscalyearperiod";
					break;
				}

				break;

			// no default
		}

		return sTimeUnitType;
	};

	/*************************************************************************************************************************************************
	 * Determines a custom formatter from the field depending on this._oDateFormatSettings
	 * @param {object} oField - OData metadata for the entity field
	 * @return {object} a text formatter
	 * @private
	 */
	ChartProvider.prototype._getDateFormatter = function(oField) {
		var fnCustomFormatter, fnDateFormatter;

		switch (oField.type) {
			case "Edm.Date":
				fnDateFormatter = DateFormat.getDateInstance(this._oDateFormatSettings);
				break;

			case "Edm.Time":
				fnDateFormatter = DateFormat.getTimeInstance(this._oDateFormatSettings);
				break;

			case "Edm.DateTimeOffset":
			case "Edm.DateTime":

				if (oField.displayFormat === "Date") {
					fnDateFormatter = DateFormat.getDateInstance(this._oDateFormatSettings);
				} else {
					fnDateFormatter = DateFormat.getDateTimeInstance(this._oDateFormatSettings);
				}

				break;

			case "Edm.String":

				if (oField.isCalendarDate && this._oDateFormatSettings) {

					var oConstraints;
					var oSettings = {
						isCalendarDate: true
					};

					if (!fnCustomFormatter) {
						var oStringDateType = ODataType.getType("Edm.String", this._oDateFormatSettings, oConstraints, oSettings);
						fnCustomFormatter = function(oValue) {
							return oStringDateType.formatValue(oValue, "string");
						};
					}
				} else if (!this._bUseTimeseries) {

					var oConstraints;
					var oSettings = {
						isCalendarDate: true
					};
					fnCustomFormatter = this._getDateFormatterForAnnotation(oField, oConstraints, oSettings);
				}

				break;

			// no default
		}

		if (fnDateFormatter) {
			fnCustomFormatter = function(timestamp) {

				if (timestamp === "") {
					return this._sNotAssignedText;
				}

				if (!timestamp) {
					return null;
				}

				var date = UI5Date.getInstance(timestamp);
				return fnDateFormatter.format(date);
			}.bind(this);
		}

		return fnCustomFormatter;
	};

	/**
	 * returns a custom date formatter depending on an time annotation for the field
	 */
	ChartProvider.prototype._getDateFormatterForAnnotation = function(oField, oConstraints, oSettings) {
		var oDateFormatterSetting = {};
		var sParserPattern = this._getParserSettingsForAnnotation(oField);
		var sPrefix = this._getParserPrefixForAnnotation(oField);

		if (this._oDateFormatSettings) {
			//Take over cutstom data configuration
			Object.assign(oDateFormatterSetting, this._oDateFormatSettings);
		}

		//Overrule pattern for dateFormatSettings
		oDateFormatterSetting.pattern = this._getFormatterPatternForAnnotation(oField);

		if (oDateFormatterSetting.pattern) {
			var oStringDateType = ODataType.getType("Edm.String", oDateFormatterSetting, oConstraints, oSettings);

			var fnCustomFormatter = function(oValue) {
				if (oValue == "") {
					return this._sNotAssignedText;
				}

				oValue = DateFormat.getInstance({pattern: sParserPattern}).parse(oValue);

				return sPrefix + oStringDateType.formatValue(oValue, "string");

			}.bind(this);
			//var fnCustomFormatter = DateFormat.getDateInstance(sDateFormatterSetting);

			return fnCustomFormatter;
		}
	};

	ChartProvider.prototype._getParserPrefixForAnnotation = function(oField) {
		if (CalendarMetadata.isYearWeek(oField)) {
			return "CW ";
		} else if (CalendarMetadata.isYearQuarter(oField)) {
			return "Q";
		}

		return "";
	};

	ChartProvider.prototype._getParserSettingsForAnnotation = function(oField){
		if (oField.type === "Edm.String"){
			var sFormatterSettings;

			if (CalendarMetadata.isYearWeek(oField)) {
				sFormatterSettings = "yyyyww";
			} else if (CalendarMetadata.isYearMonth(oField)) {
				sFormatterSettings = "yyyyMM";
			} else if (CalendarMetadata.isYearQuarter(oField)) {
				sFormatterSettings = "yyyyQQQQQ";
			}

			return sFormatterSettings;
		}
	};

	ChartProvider.prototype._getFormatterPatternForAnnotation = function(oField) {
		if (oField.type === "Edm.String"){
			var sFormatterSettings;

			if (oField.isCalendarDate) {
				sFormatterSettings = "d MMMM y";
			} else if (CalendarMetadata.isYearWeek(oField)) {
				sFormatterSettings = "ww y";
			} else if (CalendarMetadata.isYearMonth(oField)) {
				sFormatterSettings = "MMMM y";
			} else if (CalendarMetadata.isYearQuarter(oField)) {
				sFormatterSettings = "Q y";
			}

			return sFormatterSettings;
		}
	};

	/**
	 * Sets inResult on the field metadata if the field exists in the RequestAtLeast of PresentationVariant annotation
	 * @param {object} oField - OData metadata for the table field
	 * @private
	 */
	ChartProvider.prototype._setInResult = function(oField) {
		// first check if field is part of PresentationVariant-->RequestAtLeastFields
		if (this._oPresentationVariant) {
			if (this._oPresentationVariant.requestAtLeastFields && this._oPresentationVariant.requestAtLeastFields.indexOf(oField.name) > -1) {
				oField.inResult = true;
			}
		}
	};

	/**
	 * Sets sorting realted info (sorted and sortOrder) on the field metadata if the field exists in the SortOrder of PresentationVariant annotation
	 * @param {object} oField - OData metadata for the table field
	 * @private
	 */
	ChartProvider.prototype._setSortOrder = function(oField) {
		// initialize the sort Order
		oField.sorted = false;
		oField.sortOrder = "Ascending";

		var iLen;
		// first check if field is part of PresentationVariant-->SortOrder
		if (this._oPresentationVariant && this._oPresentationVariant.sortOrderFields) {
			iLen = this._oPresentationVariant.sortOrderFields.length;
			for (var i = 0; i < iLen; i++) {
				if (this._oPresentationVariant.sortOrderFields[i].name === oField.name) {
					oField.sorted = true;
					oField.sortOrder = this._oPresentationVariant.sortOrderFields[i].descending ? "Descending" : "Ascending";
					oField.sortIndex = i;
					break;
				}
			}
		}
	};

	ChartProvider.prototype._unmarkTextDimensions = function(aFields, aTextDimensionNames) {
		var i, oField;

		for (i = 0; i < aFields.length; i++) {
			oField = aFields[i];

			if (oField.isDimension) {
				if (aTextDimensionNames.indexOf(oField.name) > -1) {
					oField.isDimension = false;
				}
			}
		}
	};

	/**
	 * @param {object} oField - OData metadata for the chart field
	 * @returns {string} the role
	 */
	ChartProvider.prototype._getRole = function(oField) {

		if (this._oChartAnnotation) {
			if ((oField.isDimension || oField.isHierarchyDimension) && this._oChartAnnotation.dimensionAttributes[oField.name]) {
				return ChartMetadata.getDimensionRole(this._oChartAnnotation.dimensionAttributes[oField.name].role);
			} else if (oField.isMeasure && this._oChartAnnotation.measureAttributes[oField.name]) {
				return ChartMetadata.getMeasureRole(this._oChartAnnotation.measureAttributes[oField.name].role);
			}
		}
	};

	/**
	 * @param {object} oField - OData metadata for the chart field
	 * @returns {int} the hierarchy level
	 * @private
	 */
	ChartProvider.prototype._getHierarchyLevel = function(oField) {
		if (this._oChartAnnotation) {
			if (oField.isHierarchyDimension && this._oChartAnnotation.dimensionAttributes[oField.name]) {
				var level = null;
				try {
					level = parseInt(this._oChartAnnotation.dimensionAttributes[oField.name].hierarchyLevel);
				} catch (e) {
					level = 0;
				}
				return level;
			}

			return 0;
		}
	};

	/**
	 * @param {object} oField - OData metadata for the chart field
	 * @returns {string} the hierarchy level
	 * @since 1.54
	 * @private
	 */
	ChartProvider.prototype._getTextPropertyForHierachyDimension = function(oField) {
		var oReferenceField = oField.hierarchy.up[MetadataAnalyser.hierarchyType.nodeExternalKeyFor] || oField;

		return oReferenceField.description || oReferenceField.name;
	};

	/**
	 * Retrieve the UI.DataPoint annotation for the chart measure.
	 * @param {object} oField The metadata for the chart field
	 * @returns {string} the dataPoint
	 * @private
	 */
	ChartProvider.prototype._getDataPoint = function(oField) {
		if (this._oChartAnnotation && oField.isMeasure && this._oChartAnnotation.measureAttributes[oField.name] && this._oChartAnnotation.measureAttributes[oField.name].dataPoint) {
			var sDataPointPath = this._oChartAnnotation.measureAttributes[oField.name].dataPoint;
			var aDataPointInformation = sDataPointPath.split("#");
			var sQualifier = aDataPointInformation.length === 2 ? aDataPointInformation[1] : "";

			return this._getMeasureDataPoint(sQualifier, oField.name);
		}

		return null;
	};

	/**
	 * Gets the fields that can be added as columns.
	 * @returns {array} the table view metadata
	 * @public
	 */
	ChartProvider.prototype.getChartViewMetadata = function() {
		return this._oChartViewMetadata;
	};

	/**
	 * Returns the field for the of a specific dimension.
	 * @param sDimName Name of a dimension
	 * @returns {object} true or false based on metadata.
	 * @private
	 */
	ChartProvider.prototype.getViewField = function(sDimName) {
		var oField = this._oChartViewMetadata.fields.filter(function(field) {
			return field.name === sDimName;
		})[0];

		// Filterable from ChartProvider
		return oField;
	};

	/**
	 * Get the Chart DataPoint metadata
	 * @returns {Object} the DataPoint annotation object
	 * @public
	 */
	ChartProvider.prototype.getChartDataPointMetadata = function() {
		if (!this._oChartDataPointMetadata && this._sFullyQualifiedEntityTypeName) {
			this._oChartDataPointMetadata = this._oMetadataAnalyser.getDataPointAnnotation(this._sFullyQualifiedEntityTypeName);
		}
		return this._oChartDataPointMetadata;
	};

	/**
	 * Returns the UI.DataPoint annotation of for a given qualifier
	 * @param {string} sQualifier the value of the qualifier
	 * @param {string} sMeasure the name of the measure field for consistency check
	 * @returns {Object} the DataPoint annotation object
	 * @private
	 */
	ChartProvider.prototype._getMeasureDataPoint = function(sQualifier, sMeasure) {
		var oChartDataPointMetadata = this.getChartDataPointMetadata();

		if (oChartDataPointMetadata) {
			var oDataPoint = null;

			// filter the correct data point
			if (sQualifier) {
				if (oChartDataPointMetadata.additionalAnnotations) {
					oDataPoint = oChartDataPointMetadata.additionalAnnotations[sQualifier];
				}
			} else if (oChartDataPointMetadata.primaryAnnotation) {
					oDataPoint = oChartDataPointMetadata.primaryAnnotation;
				}

			// consistency check that measure value and field
			if (oDataPoint != null && oDataPoint.Value && oDataPoint.Value.Path == sMeasure) {
				return oDataPoint;
			}

		}

		return null;
	};

	/**
	 * Returns a flag indicating whether date handling with UTC is enabled for the table.
	 * @returns {boolean} whether UTC date handling is enabled
	 * @public
	 */
	ChartProvider.prototype.getIsUTCDateHandlingEnabled = function() {
		return this._oDateFormatSettings ? this._oDateFormatSettings.UTC : false;
	};

	/**
	 * Destroys the object
	 * @public
	 */
	ChartProvider.prototype.destroy = function() {
		if (this._oMetadataAnalyser && this._oMetadataAnalyser.destroy) {
			this._oMetadataAnalyser.destroy();
		}
		this._oMetadataAnalyser = null;
		if (this._oControlProvider && this._oControlProvider.destroy) {
			this._oControlProvider.destroy();
		}
		this._oControlProvider = null;
		this._aODataFieldMetadata = null;
		this._oChartViewMetadata = null;
		this._oChartDataPointMetadata = null;
		this._sIgnoredFields = null;
		this.bIsDestroyed = true;
	};

	/**
	 * Provides the semantic coloring for the chart measure based on the UI.DataPoint annotation.
	 * @see sap.chart.ColoringType.Criticality
	 * @param {object} oDataPoint The UI.DataPoint annotation
	 * @return {sap.chart.ColoringType.Criticality} The semantic coloring for the chart measure
	 * @public
	 */
	ChartProvider.prototype.provideSemanticColoring = function(oDataPoint) {
		var oCriticality = {};
		if (oDataPoint.Criticality) {

			if (oDataPoint.Criticality.Path) {
				oCriticality = {
					Calculated: oDataPoint.Criticality.Path
				};
			} else {
				oCriticality = {
					Static: ChartMetadata.getCriticalityType(oDataPoint.Criticality.EnumMember)
				};
			}

		} else {
			var oThresholds = {};
			var bConstant = this._buildThresholds(oThresholds, oDataPoint.CriticalityCalculation);

			if (bConstant) {
				oCriticality = {
					ConstantThresholds: oThresholds
				};
			} else {
				oCriticality = {
					DynamicThresholds: oThresholds
				};
			}

		}

		return oCriticality;
	};

	/**
	 * Determine the criticality coloring for the given dimension
	 *
	 * @param oDimensionField the dimension field
	 * @returns {object} the criticality coloring
	 */
	ChartProvider.prototype.calculateDimensionColoring = function(oDimensionField) {
		var aValueCriticality =  ChartMetadata.getValueCriticality(oDimensionField);
		if (!aValueCriticality) {
			return null;
		}

		var oValue, oValueCriticality, oCriticality = {
			Positive: {
				Values: []
			},
			Critical: {
				Values: []
			},
			Negative: {
				Values: []
			},
			Neutral: {
				Values: []
			}
		};

		for (var i = 0; i < aValueCriticality.length; i++) {
			oValueCriticality = aValueCriticality[i];
			oValue = ChartMetadata.calculateValue(oValueCriticality.Value);

			if (oValueCriticality.Criticality.EnumMember.endsWith("Positive")) {
				oCriticality.Positive.Values.push(oValue);
			} else if (oValueCriticality.Criticality.EnumMember.endsWith("Critical")) {
				oCriticality.Critical.Values.push(oValue);
			} else if (oValueCriticality.Criticality.EnumMember.endsWith("Negative")) {
				oCriticality.Negative.Values.push(oValue);
			} else {
				oCriticality.Neutral.Values.push(oValue);
			}
		}

		return oCriticality;
	};
	/**
	 * Checks whether the thresholds are dynamic or constant.
	 * @param {object} oThresholds the threshold skeleton
	 * @param {object} oCriticalityCalculation the UI.DataPoint.CriticalityCalculation annotation
	 * @returns {boolean} <code>true</code> if the threshold should be supplied as ConstantThresholds, <code>false</code> if the threshold should
	 *          be supplied as DynamicThresholds
	 * @private
	 */
	ChartProvider.prototype._buildThresholds = function(oThresholds, oCriticalityCalculation) {
		var bConstant = true;

		oThresholds.ImprovementDirection = ChartMetadata.getImprovementDirectionType(oCriticalityCalculation.ImprovementDirection.EnumMember);

		var aValidThresholds = ChartMetadata.getCriticalityThresholds();
		var iLen = aValidThresholds.length;

		var oDynamicThresholds = {
			oneSupplied: false
		// combination to check whether at least one is supplied
		};
		var oConstantThresholds = {
			oneSupplied: false
		// combination to check whether at least one is supplied
		};

		for (var i = 0; i < iLen; i++) {
			oDynamicThresholds[aValidThresholds[i]] = oCriticalityCalculation[aValidThresholds[i]] ? oCriticalityCalculation[aValidThresholds[i]].Path : undefined;
			oDynamicThresholds.oneSupplied = oDynamicThresholds.oneSupplied || oDynamicThresholds[aValidThresholds[i]];

			if (!oDynamicThresholds.oneSupplied) {
				// only consider in case no dynamic threshold is supplied
				oConstantThresholds[aValidThresholds[i]] = ChartMetadata.calculateConstantValue(oCriticalityCalculation[aValidThresholds[i]]);
				oConstantThresholds.oneSupplied = oConstantThresholds.oneSupplied || oConstantThresholds[aValidThresholds[i]];
			}
		}

		// dynamic definition shall overrule constant definition
		if (oDynamicThresholds.oneSupplied) {
			bConstant = false;

			for (var i = 0; i < iLen; i++) {
				if (oDynamicThresholds[aValidThresholds[i]]) {
					oThresholds[aValidThresholds[i]] = oDynamicThresholds[aValidThresholds[i]];
				}
			}

		} else {
			var oAggregationLevel;
			oThresholds.AggregationLevels = [];

			// check if at least one static value is supplied
			if (oConstantThresholds.oneSupplied) {

				// add one entry in the aggregation level
				oAggregationLevel = {
					VisibleDimensions: null
				};

				for (var i = 0; i < iLen; i++) {
					if (oConstantThresholds[aValidThresholds[i]]) {
						oAggregationLevel[aValidThresholds[i]] = oConstantThresholds[aValidThresholds[i]];
					}
				}

				oThresholds.AggregationLevels.push(oAggregationLevel);

			}

			// further check for ConstantThresholds
			if (oCriticalityCalculation.ConstantThresholds && oCriticalityCalculation.ConstantThresholds.length > 0) {
				for (var i = 0; i < oCriticalityCalculation.ConstantThresholds.length; i++) {
					var oAggregationLevelInfo = oCriticalityCalculation.ConstantThresholds[i];

					var aVisibleDimensions = oAggregationLevelInfo.AggregationLevel ? [] : null;

					if (oAggregationLevelInfo.AggregationLevel && oAggregationLevelInfo.AggregationLevel.length > 0) {
						for (var j = 0; j < oAggregationLevelInfo.AggregationLevel.length; j++) {
							aVisibleDimensions.push(oAggregationLevelInfo.AggregationLevel[j].PropertyPath);
						}
					}

					oAggregationLevel = {
						VisibleDimensions: aVisibleDimensions
					};

					for (var j = 0; j < iLen; j++) {
						var nValue = ChartMetadata.calculateConstantValue(oAggregationLevelInfo[aValidThresholds[j]]);
						if (nValue) {
							oAggregationLevel[aValidThresholds[j]] = nValue;
						}
					}

					oThresholds.AggregationLevels.push(oAggregationLevel);
				}
			}
		}

		return bConstant;
	};

	/**
	 * Gets the maxItems property of the UI.PresentationVariant annotation. <b>Note</b> If this property is set, the chart displays 100 items at
	 * most.
	 */
	ChartProvider.prototype.getMaxItems = function() {
		var iMaxItems = -1;

		if (this._oPresentationVariant && this._oPresentationVariant.maxItems) {
			iMaxItems = this._oPresentationVariant.maxItems;
		}

		return iMaxItems;
	};

	return ChartProvider;
}, /* bExport= */true);
