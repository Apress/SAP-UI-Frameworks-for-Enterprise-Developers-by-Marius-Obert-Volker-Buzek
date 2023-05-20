sap.ui.define([], function () {
    "use strict";

    var BIGMAP = {};
    var KPIVALUE = {};
    var sessionContext = "HANA_CLIENT";

    return {
        getCacheHanaClient : function (){
            return BIGMAP[sessionContext];
        },
        setCacheHanaClient : function (data){
            BIGMAP[sessionContext] = data;
        },
        getEvaluationByChipId : function (key) {
            if (BIGMAP[key]) {
                return BIGMAP[key];
            }
            return null;
        },
        getEvaluationById : function (key) {
            return this.getEvaluationByChipId(key);
        },
        setEvaluationById : function (key, data) {
            BIGMAP[key] = data;
        },
        getFrontEndCacheDeferredObject : function (key) {
            if (BIGMAP[key]) {
                return BIGMAP[key];
            }
            return null;
        },
        setFrontEndCacheDefferedObject : function (key, data) {
            BIGMAP[key] = data;
        },
        getKpivalueById : function (key){
            if (KPIVALUE[key]) {
                return KPIVALUE[key];
            }
            return null;
        },
        setKpivalueById : function (key, data) {
            KPIVALUE[key]  = data;
        }
    };
}, true /* bExport */);
