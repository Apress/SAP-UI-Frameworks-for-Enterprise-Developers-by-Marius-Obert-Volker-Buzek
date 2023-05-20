import { aggregation, defineUI5Class, implementInterface, property } from "sap/fe/core/helpers/ClassSupport";
import Control from "sap/ui/core/Control";
import type { CSSSize, IFormContent } from "sap/ui/core/library";
import type RenderManager from "sap/ui/core/RenderManager";

@defineUI5Class("sap.fe.core.controls.FormElementWrapper")
class FormElementWrapper extends Control implements IFormContent {
	@implementInterface("sap.ui.core.IFormContent")
	__implements__sap_ui_core_IFormContent: boolean = true;

	@property({
		type: "sap.ui.core.CSSSize",
		defaultValue: null
	})
	width!: CSSSize;

	@property({
		type: "boolean",
		defaultValue: false
	})
	formDoNotAdjustWidth!: boolean;

	@aggregation({ type: "sap.ui.core.Control", multiple: false, isDefault: true })
	content!: Control;

	getAccessibilityInfo() {
		const oContent = this.content;
		return oContent && oContent.getAccessibilityInfo ? oContent.getAccessibilityInfo() : {};
	}

	static render(oRm: RenderManager, oControl: FormElementWrapper) {
		oRm.openStart("div", oControl);
		oRm.style("min-height", "1rem");
		oRm.style("width", oControl.width);
		oRm.openEnd();

		oRm.openStart("div");
		oRm.style("display", "flex");
		oRm.style("box-sizing", "border-box");
		oRm.style("justify-content", "space-between");
		oRm.style("align-items", "center");
		oRm.style("flex-wrap", "wrap");
		oRm.style("align-content", "stretch");
		oRm.style("width", "100%");
		oRm.openEnd();
		oRm.renderControl(oControl.content); // render the child Control
		oRm.close("div");
		oRm.close("div"); // end of the complete Control
	}
}
export default FormElementWrapper;
