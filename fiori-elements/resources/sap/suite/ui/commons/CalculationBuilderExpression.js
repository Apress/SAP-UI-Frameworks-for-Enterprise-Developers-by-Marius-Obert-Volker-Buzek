sap.ui.define(["sap/ui/thirdparty/jquery","./library","./CalculationBuilderItem","sap/ui/core/Control","sap/ui/core/Popup","sap/ui/core/delegate/ItemNavigation","sap/m/MessageBox","sap/m/OverflowToolbar","sap/m/OverflowToolbarToggleButton","sap/m/OverflowToolbarButton","sap/m/ToolbarSpacer","sap/m/Title","sap/m/Button","sap/m/FlexBox","sap/m/HBox","sap/m/VBox","sap/m/library","sap/m/SegmentedButton","sap/m/SegmentedButtonItem","sap/m/StepInput","sap/m/Input","sap/m/Page","sap/m/List","sap/m/StandardListItem","sap/m/NavContainer","sap/m/SearchField","sap/m/Label","sap/m/Panel","sap/m/ResponsivePopover","sap/m/Toolbar","sap/m/MessageStrip","./CalculationBuilderValidationResult","sap/suite/ui/commons/ControlProxy","sap/ui/core/Icon","sap/ui/core/library","sap/ui/thirdparty/jqueryui/jquery-ui-core","sap/ui/thirdparty/jqueryui/jquery-ui-widget","sap/ui/thirdparty/jqueryui/jquery-ui-mouse","sap/ui/thirdparty/jqueryui/jquery-ui-draggable","sap/ui/thirdparty/jqueryui/jquery-ui-droppable","sap/ui/thirdparty/jqueryui/jquery-ui-selectable"],function(e,t,i,r,n,a,s,o,l,u,p,c,d,_,h,g,f,I,m,C,E,T,A,L,v,y,B,R,b,O,S,N,x,P,U){"use strict";var D=f.PlacementType;var w=f.ListType;var F=f.ListMode;var V=f.FlexRendertype;var K=U.TextAlign;var G=U.ValueState;var M=t.CalculationBuilderItemType,k=t.CalculationBuilderOperatorType,j=t.CalculationBuilderComparisonOperatorType,Y=t.CalculationBuilderLogicalOperatorType,$=t.CalculationBuilderLayoutType,X=f.FlexDirection;var q=Object.freeze({PAGE_MAIN:"-pagemain",PAGE_OPERATORS:"-pageoperators",PAGE_VARIABLE:"-pagevariable",PAGE_FUNCTIONS:"-pagefunctions",LABEL_LITERALS:"-literalInput-label",INPUT_LITERALS:"-literalInput-field"});var H=Object.freeze({OPERATORS_CATEGORY:"sap-icon://attachment-html",LITERALS_CATEGORY:"sap-icon://grid",VARIABLES_CATEGORY:"sap-icon://notes",FUNCTIONS_CATEGORY:"sap-icon://chalkboard",DELETE:"sap-icon://delete"});var z=Object.freeze({KEY_PREVIOUS:"previous",KEY_NEXT:"next",MOUSE:"mouse"});var W="##DEFAULT##";var Q=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");var J=r.extend("sap.suite.ui.commons.CalculationBuilderExpression",{metadata:{library:"sap.suite.ui.commons",defaultAggregation:"items",aggregations:{items:{type:"sap.suite.ui.commons.CalculationBuilderItem",multiple:true,singularName:"item",bindable:"bindable"},variables:{type:"sap.suite.ui.commons.CalculationBuilderVariable",multiple:true,singularName:"Variable"},functions:{type:"sap.suite.ui.commons.CalculationBuilderFunction",multiple:true,singularName:"Function"},operators:{type:"sap.ui.core.Item",multiple:true,singularName:"operator"},groups:{type:"sap.suite.ui.commons.CalculationBuilderGroup",multiple:true,singularName:"Group"}},events:{change:{}}},renderer:{apiVersion:2,render:function(e,t){e.openStart("div",t);e.class("sapCalculationBuilderInner");e.openEnd();t._renderDelimiter(e,0);t.getItems().forEach(function(i,r){i._iIndex=r;i._bReadOnly=t._bReadOnly;e.renderControl(i);t._renderDelimiter(e,r+1)},this);if(!t._bReadOnly){e.renderControl(t._getNewItem())}e.openStart("div");e.class("sapCalculationBuilderSelected");e.openEnd();e.close("div");e.close("div");e.openStart("div",t.getId()+"-erroricon");e.class("sapCalculationBuilderExpressionErrorIcon");e.openEnd();e.renderControl(t._getErrorIcon());e.close("div")}}});J.prototype.init=function(){this._aErrors=[];this._bAreSelectedItemsDeleting=false;this._bDragging=false;this._bIsCalculationBuilderRendering=false};J.prototype._renderDelimiter=function(e,t){e.openStart("div");e.attr("index",t);e.class("sapCalculationBuilderDelimiter").class("sapCalculationBuilderDroppable");e.openEnd();e.openStart("div");e.class("sapCalculationBuilderDroppableLine");e.openEnd();e.close("div");e.openStart("div");e.class("sapCalculationBuilderDroppableCircle");e.openEnd();e.close("div");e.openStart("div");e.class("sapCalculationBuilderDelimiterNewButton");e.openEnd();e.openStart("span");e.attr("role","presentation");e.attr("aria-hidden","true");e.attr("data-sap-ui-icon-content","");e.class("sapUiIcon").class("sapUiIconMirrorInRTL").class("sapCalculationBuilderDelimiterNewButtonIcon").class("sapCalculationBuilderExpressionSAPFont");e.openEnd();e.close("span");e.close("div");e.close("div")};J.prototype.onBeforeRendering=function(){if(!this.getParent()._oInput._aVariables.length){this._createVariablesMap();this.getParent()._oInput._aVariables=this.getParent().getVariables()}this._reset();this._createPopup();this.getParent()._enableOrDisableExpandAllButton();this._aErrors=this._validateSyntax();this._fireAfterValidation();this._bIsCalculationBuilderRendering=true;this._bRendered=false};J.prototype.onAfterRendering=function(){this._bIsCalculationBuilderRendering=false;if(!this._bReadOnly){this._setupDroppable();this._setupSelectable();this._setupNewButtonEvents()}this._setupKeyboard();this._bRendered=true;var e=this.getParent();if(e._bRendered){e._setExpression(e._oInput._itemsToString({items:this.getItems(),errors:this._aErrors}));e._oInput._displayError(this._aErrors.length!==0)}};J.prototype.onsapfocusleave=function(){if(!this._bAreSelectedItemsDeleting){this._deselect()}};J.prototype.onsapenter=function(e){this._handleEnter(e)};J.prototype.onsapspace=function(t){if(e(t.target).hasClass("sapCalculationBuilderItem")){this._handleSpace(t)}};J.prototype.onsappreviousmodifiers=function(e){if(e.ctrlKey){this._handleCtrlPrevious(e)}};J.prototype.onsapnextmodifiers=function(e){if(e.ctrlKey){this._handleCtrlNext(e)}};J.prototype.onsapdelete=function(e){this._handleDelete(e)};J.prototype.exit=function(){if(this._oPopover){this._oPopover.destroy()}if(this._oItemNavigation){this.removeDelegate(this._oItemNavigation);this._oItemNavigation.destroy()}if(this._oErrorIcon){this._oErrorIcon.destroy();this._oErrorIcon=null}};J.prototype._getErrorIcon=function(){if(!this._oErrorIcon){this._oErrorIcon=new P({src:"sap-icon://message-error",useIconTooltip:false,size:"20px"})}return this._oErrorIcon};J.prototype._createPopup=function(){var e={footerButtons:[]};this._createPopoverLayout(e);this._createPopoverFunctionsItems(e);this._createPopoverOperatorsItems(e);this._createPopoverNavContainer(e);this._createPopover(e)};J.prototype._reset=function(){this.getItems().forEach(function(e){e._reset()});if(this._oPopover){this._oPopover.destroy();this._oPopover=null}};J.prototype._createPopoverLayout=function(e){var t=function(e){return new d({text:e,press:this._updateOrCreateItem.bind(this,{type:M.Operator,key:e})}).addStyleClass("sapUiTinyMarginEnd")}.bind(this);var i=new h({renderType:V.Div,width:"100%"});i.addStyleClass("sapCalculationBuilderItemPopupOperators");i.addStyleClass("sapCalculationBuilderItemPopupOptionItem");Object.keys(k).forEach(function(e){if(this.getParent()._isTokenAllowed(e)){var r=t(k[e]);if(e===k[","]){this._attachAriaLabelToButton(r,Q.getText("CALCULATION_BUILDER_COMMA_ARIA_LABEL"))}else if(e===k["-"]){this._attachAriaLabelToButton(r,Q.getText("CALCULATION_BUILDER_MINUS_ARIA_LABEL"))}i.addItem(r)}}.bind(this));var r=this._createPopoverLiteralLabelAndInput(e);var n=new g({items:[i,r],alignItems:"Start"});n.addStyleClass("sapCalculationBuilderItemPopupOperatorsAndInputWrapper");e.layout=n.getItems().length>0?n:null};J.prototype._createPopoverLiteralLabelAndInput=function(e){var t=new B({id:this.getId()+q.LABEL_LITERALS,text:Q.getText("CALCULATION_BUILDER_LITERAL_INPUT_LABEL")});var i;if(this.getParent().getAllowStringLiterals()){i=new E({id:this.getId()+q.INPUT_LITERALS,width:"100%",placeholder:Q.getText("CALCULATION_BUILDER_ADD_LITERAL_FIELD_PLACEHOLDER_ANY_STRING"),valueStateText:Q.getText("CALCULATION_BUILDER_ADD_LITERAL_FIELD_PLACEHOLDER_ERROR"),liveChange:function(t){var i=t.getSource(),r=t.getParameter("value"),n=r.indexOf('"')===-1;i.setValueState(n?G.None:G.Error);e.footerButtons.okButton.setEnabled(n)},submit:function(e){this._submitLiteralInput(i)}.bind(this)})}else{i=new C({width:"100%",placeholder:Q.getText("CALCULATION_BUILDER_ADD_LITERAL_FIELD_PLACEHOLDER"),textAlign:K.Right,valueStateText:Q.getText("CALCULATION_BUILDER_ADD_LITERAL_FIELD_ERROR_TEXT"),displayValuePrecision:3,change:function(){e.footerButtons.okButton.setEnabled(true)}});if(i._getInput){var r=i._getInput();if(r){r.attachSubmit(function(e){this._submitLiteralInput(i)},this)}}}i.addAriaLabelledBy(t);e.literalInput=i;var n=new g({renderType:V.Div,items:[t,i],width:"100%"});n.addStyleClass("sapCalculationBuilderItemPopupOptionItem");n.addStyleClass("sapCalculationBuilderItemPopupLiteralLabelAndInput");return n};J.prototype._createPopoverVariablesItems=function(e){if(!e){return[]}var t=[];e.forEach(function(e){var i=new L({title:e._getLabel()});i._calculationBuilderKey=e.getKey();t.push(i)},this);t=t.sort(function(e,t){return e.getTitle().localeCompare(t.getTitle())});var i=new A({mode:F.SingleSelectMaster,selectionChange:function(e){this._updateOrCreateItem({type:M.Variable,key:e.getParameter("listItem")._calculationBuilderKey})}.bind(this),items:t});this._oSearchField=new y({placeholder:Q.getText("CALCULATION_BUILDER_SEARCH_VARIABLE"),liveChange:function(e){var r=e.getSource().getValue();if(r||r===""){i.removeAllItems();t.forEach(function(e){if(e.getTitle().toLowerCase().indexOf(r.toLowerCase())!==-1){i.addItem(e)}})}}});this._aVariableLists.push(i);return[this._oSearchField,i]};J.prototype._createPopoverFunctionsItems=function(e){var t=this,i=this.getParent();var r=function(e){return new L({title:e.title,description:e.description,type:w.Active,customData:[{key:"functionKey",value:e.key}],press:e.press})};e.functionList=new A({mode:F.SingleSelectMaster,itemPress:function(){this.getSelectedItem().firePress()}});i._getAllFunctions().forEach(function(i){e.functionList.addItem(r({key:i.key,title:i.title,description:i.description,press:t._updateOrCreateItem.bind(t,{key:i.key,type:i.type,functionObject:i.functionObject})}))})};J.prototype._createPopoverOperatorsItems=function(e){var t=this.getParent();var i=function(e,i){var r=[];Object.keys(e).forEach(function(n){var a,s,o=e[n];if(t._isTokenAllowed(n)){if(typeof o==="object"){s=o.getText();a=o.getKey()}else{a=s=o}var l=new d({text:s,press:this._updateOrCreateItem.bind(this,{type:i,key:a})}).addStyleClass("sapCalculationBuilderPopoverOperatorsButton").addStyleClass("sapUiTinyMarginEnd");if(n===j["!="]){this._attachAriaLabelToButton(l,Q.getText("CALCULATION_BUILDER_NOT_EQUAL_ARIA_LABEL"))}r.push(l)}}.bind(this));return r}.bind(this);var r=function(e,t,r){var n=i(t,r);if(n.length>0){return new R({content:[new B({width:"100%",text:e}).addStyleClass("sapUiTinyMarginBottom"),n]})}return null};e.operatorsItems=[];if(this.getParent().getAllowComparisonOperators()){var n=r(Q.getText("CALCULATION_BUILDER_COMPARISON_TITLE_SELECT"),j,M.Operator);n&&e.operatorsItems.push(n)}if(this.getParent().getAllowLogicalOperators()){var a=r(Q.getText("CALCULATION_BUILDER_LOGICAL_TITLE_SELECT"),Y,M.Operator);a&&e.operatorsItems.push(a)}var s=this.getParent().getOperators();if(s.length>0){e.operatorsItems.push(r(Q.getText("CALCULATION_BUILDER_OPERATORS_TITLE"),s,M.CustomOperator))}};J.prototype._createPopoverNavContainer=function(e){var t=function(e){var t=o.getPage(e);o.to(t)};var i=function(){var e=new S({type:"Error",showIcon:true}).addStyleClass("sapUiTinyMarginBegin sapUiTinyMarginEnd sapUiTinyMarginTop");this._aStrips.push(e);return e}.bind(this);this._aStrips=[];var r=[];var n=this._createPopoverVariablesItems(this._mGroups[W]);if(n.length>0){r.push(new L({title:Q.getText("CALCULATION_BUILDER_VARIABLES_TITLE"),description:Q.getText("CALCULATION_BUILDER_VARIABLES_CATEGORY_DESCRIPTION"),wrapping:true,icon:H.VARIABLES_CATEGORY,press:t.bind(this,this.getId()+q.PAGE_VARIABLE),type:w.Active}))}var a=e.functionList.getItems();if(a.length>0){r.push(new L({title:Q.getText("CALCULATION_BUILDER_FUNCTIONS_TITLE"),type:w.Active,description:Q.getText("CALCULATION_BUILDER_FUNCTIONS_CATEGORY_DESCRIPTION"),wrapping:true,icon:H.FUNCTIONS_CATEGORY,press:t.bind(this,this.getId()+q.PAGE_FUNCTIONS)}))}if(e.operatorsItems.length>0){r.unshift(new L({title:Q.getText("CALCULATION_BUILDER_OPERATORS_TITLE"),type:w.Active,description:Q.getText("CALCULATION_BUILDER_OPERATORS_CATEGORY_DESCRIPTION"),wrapping:true,icon:H.OPERATORS_CATEGORY,press:t.bind(this,this.getId()+q.PAGE_OPERATORS)}))}this.getGroups().forEach(function(e){r.push(new L({title:e._getTitle(),type:w.Active,description:e.getDescription(),icon:e.getIcon(),press:t.bind(this,this.getId()+e.getKey())}))}.bind(this));var s=new T({id:this.getId()+q.PAGE_MAIN,title:Q.getText("CALCULATION_BUILDER_DIALOG_TITLE"),content:[i(),e.layout,new _({direction:X.Column,items:[new A({items:r})]}).addStyleClass("sapUiSmallMarginBeginEnd").addStyleClass("sapUiTinyMarginTop").addStyleClass("sapCalculationBuilderNavMainPage")]});s.setFooter(this._getPageFooter(s.getId(),e));var o=new v({defaultTransitionName:"show",navigate:function(t){var i=t.getParameters().to;i.setFooter(this._getPageFooter(i.getId(),e))}.bind(this),pages:[s]});if(e.operatorsItems.length>0){o.addPage(new T({id:this.getId()+q.PAGE_OPERATORS,content:[i(),new _({direction:X.Column,items:[e.operatorsItems]}).addStyleClass("sapUiSmallMarginBeginEnd").addStyleClass("sapUiTinyMarginTop")],showNavButton:true,title:Q.getText("CALCULATION_BUILDER_OPERATORS_PAGE_TITLE"),navButtonPress:t.bind(this,this.getId()+q.PAGE_MAIN)}))}if(n.length>0){o.addPage(new T({id:this.getId()+q.PAGE_VARIABLE,content:[i(),new _({direction:X.Column,items:n}).addStyleClass("sapUiSmallMarginBeginEnd").addStyleClass("sapUiTinyMarginTop")],showNavButton:true,title:Q.getText("CALCULATION_BUILDER_VARIABLES_PAGE_TITLE"),navButtonPress:t.bind(this,this.getId()+q.PAGE_MAIN)}))}if(a.length>0){o.addPage(new T({id:this.getId()+q.PAGE_FUNCTIONS,content:[i(),new _({direction:X.Column,items:[e.functionList]}).addStyleClass("sapUiSmallMarginBeginEnd").addStyleClass("sapUiTinyMarginTop")],showNavButton:true,title:Q.getText("CALCULATION_BUILDER_FUNCTIONS_PAGE_TITLE"),navButtonPress:t.bind(this,this.getId()+q.PAGE_MAIN)}))}this.getGroups().forEach(function(e){var r=new T({id:this.getId()+e.getKey(),showNavButton:true,title:e._getTitle(),navButtonPress:t.bind(this,this.getId()+q.PAGE_MAIN),content:i()});var n=e.getCustomView();if(n){var a=new x;a.setAssociation("control",n);r.addContent(a)}else{r.addContent(new _({direction:X.Column,items:this._createPopoverVariablesItems(this._mGroups[e.getKey()])}).addStyleClass("sapUiSmallMarginBeginEnd").addStyleClass("sapUiTinyMarginTop"))}o.addPage(r)}.bind(this));e.navContainer=o};J.prototype._callFunctionFireSelection=function(e){this.getGroups().forEach(function(t){if(t.getCustomView()){t.fireSetSelection({key:e})}})};J.prototype._clearVariableLists=function(){this._aVariableLists.forEach(function(e){var t=e.getSelectedItem();if(t){e.setSelectedItem(t,false)}});this._callFunctionFireSelection()};J.prototype._setVariableListSelection=function(e){for(var t=0;t<this._aVariableLists.length;t++){var i=this._aVariableLists[t],r=this._aVariableLists[t].getItems();for(var n=0;n<r.length;n++){if(r[n]._calculationBuilderKey===e){i.setSelectedItem(r[n],true);return}}}this._callFunctionFireSelection(e)};J.prototype._sanitizeStringLiteral=function(e){if(this.getParent()._isStringLiteral(e)){e=e.substring(1,e.length-1)}return e};J.prototype._clearSearchField=function(){if(this._oSearchField){this._oSearchField.setValue("");this._oSearchField.fireLiveChange()}};J.prototype._createPopover=function(e){var t=function(){var t=this._oCurrentItem,i=e.navContainer.getCurrentPage().getId(),r=e.functionList.getSelectedItem(),n,a,s;var o=this.getParent().getAllowStringLiterals()?"":0;e.literalInput.setValue(o);this._clearVariableLists();this._clearSearchField();if(r){e.functionList.setSelectedItem(r,false)}if(!t){n=this.getId()+q.PAGE_MAIN}else{if(t._isFunction()){s=t.getKey();n=this.getId()+q.PAGE_FUNCTIONS;a=e.functionList.getItems();for(var l=0;l<a.length;l++){var u=a[l].data("functionKey");if((u&&u.toLowerCase())===s.toLowerCase()){e.functionList.setSelectedItem(a[l],true);break}}}else if(t._isLiteral()){var p=this._sanitizeStringLiteral(t.getKey());e.literalInput.setValue(p);e.literalInput.setValueState(G.None);n=this.getId()+q.PAGE_MAIN}else if(t._isVariable()){this._setVariableListSelection(t.getKey());var c=t._oVariable||t.getVariable(),d=c&&c.getGroup()||q.PAGE_VARIABLE;n=this.getId()+d}else if(t._isSecondaryOperator()){n=this.getId()+q.PAGE_OPERATORS}else{n=this.getId()+q.PAGE_MAIN}}if(n!==i){if(n!==this.getId()+q.PAGE_MAIN){e.navContainer.backToPage(this.getId()+q.PAGE_MAIN)}e.navContainer.to(e.navContainer.getPage(n),"show")}else{e.navContainer.getCurrentPage().setFooter(this._getPageFooter(i,e))}var _=this._oCurrentItem&&this._oCurrentItem._getItemError(),h=_&&" "+_.title;this._aStrips.forEach(function(e){e.setVisible(!!_);e.setText(h?Q.getText("CALCULATION_BUILDER_INCORRECT_SYNTAX")+h:"")})}.bind(this);this._oPopover=new b({showHeader:false,resizable:true,placement:D.PreferredBottomOrFlip,contentWidth:"400px",contentHeight:"450px",content:[e.navContainer],beforeOpen:t,afterClose:function(){this._bDragging=false;this._clearNewButtonPositions()}.bind(this)})};J.prototype._submitLiteralInput=function(t){var i=t.getValue();if(this.getParent()&&this.getParent().getAllowStringLiterals()&&!e.isNumeric(i)){i='"'+i+'"'}this._updateOrCreateItem({type:M.Literal,key:i});t.setValueState(G.None)};J.prototype._getPageFooter=function(e,t){var i=false,r=false,n=false;if(this._oCurrentItem&&!this._oCurrentItem._bIsNew){r=true;n=this._oCurrentItem._isLiteral()}i=t.literalInput.getValueState()===G.None&&e===this.getId()+q.PAGE_MAIN&&n;t.footerButtons.okButton=new d({enabled:i,text:Q.getText("CALCULATION_BUILDER_CONFIRM_BUTTON"),press:function(e){this._submitLiteralInput(t.literalInput)}.bind(this)});t.footerButtons.deleteButton=new d({enabled:r,text:Q.getText("CALCULATION_BUILDER_DELETE_BUTTON"),press:this._deleteItem.bind(this)});t.footerButtons.closeButton=new d({text:Q.getText("CALCULATION_BUILDER_CLOSE_BUTTON"),press:this._instantClose.bind(this)});return new O({content:[new p,t.footerButtons.okButton,t.footerButtons.deleteButton,t.footerButtons.closeButton]})};J.prototype._insertFunctionItems=function(e,t){var i=function(t){e.push(t)};if(t&&t.length>0){t.forEach(function(e){i(e)})}else{i("")}i(")")};J.prototype._updateOrCreateItem=function(e){var t=!this._oCurrentItem||this._oCurrentItem._bIsNew,i=this._oCurrentItem&&!this._oCurrentItem.getKey(),r=this.getParent(),n=e.functionObject,a=this.getItems();var s=function(){var t=e.type===M.Function?n.template:r._convertToTemplate(n.getItems());this._insertFunctionItems(u,t)}.bind(this);var o=function(){var e=isNaN(this._iCurrentIndex)?this.getItems().length:this._iCurrentIndex,t=this._getKeys();this._smartRender(t.slice(0,e).concat(u,t.slice(e)))}.bind(this);var l=function(){for(var e=0;e<a.length;e++){if(a[e]===this._oCurrentItem){return e+1}}return null}.bind(this);if(t){var u=[e.key];if(n){s()}o()}else{this._oCurrentItem.setKey(e.key);if(e.type){this._oCurrentItem._sType=e.type}if(i&&n){var u=[];this._iCurrentIndex=l();s();o()}}this._instantClose();this._fireChange()};J.prototype._expandAllVariables=function(){this.getItems().forEach(function(e){if(e.isExpandable()){e._expandVariable(false)}});this._fireChange()};J.prototype._handleDelete=function(e){if(this._isEmptySelected()){return}this._bAreSelectedItemsDeleting=true;s.show(Q.getText("CALCULATION_BUILDER_DELETE_MESSAGE_TEXT"),{icon:s.Icon.WARNING,title:Q.getText("CALCULATION_BUILDER_DELETE_MESSAGE_TITLE"),actions:[s.Action.YES,s.Action.CANCEL],onClose:function(e){if(e===s.Action.YES){var t=this.$().find(".sapCalculationBuilderSelected .sapCalculationBuilderItem"),i=t.length,r=t.first(),n=sap.ui.getCore().byId(r.attr("id"));if(n){var a=this._getKeys();a.splice(n._iIndex,i);this._smartRender(a);this._fireChange()}}this._bAreSelectedItemsDeleting=false}.bind(this)})};J.prototype._handleEnter=function(t){var i=e(t.target),r;if(this._oItemNavigation&&!this._bReadOnly){if(i.hasClass("sapCalculationBuilderNewItem")){r=this._getNewItem();if(r){r._buttonPress(t)}}else if(i.hasClass("sapCalculationBuilderItem")){r=this._getItemById(i[0].id);if(r){r._buttonPress(t)}}else if(i.hasClass("sapCalculationBuilderItemExpandButton")){r=this._getItemById(i.closest(".sapCalculationBuilderItem")[0].id);if(r){r._expandButtonPress(t)}}}};J.prototype._createVariablesMap=function(){this._mGroups={};this._aVariableLists=[];this.getVariables().forEach(function(e){var t=e.getGroup()||W;if(!this._mGroups[t]){this._mGroups[t]=[]}this._mGroups[t].push(e)}.bind(this))};J.prototype._handleSpace=function(e){this._selectItem(e.target)};J.prototype._handleCtrlNext=function(e){this._moveItems(z.KEY_NEXT)};J.prototype._handleCtrlPrevious=function(e){this._moveItems(z.KEY_PREVIOUS)};J.prototype._getVariableByKey=function(e){var t=this.getVariables();if(!e){return null}e=e.toLowerCase();for(var i=0;i<t.length;i++){if(t[i].getKey().toLowerCase()===e){return t[i]}}return null};J.prototype.setTitle=function(e){var t=this._oToolbarTitle;if(t){t.setText(e);t.setVisible(!!e)}this.setProperty("title",e)};J.prototype._getKeys=function(){return this.getItems().map(function(e){return e.getKey()})};J.prototype._deleteItem=function(){var e=this._getKeys();e.splice(this._oCurrentItem._iIndex,1);this._smartRender(e);this._instantClose();this._fireChange()};J.prototype._openDialog=function(e){this._oCurrentItem=e.currentItem;this._iCurrentIndex=e.index;this._oPopover.openBy(e.opener)};J.prototype._setupDroppable=function(t){var i=this;t=t||this.$().find(".sapCalculationBuilderDroppable");t.droppable({scope:i.getId()+"-scope",tolerance:"pointer",activeClass:"sapCalculationBuilderDroppableActive",hoverClass:"sapCalculationBuilderDroppableActive",drop:function(t,r){if(!r.draggable.hasClass("sapCalculationBuilderSelected")){i._selectItem(r.draggable[0])}i._moveItems(z.MOUSE,parseInt(e(this).attr("index"),10));i._bDragging=false},over:function(e,t){i._bDragging=true}})};J.prototype._clearNewButtonPositions=function(){var e=this.$();e.find(".sapCalculationBuilderDelimiterNewButton").hide(200);e.find(".sapCalculationBuilderItem").animate({left:0},300)};J.prototype._setupNewButtonEvents=function(){var t=13,i=300;var r=this.$().find(".sapCalculationBuilderDelimiter[data-events!='bound']"),n=this.$().find(".sapCalculationBuilderDelimiterNewButton[data-events!='bound']"),a=this,s,o;var l=function(e,t){e.prev().animate({left:-t},i);e.next().animate({left:t},i)};n.on("click",function(t){var i=e(this),r=parseInt(i.parent().attr("index"),10);i.css("opacity",1);a._oCurrentItem=null;a._iCurrentIndex=r;a._openDialog({opener:this,index:r})});n.attr("data-events","bound");r.on("mouseover",function(i){var r=e(this);if(!a._bDragging&&!a._oPopover.isOpen()){s=true;o=setTimeout(function(){if(s){s=false;l(r,t);r.find(".sapCalculationBuilderDelimiterNewButton").show(200)}},400)}});r.on("mouseout",function(t){var i=e(this).find(".sapCalculationBuilderDelimiterNewButton"),r=e(this);if(t.target===i[0]&&t.relatedTarget===r[0]){return}s=false;clearTimeout(o);if(a._bDragging||a._oPopover.isOpen()){return}if(!i.is(":hover")){l(r,0);i.hide(200)}});r.attr("data-events","bound")};J.prototype._setupSelectable=function(){this.$().selectable({cancel:".sapCalculationBuilderCancelSelectable",distance:5,start:function(){this._deselect();this._instantClose()}.bind(this),stop:function(){this._selectItems(this.$().find(".sapCalculationBuilderItem.ui-selected"))}.bind(this)})};J.prototype._selectItemsTo=function(t){var i=e(t.next(".sapCalculationBuilderDelimiter")[0]),r=i.attr("index")-1,n=this.$(),a,s,o,l,u;if(t.parent().hasClass("sapCalculationBuilderSelected")||this._isEmptySelected()){this._selectItem(t);return}if(r>this._iLastSelectedIndex){a=this._iFirstSelectedIndex;s=r+1}else{a=r;s=this._iLastSelectedIndex+1}this._deselect();l=n.find('.sapCalculationBuilderDelimiter[index="'+a+'"]');u=n.find('.sapCalculationBuilderDelimiter[index="'+s+'"]');o=l.nextUntil(u,".sapCalculationBuilderItem");this._selectItems(o)};J.prototype._selectItems=function(e){for(var t=0;t<e.length;t++){this._selectItem(e[t])}};J.prototype._selectItem=function(t){var i=this.$().find(".sapCalculationBuilderSelected"),r=e(t),n=e(r.next(".sapCalculationBuilderDelimiter")[0]),a=i[0].children.length,s=n.attr("index")-1,o=true;if(!this._oItemNavigation||!this._getItemById(r[0].id)||this._bReadOnly){return}if(a===0){this._iFirstSelectedIndex=s;this._iLastSelectedIndex=s}else{if(r.parent().hasClass("sapCalculationBuilderSelected")){if(this._iFirstSelectedIndex===s){this._iFirstSelectedIndex++;this._deselectItem(r,false)}else if(this._iLastSelectedIndex===s){this._iLastSelectedIndex--;this._deselectItem(r,true)}else{this._deselect()}this._setCorrectFocus();return}if(this._iFirstSelectedIndex-s===1){this._iFirstSelectedIndex=s;o=false}else if(s-this._iLastSelectedIndex===1){this._iLastSelectedIndex=s;o=true}else{this._iFirstSelectedIndex=s;this._iLastSelectedIndex=s;this._deselect()}}var l=this.$();if(this._isEmptySelected()){i.detach().insertBefore(r);i.draggable({revert:"invalid",cursor:"move",axis:"x",scope:this.getId()+"-scope",helper:function(e){var t=i.clone();t.removeClass("sapCalculationBuilderSelected");t.addClass("sapCalculationBuilderDraggingSelectedClone");return t},start:function(){i.addClass("sapCalculationBuilderDragging");l.find(".sapCalculationBuilderItemContent").css("cursor","move")},stop:function(){i.removeClass("sapCalculationBuilderDragging");l.find(".sapCalculationBuilderItemContent").css("cursor","pointer")}})}if(o){r.detach().appendTo(i);n.detach().appendTo(i)}else{n.detach().prependTo(i);r.detach().prependTo(i)}if(r.hasClass("sapCalculationBuilderItem")){r.draggable("disable");r.addClass("ui-selected")}this._setCorrectFocus()};J.prototype._isEmptySelected=function(){var e=this.$().find(".sapCalculationBuilderSelected");if(e){return e.is(":empty")}return true};J.prototype._deselectItem=function(t,i){var r=this.$().find(".sapCalculationBuilderSelected"),n=e(t.next(".sapCalculationBuilderDelimiter")[0]);if(!t.hasClass("ui-selected")){return}if(i){n.detach().insertAfter(r);t.detach().insertAfter(r)}else{t.detach().insertBefore(r);n.detach().insertBefore(r)}t.draggable("enable");t.removeClass("ui-selected")};J.prototype._deselect=function(){var t=this.$().find(".sapCalculationBuilderSelected");if(this._isEmptySelected()){return}this.$().find(".sapCalculationBuilderSelected .ui-selected").removeClass("ui-selected");t.children().each(function(){var i=e(this);if(i.hasClass("sapCalculationBuilderItem")){i.draggable("enable")}i.detach().insertBefore(t)})};J.prototype._setupKeyboard=function(){var e=this.getDomRef(),t=[];this.getItems().forEach(function(e){t.push(e.getFocusDomRef());if(e.isExpandable()){t.push(e.$("expandbutton"))}});t.push(this._getNewItem().getFocusDomRef());if(!this._oItemNavigation){this._oItemNavigation=new a;this.addDelegate(this._oItemNavigation)}this._oItemNavigation.setRootDomRef(e);this._oItemNavigation.setItemDomRefs(t);this._oItemNavigation.setCycling(true);this._oItemNavigation.setPageSize(250)};J.prototype._setCorrectFocus=function(){e(this._oItemNavigation.getFocusedDomRef()).focus()};J.prototype._getItemById=function(e){return this.getItems().filter(function(t){return t.getId()===e})[0]};J.prototype._getNewItem=function(){if(!this._oNewItem){this._oNewItem=new i;this._oNewItem._bIsNew=true;this._oNewItem.setParent(this,null,true)}return this._oNewItem};J.prototype._instantClose=function(){var e=this._oPopover.getAggregation("_popup");if(e&&e.oPopup&&e.oPopup.close){e.oPopup.close(0);this._setCorrectFocus()}};J.prototype._attachAriaLabelToButton=function(e,t){e.addEventDelegate({onAfterRendering:function(e){e.srcControl.$("content").attr("aria-label",t)}})};J.prototype._printErrors=function(){this.getItems().forEach(function(e){var t=e._getItemError(),i=e.$(),r=!!t?"addClass":"removeClass";i[r]("sapCalculationBuilderItemErrorSyntax")});if(this.getParent().getLayoutType()===$.VisualOnly){this._showErrorIcon()}};J.prototype._validateSyntax=function(t){var i=function(){var e=this.getItems()[I],t=e.getKey();return!e._isOperator()||t==="("||t==="+"||t==="-"||t.toLowerCase()==="not"}.bind(this);var r=function(){var e=this.getItems(),t=e[m-1];return!t._isOperator()||t.getKey()===")"}.bind(this);var n=function(e){var t=e.getKey().toLowerCase();if(e._isOperator()){return t==="not"||t==="("||t===")"?t:"#op#"}return e._isFunction()?"#fun#":"#col#"};var a=function(e){return{index:A,item:e,items:[],text:e.getKey()+(e._isFunction()?"(":"")}};var s=function(e){var t=1,i=A;A++;for(;A<c.length;A++){var r=c[A],n=r.getKey(),o=a(r);e.items.push(o);switch(n){case")":t--;break;case"(":t++;break;case",":t=1;break}if(r._isFunction()){s(o);e.text+=o.text}else{e.text+=n}if(t===0){return e}}T.push({index:i,title:Q.getText("CALCULATION_BUILDER_CLOSING_BRACKET_ERROR_TEXT")});return e};var o=function(t){var i=this.getParent()._getFunctionAllowParametersCount(t.item.getKey()),r=[],n=[];t.items.forEach(function(e){if(e.item._isComma()){r.push(n);n=[]}else{n.push(e)}});if(n.length>0&&n[n.length-1].text===")"){n.pop()}r.push(n);if(r.length!==i){T.push({index:t.index,title:Q.getText(r.length<i?"CALCULATION_BUILDER_TOO_LITTLE_PARAMETERS":"CALCULATION_BUILDER_TOO_MANY_PARAMETERS")})}if(r.length>0){r.forEach(function(i){if(i.length>0){e.merge(T,this._validateSyntax({from:i[0].index,to:i[i.length-1].index+1}))}else{T.push({index:t.index,title:Q.getText("CALCULATION_BUILDER_EMPTY_PARAMETER")})}}.bind(this))}}.bind(this);var l=0;var u=function(){var e=h.getKey()==="+"||h.getKey()==="-";if(e){l++;if(l>2){T.push({index:A,title:Q.getText("CALCULATION_BUILDER_SYNTAX_ERROR_TEXT")})}}else{l=0}};var p={"#op#":["(","#col#","#fun#","not","+","-"],"(":["(","+","-","#col#","#fun#","not"],")":["#op#",")"],"#col#":["#op#",")"],"#fun#":["(","+","-","#col#","#fun#"],not:["#col#","#fun#","not","("]};t=t||{};var c=t.items||this.getItems(),d,_,h,g,f,I=t.from||0,m=t.to||c.length,C=I===0&&m===c.length,E=[],T=[];if(c.length>0){if(!i()){T.push({index:I,title:Q.getText("CALCULATION_BUILDER_FIRST_CHAR_ERROR_TEXT")})}if(!r()){T.push({index:m-1,title:Q.getText("CALCULATION_BUILDER_LAST_CHAR_ERROR_TEXT")})}}for(var A=I;A<m;A++){h=c[A];if(h._getType()===M.Error){T.push({index:A,title:Q.getText("CALCULATION_BUILDER_SYNTAX_ERROR_TEXT")});continue}u();if(!t.skipCustomValidation&&h._isFunction()){var L=h._getCustomFunction(),v=s(a(h));if(L&&!L.getUseDefaultValidation()){var y=new N;this.getParent().fireValidateFunction({definition:v,customFunction:L,result:y});e.merge(T,y.getErrors())}else{o(v)}}if(A<m-1){g=c[A+1];d=n(c[A]);_=n(g);f=g?g.getKey().toLowerCase():"";var B=g._isCustomOperator()||h._isCustomOperator();if(p[d].indexOf(_)===-1&&p[d].indexOf(f)===-1&&!B){var R={index:A+1};if(h._isOperator()&&g._isOperator()){R.title=Q.getText("CALCULATION_BUILDER_BEFORE_OPERATOR_ERROR_TEXT",g.getKey())}else if(!h._isOperator()&&!g._isOperator()){R.title=Q.getText("CALCULATION_BUILDER_BETWEEN_NOT_OPERATORS_ERROR_TEXT",[h.getKey(),g.getKey()])}else if(h.getKey()===")"&&!g._isOperator()){R.title=Q.getText("CALCULATION_BUILDER_AFTER_CLOSING_BRACKET_ERROR_TEXT")}else if(!h._isOperator()&&g.getKey()==="("){R.title=Q.getText("CALCULATION_BUILDER_BEFORE_OPENING_BRACKET_ERROR_TEXT")}else{R.title=Q.getText("CALCULATION_BUILDER_CHAR_ERROR_TEXT")}T.push(R)}}if(h._isFunction()){continue}if(C&&h.getKey()===","){T.push({index:A,title:Q.getText("CALCULATION_BUILDER_WRONG_PARAMETER_MARK")})}if(h._isOperator()&&h.getKey()==="("||h._isFunction()){E.push(A)}if(h._isOperator()&&h.getKey()===")"){if(E.length===0){T.push({index:A,title:Q.getText("CALCULATION_BUILDER_OPENING_BRACKET_ERROR_TEXT")})}else{E.pop()}}}for(A=0;A<E.length;A++){T.push({index:E[A],title:Q.getText("CALCULATION_BUILDER_CLOSING_BRACKET_ERROR_TEXT")})}return T};J.prototype._getType=function(e){return this.getParent()&&this.getParent()._getType(e)};J.prototype._moveItems=function(t,i){var r=[],n=this.$(),a=this.getItems(),s=n.find(".sapCalculationBuilderSelected"),o,l,u,p;if(this._isEmptySelected()){return}p=s.length>1?e(s[0]).children():s.children();if(t===z.KEY_PREVIOUS){l=this._iFirstSelectedIndex-1}else if(t===z.KEY_NEXT){l=this._iLastSelectedIndex+2}else if(t===z.MOUSE){l=i}if(l<0||l===a.length+1){return}o=this.$().find('.sapCalculationBuilderDelimiter[index="'+l+'"]');for(var c=0;c<a.length+1;c++){u=a[c];if(l===c){p.each(function(){var t=e(this),i;if(t.hasClass("sapCalculationBuilderItem")){i=sap.ui.getCore().byId(e(this)[0].id);r.push(i);i._bMovingItem=true;t.draggable("enable")}t.css("left",0+"px");t.detach().insertAfter(o).removeClass("");o=t})}if(u&&!u.$().parent().hasClass("sapCalculationBuilderSelected")&&!u._bMovingItem){r.push(u)}}s.css("left","");n.find(".sapCalculationBuilderDelimiter").each(function(t){e(this).attr("index",t)});this.removeAllAggregation("items",true);r.forEach(function(e,t){e._bMovingItem=false;e._iIndex=t;this.addAggregation("items",e,true)}.bind(this));this._setupKeyboard();this._selectItems(p.filter(function(t,i){return e(i).hasClass("sapCalculationBuilderItem")}));this._fireChange()};J.prototype._fireAfterValidation=function(){this.getParent().fireAfterValidation()};J.prototype._setItems=function(e){this.removeAllAggregation("items",true);(e||[]).forEach(function(e){this.addAggregation("items",this._convertFromNewItem(e),true)}.bind(this))};J.prototype._getKeyFromCreatedItem=function(e){return typeof e==="object"?e.getKey():e};J.prototype._convertFromNewItem=function(e){return typeof e==="object"?e:new i({key:e})};J.prototype._showErrorIcon=function(){var e=this.$("erroricon"),t=this.getParent(),i=t._createErrorText(null,true);if(i){e.show();e.attr("title",t._createErrorText(null,true))}else{e.hide()}};J.prototype._smartRender=function(t){var i,r=this.$(),n=[],a=this.getItems(),s=a.length,o=sap.ui.getCore().createRenderManager();var l=function(e){e=this._convertFromNewItem(e);this.addAggregation("items",e,true);e._iIndex=i;if(r[0]){e._render(o);this._renderDelimiter(o,i+1)}e.bOutput=true;n.push(e)}.bind(this);if(!this.getParent()._isExpressionVisible()){this._setItems(t);return}this._bRendered=false;this._bIsCalculationBuilderRendering=true;this._deselect();for(var i=0;i<t.length;i++){var u=a[i],p=t[i],c=typeof p==="object"&&p.getKey?p.getKey():p,d=p._sType?p._sType:"";if(!u){l(t[i])}else if(u.getKey()!==c||u._sType!==d){u.setKey(c,true);u._sType=d;var _=u.$();u._innerRender(o,_[0]);_.attr("class",u._getClass(null,o,true));_.attr("title",u._getTooltip());u._setEvents()}}if(t.length<s){for(var i=t.length;i<a.length;i++){var _=a[i].$();_.next().remove();_.remove();this.removeAggregation("items",a[i],true)}}if(r[0]&&n.length>0){o.flush(r[0],false,r.children().index(r.find(".sapCalculationBuilderDelimiter").last()[0])+1);n.forEach(function(e){e._afterRendering()});this._setupDroppable(r.find(".sapCalculationBuilderDroppable").filter(function(){return parseInt(e(this).attr("index"),10)>s}))}this._bRendered=true;this._setupKeyboard();this._setupNewButtonEvents();this._bIsCalculationBuilderRendering=false};J.prototype._fireChange=function(){this.fireEvent("change")};return J});