/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/core/library","sap/m/library","sap/m/Dialog","sap/m/Button","sap/m/ProgressIndicator","sap/m/Text","sap/m/MessageBox","sap/ui/core/format/NumberFormat"],function(e,t,n,a,s,i,r,o){"use strict";var u=e.ValueState;var f=t.DialogType;var l=t.ButtonType;var T=sap.ui.getCore().getLibraryResourceBundle("sap.ui.export",true);function g(){return new Promise(function(e,t){var r;T.then(function(t){var o=new a({text:t.getText("CANCEL_BUTTON"),press:function(){if(r&&r.oncancel){r.oncancel()}r.finish()}});var l=new s({displayAnimation:false,displayValue:"0 / 0",showValue:true,height:"0.75rem",state:u.Information});l.addStyleClass("sapUiMediumMarginTop");var T=new i({text:t.getText("PROGRESS_FETCHING_MSG")});r=new n({title:t.getText("PROGRESS_TITLE"),type:f.Message,contentWidth:"500px",content:[T,l],endButton:o,ariaLabelledBy:[T]});r.updateStatus=function(e,n,a){var s;if(typeof e==="string"&&e){a=e;T.setText(a)}if(!isNaN(e)&!isNaN(n)){s=e/n*100}if(s>=100){l.setState(u.Success);o.setEnabled(false);T.setText(a||t.getText("PROGRESS_BUNDLE_MSG"))}l.setPercentValue(s);if(isNaN(n)||n<=0||n>=1048575){n="∞"}if(!isNaN(e)){l.setDisplayValue(""+e+" / "+n)}};r.finish=function(){r.close();r.destroy()};e(r)})})}function c(e){return new Promise(function(t,s){T.then(function(r){var T,g,c,p,x,E,N,R,_;x=o.getIntegerInstance({groupingEnabled:true});T=false;p="";if(!e.rows){p=r.getText("NO_COUNT_WARNING_MSG")}else{E=x.format(e.rows);if(e.sizeLimit){N=x.format(e.rows*e.columns);p=r.getText("SIZE_WARNING_MSG",[E,e.columns,N])}if(e.rows>e.cutOff){R=x.format(e.cutOff);p+=p===""?"":"\n\n";_=r.getText(e.fileType+"_FILETYPE");p+=r.getText("MSG_WARNING_CUT_OFF",[E,R,_])}}c=new i({text:p});g=new n({title:r.getText("WARNING_TITLE"),type:f.Message,state:u.Warning,content:c,ariaLabelledBy:c,endButton:new a({type:l.Transparent,text:r.getText("CANCEL_BUTTON"),press:function(){g.close()}}),beginButton:new a({type:l.Emphasized,text:r.getText("EXPORT_BUTTON"),press:function(){T=true;g.close()}}),afterClose:function(){g.destroy();T?t():s()}});g.open()})})}function p(e){if(!e){return}if(e instanceof Error){e=e.message}T.then(function(t){var n=e||t.getText("PROGRESS_ERROR_DEFAULT");if(e.toLowerCase().indexOf("invalid string length")>-1){n=t.getText("MSG_ERROR_OUT_OF_MEMORY")}r.error(n,{title:t.getText("PROGRESS_ERROR_TITLE")})})}return{getProgressDialog:g,showErrorMessage:p,showWarningDialog:c}},true);