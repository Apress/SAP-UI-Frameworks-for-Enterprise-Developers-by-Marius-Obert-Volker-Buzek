import { defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import VBox from "sap/m/VBox";
import StashedControlSupport from "sap/ui/core/StashedControlSupport";
@defineUI5Class("sap.fe.templates.ObjectPage.controls.StashableVBox", {
	designtime: "sap/fe/templates/ObjectPage/designtime/StashableVBox.designtime"
})
class StashableVBox extends VBox {}
StashedControlSupport.mixInto(StashableVBox);

export default StashableVBox;
