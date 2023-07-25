/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2014 SAP AG. All rights reserved
 */
sap.ui.define([
	'sap/base/Log',
	'./MetadataException',
	'sap/ui/base/Object'
],
	function(Log, MetadataException, BaseObject) {
	"use strict";

	var TimelineTermsUtility = BaseObject.extend("sap.collaboration.components.socialtimeline.annotations.TimelineTermsUtility",{
		/**
		 * Constructor for the Timeline Terms Utility
		 * This class is responsible with providing the field mapping for the TimelineEntry entities of a given business object
		 *
		 * @class TimelineTermsUtility
		 * @name sap.collaboration.components.socialtimeline.annotations.TimelineTermsUtility
		 *
		 * @constructor
		 * @param oServiceMetadata {Object} Service Metadata returned from ODataModel.getServiceMetadata()
		 * @param oServiceAnnotations {Object} Service Annotations returned from ODataModel.getServiceAnnotations()
		 */
		constructor: function(oServiceMetadata, oServiceAnnotations){
			this._oLogger = Log.getLogger("sap.collaboration.components.socialtimeline.annotations.TimelineTermsUtility");
			this._oServiceMetadata = oServiceMetadata;
			this._oServiceAnnotations = oServiceAnnotations;
			this._oEntityMappings = {};
			// Services supported by the timeline must have the com.sap.vocabularies.Timeline.v1 namespace
			// defined in an Include element in their metadata document.
			this.sSchemaNamespace = "com.sap.vocabularies.Timeline.v1";
			var oSchema = this._getIncludedSchema(this.sSchemaNamespace);
			if (!(oSchema && oSchema.schemaNamespace === this.sSchemaNamespace)) {
				var sExceptionMessage = "Schema with namespace " + this.sSchemaNamespace + " wasn't in an Include in the service's metadata document.";
				this._oLogger.error(sExceptionMessage);
				throw new MetadataException(sExceptionMessage);
			}
		},
		/**
		 * Get the TimelineEntry navigation path for sEntityCollection
		 * @public
		 * @param sEntityCollection
		 * @returns {string}
		 */
		getTimelineEntryNavigationPath: function(sEntityCollection){
			if (!sEntityCollection){
				var oError = new Error('Parameter sEntityCollection is undefined');
				this._oLogger.error(oError.message);
				throw oError;
			}
			var oMapping = this._oEntityMappings[sEntityCollection];
			if (!oMapping){
				oMapping = this._buildMapping(sEntityCollection);
			}

			return oMapping.timelineEntryNavigationPath;
		},
		/**
		 * Get the TimelineEntry entity's fields
		 * @public
		 * @param sEntityCollection
		 * @returns {object} map of the TimelineEntry entity's fields
		 */
		getTimelineEntryFields: function(sEntityCollection){
			if (!sEntityCollection){
				var oError = new Error('Parameter sEntityCollection is undefined');
				this._oLogger.error(oError.message);
				throw oError;
			}
			var oMapping = this._oEntityMappings[sEntityCollection];
			if (!oMapping){
				oMapping = this._buildMapping(sEntityCollection);
			}

			var oTimelineEntryFields = this._oEntityMappings[sEntityCollection].timelineEntryFields;
			if (!oTimelineEntryFields){
				var oTimelineEntryEntityFields = this._oServiceAnnotations[oMapping.timelineEntryEntityTypeFull][this.sSchemaNamespace + ".TimelineEntry"];
				if (!oTimelineEntryEntityFields){
					oTimelineEntryEntityFields = this._oServiceAnnotations[oMapping.timelineEntryEntityTypeFull][this._getCollaborationAlias() + ".TimelineEntry"];
				}
				oTimelineEntryFields = this._mapEntityFields(oTimelineEntryEntityFields);
				this._oEntityMappings[sEntityCollection].timelineEntryFields = oTimelineEntryFields;
			}
			return oTimelineEntryFields;
		},
		/**
		 * Get the TimelineEntryDetail entity's fields
		 * @public
		 * @param sEntityCollection
		 * @returns {object} map of the TimelineEntry entity's fields
		 */
		getTimelineEntryDetailFields: function(sEntityCollection){
			if (!sEntityCollection){
				var oError = new Error('Parameter sEntityCollection is undefined');
				this._oLogger.error(oError.message);
				throw oError;
			}
			var oMapping = this._oEntityMappings[sEntityCollection];
			if (!oMapping){
				oMapping = this._buildMapping(sEntityCollection);
			}

			var oTimelineEntryDetailFields = this._oEntityMappings[sEntityCollection].timelineEntryDetailFields;
			if (!oTimelineEntryDetailFields){
				var oTimelineEntryDetailEntityFields = this._oServiceAnnotations[oMapping.timelineEntryDetailEntityTypeFull][this.sSchemaNamespace + ".TimelineDetailPropertyValueChange"];
				if (!oTimelineEntryDetailEntityFields){
					oTimelineEntryDetailEntityFields = this._oServiceAnnotations[oMapping.timelineEntryDetailEntityTypeFull][this._getCollaborationAlias() + ".TimelineDetailPropertyValueChange"];
				}
				oTimelineEntryDetailFields = this._mapEntityFields(oTimelineEntryDetailEntityFields);
				this._oEntityMappings[sEntityCollection].timelineEntryDetailFields = oTimelineEntryDetailFields;
			}
			return oTimelineEntryDetailFields;
		},

		/**
		 * Build mapping object for an entity collection
		 * @private
		 * @param sEntityCollection
		 * @returns {object} oMapping object
		 */
		_buildMapping: function(sEntityCollection){
			//build mapping object for entity collection and keep it for reuse
			this._oEntityMappings[sEntityCollection] = {};
			this._oEntityMappings[sEntityCollection].entityCollection = sEntityCollection;
			this._oEntityMappings[sEntityCollection].entityTypeFull = this._getEntityTypeFull(sEntityCollection);
			this._oEntityMappings[sEntityCollection].namespace = this._oEntityMappings[sEntityCollection].entityTypeFull.split(".")[0];
			this._oEntityMappings[sEntityCollection].entityType = this._oEntityMappings[sEntityCollection].entityTypeFull.split(".")[1];

			var oEntityTimelineNavigationPath = this._oServiceAnnotations[this._oEntityMappings[sEntityCollection].entityTypeFull][this.sSchemaNamespace + ".TimelineNavigationPath"];
			if (!oEntityTimelineNavigationPath){
				oEntityTimelineNavigationPath = this._oServiceAnnotations[this._oEntityMappings[sEntityCollection].entityTypeFull][this._getCollaborationAlias() + ".TimelineNavigationPath"];
			}
			this._oEntityMappings[sEntityCollection].timelineEntryNavigationPath = oEntityTimelineNavigationPath.NavigationPropertyPath;
			this._oEntityMappings[sEntityCollection].timelineEntryEntityTypeFull = this._getChildEntityTypeFull( this._oEntityMappings[sEntityCollection].entityType, this._oEntityMappings[sEntityCollection].timelineEntryNavigationPath );
			this._oEntityMappings[sEntityCollection].timelineEntryEntityType = this._oEntityMappings[sEntityCollection].timelineEntryEntityTypeFull.split(".")[1];
			this._oEntityMappings[sEntityCollection].timelineEntryFields = undefined;

			var oTimelineEntryEntityFields = this._oServiceAnnotations[this._oEntityMappings[sEntityCollection].timelineEntryEntityTypeFull][this.sSchemaNamespace + ".TimelineEntry"];
			if (!oTimelineEntryEntityFields){
				oTimelineEntryEntityFields = this._oServiceAnnotations[this._oEntityMappings[sEntityCollection].timelineEntryEntityTypeFull][this._getCollaborationAlias() + ".TimelineEntry"];
			}
			this._oEntityMappings[sEntityCollection].timelineEntryDetailNavigationPath = oTimelineEntryEntityFields.TimelineDetailNavigationPath.NavigationPropertyPath;
			this._oEntityMappings[sEntityCollection].timelineEntryDetailEntityTypeFull = this._getChildEntityTypeFull( this._oEntityMappings[sEntityCollection].timelineEntryEntityType, this._oEntityMappings[sEntityCollection].timelineEntryDetailNavigationPath );
			this._oEntityMappings[sEntityCollection].timelineEntryDetailFields = undefined;

			return this._oEntityMappings[sEntityCollection];
		},
		/**
		 * Get the full entity type from the service metadata for given entity collection
		 * @private
		 * @param sEntityCollection
		 * @returns {string} entityType
		 */
		_getEntityTypeFull: function(sEntityCollection){
			for (var i = this._oServiceMetadata.dataServices.schema.length - 1; i >= 0; i--) {
				var oMetadataSchema = this._oServiceMetadata.dataServices.schema[i];
				if (oMetadataSchema.entityContainer) {
					var aEntitySets = oMetadataSchema.entityContainer[0].entitySet;
					for (var j = aEntitySets.length - 1; j >= 0; j--) {
						if (aEntitySets[j].name === sEntityCollection) {
							return aEntitySets[j].entityType;
						}
					}
				}
			}
			throw new Error("Entity collection '" + sEntityCollection + "' could not be found in service");
		},
		/**
		 * Get the full entity type for a child entity
		 * @param sEntityType
		 * @param sNavigationPath
		 * @returns {object} returns an object from the service metadata representing the entity type of the Timeline Entry
		 */
		_getChildEntityTypeFull: function(sEntityType, sNavigationPath){
			var oEntityType = this._getEntityTypeObject(sEntityType);
			var oNavigationProperty = this._getNavigationProperty(oEntityType, sNavigationPath);
			var oAssociationEnd = this._getAssociationEnd(oNavigationProperty.toRole);

			return oAssociationEnd.type;
		},
		/**
		 * Get the entity type object
		 * @param sEntityType
		 * @returns {object} returns an object from the service metadata representing the entity type
		 */
		_getEntityTypeObject: function(sEntityType){
			for (var i = this._oServiceMetadata.dataServices.schema.length - 1; i >= 0; i--) {
				var oMetadataSchema = this._oServiceMetadata.dataServices.schema[i];
				if (oMetadataSchema.entityType) {
					var aEntityTypes = oMetadataSchema.entityType;
					for (var j = aEntityTypes.length - 1; j >= 0; j--) {
						if (aEntityTypes[j].name === sEntityType ) {
							return aEntityTypes[j];
						}
					}
				}
			}
			throw new Error("Entity Type '" + sEntityType + "' could not be found in service");
		},
		/**
		 * Get the navigation property object
		 * @param oEntityType
		 * @param sNavigationProperty
		 * @returns {object} returns an object from the service metadata representing the navigation property
		 */
		_getNavigationProperty: function(oEntityType, sNavigationProperty){
			if (oEntityType.navigationProperty){
				for (var k = oEntityType.navigationProperty.length - 1; k >= 0; k--) {
					if (oEntityType.navigationProperty[k].name === sNavigationProperty){
						return oEntityType.navigationProperty[k];
					}
				}
			}
			throw new Error("Navigation property '" + sNavigationProperty + "' could not be found for entity '" + oEntityType.name + "'.");
		},
		/**
		 * Get association end object
		 * @param sRole
		 * @returns {object} returns an object from the service metadata representing the association end
		 */
		_getAssociationEnd: function(sRole){
			for (var i = this._oServiceMetadata.dataServices.schema.length - 1; i >= 0; i--) {
				var oMetadataSchema = this._oServiceMetadata.dataServices.schema[i];
				if (oMetadataSchema.association) {
					for (var j = oMetadataSchema.association.length - 1; j >= 0; j--) {
						for (var k = oMetadataSchema.association[j].end.length - 1; k >= 0; k--){
							if ( oMetadataSchema.association[j].end[k].role === sRole ){
								return oMetadataSchema.association[j].end[k];
							}
						}
					}
				}
			}
			throw new Error("Association with role '" + sRole + "' could not be found in service.");
		},
		/**
		 * Returns an object map of an entity's field names
		 * @param oEntityFields
		 * @returns {object}
		 */
		_mapEntityFields: function(oEntityFields){
			var oFields = {};
			for (var oProperty in oEntityFields) {
				if (oEntityFields.hasOwnProperty(oProperty)) {
					if (oEntityFields[oProperty].Path) {
						oFields[oProperty] = oEntityFields[oProperty].Path;
					} else if (oEntityFields[oProperty].PropertyPath) {
						oFields[oProperty] = oEntityFields[oProperty].PropertyPath;
					} else if (oEntityFields[oProperty].EnumMember) {
						oFields[oProperty] = oEntityFields[oProperty].EnumMember;
					} else if (oEntityFields[oProperty].NavigationPropertyPath) {
						oFields[oProperty] = oEntityFields[oProperty].NavigationPropertyPath;
					}
				}
			}
			return oFields;
		},
		/**
		 * Get collaboration definition
		 * @returns {string}
		 */
		_getCollaborationAlias: function(){
			var aliasDefinitions = this._oServiceAnnotations.aliasDefinitions;
			for (var alias in aliasDefinitions){
				if (aliasDefinitions[alias].indexOf("com.sap.vocabularies.Timeline.v1") > -1){
					return alias;
				}
			}
		},



		/**
		 * Obtains the schema with the specified namespace from a Reference element in the metadata document. If
		 * the schema is defined within a Schema element, then this method returns undefined.
		 * @private
		 * @param sSchemaNamespace The namespace of the schema to return.
		 * @returns {object} Returns an object with the following structure: {schemaNamespace:"namespace", schemaAlias:"alias"}. If the schema doesn't use an alias,
		 * then the schemaAlias property value will be undefined. If the schema can't be found in a Reference element of the Metadata Document, then this method
		 * returns undefined.
		 */
		_getIncludedSchema: function(sSchemaNamespace) {
			// Iterate through the reference elements.
			var i = 0;
			var j = 0;
			var k = 0;
			var oReference;
			var oReferenceChild;
			var oIncludeAttribute;
			var oSchema = {schemaNamespace:undefined, schemaAlias:undefined};
			if (this._oServiceMetadata && this._oServiceMetadata.extensions) {
				// Iterate through the Reference elements.
				for (i = 0; i < this._oServiceMetadata.extensions.length; ++i) {
					oReference = this._oServiceMetadata.extensions[i];
					// Iterate through the child elements; we pay attention to the Include elements only.
					for (j = 0; j < oReference.children.length; ++j) {
						oReferenceChild = oReference.children[j];
						if (oReferenceChild.name == "Include") {
							// We then extract the Namespace and Alias attribute values.
							for (k = 0; k < oReferenceChild.attributes.length; ++k) {
								oIncludeAttribute = oReferenceChild.attributes[k];
								if (oIncludeAttribute.name == "Namespace") {
									oSchema.schemaNamespace = oIncludeAttribute.value;
								}
								if (oIncludeAttribute.name == "Alias") {
									oSchema.schemaAlias = oIncludeAttribute.value;
								}
							}
							// Return this schema if it matches the input namespace.
							if (oSchema.schemaNamespace == sSchemaNamespace) {
								return oSchema;
							}
						}
					}
				}
				// If the schema wasn't found within a Reference element, then return undefined.
				return undefined;
			}
			return undefined;
		}
	});

	return TimelineTermsUtility;

});
