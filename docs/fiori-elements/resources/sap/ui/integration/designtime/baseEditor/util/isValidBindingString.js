/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/BindingParser"],function(r){"use strict";function n(e,i){var t;try{var a=e.replace(/{{([^{]*)}}/g,function(r,e){if(n(e)){return"${}"}throw"Invalid binding string"});t=r.complexParser(a)}catch(r){return false}return i!==false?true:!!t}return n});