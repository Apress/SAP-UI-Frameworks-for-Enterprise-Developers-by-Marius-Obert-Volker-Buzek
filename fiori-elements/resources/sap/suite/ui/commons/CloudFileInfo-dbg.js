sap.ui.define([
    'sap/ui/base/ManagedObject'
], function(ManagedObject) {
    'use strict';

    var CloudFileInfo = ManagedObject.extend("sap.suite.ui.commons.CloudFileInfo", {
        metadata: {
			library: "sap.suite.ui.commons",
			properties: {
                /**
                 * FileShare ID of the selected instance.
                 */
                fileShareId : {type : "string", group : "Data"},
                /**
                 * FileShareItem ID of the selected instance.
                 */
                fileShareItemId : {type : "string", group : "Data"},
                /**
                 * Indicate if a FileShareItem is a folder or not
                 */
                isFolder : {type : "boolean", group : "Data"},
                /**
                 * ID of the parent of the selected instance.
                 */
                parentFileShareItemId : {type : "string", group : "Data"},
                /**
                 * Name of the file share instance.
                 */
                fileShareItemName : {type : "string", group : "Data"},
                /**
                 * Name of the user that creates the instance.
                 */
                createdByUser : {type : "string", group : "Data"},
                /**
                 * Time of the instance creation.
                 */
                creationDateTime : {type : "string", group : "Data"},
                /**
                 * Last user to change the instance.
                 */
                lastChangedByUser : {type : "string", group : "Data"},
                /**
                 * Time of the last changes on the instance.
                 */
                lastChangeDateTime : {type : "string", group : "Data"},
                /**
                 * Content of the file share item instance.
                 */
                fileShareItemContent : {type : "string", group : "Data"},
                /**
                 * Content type of the file share instance.
                 */
                fileShareItemContentType : {type : "string", group : "Data"},
                /**
                 * Size of the file share item isntance.
                 */
                fileShareItemContentSize : {type : "string", group : "Data"},
                /**
                 * Link to the file share item instance.
                 */
                fileShareItemContentLink : {type : "string", group : "Data"},
                /**
                 * Indicate if an action is a allowed or not
                 */
                isDocumentCreationAllowed : {type : "boolean", group : "Data"}
            }
		}
	});

    return CloudFileInfo;
});