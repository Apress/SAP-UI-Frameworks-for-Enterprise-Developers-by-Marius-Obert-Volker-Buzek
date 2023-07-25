/*!
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/navigation/PresentationVariant", "./NavError"],
	function(FEPresentationVariant, NavError) {
	"use strict";

	/**
	 * @class
	 * Creates a new instance of a PresentationVariant class. If no parameter is passed,
	 * an new empty instance is created whose ID has been set to <code>""</code>.
	 * Passing a JSON-serialized string complying to the Selection Variant Specification will parse it,
	 * and the newly created instance will contain the same information.
	 * @extends sap.fe.navigation.PresentationVariant
	 * @constructor
	 * @public
	 * @deprecated Since version 1.83.0. Please use {@link sap.fe.navigation.PresentationVariant} instead.
	 * @alias sap.ui.generic.app.navigation.service.PresentationVariant
	 * @param {string|object} [vPresentationVariant] If of type <code>string</code>, the selection variant is JSON-formatted;
	 * if of type <code>object</code>, the object represents a selection variant
	 * @throws An instance of {@link sap.ui.generic.app.navigation.service.NavError} in case of input errors. Valid error codes are:
	 * <table>
	 * <tr><th>Error code</th><th>Description</th></tr>
	 * <tr><td>PresentationVariant.INVALID_INPUT_TYPE</td><td>Indicates that the data format of the selection variant provided is inconsistent</td></tr>
	 * <tr><td>PresentationVariant.UNABLE_TO_PARSE_INPUT</td><td>Indicates that the provided string is not a JSON-formatted string</td></tr>
	 * <tr><td>PresentationVariant.INPUT_DOES_NOT_CONTAIN_SELECTIONVARIANT_ID</td><td>Indicates that the PresentationVariantID cannot be retrieved</td></tr>
	 * <tr><td>PresentationVariant.PARAMETER_WITHOUT_VALUE</td><td>Indicates that there was an attempt to specify a parameter, but without providing any value (not even an empty value)</td></tr>
	 * <tr><td>PresentationVariant.SELECT_OPTION_WITHOUT_PROPERTY_NAME</td><td>Indicates that a selection option has been defined, but the Ranges definition is missing</td></tr>
	 * <tr><td>PresentationVariant.SELECT_OPTION_RANGES_NOT_ARRAY</td><td>Indicates that the Ranges definition is not an array</td></tr>
	 * </table>
	 * These exceptions can only be thrown if the parameter <code>vPresentationVariant</code> has been provided.
	 */
	var PresentationVariant = FEPresentationVariant.extend("sap.ui.generic.app.navigation.service.PresentationVariant", /** @lends sap.ui.generic.app.navigation.service.PresentationVariant */ {

		constructor : function(vPresentationVariant) {
			try {
				FEPresentationVariant.apply(this, [vPresentationVariant]);
			} catch (oError) {
				if (oError) {
					throw new NavError(oError.getErrorCode());
				}
			}
		},

		/**
		 * Returns the identification of the selection variant.
		 * @returns {string} The identification of the selection variant as made available during construction
		 * @public
		 * @deprecated Since version 1.83.0
		 */
		getID : function() {
			return FEPresentationVariant.prototype.getID.apply(this);
		},

		/**
		 * Sets the identification of the selection variant.
		 * @param {string} sId The new identification of the selection variant
		 * @public
		 * @deprecated Since version 1.83.0
		 */
		setID : function(sId) {
			FEPresentationVariant.prototype.setID.apply(this, [sId]);
		},

		/**
		 * Sets the text / description of the selection variant.
		 * @param {string} sNewText The new description to be used
		 * @public
		 * @deprecated Since version 1.83.0
		 * @throws An instance of {@link sap.ui.generic.app.navigation.service.NavError} in case of input errors. Valid error codes are:
		 * <table>
		 * <tr><th>Error code</th><th>Description</th></tr>
		 * <tr><td>PresentationVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
		 * </table>
		 */
		setText : function(sNewText) {
			try {
				FEPresentationVariant.prototype.setText.apply(this, [sNewText]);
			} catch (oError) {
				if (oError) {
					throw new NavError(oError.getErrorCode());
				}
			}
		},

		/**
		 * Returns the current text / description of this selection variant.
		 * @returns {string} the current description of this selection variant.
		 * @public
		 * @deprecated Since version 1.83.0
		 */
		getText : function() {
			return FEPresentationVariant.prototype.getText.apply(this);
		},

		/**
		 * Sets the context URL.
		 * @param {string} sURL The URL of the context
		 * @public
		 * @deprecated Since version 1.83.0
		 * @throws An instance of {@link sap.ui.generic.app.navigation.service.NavError} in case of input errors. Valid error codes are:
		 * <table>
		 * <tr><th>Error code</th><th>Description</th></tr>
		 * <tr><td>PresentationVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
		 * </table>
		 */
		setContextUrl : function(sURL) {
			try {
				FEPresentationVariant.prototype.setContextUrl.apply(this, [sURL]);
			} catch (oError) {
				if (oError) {
					throw new NavError(oError.getErrorCode());
				}
			}
		},

		/**
		 * Gets the current context URL intended for the query.
		 * @returns {string} The current context URL for the query
		 * @public
		 * @deprecated Since version 1.83.0
		 */
		getContextUrl : function() {
			return FEPresentationVariant.prototype.getContextUrl.apply(this);
		},

		/**
		 * Returns <code>true</code> if the presentation variant does not contain any properties.
		 * nor ranges.
		 * @return {boolean} If set to <code>true</code> there are no current properties set; <code>false</code> otherwise.
		 * @public
		 * @deprecated Since version 1.83.0
		 */
		isEmpty : function() {
			return FEPresentationVariant.prototype.isEmpty.apply(this);
		},



		/**
		 * Sets the more trivial properties. Basically all properties with the exception of the Visualization.
		 *
		 * @param {map} mProperties properties to be used.
		 * @public
		 * @deprecated Since version 1.83.0
		 */
		setProperties : function(mProperties) {
			FEPresentationVariant.prototype.setProperties.apply(this, [mProperties]);
		},

		/**
		 * Gets the more trivial properties. Basically all properties with the exception of the Visualization.
		 * @returns {map} The current properties.
		 * @public
		 * @deprecated Since version 1.83.0
		 */
		getProperties : function() {
			return FEPresentationVariant.prototype.getProperties.apply(this);
		},

		/**
		 * Sets the table visualization property.
		 *
		 * @param {map} mProperties to be used for the table visualization.
		 * @public
		 * @deprecated Since version 1.83.0
		 */
		setTableVisualization : function(mProperties) {
			FEPresentationVariant.prototype.setTableVisualization.apply(this, [mProperties]);
		},

		/**
		 * Gets the table visualization property.
		 *
		 * @returns {map} mProperties to be used for the table visualization.
		 * @public
		 * @deprecated Since version 1.83.0
		 */
		getTableVisualization : function() {
			return FEPresentationVariant.prototype.getTableVisualization.apply(this);
		},

		/**
		 * Sets the chart visualization property.
		 *
		 * @param {map} mProperties to be used for the chart visualization.
		 * @public
		 * @deprecated Since version 1.83.0
		 */
		setChartVisualization : function(mProperties) {
			FEPresentationVariant.prototype.setChartVisualization.apply(this, [mProperties]);
		},

		/**
		 * Gets the chart visualization property.
		 *
		 * @returns {map} mProperties to be used for the chart visualization.
		 * @public
		 * @deprecated Since version 1.83.0
		 */
		getChartVisualization : function() {
			return FEPresentationVariant.prototype.getChartVisualization.apply(this);
		},


		/**
		 * Returns the external representation of the selection variant as JSON object.
		 * @return {object} The external representation of this instance as a JSON object
		 * @public
		 * @deprecated Since version 1.83.0
		 */
		toJSONObject : function() {
			return FEPresentationVariant.prototype.toJSONObject.apply(this);
		},

		/**
		 * Serializes this instance into a JSON-formatted string.
		 * @return {string} The JSON-formatted representation of this instance in stringified format
		 * @public
		 * @deprecated Since version 1.83.0
		 */
		toJSONString : function() {
			return FEPresentationVariant.prototype.toJSONString.apply(this);
		}
	});

	return PresentationVariant;

});
