/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Core"],function(e){"use strict";var r={};var n={"{{parameters.NOW_ISO}}":t,"{{parameters.TODAY_ISO}}":a,"{{parameters.LOCALE}}":i};function t(){return(new Date).toISOString()}function a(){return(new Date).toISOString().slice(0,10)}function i(){return e.getConfiguration().getLocale().toString()}r.processPredefinedParameter=function(e){var r;Object.keys(n).forEach(function(t){r=new RegExp(t,"g");if(e.indexOf(t)>-1){e=e.replace(r,n[t]())}});return e};r.getParamsForModel=function(){var e={};for(var r in n){var t=r.indexOf("."),a=r.indexOf("}");e[r.substring(t+1,a)]=n[r]()}return e};return r});