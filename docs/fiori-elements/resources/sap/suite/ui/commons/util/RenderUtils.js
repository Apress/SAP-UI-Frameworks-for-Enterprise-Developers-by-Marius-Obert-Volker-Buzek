/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object","sap/base/security/encodeXML"],function(e,t){"use strict";var r=function(e){this._rm=e};r.prototype=Object.create(e.prototype||null);r.prototype._getRenderManager=function(){if(!this._rm){throw new Error("Render manager not defined")}return this._rm};r.prototype.writeOpeningTag=function(e,r){r=r||{};var i=this._getRenderManager();var s;i.write("<");i.writeEscaped(e);if(r.classes){for(var a=0;a<r.classes.length;a++){i.addClass(t(r.classes[a]))}i.writeClasses()}if(r.attributes){for(s in r.attributes){i.writeAttribute(s,r.attributes[s])}}if(r.escapedAttributes){for(s in r.escapedAttributes){i.writeAttributeEscaped(s,r.escapedAttributes[s])}}i.write(">")};r.prototype.writeClosingTag=function(e){var t=this._getRenderManager();t.write("</");t.writeEscaped(e);t.write(">")};return r},true);