import { aggregation, association, defineUI5Class, EnhanceWithUI5, implementInterface, property } from "sap/fe/core/helpers/ClassSupport";
import Control from "sap/ui/core/Control";
import type { CSSSize, IFormContent } from "sap/ui/core/library";
import type RenderManager from "sap/ui/core/RenderManager";

@defineUI5Class("sap.fe.macros.controls.ConditionalWrapper")
class ConditionalWrapper extends Control implements IFormContent {
	@implementInterface("sap.ui.core.IFormContent")
	__implements__sap_ui_core_IFormContent: boolean = true;

	@property({ type: "sap.ui.core.CSSSize", defaultValue: null })
	width!: CSSSize;

	@property({ type: "boolean", defaultValue: false })
	formDoNotAdjustWidth!: boolean;

	@property({ type: "boolean", defaultValue: false })
	condition!: boolean;

	/**
	 * Association to controls / IDs that label this control (see WAI-ARIA attribute aria-labelledby).
	 */
	@association({ type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" })
	ariaLabelledBy!: Control[];

	@aggregation({ type: "sap.ui.core.Control", multiple: false, isDefault: true })
	contentTrue!: Control;

	@aggregation({ type: "sap.ui.core.Control", multiple: false })
	contentFalse!: Control;

	enhanceAccessibilityState(oElement: any, mAriaProps: any) {
		const oParent = this.getParent() as any;

		if (oParent && oParent.enhanceAccessibilityState) {
			oParent.enhanceAccessibilityState(this, mAriaProps);
		}

		return mAriaProps;
	}

	/**
	 * This function provides the current accessibility state of the control.
	 *
	 * @returns The accessibility info of the wrapped control
	 */
	getAccessibilityInfo() {
		let content;
		if (this.condition) {
			content = this.contentTrue;
		} else {
			content = this.contentFalse;
		}
		return content?.getAccessibilityInfo ? content.getAccessibilityInfo() : {};
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
		// before calling the renderer of the ConditionalWrapper parent control may have set ariaLabelledBy
		// we ensure it is passed to its inner controls
		this._setAriaLabelledBy(this.contentTrue);
		this._setAriaLabelledBy(this.contentFalse);
	}

	static render(oRm: RenderManager, oControl: ConditionalWrapper) {
		oRm.openStart("div", oControl);
		oRm.style("width", oControl.width);
		oRm.style("display", "inline-block");
		oRm.openEnd();
		if (oControl.condition) {
			oRm.renderControl(oControl.contentTrue);
		} else {
			oRm.renderControl(oControl.contentFalse);
		}
		oRm.close("div"); // end of the complete Control
	}
}

export default ConditionalWrapper as unknown as EnhanceWithUI5<ConditionalWrapper>;
