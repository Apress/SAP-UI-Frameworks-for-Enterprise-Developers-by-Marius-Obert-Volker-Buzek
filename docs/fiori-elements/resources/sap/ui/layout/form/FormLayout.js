/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Control","sap/ui/core/Element","sap/ui/layout/library","./FormLayoutRenderer","sap/ui/core/theming/Parameters","sap/ui/thirdparty/jquery","sap/ui/core/Configuration","sap/ui/dom/jquery/Selectors"],function(e,t,r,i,n,o,a){"use strict";var f=r.BackgroundDesign;var l=e.extend("sap.ui.layout.form.FormLayout",{metadata:{library:"sap.ui.layout",properties:{backgroundDesign:{type:"sap.ui.layout.BackgroundDesign",group:"Appearance",defaultValue:f.Translucent}}},renderer:i});l.prototype.init=function(){this._sFormTitleSize="H4";this._sFormSubTitleSize="H5"};l.prototype.onBeforeRendering=function(e){this.loadTitleSizes()};l.prototype.contentOnAfterRendering=function(e,t){if(r.form.FormHelper.bArrowKeySupport){o(t.getFocusDomRef()).data("sap.InNavArea",true)}if(t.getWidth&&(!t.getWidth()||t.getWidth()=="auto")&&(!t.getFormDoNotAdjustWidth||!t.getFormDoNotAdjustWidth())){t.$().css("width","100%")}};l.prototype.toggleContainerExpanded=function(e){var t=e.getExpanded();if(this.getDomRef()){if(t){e.$("content").css("display","")}else{e.$("content").css("display","none")}}};l.prototype.getLayoutDataForElement=function(e,t){var r=e.getLayoutData();if(!r){return undefined}else if(r.isA(t)){return r}else if(r.isA("sap.ui.core.VariantLayoutData")){var i=r.getMultipleLayoutData();for(var n=0;n<i.length;n++){var o=i[n];if(o.isA(t)){return o}}}};l.prototype.onsapright=function(e){if(r.form.FormHelper.bArrowKeySupport){var t=a.getRTL();if(!t){this.navigateForward(e)}else{this.navigateBack(e)}}};l.prototype.onsapleft=function(e){if(r.form.FormHelper.bArrowKeySupport){var t=a.getRTL();if(!t){this.navigateBack(e)}else{this.navigateForward(e)}}};l.prototype.onsapdown=function(e){if(r.form.FormHelper.bArrowKeySupport){var t=e.srcControl;var i;var n=this.findElement(t);var o=n.element;t=n.rootControl;if(o&&o.isA("sap.ui.layout.form.FormElement")){i=this.findFieldBelow(t,o)}else if(o&&o.isA("sap.ui.layout.form.FormContainer")){i=this.findFirstFieldOfNextElement(o,0)}if(i){i.focus();e.preventDefault()}}};l.prototype.onsapup=function(e){if(r.form.FormHelper.bArrowKeySupport){var t=e.srcControl;var i=0;var n;var o=this.findElement(t);var a=o.element;t=o.rootControl;if(a&&a.isA("sap.ui.layout.form.FormElement")){n=this.findFieldAbove(t,a)}else if(a&&a.isA("sap.ui.layout.form.FormContainer")){var f=a.getParent();i=f.indexOfFormContainer(a);n=this.findLastFieldOfLastElementInPrevContainer(f,i-1)}if(n){n.focus();e.preventDefault()}}};l.prototype.onsaphome=function(e){if(r.form.FormHelper.bArrowKeySupport){var t=e.srcControl;var i=0;var n;var o=this.findElement(t);var a=o.element;var f=a.getParent();var l=f.getParent();i=l.indexOfFormContainer(f);n=this.findFirstFieldOfFirstElementInNextContainer(l,i);if(n){n.focus();e.preventDefault()}}};l.prototype.onsaptop=function(e){if(r.form.FormHelper.bArrowKeySupport){var t=e.srcControl;var i=this.findElement(t);var n=i.element;var o;var a;if(n&&n.isA("sap.ui.layout.form.FormElement")){a=n.getParent()}else if(n&&n.isA("sap.ui.layout.form.FormContainer")){a=n}var f=a.getParent();o=this.findFirstFieldOfForm(f);if(o){o.focus();e.preventDefault()}}};l.prototype.onsapend=function(e){if(r.form.FormHelper.bArrowKeySupport){var t=e.srcControl;var i=0;var n;var o=this.findElement(t);var a=o.element;var f=a.getParent();var l=f.getParent();i=l.indexOfFormContainer(f);n=this.findLastFieldOfLastElementInPrevContainer(l,i);if(n){n.focus();e.preventDefault()}}};l.prototype.onsapbottom=function(e){if(r.form.FormHelper.bArrowKeySupport){var t=e.srcControl;var i=this.findElement(t);var n=i.element;var o;var a;if(n&&n.isA("sap.ui.layout.form.FormElement")){a=n.getParent()}else if(n&&n.isA("sap.ui.layout.form.FormContainer")){a=n}var f=a.getParent();var l=f.getFormContainers();var s=l.length;o=this.findLastFieldOfLastElementInPrevContainer(f,s-1);if(o){o.focus();e.preventDefault()}}};l.prototype.onsapexpand=function(e){var t=e.srcControl;var r=this.findElement(t);var i=r.element;var n;if(i.isA("sap.ui.layout.form.FormContainer")){n=i}else{n=i.getParent()}if(n.getExpandable()&&t===n._oExpandButton){n.setExpanded(true)}};l.prototype.onsapcollapse=function(e){var t=e.srcControl;var r=this.findElement(t);var i=r.element;var n;if(i.isA("sap.ui.layout.form.FormContainer")){n=i}else{n=i.getParent()}if(n.getExpandable()&&t===n._oExpandButton){n.setExpanded(false)}};l.prototype.onsapskipforward=function(e){var t=e.srcControl;var r=this.findElement(t);var i=r.element;t=r.rootControl;var n;var o;if(i&&i.isA("sap.ui.layout.form.FormElement")){o=i.getParent()}else if(i&&i.isA("sap.ui.layout.form.FormContainer")){o=i}var a=o.getParent();var f=a.indexOfFormContainer(o);n=this.findFirstFieldOfFirstElementInNextContainer(a,f+1);if(n){n.focus();e.preventDefault()}};l.prototype.onsapskipback=function(e){var t=e.srcControl;var r=this.findElement(t);var i=r.element;t=r.rootControl;var n;var o;if(i&&i.isA("sap.ui.layout.form.FormElement")){o=i.getParent()}else if(i&&i.isA("sap.ui.layout.form.FormContainer")){o=i}var a=o.getParent();var f=a.getFormContainers();var l=a.indexOfFormContainer(o);while(!n&&l>0){var s=f[l-1];if(!s.getExpandable()||s.getExpanded()){n=this.findFirstFieldOfFirstElementInPrevContainer(a,l-1)}l=l-1}if(n&&n!==t.getFocusDomRef()){n.focus();e.preventDefault()}};l.prototype.onBeforeFastNavigationFocus=function(e){if(o.contains(this.getDomRef(),e.source)){e.srcControl=t.closestTo(e.source);if(e.forward){this.onsapskipforward(e)}else{this.onsapskipback(e)}}else{var r=e.forward?this.findFirstFieldOfForm(this.getParent()):this.findFirstFieldOfLastContainerOfForm(this.getParent());if(r){r.focus();e.preventDefault()}}};l.prototype.findElement=function(e){var t=e.getParent();var r=e;while(t&&!t.isA("sap.ui.layout.form.FormElement")&&!t.isA("sap.ui.layout.form.FormContainer")&&!t.isA("sap.ui.layout.form.Form")){r=t;t=t.getParent()}return{rootControl:r,element:t}};l.prototype.navigateForward=function(e){var t=e.srcControl;var r=0;var i;var n=this.findElement(t);var o=n.element;t=n.rootControl;if(o&&o.isA("sap.ui.layout.form.FormElement")){if(t==o.getLabelControl()){r=-1}else{r=o.indexOfField(t)}i=this.findNextFieldOfElement(o,r+1);if(!i){var a=o.getParent();r=a.indexOfFormElement(o);i=this.findFirstFieldOfNextElement(a,r+1);if(!i){var f=a.getParent();r=f.indexOfFormContainer(a);i=this.findFirstFieldOfFirstElementInNextContainer(f,r+1)}}}else if(o&&o.isA("sap.ui.layout.form.FormContainer")){i=this.findFirstFieldOfNextElement(o,0)}if(i){i.focus();e.preventDefault()}};l.prototype.tabForward=function(e){var t;var r=e.srcControl;var i=0;var n;var o=this.findElement(r);var a=o.element;r=o.rootControl;if(a&&a.isA("sap.ui.layout.form.FormElement")){if(r==a.getLabelControl()){i=-1}else{i=a.indexOfField(r)}n=this.findNextFieldOfElement(a,i+1,true);if(!n){var f=a.getParent();i=f.indexOfFormElement(a);n=this.findFirstFieldOfNextElement(f,i+1,true);if(!n){t=f.getParent();i=t.indexOfFormContainer(f);n=this.findFirstFieldOfFirstElementInNextContainer(t,i+1,true)}}}else if(a&&a.isA("sap.ui.layout.form.FormContainer")){n=this.findFirstFieldOfNextElement(a,0,true);if(!n){t=a.getParent();i=t.indexOfFormContainer(a);n=this.findFirstFieldOfFirstElementInNextContainer(t,i+1,true)}}if(n){n.focus();e.preventDefault()}};l.prototype.findNextFieldOfElement=function(e,t,r){var i=e.getFieldsForRendering();var n=i.length;var o;for(var a=t;a<n;a++){var f=i[a];var l=this._getDomRef(f);if(r==true){if((!f.getEditable||f.getEditable())&&(!f.getEnabled||f.getEnabled())&&l){o=l;break}}else{if((!f.getEnabled||f.getEnabled())&&l){o=l;break}}}return o};l.prototype.findFirstFieldOfNextElement=function(e,t,r){var i=e.getFormElements();var n=i.length;var o;var a=t;while(!o&&a<n){var f=i[a];if(r==true){o=this.findNextFieldOfElement(f,0,true)}else{o=this.findNextFieldOfElement(f,0)}a++}return o};l.prototype.findFirstFieldOfForm=function(e){var t=this.findFirstFieldOfFirstElementInNextContainer(e,0);return t};l.prototype.findFirstFieldOfLastContainerOfForm=function(e){var t;var r=e.getFormContainers();var i=r.length;while(!t&&i>0){var n=r[i-1];if(!n.getExpandable()||n.getExpanded()){t=this.findFirstFieldOfFirstElementInPrevContainer(e,i-1)}i=i-1}return t};l.prototype.findFirstFieldOfFirstElementInNextContainer=function(e,t,r){var i=e.getFormContainers();var n=i.length;var o;var a=t;while(!o&&a<n){var f=i[a];if(f.getExpandable()&&r){o=f._oExpandButton.getFocusDomRef();if(o){break}}if(!f.getExpandable()||f.getExpanded()){if(r==true){o=this.findFirstFieldOfNextElement(f,0,true)}else{o=this.findFirstFieldOfNextElement(f,0)}}a++}return o};l.prototype.findFirstFieldOfFirstElementInPrevContainer=function(e,t){var r=e.getFormContainers();var i=r.length;var n;var o=t;while(!n&&o<i&&o>=0){var a=r[o];if(!a.getExpandable()||a.getExpanded()){n=this.findFirstFieldOfNextElement(a,0)}o++}return n};l.prototype.navigateBack=function(e){var t;var r=e.srcControl;var i=0;var n;var o=this.findElement(r);var a=o.element;r=o.rootControl;if(a&&a.isA("sap.ui.layout.form.FormElement")){if(r==a.getLabelControl()){i=0}else{i=a.indexOfField(r)}n=this.findPrevFieldOfElement(a,i-1);if(!n){var f=a.getParent();i=f.indexOfFormElement(a);n=this.findLastFieldOfPrevElement(f,i-1);if(!n){t=f.getParent();i=t.indexOfFormContainer(f);n=this.findLastFieldOfLastElementInPrevContainer(t,i-1)}}}else if(a&&a.isA("sap.ui.layout.form.FormContainer")){t=a.getParent();i=t.indexOfFormContainer(a);n=this.findLastFieldOfLastElementInPrevContainer(t,i-1)}if(n){n.focus();e.preventDefault()}};l.prototype.tabBack=function(e){var t;var r=e.srcControl;var i=0;var n;var o=this.findElement(r);var a=o.element;r=o.rootControl;if(a&&a.isA("sap.ui.layout.form.FormElement")){if(r==a.getLabelControl()){i=0}else{i=a.indexOfField(r)}n=this.findPrevFieldOfElement(a,i-1,true);if(!n){var f=a.getParent();i=f.indexOfFormElement(a);n=this.findLastFieldOfPrevElement(f,i-1,true);if(!n){t=f.getParent();i=t.indexOfFormContainer(f);if(f.getExpandable()){n=f._oExpandButton.getFocusDomRef()}if(!n){n=this.findLastFieldOfLastElementInPrevContainer(t,i-1,true)}}}}else if(a&&a.isA("sap.ui.layout.form.FormContainer")){t=a.getParent();i=t.indexOfFormContainer(a);n=this.findLastFieldOfLastElementInPrevContainer(t,i-1,true)}if(n){n.focus();e.preventDefault()}};l.prototype.findPrevFieldOfElement=function(e,t,r){var i=e.getFieldsForRendering();var n;for(var o=t;o>=0;o--){var a=i[o];var f=this._getDomRef(a);if(r==true){if((!a.getEditable||a.getEditable())&&(!a.getEnabled||a.getEnabled())&&f){n=f;break}}else{if((!a.getEnabled||a.getEnabled())&&f){n=f;break}}}return n};l.prototype.findLastFieldOfPrevElement=function(e,t,r){var i=e.getFormElements();var n;var o=t;while(!n&&o>=0){var a=i[o];var f=a.getFieldsForRendering().length;if(r==true){n=this.findPrevFieldOfElement(a,f-1,true)}else{n=this.findPrevFieldOfElement(a,f-1)}o--}return n};l.prototype.findLastFieldOfLastElementInPrevContainer=function(e,t,r){var i=e.getFormContainers();var n;var o=t;while(!n&&o>=0){var a=i[o];if(a.getExpandable()&&!a.getExpanded()&&r){n=a._oExpandButton.getFocusDomRef();if(n){break}}if(!a.getExpandable()||a.getExpanded()){var f=a.getFormElements().length;if(r==true){n=this.findLastFieldOfPrevElement(a,f-1,true)}else{n=this.findLastFieldOfPrevElement(a,f-1,0)}}o--}return n};l.prototype.findFieldBelow=function(e,t){var r=t.getParent();var i=r.indexOfFormElement(t);var n=this.findFirstFieldOfNextElement(r,i+1);if(!n){var o=r.getParent();i=o.indexOfFormContainer(r);n=this.findFirstFieldOfFirstElementInNextContainer(o,i+1)}return n};l.prototype.findFieldAbove=function(e,t){var r=t.getParent();var i=r.indexOfFormElement(t);var n=r.getFormElements();var o;var a=i-1;while(!o&&a>=0){var f=n[a];o=this.findPrevFieldOfElement(f,0);a--}if(!o){var l=r.getParent();i=l.indexOfFormContainer(r);o=this.findLastFieldOfLastElementInPrevContainer(l,i-1)}return o};l.prototype._getDomRef=function(e){var t=e.getFocusDomRef();if(!o(t).is(":sapFocusable")){t=undefined}return t};l.prototype.getContainerRenderedDomRef=function(e){if(this.getDomRef()){return e.getDomRef()}else{return null}};l.prototype.getElementRenderedDomRef=function(e){if(this.getDomRef()){return e.getDomRef()}else{return null}};l.prototype.getLayoutDataForDelimiter=function(){};l.prototype.getLayoutDataForSemanticField=function(e,t,r){};l.prototype.loadTitleSizes=function(){var e=n.get({name:["sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormTitleSize","sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormSubTitleSize"],callback:this.applyTitleSizes.bind(this)});if(e&&e.hasOwnProperty("sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormTitleSize")){this.applyTitleSizes(e,true)}};l.prototype.applyTitleSizes=function(e,t){if(e&&(this._sFormTitleSize!==e["sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormTitleSize"]||this._sFormSubTitleSize!==e["sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormSubTitleSize"])){this._sFormTitleSize=e["sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormTitleSize"];this._sFormSubTitleSize=e["sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormSubTitleSize"];if(!t){this.invalidate()}}};return l});