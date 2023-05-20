/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/formatters/TableFormatterTypes"],function(e){"use strict";var i={};var t=e.MessageType;function a(e){let i;switch(e){case"UI.CriticalityType/Negative":case"UI.CriticalityType/VeryNegative":i=t.Error;break;case"UI.CriticalityType/Critical":i=t.Warning;break;case"UI.CriticalityType/Positive":case"UI.CriticalityType/VeryPositive":i=t.Success;break;case"UI.CriticalityType/Information":i=t.Information;break;case"UI.CriticalityType/Neutral":default:i=t.None}return i}i.getMessageTypeFromCriticalityType=a;return i},false);