/*!
* OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
*/
sap.ui.define(["./LinkWithIconRenderer","sap/ui/integration/library","sap/m/Link","sap/ui/core/Icon"],function(e,i,t,n){"use strict";var o=t.extend("sap.ui.integration.controls.LinkWithIcon",{metadata:{library:"sap.ui.integration",properties:{icon:{type:"sap.ui.core.URI",group:"Appearance",defaultValue:""}},aggregations:{_icon:{type:"sap.ui.core.Icon",multiple:false,visibility:"hidden"}}},renderer:e});o.prototype.onBeforeRendering=function(){t.prototype.onBeforeRendering.apply(this,arguments);if(this.getIcon()){this._getIcon().setSrc(this.getIcon())}this.addStyleClass("sapUiIntCardLinkWithIcon")};o.prototype._getIcon=function(){var e=this.getAggregation("_icon");if(!e){e=new n;this.setAggregation("_icon",e)}return e};return o});