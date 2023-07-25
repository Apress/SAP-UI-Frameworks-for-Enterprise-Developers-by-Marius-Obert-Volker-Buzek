/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/Select","sap/m/SelectRenderer"],function(e,t){"use strict";const r=e.extend("sap.fe.core.controls.MassEditSelect",{metadata:{properties:{showValueHelp:{type:"boolean"},valueHelpIconSrc:{type:"string"},selectValue:{type:"string"}},events:{valueHelpRequest:{}},interfaces:["sap.ui.core.IFormContent"]},renderer:{apiVersion:2,render:t.render}});return r},false);