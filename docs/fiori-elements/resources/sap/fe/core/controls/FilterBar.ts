import FilterContainer from "sap/fe/core/controls/filterbar/FilterContainer";
import VisualFilterContainer from "sap/fe/core/controls/filterbar/VisualFilterContainer";
import { association, defineUI5Class, property } from "sap/fe/core/helpers/ClassSupport";
import type SegmentedButton from "sap/m/SegmentedButton";
import Core from "sap/ui/core/Core";
import MdcFilterBar from "sap/ui/mdc/FilterBar";
import FilterItemLayout from "sap/ui/mdc/filterbar/aligned/FilterItemLayout";
@defineUI5Class("sap.fe.core.controls.FilterBar")
class FilterBar extends MdcFilterBar {
	@property({ type: "string", defaultValue: "compact" })
	initialLayout!: string;

	/**
	 * Control which allows for switching between visual and normal filter layouts
	 */
	@association({
		type: "sap.m.SegmentedButton",
		multiple: false
	})
	toggleControl!: SegmentedButton;

	private _oSegmentedButton?: SegmentedButton;

	private _oSecondaryFilterBarLayout: any;

	private _oFilterBarLayout: any;

	private _cLayoutItem: any;

	setToggleControl(vToggle: string | SegmentedButton) {
		if (typeof vToggle === "string") {
			this._oSegmentedButton = Core.byId(vToggle) as SegmentedButton;
		} else {
			this._oSegmentedButton = vToggle;
		}

		if (this.toggleControl && this._oSegmentedButton) {
			this._oSegmentedButton.detachEvent("select", this._toggleLayout.bind(this));
		}
		if (this._oSegmentedButton) {
			this._oSegmentedButton.attachEvent("select", this._toggleLayout.bind(this));
		}
		this.setAssociation("toggleControl", vToggle, true);
	}

	_toggleLayout() {
		// Since primary layout is always compact
		// hence set the secondary layout as visual filter only for the first time only
		if (!this._oSecondaryFilterBarLayout) {
			this._oSecondaryFilterBarLayout = new VisualFilterContainer();
		}

		// do not show Adapt Filters Button for visual layout
		if (this._oSecondaryFilterBarLayout.isA("sap.fe.core.controls.filterbar.VisualFilterContainer")) {
			this.setShowAdaptFiltersButton(false);
		} else {
			this.setShowAdaptFiltersButton(true);
		}

		// get all filter fields and button of the current layout
		const oCurrentFilterBarLayout = this._oFilterBarLayout;
		const oFilterItems = this.getFilterItems();
		const aFilterFields = oCurrentFilterBarLayout.getAllFilterFields();
		const aSortedFilterFields = this.getSortedFilterFields(oFilterItems, aFilterFields);
		const aButtons = oCurrentFilterBarLayout.getAllButtons();
		const aVisualFilterFields = oCurrentFilterBarLayout.getAllVisualFilterFields && oCurrentFilterBarLayout.getAllVisualFilterFields();
		if (this._oSecondaryFilterBarLayout.isA("sap.fe.core.controls.filterbar.VisualFilterContainer")) {
			this._oSecondaryFilterBarLayout.setAllFilterFields(aSortedFilterFields, aVisualFilterFields);
		}
		// use secondary filter bar layout as new layout
		this._oFilterBarLayout = this._oSecondaryFilterBarLayout;

		// insert all filter fields from current layout to new layout
		aFilterFields.forEach((oFilterField: any, iIndex: any) => {
			oCurrentFilterBarLayout.removeFilterField(oFilterField);
			this._oFilterBarLayout.insertFilterField(oFilterField, iIndex);
		});
		// insert all buttons from the current layout to the new layout
		aButtons.forEach((oButton: any) => {
			oCurrentFilterBarLayout.removeButton(oButton);
			this._oFilterBarLayout.addButton(oButton);
		});

		// set the current filter bar layout to the secondary one
		this._oSecondaryFilterBarLayout = oCurrentFilterBarLayout;

		// update the layout aggregation of the filter bar and rerender the same.
		this.setAggregation("layout", this._oFilterBarLayout, true);
		this._oFilterBarLayout.rerender();
	}

	getSortedFilterFields(aFilterItems: any, aFilterFields: any) {
		const aFilterIds: any[] = [];
		aFilterItems.forEach(function (oFilterItem: any) {
			aFilterIds.push(oFilterItem.getId());
		});
		aFilterFields.sort(function (aFirstItem: any, aSecondItem: any) {
			let sFirstItemVFId, sSecondItemVFId;
			aFirstItem.getContent().forEach(function (oInnerControl: any) {
				if (oInnerControl.isA("sap.ui.mdc.FilterField")) {
					sFirstItemVFId = oInnerControl.getId();
				}
			});
			aSecondItem.getContent().forEach(function (oInnerControl: any) {
				if (oInnerControl.isA("sap.ui.mdc.FilterField")) {
					sSecondItemVFId = oInnerControl.getId();
				}
			});
			return aFilterIds.indexOf(sFirstItemVFId) - aFilterIds.indexOf(sSecondItemVFId);
		});
		return aFilterFields;
	}

	_createInnerLayout() {
		this._oFilterBarLayout = new FilterContainer();
		this._cLayoutItem = FilterItemLayout;
		this._oFilterBarLayout.getInner().addStyleClass("sapUiMdcFilterBarBaseAFLayout");
		this._addButtons();

		// TODO: Check with MDC if there is a better way to load visual filter on the basis of control property
		// _createInnerLayout is called on Init by the filter bar base.
		// This mean that we do not have access to the control properties yet
		// and hence we cannot decide on the basis of control properties whether initial layout should be compact or visual
		// As a result we have to do this workaround to always load the compact layout by default
		// And toogle the same in case the initialLayout was supposed to be visual filters.
		const oInnerLayout = this._oFilterBarLayout.getInner();
		const oFilterContainerInnerLayoutEventDelegate = {
			onBeforeRendering: () => {
				if (this.initialLayout === "visual") {
					this._toggleLayout();
				}
				oInnerLayout.removeEventDelegate(oFilterContainerInnerLayoutEventDelegate);
			}
		};
		oInnerLayout.addEventDelegate(oFilterContainerInnerLayoutEventDelegate);

		this.setAggregation("layout", this._oFilterBarLayout, true);
	}

	exit() {
		super.exit();
		// Sometimes upon external navigation this._SegmentedButton is already destroyed
		// so check if it exists and then only remove stuff
		if (this._oSegmentedButton) {
			this._oSegmentedButton.detachEvent("select", this._toggleLayout);
			delete this._oSegmentedButton;
		}
	}

	getSegmentedButton() {
		return this._oSegmentedButton;
	}
}
interface FilterBar {
	_addButtons(): any;
}
export default FilterBar;
