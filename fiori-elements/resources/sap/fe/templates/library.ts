import "sap/f/library";
import "sap/fe/core/library";
import "sap/fe/macros/library";
import MultipleModeBlock from "sap/fe/templates/ListReport/view/fragments/MultipleMode.block";
import DraftHandlerButtonBlock from "sap/fe/templates/ObjectPage/components/DraftHandlerButton.block";
import FooterContentBlock from "sap/fe/templates/ObjectPage/view/fragments/FooterContent.block";
import Core from "sap/ui/core/Core";
import "sap/ui/core/library";
/**
 * Library providing the official templates supported by SAP Fiori elements.
 *
 * @namespace
 * @name sap.fe.templates
 * @public
 */
export const templatesNamespace = "sap.fe.templates";

/**
 * @namespace
 * @name sap.fe.templates.ListReport
 * @public
 */
export const templatesLRNamespace = "sap.fe.templates.ListReport";

/**
 * @namespace
 * @name sap.fe.templates.ObjectPage
 * @public
 */
export const templatesOPNamespace = "sap.fe.templates.ObjectPage";

const thisLib = Core.initLibrary({
	name: "sap.fe.templates",
	dependencies: ["sap.ui.core", "sap.fe.core", "sap.fe.macros", "sap.f"],
	types: ["sap.fe.templates.ObjectPage.SectionLayout"],
	interfaces: [],
	controls: [],
	elements: [],
	// eslint-disable-next-line no-template-curly-in-string
	version: "${version}",
	noLibraryCSS: true
}) as any;

if (!thisLib.ObjectPage) {
	thisLib.ObjectPage = {};
}
thisLib.ObjectPage.SectionLayout = {
	/**
	 * All sections are shown in one page
	 *
	 * @public
	 */
	Page: "Page",

	/**
	 * All top-level sections are shown in an own tab
	 *
	 * @public
	 */
	Tabs: "Tabs"
};

MultipleModeBlock.register();
DraftHandlerButtonBlock.register();
FooterContentBlock.register();

export default thisLib;
