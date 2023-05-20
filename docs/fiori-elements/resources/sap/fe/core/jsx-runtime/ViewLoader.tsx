import { defineUI5Class, property } from "sap/fe/core/helpers/ClassSupport";
import Page from "sap/m/Page";
import ManagedObject from "sap/ui/base/ManagedObject";

import Control from "sap/ui/core/Control";

import View from "sap/ui/core/mvc/View";
import { ManagedObjectEx } from "../../../../../../../types/extension_types";

@defineUI5Class("sap.fe.core.jsx-runtime.MDXViewLoader")
export default class ViewLoader extends View {
	static preprocessorData: any;

	static controller: any;

	@property({ type: "string" })
	viewName!: string;

	loadDependency(name: string): Promise<any> {
		return new Promise((resolve) => {
			sap.ui.require([name], async (MDXContent: Function) => {
				resolve(MDXContent);
			});
		});
	}

	getControllerName() {
		const viewData = this.getViewData() as any;
		return viewData.controllerName;
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	async createContent(oController: any): Promise<Control> {
		const viewData = this.getViewData() as any;
		const MDXContent = viewData.viewContent || (await this.loadDependency(viewData._mdxViewName));
		ViewLoader.preprocessorData = (this as any).mPreprocessors.xml;
		ViewLoader.controller = oController;
		const mdxContent = (ManagedObject as ManagedObjectEx).runWithPreprocessors(
			() => {
				return MDXContent();
			},
			{
				id: (sId: string) => {
					return this.createId(sId);
				}
			}
		);
		return <Page class={"sapUiContentPadding"}>{{ content: mdxContent }}</Page>;
	}
}
