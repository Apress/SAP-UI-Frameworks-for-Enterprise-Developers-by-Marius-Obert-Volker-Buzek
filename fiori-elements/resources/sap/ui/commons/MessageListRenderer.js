/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var e={};e.render=function(e,r){e.write('<ul class="sapUiMsgList"');e.writeControlData(r);e.write(">");for(var s=r.aMessages.length-1;s>=0;s--){e.write('<li class="sapUiMsgListLi">');e.renderControl(r.aMessages[s]);e.write("</li>")}e.write("</ul>")};return e},true);