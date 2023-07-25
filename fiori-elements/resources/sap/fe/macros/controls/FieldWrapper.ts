import { aggregation, association, defineUI5Class, implementInterface, property } from "sap/fe/core/helpers/ClassSupport";
import Control from "sap/ui/core/Control";
import type { CSSSize, IFormContent, TextAlign } from "sap/ui/core/library";
import type RenderManager from "sap/ui/core/RenderManager";

@defineUI5Class("sap.fe.macros.controls.FieldWrapper")
class FieldWrapper extends Control implements IFormContent {
	@implementInterface("sap.ui.core.IFormContent")
	__implements__sap_ui_core_IFormContent: boolean = true;

	@property({ type: "sap.ui.core.TextAlign" })
	textAlign!: TextAlign;

	@property({ type: "sap.ui.core.CSSSize", defaultValue: null })
	width!: CSSSize;

	@property({ type: "boolean", defaultValue: false })
	formDoNotAdjustWidth!: boolean;

	@property({ type: "string", defaultValue: "Display" })
	editMode!: string;

	@property({ type: "boolean", defaultValue: false })
	required!: boolean;

	/**
	 * Association to controls / IDs that label this control (see WAI-ARIA attribute aria-labelledby).
	 */
	@association({ type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" })
	ariaLabelledBy!: Control[];

	@aggregation({ type: "sap.ui.core.Control", multiple: false, isDefault: true })
	contentDisplay!: Control;

	@aggregation({ type: "sap.ui.core.Control", multiple: true })
	contentEdit!: Control[];

	enhanceAccessibilityState(oElement: any, mAriaProps: any) {
		const oParent = this.getParent() as any;

		if (oParent && oParent.enhanceAccessibilityState) {
			// use FieldWrapper as control, but aria properties of rendered inner control.
			oParent.enhanceAccessibilityState(this, mAriaProps);
		}

		return mAriaProps;
	}

	getAccessibilityInfo() {
		let oContent;
		if (this.editMode === "Display") {
			oContent = this.contentDisplay;
		} else {
			oContent = this.contentEdit.length ? this.contentEdit[0] : null;
		}
		return oContent && oContent.getAccessibilityInfo ? oContent.getAccessibilityInfo() : {};
	}

	/**
	 * Returns the DOMNode ID to be used for the "labelFor" attribute.
	 *
	 * We forward the call of this method to the content control.
	 *
	 * @returns ID to be used for the <code>labelFor</code>
	 */
	getIdForLabel(): string {
		let oContent;
		if (this.editMode === "Display") {
			oContent = this.contentDisplay;
		} else {
			oContent = this.contentEdit.length ? this.contentEdit[0] : null;
		}
		return (oContent as Control)?.getIdForLabel();
	}

	_setAriaLabelledBy(oContent: any) {
		if (oContent && oContent.addAriaLabelledBy) {
			const aAriaLabelledBy = this.ariaLabelledBy;

			for (let i = 0; i < aAriaLabelledBy.length; i++) {
				const sId = aAriaLabelledBy[i];
				const aAriaLabelledBys = oContent.getAriaLabelledBy() || [];
				if (aAriaLabelledBys.indexOf(sId) === -1) {
					oContent.addAriaLabelledBy(sId);
				}
			}
		}
	}

	onBeforeRendering() {
		// before calling the renderer of the FieldWrapper parent control may have set ariaLabelledBy
		// we ensure it is passed to its inner controls
		this._setAriaLabelledBy(this.contentDisplay);
		const aContentEdit = this.contentEdit;
		for (let i = 0; i < aContentEdit.length; i++) {
			this._setAriaLabelledBy(aContentEdit[i]);
		}
	}

	static render(oRm: RenderManager, oControl: FieldWrapper) {
		oRm.openStart("div", oControl);
		oRm.style("text-align", oControl.textAlign);
		if (oControl.editMode === "Display") {
			oRm.style("width", oControl.width);
			oRm.openEnd();
			oRm.renderControl(oControl.contentDisplay); // render the child Control for display
		} else {
			const aContentEdit = oControl.contentEdit;

			// if (aContentEdit.length > 1) {
			// 	oRm.class("sapUiMdcFieldBaseMoreFields");
			// }
			oRm.style("width", oControl.width);
			oRm.openEnd();
			for (let i = 0; i < aContentEdit.length; i++) {
				const oContent = aContentEdit[i]; // render the child Control  for edit
				oRm.renderControl(oContent);
			}
		}
		oRm.close("div"); // end of the complete Control
	}
}

export default FieldWrapper;
