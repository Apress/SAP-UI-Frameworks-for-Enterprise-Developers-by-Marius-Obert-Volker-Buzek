/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object","sap/ui/fl/changeHandler/PropertyChange","sap/base/Log"],function(e,t,n){var r=e.extend("sap.suite.ui.commons.flexibility.changeHandler.PropertyChangeMapper",{constructor:function(e,t){if(typeof e==="function"){this._fnProperty=e}else if(typeof e==="string"){this._fnProperty=function(){return e}}else{n.fatal("Incorrect type of property: "+typeof e)}if(typeof t==="function"){this._fnValue=t}else{this._fnValue=function(){return t}}}});r.prototype.applyChange=function(e,n,r){var o=e.getDefinition().content,a=o.property;if(Array.isArray(a)){a.forEach(function(a){o.property=a;t.applyChange(e,n,r)})}else{t.applyChange(e,n,r)}};r.prototype.completeChangeContent=function(e,n){var r=this._fnProperty(n),o=Object.assign(n,{content:{property:r,newValue:this._fnValue(r)}});t.completeChangeContent(e,o)};r.revertChange=function(e,n,r){var o=e.getDefinition().content,a=o.property;if(Array.isArray(a)){a.forEach(function(a){o.property=a;t.revertChange(e,n,r)})}else{t.revertChange(e,n,r)}};return r});