/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Renderer","sap/ui/core/IconPool","sap/ui/mdc/enum/EditMode"],function(e,t,i){"use strict";var n=e.extend("sap.ui.mdc.field.FieldBaseRenderer");n=Object.assign(n,{apiVersion:2});n.render=function(e,t){var n=t._getContent();var a=t.getWidth();var s=t.getConditions();var r=t.getEditMode();var d=t.getShowEmptyIndicator()&&s.length===0&&r===i.Display&&!t.getContent()&&!t.getContentDisplay();e.openStart("div",t);e.class("sapUiMdcFieldBase");if(n.length>1){e.class("sapUiMdcFieldBaseMoreFields")}if(d){e.class("sapMShowEmpty-CTX")}e.style("width",a);e.openEnd();for(var o=0;o<n.length;o++){var l=n[o];e.renderControl(l)}e.close("div")};return n});