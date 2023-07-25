// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/thirdparty/jquery","sap/m/Button","./ShellFloatingActionRenderer","sap/ushell/library"],function(t,e,i){"use strict";var l=e.extend("sap.ushell.ui.shell.ShellFloatingAction",{metadata:{library:"sap.ushell"},renderer:i});l.prototype.init=function(){this.addStyleClass("sapUshellShellFloatingAction");if(e.prototype.init){e.prototype.init.apply(this,arguments)}};l.prototype.exit=function(){e.prototype.exit.apply(this,arguments)};l.prototype.onAfterRendering=function(){if(this.data("transformY")){this.removeStyleClass("sapUshellShellFloatingActionTransition");t(this.getDomRef()).css("transform","translateY("+this.data("transformY")+")")}else{this.addStyleClass("sapUshellShellFloatingActionTransition")}};return l});