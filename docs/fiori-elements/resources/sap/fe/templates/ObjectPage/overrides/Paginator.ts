import type Paginator from "sap/fe/core/controllerextensions/Paginator";

const PaginatorExtensionOverride = {
	onBeforeContextUpdate: function (this: Paginator, oListBinding: any, iCurrentContextIndex: any) {
		const oCurrentView = this.getView(),
			oControlContext = oCurrentView && oCurrentView.getBindingContext(),
			aCurrentContexts = oListBinding && oListBinding.getCurrentContexts(),
			oPaginatorCurrentContext = aCurrentContexts[iCurrentContextIndex];

		if (oPaginatorCurrentContext && oControlContext && oPaginatorCurrentContext.getPath() !== oControlContext.getPath()) {
			// Prevent default update of context index in Object Page Paginator when view context is different from the paginator context.
			return true;
		}
	},

	onContextUpdate: function (this: Paginator, oContext: any) {
		this.base._routing.navigateToContext(oContext, { callExtension: true });
	}
};

export default PaginatorExtensionOverride;
