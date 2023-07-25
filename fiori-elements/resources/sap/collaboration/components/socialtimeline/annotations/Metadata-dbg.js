/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/base/Object'],
	function(BaseObject) {
	"use strict";

	var Metadata = BaseObject.extend("sap.collaboration.components.socialtimeline.annotations.Metadata", {
		constructor: function(oODataMetadata) {
			// namespace -> alias (For Schema that are included in an Include element as a child of a Reference element.)
			// namespace -> null (Means there's no alias for that namespace)
			// namespace -> undefined (Means the namespace isn't included.)
			this._oIncludedSchemaAliasMap = {};
			// namespace -> alias (For Schema that are defined as children of the DataServices element.)
			// namespace -> null (Means there's no alias for that namespace.)
			// namespace -> undefined (Means the namespace isn't defined.)
			this._oSchemaAliasMap = {};
			this._oODataMetadata = oODataMetadata;
			this._parseODataMetadata();
		},

		_parseODataMetadata: function() {
			this._parseReferenceElements(this._oODataMetadata.extensions);
			this._parseDataServicesElement(this._oODataMetadata.dataServices); // There can only be one of these.
		},

		_parseReferenceElements: function(aReferenceElements) {
			for (var iReferenceElementIndex in aReferenceElements) {
				this._parseReferenceElement(aReferenceElements[iReferenceElementIndex]);
			}
		},

		_parseReferenceElement: function(oReferenceElement) {
			for (var iReferenceElementChildIndex in oReferenceElement.children) {
				this._parseReferenceElementChild(oReferenceElement.children[iReferenceElementChildIndex]);
			}
		},

		_parseReferenceElementChild: function(oReferenceElementChild) {
			if (oReferenceElementChild.name === "Include") {
				this._parseIncludeElement(oReferenceElementChild);
			}
			else {
				// This means the child element is an IncludeAnnotations element, which we don't support.
				return;
			}
		},

		_parseIncludeElement: function(oIncludeElement) {
			var sIncludeElementNamespace = null; // This must be specified! The spec demands it!
			var sIncludeElementAlias = null; // This may not be an attribute because it is optional.
			for (var iIncludeElementAttributeIndex in oIncludeElement.attributes) {
				if (oIncludeElement.attributes[iIncludeElementAttributeIndex].name === "Namespace") {
					sIncludeElementNamespace = oIncludeElement.attributes[iIncludeElementAttributeIndex].value;
				}
				else {
					sIncludeElementAlias = oIncludeElement.attributes[iIncludeElementAttributeIndex].value;
				}
			}
			this._oIncludedSchemaAliasMap[sIncludeElementNamespace] = sIncludeElementAlias;
		},

		_parseDataServicesElement: function(oDataServicesElement) {
			this._parseSchemaElements(oDataServicesElement.schema);

		},

		_parseSchemaElements: function(aSchemaElements) {
			for (var iSchemaElementIndex in aSchemaElements) {
				this._parseSchemaElement(aSchemaElements[iSchemaElementIndex]);
			}
		},

		_parseSchemaElement: function(oSchemaElement) {
			if (oSchemaElement.alias === undefined) {
				this._oSchemaAliasMap[oSchemaElement.namespace] = null;
			}
			else {
				this._oSchemaAliasMap[oSchemaElement.namespace] = oSchemaElement.alias;
			}
			this._parseEntityTypeElements(oSchemaElement.entityType);
		},

		_parseEntityTypeElements: function(aEntityTypeElements) {
			for (var iEntityTypeElementIndex in aEntityTypeElements) {
				this._parseEntityTypeElement(aEntityTypeElements[iEntityTypeElementIndex]);
			}
		},

		_parseEntityTypeElement: function() {

		},

		isSchemaIncluded: function (sNamespace) {
			return (this._oIncludedSchemaAliasMap[sNamespace] !== undefined);
		}
	});

	return Metadata;

});
