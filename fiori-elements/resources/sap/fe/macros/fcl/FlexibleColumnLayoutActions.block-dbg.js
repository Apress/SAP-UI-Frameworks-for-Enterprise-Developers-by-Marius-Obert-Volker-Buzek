/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase","sap/fe/core/buildingBlocks/BuildingBlockSupport","sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor"],function(e,t,o){"use strict";var n,i;var r={};var c=o.xml;var l=t.defineBuildingBlock;function s(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;a(e,t)}function a(e,t){a=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,o){t.__proto__=o;return t};return a(e,t)}let p=(n=l({name:"FlexibleColumnLayoutActions",namespace:"sap.fe.macros.fcl",publicNamespace:"sap.fe.macros"}),n(i=function(e){s(t,e);function t(){return e.apply(this,arguments)||this}r=t;var o=t.prototype;o.getTemplate=function e(){return c`
            <m:OverflowToolbarButton
                id="fe::FCLStandardAction::FullScreen"
                type="Transparent"
                icon="{fclhelper>/actionButtonsInfo/switchIcon}"
                visible="{fclhelper>/actionButtonsInfo/switchVisible}"
                press="._routing.switchFullScreen()"
            />
            <m:OverflowToolbarButton
                id="fe::FCLStandardAction::Close"
                type="Transparent"
                icon="sap-icon://decline"
                tooltip="{sap.fe.i18n>C_COMMON_SAPFE_CLOSE}"
                visible="{fclhelper>/actionButtonsInfo/closeVisible}"
                press="._routing.closeColumn()"
            />`};return t}(e))||i);r=p;return r},false);