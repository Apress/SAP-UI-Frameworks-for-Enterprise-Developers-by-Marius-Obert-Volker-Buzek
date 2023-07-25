/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Element"],function(e){"use strict";const t=e.extend("sap.fe.core.controls.AnyElement",{metadata:{properties:{anyText:"string"}},updateProperty:function(e){if(e==="anyText"){this.setAnyText(this.getBindingInfo(e).binding.getExternalValue())}}});return t},false);