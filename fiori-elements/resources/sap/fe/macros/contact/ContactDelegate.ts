import Fragment from "sap/ui/core/Fragment";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
import XMLTemplateProcessor from "sap/ui/core/XMLTemplateProcessor";

import type Control from "sap/ui/core/Control";
import LinkDelegate from "sap/ui/mdc/LinkDelegate";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

type ContactPayload = { navigationPath: string; contact: string };

export default Object.assign({}, LinkDelegate, {
	/**
	 * Method called to do the templating of the popover content.
	 *
	 * @param payload
	 * @param metaModel
	 * @returns  A promise containing the popover content
	 */
	_fnTemplateFragment: async function (payload: ContactPayload, metaModel: ODataMetaModel) {
		const fragmentName = "sap.fe.macros.contact.ContactQuickView";
		const preProcessorSettings: { bindingContexts: object; models: object } = { bindingContexts: {}, models: {} };
		const contactContext = metaModel.createBindingContext(payload.contact);
		if (payload.contact && contactContext) {
			preProcessorSettings.bindingContexts = {
				contact: contactContext
			};
			preProcessorSettings.models = {
				contact: metaModel
			};
		}

		const fragment = XMLTemplateProcessor.loadTemplate(fragmentName, "fragment");
		const templatedFragment = await XMLPreprocessor.process(fragment, { name: fragmentName }, preProcessorSettings);
		return Fragment.load({
			definition: templatedFragment,
			controller: this
		});
	},

	/**
	 * Method calls by the mdc.field to determine what should be the content of the popup when mdcLink#open is called.
	 *
	 * @param payload
	 * @param mdcLinkControl
	 * @returns A promise containing the popover content
	 */
	fetchAdditionalContent: async function (payload: ContactPayload, mdcLinkControl: Control) {
		const navigateRegexpMatch = payload.navigationPath?.match(/{(.*?)}/);
		const bindingContext =
			navigateRegexpMatch && navigateRegexpMatch.length > 1 && navigateRegexpMatch[1]
				? mdcLinkControl
						.getModel()
						.bindContext(navigateRegexpMatch[1], mdcLinkControl.getBindingContext() as Context, { $$ownRequest: true })
				: null;
		if (mdcLinkControl.isA("sap.ui.mdc.Link")) {
			const metaModel = mdcLinkControl.getModel().getMetaModel() as ODataMetaModel;
			const popoverContent = (await this._fnTemplateFragment(payload, metaModel)) as Control;
			if (bindingContext) {
				popoverContent.setBindingContext(bindingContext.getBoundContext() as Context);
			}
			return [popoverContent];
		}
		return Promise.resolve([]);
	},

	fetchLinkType: async function () {
		return {
			initialType: {
				type: 2, // this means mdcLink.open will open a popup which shows content retrieved by fetchAdditionalContent
				directLink: undefined
			},
			runtimeType: undefined
		};
	}
});
