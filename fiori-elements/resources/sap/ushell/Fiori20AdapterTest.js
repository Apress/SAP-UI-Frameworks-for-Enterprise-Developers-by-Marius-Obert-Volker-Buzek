// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log","sap/base/util/isEmptyObject","sap/base/util/UriParameters","sap/base/util/Version","sap/ui/core/Configuration","sap/ui/core/library","sap/ui/core/service/ServiceFactoryRegistry","sap/ui/core/UIComponent","sap/ushell/Fiori20Adapter"],function(e,i,t,a,r,n,s,o,u){"use strict";var l={I_DEFAULT_SEARCH_DEPTH:5,B_DEFAULT_LATE_ADAPTATION:false,S_FIORI20ADAPTER_URL_PARAM_NAME:"sap-ui-xx-fiori2Adaptation",S_FIORI20ADAPTER_METADATA_PARAM_NAME:"sapFiori2Adaptation",A_ALLOWLIST:["fin.*","ssuite.fin.*","fscm.*","sap.fin.*","cus.sd.*","cus.o2c.*","sap.apf.*","tl.ibp.*","ux.fnd.apf.o2c.*","fnd.apf.*","fnd.pob.o2c.*","fcg.sll.*","ux.fnd.generic-apf-application.*","hpa.cei.*","query.viewbrowser.s1.*","ssuite.vdm.viewbrowser.s1.*","ssuite.smartbusiness.kpi.s1.*","ssuite.smartbusiness.evaluation.s1.*","ssuite.smartbusiness.association.s1.*","ssuite.smartbusiness.drilldown.s1.*","ssuite.smartbusiness.tile.s1.*","ssuite.smartbusiness.tile.ce.s1.*","ssuite.smartbusiness.workspace.s1.*","ssuite.smartbusiness.runtime.s1.*","gs.fin.customersummarycn.display.*","gs.fin.financialstatement.structure.manage.*","gs.fin.financialstatement.display.*","uipsm.*","publicservices.her.*"],getConfiguration:function(e){var i=this._getURLParamConfiguration();if(!i){i=this._getMetadataConfiguration(e)}if(!i){i=this._getDefaultConfiguration(e)}i.iSearchDepth=i.iSearchDepth||l.I_DEFAULT_SEARCH_DEPTH;if(typeof i.iSearchDepth==="string"&&!isNaN(i.iSearchDepth)){i.iSearchDepth=parseInt(i.iSearchDepth,10)}return i},_getURLParamConfiguration:function(){if(typeof r.getFiori2Adaptation!=="function"){return}var e=t.fromQuery(window.location.search);if(!e.get(l.S_FIORI20ADAPTER_URL_PARAM_NAME)){return}var i=r.getFiori2Adaptation();var a;var n;if(typeof i==="boolean"){a=i}else if(i&&i.length>=1){n=i}if(!n&&a===undefined){return}return{bStylePage:n?n.indexOf("style")>-1:a,bMoveTitle:n?n.indexOf("title")>-1:a,bHideBackButton:n?n.indexOf("back")>-1:a,bCollapseHeader:n?n.indexOf("collapse")>-1:a,bHierarchy:n?n.indexOf("hierarchy")>-1:a}},_getMetadataConfiguration:function(e){var t=e.getMetadata("config").getConfig(l.S_FIORI20ADAPTER_METADATA_PARAM_NAME);var a;var r;if(typeof t==="boolean"){a=t}else if(typeof t==="object"&&!i(t)){r=t}if(!r&&a===undefined){return}return{bStylePage:r?this._isSgnTrue(r.style):a,bMoveTitle:r?this._isSgnTrue(r.title):a,bHideBackButton:r?this._isSgnTrue(r.back):a,bCollapseHeader:r?this._isSgnTrue(r.collapse):a,bHierarchy:r?this._isSgnTrue(r.hierarchy):a,bLateAdaptation:r?this._isSgnTrue(r.lateAdaptation):l.B_DEFAULT_LATE_ADAPTATION}},_getDefaultConfiguration:function(e){var i=this._hasMinVersionSmallerThan(e,"1.42")&&this._isAllowed(e);return{bStylePage:i,bMoveTitle:i,bHideBackButton:i,bCollapseHeader:i,bHierarchy:i}},_isAllowed:function(e){var i=e.getMetadata().getName();for(var t=0;t<l.A_ALLOWLIST.length;t++){var a=l.A_ALLOWLIST[t].substring(0,l.A_ALLOWLIST[t].length-2);if(this._isPrefixedString(i,a)){return true}}return false},_isAdaptationRequired:function(e){for(var i in e){if(e[i]===true){return true}}return false},_isPrefixedString:function(e,i){return e&&i&&e.substring(0,i.length)===i},_hasMinVersionSmallerThan:function(e,i){var t=e.getMetadata().getManifestEntry("sap.ui5");var r=true;if(t&&t.dependencies&&t.dependencies.minUI5Version){var n=new a(t.dependencies.minUI5Version);r=n.compareTo(new a(i))<0}return r},_isSgnTrue:function(e){return e===true||e==="true"}};o._fnOnInstanceInitialized=function(i){var t=i.getAggregation("rootControl");if(!t||t.getId()==="navContainerFlp"||i.getId().indexOf("application-")!==0){return}var a=l.getConfiguration(i);if(!l._isAdaptationRequired(a)){return}if(!n.service||!s||typeof s.get!=="function"){e.warning("Fiori20Adapter not loaded because static FactoryRegistry is not available","sap.ui.core.service.ServiceFactoryRegistry should be a function","sap.ushell.Fiori20AdapterTest");return}var r={onBeforeRendering:function(){t.removeEventDelegate(r);var n=s.get("sap.ushell.ui5service.ShellUIService"),o=n&&n.createInstance();if(!n||!o){e.warning("Fiori20Adapter not loaded because ShellUIService is not available","sap.ushell.ui5service.ShellUIService should be declared by configuration","sap.ushell.Fiori20AdapterTest");return}o.then(function(e){if(e&&e.getUxdVersion()===2){u.applyTo(t,i,a,e)}},function(i){e.warning("Fiori20Adapter not loaded as ShellUIService is not available",i,"sap.ushell.Fiori20AdapterTest")})}};t.addEventDelegate(r)}});