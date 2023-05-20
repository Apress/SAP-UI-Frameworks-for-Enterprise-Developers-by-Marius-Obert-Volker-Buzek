/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define([],function(){"use strict";var e=sap.ui.getCore().initLibrary({name:"sap.ui.export",dependencies:["sap.ui.core"],types:["sap.ui.export.EdmType","sap.ui.export.FileType"],interfaces:[],controls:[],elements:[],version:"1.113.0"});e.EdmType={BigNumber:"BigNumber",Boolean:"Boolean",Currency:"Currency",Date:"Date",DateTime:"DateTime",Enumeration:"Enumeration",Number:"Number",Percentage:"Percentage",String:"String",Time:"Time"};e.FileType={CSV:"CSV",GSHEET:"GSHEET",PDF:"PDF",XLSX:"XLSX"};e.Destination={LOCAL:"LOCAL",REMOTE:"REMOTE"};sap.ui.loader.config({shim:{"sap/ui/export/js/XLSXBuilder":{amd:true,exports:"XLSXBuilder"},"sap/ui/export/js/XLSXExportUtils":{amd:true,exports:"XLSXExportUtils"}}});return e});