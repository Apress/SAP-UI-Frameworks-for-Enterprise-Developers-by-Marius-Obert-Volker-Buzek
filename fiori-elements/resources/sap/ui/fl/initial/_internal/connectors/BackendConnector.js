/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/initial/_internal/connectors/Utils","sap/base/util/restricted/_pick"],function(e,n){"use strict";return{xsrfToken:undefined,settings:undefined,sendRequest:function(t){var i=n(t,["version","allContexts"]);if(this.isLanguageInfoRequired){e.addLanguageInfo(i)}var s=e.getUrl(this.ROUTES.DATA,t,i);return e.sendRequest(s,"GET",{initialConnector:this,xsrfToken:this.xsrfToken}).then(function(e){var n=e.response;if(e.etag){n.cacheKey=e.etag}if(n.settings){this.settings=n.settings}return n}.bind(this))},loadFlexData:function(e){return this.sendRequest(e).then(function(e){e.changes=e.changes.concat(e.compVariants||[]);return e})}}});