/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides data type sap.ui.vk.TransformationMatrix.
sap.ui.define([
	"sap/ui/base/DataType",
	"sap/base/assert"
], function(
	DataType,
	assert
) {
	"use strict";

	/**
	 * @classdesc
	 * Transformation matrix is an array of 12 numbers in a row major mode.
	 * @namespace
	 * @final
	 * @public
	 * @alias sap.ui.vk.TransformationMatrix
	 * @since 1.32.0
	 */
	var TransformationMatrix = DataType.getType("float[]");


	/**
	 * Parses the given string value and converts it into an array of numbers.
	 * @param {string} value a comma or white space delimited string
	 * @return {float[]} an array of 12 numbers
	 * @static
	 * @public
	 */
	TransformationMatrix.parseValue = function(value) {
		var componentType = TransformationMatrix.getComponentType();
		return value.split(/\s*,\s*|\s+/).map(componentType.parseValue.bind(componentType));
	};

	/**
	 * Converts matrix from 4x3 to 4x4.
	 * @param {float[]} matrix4x3 The matrix to convert.
	 * @return {float[]} The matrix 4x4 with [0, 0, 0, 1] in the last column.
	 * @static
	 * @public
	 */
	TransformationMatrix.convertTo4x4 = function(matrix4x3) {
		var m = matrix4x3;
		return [m[0], m[1], m[2], 0, m[3], m[4], m[5], 0, m[6], m[7], m[8], 0, m[9], m[10], m[11], 1];
	};

	/**
	 * Checks that a matrix can be safely converted to a 4x3 matrix.
	 * @param {float[]} matrix4x4 The matrix to check
	 * @return {boolean} true if the matrix can be safely converted to a 4x3 matrix
	 * @static
	 * @private
	 */
	TransformationMatrix.canConvertTo4x3 = function(matrix4x4) {
		var equals = function(a, b) { return Math.abs(a - b) < 1e-5; };
		return (
			equals(matrix4x4[3], 0) &&
			equals(matrix4x4[7], 0) &&
			equals(matrix4x4[11], 0) &&
			equals(matrix4x4[15], 1));
	};

	/**
	 * Converts matrix from 4x4 to 4x3.
	 * @param {float[]} matrix4x4 The matrix to convert. The last column must be [0, 0, 0, 1].
	 * @return {float[]} The matrix 4x3 with the last column removed from matrix4x4.
	 * @public
	 * @static
	 */
	TransformationMatrix.convertTo4x3 = function(matrix4x4) {
		var m = matrix4x4;
		assert(TransformationMatrix.canConvertTo4x3(m), "The transformation matrix is invalid. The last column must be [0, 0, 0, 1].");
		return [m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10], m[12], m[13], m[14]];
	};

	/**
	 * Converts matrix from 3x2 to 4x3.
	 * @param {float[]} m3x2 The matrix to convert.
	 * @return {float[]} The matrix 4x3 with the last column removed from matrix4x4.
	 * @public
	 * @static
	 */
	TransformationMatrix.convert3x2To4x3 = function(m3x2) {
		return [m3x2[0], m3x2[1], 0, m3x2[2], m3x2[3], 0, 0, 0, 1, m3x2[4], m3x2[5], 0];
	};

	/**
	 * Converts matrix from 4x3 to 3x2.
	 * @param {float[]} m4x3 The matrix 4x3 to convert.
	 * @return {float[]} The matrix 3x2.
	 * @static
	 * @public
	 */
	TransformationMatrix.convert4x3To3x2 = function(m4x3) {
		return new Float32Array([m4x3[0], m4x3[1], m4x3[3], m4x3[4], m4x3[9], m4x3[10]]);
	};

	/**
	 * Converts matrix from 4x4 to 3x2.
	 * @param {float[]} m4x4 The matrix 4x4 to convert.
	 * @return {float[]} The matrix 3x2.
	 * @static
	 * @public
	 */
	TransformationMatrix.convert4x4To3x2 = function(m4x4) {
		return new Float32Array([m4x4[0], m4x4[1], m4x4[4], m4x4[5], m4x4[12], m4x4[13]]);
	};

	/**
	 * Converts matrix from 4x4 or 4x4 to 3x2.
	 * @param {float[]} m The matrix 4x4 or 4x3 to convert.
	 * @return {float[]} The matrix 3x2.
	 * @static
	 * @public
	 */
	TransformationMatrix.convertTo3x2 = function(m) {
		if (m) {
			if (m.length === 12) {
				return TransformationMatrix.convert4x3To3x2(m);
			} else if (m.length === 16) {
				return TransformationMatrix.convert4x4To3x2(m);
			}
		}
		return new Float32Array([1, 0, 0, 1, 0, 0]);
	};

	return TransformationMatrix;
}, /* bExport = */ true);
