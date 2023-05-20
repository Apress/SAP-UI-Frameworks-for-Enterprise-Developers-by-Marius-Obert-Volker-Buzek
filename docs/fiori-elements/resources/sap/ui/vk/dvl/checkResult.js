/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/base/Log","../DvlException"],function(e,r){"use strict";var t=function(t){if(t<0){var i=sap.ve.dvl.DVLRESULT.getDescription?sap.ve.dvl.DVLRESULT.getDescription(t):"";e.error(i,JSON.stringify({errorCode:t}),"sap.ve.dvl");throw new r(t,i)}return t};return t},true);