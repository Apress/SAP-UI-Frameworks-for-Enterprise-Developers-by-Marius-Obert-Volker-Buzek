//@ui5-bundle sap/fe/templates/designtime/library-preload.designtime.js
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/designtime/FlexBox.designtime",[],function(){"use strict";const e={actions:{remove:null},aggregations:{items:{domRef:":sap-domref",actions:{move:"moveControls"}}}};return e},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */sap.ui.predefine("sap/fe/templates/ObjectPage/designtime/StashableHBox.designtime",["sap/ui/core/Core"],function(e){"use strict";const t=e.getLibraryResourceBundle("sap.fe.templates");const n={actions:{remove:{changeType:"stashControl"},reveal:{changeType:"unstashControl"},rename:function(){return{changeType:"renameHeaderFacet",domRef:function(e){const t=e.getTitleControl();if(t){return t.getDomRef()}else{return null}}}}},name:{singular:function(){return t.getText("T_STASHABLE_HBOX_RTA_HEADERFACET_MENU_ADD")},plural:function(){return t.getText("T_STASHABLE_HBOX_RTA_HEADERFACET_MENU_ADD_PLURAL")}},palette:{group:"LAYOUT",icons:{svg:"sap/m/designtime/HBox.icon.svg"}},templates:{create:"sap/m/designtime/HBox.create.fragment.xml"}};return n},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */sap.ui.predefine("sap/fe/templates/ObjectPage/designtime/StashableVBox.designtime",["sap/ui/core/Core"],function(e){"use strict";const t=e.getLibraryResourceBundle("sap.fe.templates");const n={actions:{remove:{changeType:"stashControl"},reveal:{changeType:"unstashControl"}},name:{singular:function(){return t.getText("T_STASHABLE_VBOX_RTA_HEADERCOLLECTIONFACET_MENU_ADD")},plural:function(){return t.getText("T_STASHABLE_VBOX_RTA_HEADERCOLLECTIONFACET_MENU_ADD_PLURAL")}},palette:{group:"LAYOUT",icons:{svg:"sap/m/designtime/VBox.icon.svg"}},templates:{create:"sap/m/designtime/VBox.create.fragment.xml"}};return n},false);