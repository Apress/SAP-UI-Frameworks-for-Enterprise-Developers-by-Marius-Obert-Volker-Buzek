/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var t={initials:function(t,n){var r=t.split(" "),n=!n?2:n,i="";r.forEach(function(t){i+=t.substring(0,1)});i=n===2?i.charAt(0)+i.charAt(i.length-1):i.substring(0,n);return i.toUpperCase()}};return t});