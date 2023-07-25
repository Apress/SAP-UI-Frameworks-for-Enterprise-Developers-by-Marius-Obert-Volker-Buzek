/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Element","sap/ui/thirdparty/jquery"],function(e,n){"use strict";return{domRef:function(t){var i=n.find(".mdcbaseinfoPanelListItem");var r=i.filter(function(n){return e.closestTo(n).getParent().getKey()===t.getId()});return r[0]},name:{singular:"p13nDialog.PANEL_ITEM_NAME",plural:"p13nDialog.PANEL_ITEM_NAME_PLURAL"},actions:{remove:function(){return{changeType:"hideItem"}},reveal:function(){return{changeType:"revealItem"}}},isVisible:function(e){return e.getVisible()}}});