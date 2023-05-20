/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/format/NumberFormat","sap/ui/core/Core"],function(r,e){"use strict";var t={};t._oCurrencyFormatter=null;t.formatCurrency=function(r,e,n){return t._getCurrencyFormatter(n).format(r,e)||""};t._getCurrencyFormatter=function(n){t._oCurrencyFormatter=r.getCurrencyInstance({showMeasure:false,maxFractionDigits:n},e.getConfiguration().getLocale());return t._oCurrencyFormatter};return t},true);