/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/actiontoolbar/ActionToolbarAction","../Util"],function(t,e){"use strict";var n={description:"{description}",name:"{name}",aggregations:{action:{propagateMetadata:function(t){return{actions:{rename:{changeType:"rename",domRef:function(t){return t.$()},getTextMutators:function(t){return{getText:function(){return t.getDomRef().textContent},setText:function(e){t.getDomRef().textContent=e}}}},remove:null,reveal:null}}}}},properties:{},actions:{}},o=["action"],i=[];return e.getDesignTime(t,i,o,n)});