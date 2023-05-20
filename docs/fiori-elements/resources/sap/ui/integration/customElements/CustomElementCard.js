/*!
* OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
*/
sap.ui.require(["sap/ui/integration/widgets/Card","sap/ui/integration/customElements/CustomElementBase","sap/m/BadgeCustomData"],function(t,e,i){"use strict";var n=e.extend(t,{privateProperties:["width","height"],customProperties:{badge:{set:function(t,e){t.addCustomData(new i({value:e}))}}}});n.prototype.refresh=function(){this._getControl().refresh()};n.prototype.loadDesigntime=function(){return this._getControl().loadDesigntime()};e.define("ui-integration-card",n)});