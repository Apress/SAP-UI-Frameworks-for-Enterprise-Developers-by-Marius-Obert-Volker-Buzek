/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/m/StandardListItemRenderer","sap/ui/core/Renderer"],function(e,a){"use strict";var i=a.extend(e);i.apiVersion=2;i.renderLIContent=function(a,i){var r=i.getColor();var s=i.getSemanticSpotType();var n=null;if(r){a.openStart("span");a.class("sapUiVkLegendItemSquare");a.style("background-color",r);a.openEnd();a.close("span")}if(s){switch(s){case sap.ui.vbm.SemanticType.Error:n=sap.ui.require.toUrl("sap/ui/vbm/themes/base/img/Pin_Red.png");break;case sap.ui.vbm.SemanticType.Warning:n=sap.ui.require.toUrl("sap/ui/vbm/themes/base/img/Pin_Orange.png");break;case sap.ui.vbm.SemanticType.Success:n=sap.ui.require.toUrl("sap/ui/vbm/themes/base/img/Pin_Green.png");break;case sap.ui.vbm.SemanticType.Default:n=sap.ui.require.toUrl("sap/ui/vbm/themes/base/img/Pin_Blue.png");break;case sap.ui.vbm.SemanticType.Inactive:n=sap.ui.require.toUrl("sap/ui/vbm/themes/base/img/Pin_Grey.png");break;default:break}if(n){i.addStyleClass("sapUiVkLegendItemSpotType");i.setIcon(n)}}e.renderLIContent(a,i)};return i},true);