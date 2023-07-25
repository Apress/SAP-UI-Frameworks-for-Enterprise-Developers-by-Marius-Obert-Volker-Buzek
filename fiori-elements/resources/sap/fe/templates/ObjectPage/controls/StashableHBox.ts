import { defineUI5Class, property } from "sap/fe/core/helpers/ClassSupport";
import HBox from "sap/m/HBox";
import StashedControlSupport from "sap/ui/core/StashedControlSupport";
@defineUI5Class("sap.fe.templates.ObjectPage.controls.StashableHBox", {
	designtime: "sap/fe/templates/ObjectPage/designtime/StashableHBox.designtime"
})
class StashableHBox extends HBox {
	/*
	 * Title of the Header Facet. Not visible on the UI. Visible on the UI is the Title or Link control inside the items aggregation of the Header Facet.
	 * Must always be in sync with the visible Title or Link control.
	 */
	@property({ type: "string" })
	title!: string;

	/*
	 * Fallback title to be displayed if no title is available (only needed for displaying stashed header facets in Flex dialog)
	 */
	@property({ type: "string" })
	fallbackTitle!: string;

	/*
	 * Set title of visible Title/Link control and own title property.
	 */
	setTitle(sTitle: any) {
		const oControl = this.getTitleControl();
		if (oControl) {
			oControl.setText(sTitle);
		}
		this.title = sTitle;

		return this;
	}

	/*
	 * Return the title property.
	 */
	getTitle() {
		return this.title || this.fallbackTitle;
	}

	/*
	 * In case of UI changes, Title/Link text needs to be set to new value after Header Facet control and inner controls are rendered.
	 * Else: title property needs to be initialized.
	 */
	onAfterRendering() {
		if (this.title) {
			this.setTitle(this.title);
		} else {
			const oControl = this.getTitleControl();
			if (oControl) {
				this.title = oControl.getText();
			}
		}
	}

	/*
	 * Retrieves Title/Link control from items aggregation.
	 */
	getTitleControl() {
		let aItems = [],
			content,
			i;
		if (this.getItems && this.getItems()[0] && (this.getItems()[0] as any).getItems) {
			aItems = (this.getItems()[0] as any).getItems();
		} else if (this.getItems && this.getItems()[0] && (this.getItems()[0] as any).getMicroChartTitle) {
			aItems = (this.getItems()[0] as any).getMicroChartTitle();
		}
		for (i = 0; i < aItems.length; i++) {
			if (aItems[i].isA("sap.m.Title") || aItems[i].isA("sap.m.Link")) {
				if (aItems[i].isA("sap.m.Title")) {
					// If a title was found, check if there is a link in the content aggregation
					content = aItems[i].getContent();
					if (content && content.isA("sap.m.Link")) {
						return content;
					}
				}
				return aItems[i];
			}
		}
		return null;
	}
}
StashedControlSupport.mixInto(StashableHBox);

export default StashableHBox;
