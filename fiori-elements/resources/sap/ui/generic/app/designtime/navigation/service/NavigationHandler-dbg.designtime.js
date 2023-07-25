/*
 * ! SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */

// Provides the Design Time Metadata for the sap.ui.generic.app.navigation.service.NavigationHandler control.
sap.ui.define([], function() {
	"use strict";
	return {
		annotations: {
			/**
			 * Defines whether a property is marked as sensitive. Sensitive properties will not be stored as application data. During the storage of
			 * application data, the properties annotated <codeY>IsPotentiallySensitive</code> will be removed from the application data. <b>Note:</b>
			 * The IsPotentiallySensitive processing will only take place when the model is of type {@linksap.ui.model.odata.v2.ODataModel ODataModel}.
			 * If the metadata is not yet fully loaded, an empty application state will be stored<br>
			 * <i>XML Example for OData V4 with IsSensitive BirthDay</i>
			 *
			 * <pre>
			 *    &lt;Annotations Target=&quot;BirthDay&quot; &gt;
			 *     &lt;Annotation Term=&quot;com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive&quot;/&gt;
			 *    &lt;/Annotations&gt;
			 * </pre>
			 */

			isSensitive: {
				namespace: "com.sap.vocabularies.PersonalData.v1",
				annotation: "IsPotentiallySensitive",
				target: [
					"Property"
				],
				appliesTo: [
					"selectionVariant, valueTexts"
				],
				group: [
					"Behavior"
				],
				since: "1.58.0"
			}
		}
	};
});