import { defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import MdcFilterContainer from "sap/ui/mdc/filterbar/aligned/FilterContainer";

/**
 * Constructor for a new FE filter container.
 *
 * @extends sap.ui.mdc.filterbar.aligned.FilterContainer
 * @class
 * @private
 * @alias sap.fe.core.controls.filterbar.FilterContainer
 */
@defineUI5Class("sap.fe.core.controls.filterbar.FilterContainer")
class FilterContainer extends MdcFilterContainer {
	init(...args: any[]) {
		this.aAllFilterFields = [];
		this.aAllVisualFilters = {};
		super.init(...args);
	}

	exit(...args: any[]) {
		// destroy layout
		super.exit(...args);
		// destroy all filter fields which are not in the layout
		this.aAllFilterFields.forEach(function (oFilterField: any) {
			oFilterField.destroy();
		});
		Object.keys(this.aAllVisualFilters).forEach((sKey: string) => {
			this.aAllVisualFilters[sKey].destroy();
		});
	}

	insertFilterField(oControl: any, iIndex: number) {
		const oFilterItemLayoutEventDelegate = {
			onBeforeRendering: function () {
				// For compact filters the item layout needs to render both label and filter field.
				// hence use the original getContent of the FilterItemLayout
				if (oControl._fnGetContentCopy) {
					oControl.getContent = oControl._fnGetContentCopy;
				}
				oControl.removeEventDelegate(oFilterItemLayoutEventDelegate);
			}
		};
		oControl.addEventDelegate(oFilterItemLayoutEventDelegate);

		// In this layout there is no need to render visual filter
		// hence find the filter field from the layout and remove it's content aggregation
		oControl.getContent().forEach((oInnerControl: any) => {
			const oContent = oInnerControl.getContent && oInnerControl.getContent();
			if (oInnerControl.isA("sap.ui.mdc.FilterField") && oContent && oContent.isA("sap.fe.core.controls.filterbar.VisualFilter")) {
				// store the visual filter for later use.
				const oVFId = oInnerControl.getId();
				this.aAllVisualFilters[oVFId] = oContent;
				// remove the content aggregation to render internal content of the field
				oInnerControl.setContent(null);
			}
		});

		// store filter fields to refer to when switching between layout
		this.aAllFilterFields.push(oControl);
		super.insertFilterField(oControl, iIndex);
	}

	removeFilterField(oControl: any) {
		const oFilterFieldIndex = this.aAllFilterFields.findIndex(function (oFilterField: any) {
			return oFilterField.getId() === oControl.getId();
		});

		// Setting VF content for Fillterfield before removing
		oControl.getContent().forEach((oInnerControl: any) => {
			if (oInnerControl.isA("sap.ui.mdc.FilterField") && !oInnerControl.getContent()) {
				const oVFId = oInnerControl.getId();
				if (this.aAllVisualFilters[oVFId]) {
					oInnerControl.setContent(this.aAllVisualFilters[oVFId]);
				}
			}
		});

		this.aAllFilterFields.splice(oFilterFieldIndex, 1);

		super.removeFilterField(oControl);
	}

	removeAllFilterFields() {
		this.aAllFilterFields = [];
		this.aAllVisualFilters = {};
		this.oLayout.removeAllContent();
	}

	getAllButtons() {
		return this.oLayout.getEndContent();
	}

	removeButton(oControl: any) {
		this.oLayout.removeEndContent(oControl);
	}

	getAllFilterFields() {
		return this.aAllFilterFields.slice();
	}

	getAllVisualFilterFields() {
		return this.aAllVisualFilters;
	}

	setAllFilterFields(aFilterFields: any) {
		this.aAllFilterFields = aFilterFields;
	}
}
export default FilterContainer;
