/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/ActionToolbar","sap/m/p13n/Engine","../Util"],function(e,n,t){"use strict";var a=sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");var i={description:"{description}",name:"{name}",aggregations:{between:{propagateMetadata:function(e){if(e.isA("sap.ui.fl.variants.VariantManagement")){return null}return{actions:"not-adaptable"}}}},properties:{},actions:{settings:{name:a.getText("actiontoolbar.RTA_SETTINGS_NAME"),handler:function(e,t){return n.getInstance().getRTASettingsActionHandler(e,t,"actionsKey").then(function(e){return e})},CAUTION_variantIndependent:true}}},r=["actions","between"],s=[];return t.getDesignTime(e,s,r,i)});