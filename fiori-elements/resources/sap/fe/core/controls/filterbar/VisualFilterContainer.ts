import { aggregation, defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import FlexBox from "sap/m/FlexBox";
import HeaderContainer from "sap/m/HeaderContainer";
import type Control from "sap/ui/core/Control";
import coreLibrabry from "sap/ui/core/library";
import { system } from "sap/ui/Device";
import IFilterContainer from "sap/ui/mdc/filterbar/IFilterContainer";
/**
 * Constructor for a new Visual Filter Container.
 * Used for visual filters.
 *
 * @extends sap.ui.mdc.filterbar.IFilterContainer
 * @class
 * @private
 * @alias sap.fe.core.controls.filterbar.VisualFilterContainer
 */
@defineUI5Class("sap.fe.core.controls.filterbar.VisualFilterContainer")
class VisualFilterContainer extends IFilterContainer {
	@aggregation({
		type: "sap.ui.core.Control",
		multiple: false,
		visibility: "hidden"
	})
	/**
	 * Internal hidden aggregation to hold the inner layout.
	 */
	_layout!: Control;

	init(...args: any[]) {
		super.init(...args);
		//var oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		const sDeviceSystem = system,
			Orientation = coreLibrabry.Orientation,
			sOrientation = sDeviceSystem.phone ? Orientation.Vertical : undefined,
			sDirection = sDeviceSystem.phone ? "ColumnReverse" : "Column";

		this.oHeaderContainer = new HeaderContainer({
			orientation: sOrientation
		});
		this.oButtonFlexBox = new FlexBox({
			alignItems: "End",
			justifyContent: "End"
		});

		this.oLayout = new FlexBox({
			direction: sDirection, // Direction is Column Reverse for Phone
			items: [this.oHeaderContainer, this.oButtonFlexBox]
		});

		this.aAllFilterFields = [];
		this.aVisualFilterFields = {};
	}

	exit(...args: any[]) {
		// destroy layout
		super.exit(...args);
		// destroy all filter fields which are not in the layout
		const aAllFilterFields = this.getAllFilterFields();
		aAllFilterFields.forEach(function (oFilterField: any) {
			oFilterField.destroy();
		});
		this.oHeaderContainer = null;
		this.oButtonFlexBox = null;
		this.aAllFilterFields = [];
	}

	insertFilterField(oControl: any, iIndex: any) {
		const oFilterItemLayoutEventDelegate = {
			onBeforeRendering: function () {
				// visual filter does not need to render a label
				// hence override the getContent of the FilterItemLayout
				// and store the original getContent for later usage in the compact filters
				if (!oControl._fnGetContentCopy) {
					oControl._fnGetContentCopy = oControl.getContent;
				}
				// override getContent of FilterItemLayout
				// to add only filterField and not label
				oControl.getContent = function () {
					const aContent = [];
					aContent.push(oControl._oFilterField);
					return aContent;
				};
				oControl.removeEventDelegate(oFilterItemLayoutEventDelegate);
			}
		};
		oControl.addEventDelegate(oFilterItemLayoutEventDelegate);

		// Setting VF control for the Filterfield.
		const oVisualFilters = this.aVisualFilterFields;
		oControl.getContent().some((oInnerControl: any) => {
			const sFFId = oInnerControl.getId();
			if (oVisualFilters[sFFId] && oInnerControl.isA("sap.ui.mdc.FilterField")) {
				oInnerControl.setContent(oVisualFilters[sFFId]);
				this.oHeaderContainer.insertContent(oControl, iIndex);
			}
		});
	}

	removeFilterField(oControl: any) {
		this.oHeaderContainer.removeContent(oControl);
	}

	removeAllFilterFields() {
		this.aAllFilterFields = [];
		this.aVisualFilterFields = {};
		this.oHeaderContainer.removeAllContent();
	}

	getFilterFields() {
		return this.oHeaderContainer.getContent();
	}

	addButton(oControl: any) {
		this.oButtonFlexBox.insertItem(oControl);
	}

	getAllButtons() {
		return this.oButtonFlexBox.getItems().reverse();
	}

	removeButton(oControl: any) {
		this.oButtonFlexBox.removeItem(oControl);
	}

	getAllFilterFields() {
		return this.aAllFilterFields.slice();
	}

	setAllFilterFields(aFilterFields: any, aVisualFilterFields: any) {
		this.aAllFilterFields = aFilterFields;
		this.aVisualFilterFields = aVisualFilterFields;
	}
}

export default VisualFilterContainer;
