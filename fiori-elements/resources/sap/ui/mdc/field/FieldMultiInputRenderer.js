/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Renderer","sap/m/MultiInputRenderer","sap/ui/mdc/field/FieldInputRenderUtil"],function(e,t,i){"use strict";var n=e.extend(t);n.apiVersion=2;n.addOuterClasses=function(e,i){t.addOuterClasses.apply(this,arguments);e.class("sapUiMdcFieldMultiInput")};n.getAriaRole=function(e){return i.getAriaRole.call(this,e,t)};n.getAccessibilityState=function(e){return i.getAccessibilityState.call(this,e,t)};n.writeInnerAttributes=function(e,n){return i.writeInnerAttributes.call(this,e,n,t)};return n});