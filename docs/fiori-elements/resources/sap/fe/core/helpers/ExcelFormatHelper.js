/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/format/DateFormat"],function(e){"use strict";const t={getExcelDatefromJSDate:function(){let t=e.getDateInstance().oFormatOptions.pattern.toLowerCase();if(t){const e=/^[^y]*y[^y]*$/m;if(e.exec(t)){t=t.replace("y","yyyy")}}return t},getExcelDateTimefromJSDateTime:function(){let t=e.getDateTimeInstance().oFormatOptions.pattern.toLowerCase();if(t){const e=/^[^y]*y[^y]*$/m;if(e.exec(t)){t=t.replace("y","yyyy")}if(t.includes("a")){t=t.replace("a","AM/PM")}}return t},getExcelTimefromJSTime:function(){let t=e.getTimeInstance().oFormatOptions.pattern;if(t&&t.includes("a")){t=t.replace("a","AM/PM")}return t}};return t},false);