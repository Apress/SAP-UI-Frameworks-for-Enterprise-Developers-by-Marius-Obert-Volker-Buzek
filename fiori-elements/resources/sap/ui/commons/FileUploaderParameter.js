/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/Log","./library","sap/ui/unified/FileUploaderParameter"],function(e,a,r){"use strict";var i=r.extend("sap.ui.commons.FileUploaderParameter",{metadata:{deprecated:true,library:"sap.ui.commons"}});try{sap.ui.getCore().loadLibrary("sap.ui.unified")}catch(a){e.error("The element 'sap.ui.commons.FileUploaderParameter' needs library 'sap.ui.unified'.");throw a}return i});