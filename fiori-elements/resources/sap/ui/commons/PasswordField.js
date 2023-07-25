/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/thirdparty/jquery","./TextField","./library","./PasswordFieldRenderer","sap/ui/Device"],function(e,t,o,p,r){"use strict";var i=t.extend("sap.ui.commons.PasswordField",{metadata:{library:"sap.ui.commons",deprecated:true}});i.prototype.onfocusin=function(o){t.prototype.onfocusin.apply(this,arguments);if(!r.support.input.placeholder&&this.getPlaceholder()){e(this.getInputDomRef()).attr("type","password")}};i.prototype.onsapfocusleave=function(o){if(!r.support.input.placeholder&&this.getPlaceholder()){var p=e(this.getInputDomRef());if(!p.val()){p.removeAttr("type")}}t.prototype.onsapfocusleave.apply(this,arguments)};return i});