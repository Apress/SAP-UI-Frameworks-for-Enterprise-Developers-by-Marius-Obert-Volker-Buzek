/**
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/base/Object","sap/ui/model/resource/ResourceModel"],function(e,n){"use strict";var o=sap.ui.require.toUrl("sap/collaboration/components/resources/i18n/messagebundle.properties");var t=e.extend("sap.collaboration.components.util.LanguageBundle",{constructor:function(){this.i18nModel=new n({bundleUrl:o});this.oLangBundle=this.i18nModel.getResourceBundle()},getText:function(e,n){return this.oLangBundle.getText(e,n)},createResourceModel:function(){return this.i18nModel}});return t});