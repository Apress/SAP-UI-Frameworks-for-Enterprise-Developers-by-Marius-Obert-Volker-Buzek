/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/base/Log","../DvlException"],function(e,r){"use strict";var t=function(t){if(typeof t==="number"){var i=t;var n=sap.ve.dvl.DVLRESULT.getDescription?sap.ve.dvl.DVLRESULT.getDescription(i):"";e.error(n,JSON.stringify({errorCode:i}),"sap.ve.dvl");throw new r(i,n)}return t};return t},true);