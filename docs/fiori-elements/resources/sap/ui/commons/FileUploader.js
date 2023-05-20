/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/Log","./library","sap/ui/unified/FileUploader","./FileUploaderRenderer","sap/ui/core/Core"],function(e,r,a,i,o){"use strict";var s=a.extend("sap.ui.commons.FileUploader",{metadata:{deprecated:true,library:"sap.ui.commons"}});try{sap.ui.getCore().loadLibrary("sap.ui.unified")}catch(r){e.error("The control 'sap.ui.commons.FileUploader' needs library 'sap.ui.unified'.");throw r}return s});