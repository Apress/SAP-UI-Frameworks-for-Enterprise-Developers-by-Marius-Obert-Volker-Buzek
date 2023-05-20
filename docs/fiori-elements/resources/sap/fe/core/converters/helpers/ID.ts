import type { AuthorizedIdAnnotationsType } from "../../helpers/StableIdHelper";
import { generate } from "../../helpers/StableIdHelper";
type IDPart = string | AuthorizedIdAnnotationsType;
const BASE_ID: IDPart[] = ["fe"];

/**
 * Shortcut to the stableIdHelper providing a "curry" like method where the last parameter is missing.
 *
 * @param sFixedPart
 * @returns A shortcut function with the fixed ID part
 */
export function createIDGenerator(...sFixedPart: IDPart[]) {
	return function (...sIDPart: IDPart[]) {
		return generate(BASE_ID.concat(...sFixedPart, ...sIDPart));
	};
}

/**
 * Those are all helpers to centralize ID generation in the code for different elements
 */
export const getHeaderFacetID = createIDGenerator("HeaderFacet");
export const getHeaderFacetContainerID = createIDGenerator("HeaderFacetContainer");
export const getHeaderFacetFormID = createIDGenerator("HeaderFacet", "Form");
export const getCustomHeaderFacetID = createIDGenerator("HeaderFacetCustomContainer");
export const getEditableHeaderSectionID = createIDGenerator("EditableHeaderSection");
export const getSectionID = createIDGenerator("FacetSection");
export const getCustomSectionID = createIDGenerator("CustomSection");
export const getSubSectionID = createIDGenerator("FacetSubSection");
export const getCustomSubSectionID = createIDGenerator("CustomSubSection");
export const getSideContentID = createIDGenerator("SideContent");
export const getSideContentLayoutID = function (sSectionID: string) {
	return generate(["fe", sSectionID, "SideContentLayout"]);
};
export const getFormID = createIDGenerator("Form");
export const getFormContainerID = createIDGenerator("FormContainer");
export const getFormStandardActionButtonID = function (sFormContainerId: string, sActionName: string) {
	return generate(["fe", "FormContainer", sFormContainerId, "StandardAction", sActionName]);
};
export const getTableID = createIDGenerator("table");
export const getCustomTabID = createIDGenerator("CustomTab");
export const getFilterBarID = createIDGenerator("FilterBar");
export const getDynamicListReportID = function () {
	return "fe::ListReport";
};
export const getIconTabBarID = createIDGenerator("TabMultipleMode");
export const getFilterVariantManagementID = function (sFilterID: string) {
	return generate([sFilterID, "VariantManagement"]);
};
export const getChartID = createIDGenerator("Chart");
export const getCustomActionID = function (sActionID: string) {
	return generate(["CustomAction", sActionID]);
};
export const getKPIID = createIDGenerator("KPI");
