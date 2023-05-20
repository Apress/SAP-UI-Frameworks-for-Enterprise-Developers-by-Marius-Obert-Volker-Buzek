/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/base/ManagedObject"],function(e){"use strict";const n=e.extend("sap.fe.core.controls.Any",{metadata:{properties:{any:"any",anyText:"string"}},updateProperty:function(e){if(e==="any"){this.setAny(this.getBindingInfo(e).binding.getExternalValue())}else{this.setAnyText(this.getBindingInfo(e).binding.getExternalValue())}}});return n},false);