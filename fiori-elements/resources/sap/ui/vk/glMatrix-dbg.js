/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// A wrapper for gl-matrix to initialize the matrix array type with `Float64Array` instead of default `Float32Array`.
// VIT modules must include this `glMatrix` file instead of `thirdparty/gl-matrix`.
sap.ui.define([
	"./thirdparty/gl-matrix"
], function(
	glMatrix
) {
	"use strict";

	glMatrix.glMatrix.setMatrixArrayType(Float64Array);

	return glMatrix;
});
