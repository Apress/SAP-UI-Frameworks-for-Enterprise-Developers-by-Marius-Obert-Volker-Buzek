/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
sap.ui.define(["./sapvbi"],function(){"use strict";VBI.Configurations=function(){var a={};a.m_configdata=[];a.clear=function(){a.m_configdata=[]};a.load=function(n,t){if(n.Set){a.clear();var e=n.Set.P;if(jQuery.type(e)=="object"){a.m_configdata[e.name]=e.value}else if(jQuery.type(e)=="array"){for(var i=0,f=e.length;i<f;++i){a.m_configdata[e[i].name]=e[i].value}}}};a.GetData=function(n){return a.m_configdata[n]};return a}});