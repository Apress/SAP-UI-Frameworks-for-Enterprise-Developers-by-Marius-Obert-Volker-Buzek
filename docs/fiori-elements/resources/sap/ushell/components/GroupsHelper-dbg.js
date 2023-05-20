// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([], function () {
    "use strict";

    return {
        getIndexOfGroup: getIndexOfGroup,
        getModelPathOfGroup: getModelPathOfGroup
    };

    /**
     * Get the path for the given group in context of the groups model
     *
     * @param {Array} aGroups Group list
     * @param {String} sGroupId Group id
     *
     * @return {String} Return the path to the group like "/groups/0"
     */
    function getModelPathOfGroup (aGroups, sGroupId) {
        var iGroupIndex = getIndexOfGroup(aGroups, sGroupId);
        if (iGroupIndex < 0) {
            return null;
        }
        return "/groups/" + iGroupIndex;
    }

    /**
     * Get the index of the group first group from the list with given id.
     *
     * @param {Array} aGroups Group list
     * @param {String} sGroupId Group id
     *
     * @return {Number} Return the index of the group or -1 if the group was not found by id
     */
    function getIndexOfGroup (aGroups, sGroupId) {
        for (var i = 0; i < aGroups.length; i++) {
            if (aGroups[i].groupId === sGroupId) { return i; }
        }
        return -1;
    }
});
