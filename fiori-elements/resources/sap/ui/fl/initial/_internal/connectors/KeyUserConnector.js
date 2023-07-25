/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/merge","sap/ui/fl/initial/_internal/connectors/BackendConnector","sap/ui/fl/Layer"],function(e,n,a){"use strict";var t="/flex/keyuser";var c="/v2";var r=e({},n,{layers:[a.CUSTOMER,a.PUBLIC],API_VERSION:c,ROUTES:{DATA:t+c+"/data/"},isLanguageInfoRequired:true,loadFlexData:function(e){return n.sendRequest.call(r,e).then(function(e){e.contents.map(function(e,n,a){a[n].changes=(e.changes||[]).concat(e.compVariants)});e.contents.cacheKey=e.cacheKey;return e.contents})}});return r});