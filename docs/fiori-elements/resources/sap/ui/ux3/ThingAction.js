/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Element","./library"],function(e){"use strict";var t=e.extend("sap.ui.ux3.ThingAction",{metadata:{deprecated:true,library:"sap.ui.ux3",properties:{text:{type:"string",group:"Misc",defaultValue:null},enabled:{type:"boolean",group:"Misc",defaultValue:true}},events:{select:{parameters:{id:{type:"string"},action:{type:"sap.ui.ux3.ThingAction"}}}}}});t.prototype.onclick=function(e){this.fireSelect({id:this.getId(),action:this})};t.prototype.onsapselect=function(e){this.fireSelect({id:this.getId(),action:this})};return t});