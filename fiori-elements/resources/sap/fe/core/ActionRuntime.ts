import type { PrimitiveType } from "@sap-ux/vocabularies-types";
import merge from "sap/base/util/merge";
import type { _RequestedProperty } from "sap/fe/core/CommonUtils";
import CommonUtils from "sap/fe/core/CommonUtils";
import type { PathInModelExpression } from "sap/fe/core/helpers/BindingToolkit";
import { compileExpression, constant, equal, transformRecursively } from "sap/fe/core/helpers/BindingToolkit";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { isEntitySet } from "sap/fe/core/helpers/TypeGuards";
import type Event from "sap/ui/base/Event";
import type View from "sap/ui/core/mvc/View";
import type Table from "sap/ui/mdc/Table";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import type PropertyBinding from "sap/ui/model/PropertyBinding";
import AnyElement from "./controls/AnyElement";
import ConverterContext from "./converters/ConverterContext";
import type { BaseManifestSettings } from "./converters/ManifestSettings";
import { getEditButtonEnabled, getHiddenExpression } from "./converters/objectPage/HeaderAndFooterAction";

const ActionRuntime = {
	/**
	 * Sets the action enablement.
	 *
	 * @function
	 * @name setActionEnablement
	 * @param oInternalModelContext Object containing the context model
	 * @param oActionOperationAvailableMap Map containing the operation availability of actions
	 * @param aSelectedContexts Array containing selected contexts of the chart
	 * @param sControl Control name
	 * @returns The action enablement promises
	 * @ui5-restricted
	 */
	setActionEnablement: async function (
		oInternalModelContext: InternalModelContext,
		oActionOperationAvailableMap: Record<string, string>,
		aSelectedContexts: Context[],
		sControl: string
	) {
		const aPromises = [];
		for (const sAction in oActionOperationAvailableMap) {
			let aRequestPromises: Promise<_RequestedProperty>[] = [];
			oInternalModelContext.setProperty(sAction, false);
			const sProperty = oActionOperationAvailableMap[sAction];
			for (let i = 0; i < aSelectedContexts.length; i++) {
				const oSelectedContext = aSelectedContexts[i];
				if (oSelectedContext) {
					const oContextData = oSelectedContext.getObject() as Record<string, unknown>;
					if (sControl === "chart") {
						if ((sProperty === null && !!oContextData[`#${sAction}`]) || oSelectedContext.getObject(sProperty)) {
							//look for action advertisement if present and its value is not null
							oInternalModelContext.setProperty(sAction, true);
							break;
						}
					} else if (sControl === "table") {
						aRequestPromises = this._setActionEnablementForTable(
							oSelectedContext,
							oInternalModelContext,
							sAction,
							sProperty,
							aRequestPromises
						);
					}
				}
			}
			if (sControl === "table") {
				if (!aSelectedContexts.length) {
					oInternalModelContext.setProperty(`dynamicActions/${sAction}`, {
						bEnabled: false,
						aApplicable: [],
						aNotApplicable: []
					});
					aPromises.push(CommonUtils.setContextsBasedOnOperationAvailable(oInternalModelContext, []));
				} else if (aSelectedContexts.length && typeof sProperty === "string") {
					// When all property values have been retrieved, set
					// The applicable and not-applicable selected contexts for each action and
					// The enabled property of the dynamic action in internal model context.
					aPromises.push(CommonUtils.setContextsBasedOnOperationAvailable(oInternalModelContext, aRequestPromises));
				}
			}
		}
		return Promise.all(aPromises);
	},
	setActionEnablementAfterPatch: function (oView: View, oListBinding: ODataListBinding, oInternalModelContext: InternalModelContext) {
		const oInternalModelContextData = oInternalModelContext?.getObject() as Record<string, unknown>;
		const oControls = (oInternalModelContextData?.controls || {}) as Record<string, { controlId?: string }>;
		for (const sKey in oControls) {
			if (oControls[sKey] && oControls[sKey].controlId) {
				const oTable = oView.byId(sKey);
				if (oTable && oTable.isA<Table>("sap.ui.mdc.Table")) {
					const oRowBinding = oTable.getRowBinding();
					if (oRowBinding == oListBinding) {
						ActionRuntime.setActionEnablement(
							oTable.getBindingContext("internal") as InternalModelContext,
							JSON.parse(oTable.data("operationAvailableMap").customData),
							oTable.getSelectedContexts() as Context[],
							"table"
						);
					}
				}
			}
		}
	},

	updateEditButtonVisibilityAndEnablement(oView: View) {
		const iViewLevel = (oView.getViewData() as BaseManifestSettings)?.viewLevel;
		if ((iViewLevel as number) > 1) {
			const oContext = oView.getBindingContext() as Context;
			const oAppComponent = CommonUtils.getAppComponent(oView);
			const sMetaPath = ModelHelper.getMetaPathForContext(oContext);
			const sEntitySet = ModelHelper.getRootEntitySetPath(sMetaPath);
			const metaContext = oContext?.getModel()?.getMetaModel()?.getContext(oContext?.getPath());
			const converterContext = ConverterContext?.createConverterContextForMacro(
				sEntitySet,
				metaContext,
				oAppComponent.getDiagnostics(),
				merge,
				undefined
			);
			const entitySet = converterContext.getEntitySet();
			const entityType = converterContext.getEntityType();
			let updateHidden;
			//Find the Update Hidden of the root entity set and bind the property to AnyElement, any changes in the path of the root UpdateHidden will be updated via the property, internal model context is updated based on the property
			const bUpdateHidden = isEntitySet(entitySet) && entitySet.annotations.UI?.UpdateHidden?.valueOf();
			if (bUpdateHidden !== true) {
				updateHidden = ModelHelper.isUpdateHidden(entitySet, entityType);
			}
			//Find the operation available property of the root edit configuration and fetch the property using AnyElement
			const sEditEnableBinding = getEditButtonEnabled(converterContext, undefined);
			const draftRootPath = ModelHelper.getDraftRootPath(oContext);
			const sStickyRootPath = ModelHelper.getStickyRootPath(oContext);
			const sPath = draftRootPath || sStickyRootPath;
			const oInternalModelContext = oView.getBindingContext("internal") as InternalModelContext;
			if (sPath) {
				const oRootContext = oView.getModel().bindContext(sPath).getBoundContext() as Context;
				if (updateHidden !== undefined) {
					const sHiddenExpression = compileExpression(equal(getHiddenExpression(converterContext, updateHidden), false));
					this.updateEditModelContext(sHiddenExpression, oView, oRootContext, "rootEditVisible", oInternalModelContext);
				}
				if (sEditEnableBinding) {
					this.updateEditModelContext(sEditEnableBinding, oView, oRootContext, "rootEditEnabled", oInternalModelContext);
				}
			}
		}
	},

	updateEditModelContext: function (
		sBindingExpression: string | undefined,
		oView: View,
		oRootContext: Context,
		sProperty: string,
		oInternalModelContext: InternalModelContext
	) {
		if (sBindingExpression) {
			const oHiddenElement = new AnyElement({ anyText: sBindingExpression });
			oHiddenElement.setBindingContext(null);
			oView.addDependent(oHiddenElement);
			oHiddenElement.getBinding("anyText");
			const oContext = oHiddenElement
				.getModel()
				?.bindContext(oRootContext.getPath(), oRootContext, { $$groupId: "$auto.Heroes" })
				?.getBoundContext();
			oHiddenElement.setBindingContext(oContext);
			oHiddenElement?.getBinding("anyText")?.attachChange((oEvent: Event) => {
				const oNewValue = (oEvent.getSource() as PropertyBinding).getExternalValue();
				oInternalModelContext.setProperty(sProperty, oNewValue);
			});
		}
	},

	_setActionEnablementForTable: function (
		oSelectedContext: Context | undefined,
		oInternalModelContext: InternalModelContext,
		sAction: string,
		sProperty: string,
		aRequestPromises: Promise<_RequestedProperty>[]
	) {
		// Reset all properties before computation
		oInternalModelContext.setProperty(`dynamicActions/${sAction}`, {
			bEnabled: false,
			aApplicable: [],
			aNotApplicable: []
		});
		// Note that non dynamic actions are not processed here. They are enabled because
		// one or more are selected and the second part of the condition in the templating
		// is then undefined and thus the button takes the default enabling, which is true!
		const aApplicable = [],
			aNotApplicable = [],
			sDynamicActionEnabledPath = `${oInternalModelContext.getPath()}/dynamicActions/${sAction}/bEnabled`;
		if (typeof sProperty === "object" && sProperty !== null && sProperty !== undefined) {
			if (oSelectedContext) {
				const oContextData = oSelectedContext.getObject() as Record<string, PrimitiveType>;
				const oTransformedBinding = transformRecursively(
					sProperty,
					"PathInModel",
					// eslint-disable-next-line no-loop-func
					function (oBindingExpression: PathInModelExpression<PrimitiveType>) {
						return oContextData ? constant(oContextData[oBindingExpression.path]) : constant(false);
					},
					true
				);
				const sResult = compileExpression(oTransformedBinding);
				if (sResult === "true") {
					oInternalModelContext.getModel().setProperty(sDynamicActionEnabledPath, true);
					aApplicable.push(oSelectedContext);
				} else {
					aNotApplicable.push(oSelectedContext);
				}
			}
			CommonUtils.setDynamicActionContexts(oInternalModelContext, sAction, aApplicable, aNotApplicable);
		} else {
			const oContextData = oSelectedContext?.getObject() as Record<string, PrimitiveType>;
			if (sProperty === null && !!oContextData[`#${sAction}`]) {
				//look for action advertisement if present and its value is not null
				oInternalModelContext.getModel().setProperty(sDynamicActionEnabledPath, true);
			} else if (oSelectedContext !== undefined) {
				// Collect promises to retrieve singleton or normal property value asynchronously
				aRequestPromises.push(CommonUtils.requestProperty(oSelectedContext, sAction, sProperty, sDynamicActionEnabledPath));
			}
		}
		return aRequestPromises;
	}
};
export default ActionRuntime;
