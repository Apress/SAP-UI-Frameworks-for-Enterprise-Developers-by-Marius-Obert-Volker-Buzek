/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/support/library"],function(e){"use strict";var t=e.Categories,s=e.Severity,i=e.Audiences;var a=function(e){return e.getDomRef().getBoundingClientRect().height};var n={id:"messagePageShouldNotBeInAContainerWithoutSetHeight",audiences:[i.Application],categories:[t.Usability],enabled:true,minversion:"1.28",title:"Message Page: In a container without set height",description:"Message Page should not be used in a container which has no set height",resolution:"Use Message Page in a container with set height, such as sap.m.App",resolutionurls:[{text:"sap.m.MessagePage API Reference",href:"https://sdk.openui5.org/api/sap.m.MessagePage"}],check:function(e,t,i){i.getElementsByClassName("sap.m.MessagePage").forEach(function(t){var i=t.getId(),n=a(t),g=t.getShowHeader()?a(t.getAggregation("_internalHeader")):0,o=n-g;if(t.getParent()===t.getUIArea()&&o<=0){e.addIssue({severity:s.High,details:"Message Page"+" ("+i+") is used in a container which has no height set.",context:{id:i}})}})}};var g={id:"messagePageShouldNotBeTopLevel",audiences:[i.Application],categories:[t.Usability],enabled:true,minversion:"1.28",title:"Message Page: Top-level control",description:"Message Page should not be a top-level control",resolution:"Use Message Page as described in the SAP Fiori Design Guidelines",resolutionurls:[{text:"SAP Fiori Design Guidelines: Message Page",href:"https://experience.sap.com/fiori-design-web/message-page"}],check:function(e,t,i){i.getElementsByClassName("sap.m.MessagePage").forEach(function(t){var i=t.getUIArea().getAggregation("content"),a=t.getId();if(i.length>1&&t.getParent()===t.getUIArea()){e.addIssue({severity:s.Medium,details:"Message Page"+" ("+a+") is a top-level control.",context:{id:a}})}})}};return[n,g]},true);