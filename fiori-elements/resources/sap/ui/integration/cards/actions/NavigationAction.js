/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./BaseAction","sap/ui/util/openWindow"],function(t,e){"use strict";var i=t.extend("sap.ui.integration.cards.actions.NavigationAction",{metadata:{library:"sap.ui.integration"}});i.prototype.execute=function(){var t=this.getResolvedConfig();if(t.service){return}var e=this.getParameters(),i,n,r,a;if(e){r=e.url;a=e.target}i=t.url||r;n=t.target||a||"_blank";if(i){this._openUrl(i,n)}};i.prototype._openUrl=function(t,i){e(t,i)};return i});