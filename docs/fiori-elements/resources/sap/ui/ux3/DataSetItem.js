/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Element","./library"],function(e,t){"use strict";var i=e.extend("sap.ui.ux3.DataSetItem",{metadata:{deprecated:true,library:"sap.ui.ux3",properties:{iconSrc:{type:"sap.ui.core.URI",group:"Misc",defaultValue:null},title:{type:"string",group:"Misc",defaultValue:"Title"},checkable:{type:"boolean",group:"Misc",defaultValue:true},subtitle:{type:"string",group:"Misc",defaultValue:"Subtitle"}},aggregations:{_template:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"}},events:{selected:{parameters:{itemId:{type:"string"}}}}}});i.prototype.onclick=function(e){e.stopPropagation();var t=e.shiftKey;var i=!!(e.metaKey||e.ctrlKey);this.fireSelected({itemId:this.getId(),shift:t,ctrl:i})};i.prototype.ondblclick=function(e){this.onclick(e)};return i});