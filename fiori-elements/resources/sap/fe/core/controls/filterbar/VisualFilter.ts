import CommonUtils from "sap/fe/core/CommonUtils";
import VisualFilterUtils from "sap/fe/core/controls/filterbar/utils/VisualFilterUtils";
import { defineUI5Class, event, implementInterface, property } from "sap/fe/core/helpers/ClassSupport";
import CommonHelper from "sap/fe/macros/CommonHelper";
import FilterUtils from "sap/fe/macros/filter/FilterUtils";
import VBox from "sap/m/VBox";
import Core from "sap/ui/core/Core";
import type { IFormContent } from "sap/ui/core/library";
import type FilterBar from "sap/ui/mdc/FilterBar";
import { getFiltersConditionsFromSelectionVariant } from "../../templating/FilterHelper";
/**
 * Constructor for a new filterBar/aligned/FilterItemLayout.
 *
 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
 * @param {object} [mSettings] Initial settings for the new control
 * @class Represents a filter item on the UI.
 * @extends sap.m.VBox
 * @implements {sap.ui.core.IFormContent}
 * @class
 * @private
 * @since 1.61.0
 * @alias control sap.fe.core.controls.filterbar.VisualFilter
 */
@defineUI5Class("sap.fe.core.controls.filterbar.VisualFilter")
class VisualFilter extends VBox implements IFormContent {
	@implementInterface("sap.ui.core.IFormContent")
	__implements__sap_ui_core_IFormContent: boolean = true;

	@property({
		type: "boolean"
	})
	showValueHelp!: boolean;

	@property({
		type: "string"
	})
	valueHelpIconSrc!: string;

	@event()
	valueHelpRequest!: Function;

	private _oChartBinding?: boolean;

	onAfterRendering() {
		let sLabel;
		const oInteractiveChart = (this.getItems()[1] as any).getItems()[0];
		const sInternalContextPath = this.data("infoPath");
		const oInteractiveChartListBinding =
			oInteractiveChart.getBinding("segments") || oInteractiveChart.getBinding("bars") || oInteractiveChart.getBinding("points");
		const oInternalModelContext = oInteractiveChart.getBindingContext("internal");
		const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
		const bShowOverLayInitially = oInteractiveChart.data("showOverlayInitially");
		const oSelectionVariantAnnotation: any = oInteractiveChart.data("selectionVariantAnnotation")
			? CommonHelper.parseCustomData(oInteractiveChart.data("selectionVariantAnnotation"))
			: { SelectOptions: [] };
		const aRequiredProperties: any[] = oInteractiveChart.data("requiredProperties")
			? (CommonHelper.parseCustomData(oInteractiveChart.data("requiredProperties")) as any[])
			: [];
		const oMetaModel = oInteractiveChart.getModel().getMetaModel();
		const sEntitySetPath = oInteractiveChartListBinding ? oInteractiveChartListBinding.getPath() : "";
		let oFilterBar = this.getParent()?.getParent() as FilterBar;
		// TODO: Remove this part once 2170204347 is fixed
		if (oFilterBar.getMetadata().getElementName() === "sap.ui.mdc.filterbar.p13n.AdaptationFilterBar") {
			oFilterBar = oFilterBar.getParent()?.getParent() as FilterBar;
		}
		let oFilterBarConditions: any = {};
		let aPropertyInfoSet = [];
		let sFilterEntityName;
		if (oFilterBar.getMetadata().getElementName() === "sap.fe.core.controls.FilterBar") {
			oFilterBarConditions = oFilterBar.getConditions();
			aPropertyInfoSet = (oFilterBar as any).getPropertyInfoSet();
			sFilterEntityName = oFilterBar.data("entityType").split("/")[1];
		}
		const aParameters = oInteractiveChart.data("parameters") ? oInteractiveChart.data("parameters").customData : [];
		const filterConditions = getFiltersConditionsFromSelectionVariant(
			sEntitySetPath,
			oMetaModel,
			oSelectionVariantAnnotation,
			VisualFilterUtils.getCustomConditions.bind(VisualFilterUtils)
		);
		const oSelectionVariantConditions = VisualFilterUtils.convertFilterCondions(filterConditions);
		const mConditions: any = {};

		Object.keys(oFilterBarConditions).forEach(function (sKey: string) {
			if (oFilterBarConditions[sKey].length) {
				mConditions[sKey] = oFilterBarConditions[sKey];
			}
		});

		Object.keys(oSelectionVariantConditions).forEach(function (sKey: string) {
			if (!mConditions[sKey]) {
				mConditions[sKey] = oSelectionVariantConditions[sKey];
			}
		});
		if (bShowOverLayInitially === "true") {
			if (!Object.keys(oSelectionVariantAnnotation).length) {
				if (aRequiredProperties.length > 1) {
					oInternalModelContext.setProperty(sInternalContextPath, {
						showError: true,
						errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
						errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_MULTIPLEVF")
					});
				} else {
					sLabel =
						oMetaModel.getObject(`${sEntitySetPath}/${aRequiredProperties[0]}@com.sap.vocabularies.Common.v1.Label`) ||
						aRequiredProperties[0];
					oInternalModelContext.setProperty(sInternalContextPath, {
						showError: true,
						errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
						errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_SINGLEVF", sLabel)
					});
				}
			} else {
				const aSelectOptions: any[] = [];
				const aNotMatchedConditions: any[] = [];
				if (oSelectionVariantAnnotation.SelectOptions) {
					oSelectionVariantAnnotation.SelectOptions.forEach(function (oSelectOption: any) {
						aSelectOptions.push(oSelectOption.PropertyName.$PropertyPath);
					});
				}
				if (oSelectionVariantAnnotation.Parameters) {
					oSelectionVariantAnnotation.Parameters.forEach(function (oParameter: any) {
						aSelectOptions.push(oParameter.PropertyName.$PropertyPath);
					});
				}
				aRequiredProperties.forEach(function (sPath: any) {
					if (aSelectOptions.indexOf(sPath) === -1) {
						aNotMatchedConditions.push(sPath);
					}
				});
				if (aNotMatchedConditions.length > 1) {
					oInternalModelContext.setProperty(sInternalContextPath, {
						showError: true,
						errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
						errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_MULTIPLEVF")
					});
				} else {
					sLabel =
						oMetaModel.getObject(`${sEntitySetPath}/${aNotMatchedConditions[0]}@com.sap.vocabularies.Common.v1.Label`) ||
						aNotMatchedConditions[0];
					oInternalModelContext.setProperty(sInternalContextPath, {
						showError: true,
						errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
						errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_SINGLEVF", sLabel)
					});
				}
				if (aNotMatchedConditions.length > 1) {
					oInternalModelContext.setProperty(sInternalContextPath, {
						showError: true,
						errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
						errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_MULTIPLEVF")
					});
				} else {
					oInternalModelContext.setProperty(sInternalContextPath, {
						showError: true,
						errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
						errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_SINGLEVF", aNotMatchedConditions[0])
					});
				}
			}
		}

		if (!this._oChartBinding || this._oChartBinding !== oInteractiveChartListBinding) {
			if (this._oChartBinding) {
				this.detachDataReceivedHandler(this._oChartBinding);
			}
			this.attachDataRecivedHandler(oInteractiveChartListBinding);
			this._oChartBinding = oInteractiveChartListBinding;
		}
		const bShowOverlay =
			oInternalModelContext.getProperty(sInternalContextPath) && oInternalModelContext.getProperty(sInternalContextPath).showError;
		const sChartEntityName = sEntitySetPath !== "" ? sEntitySetPath.split("/")[1].split("(")[0] : "";
		if (aParameters && aParameters.length && sFilterEntityName === sChartEntityName) {
			const sBindingPath = FilterUtils.getBindingPathForParameters(oFilterBar, mConditions, aPropertyInfoSet, aParameters);
			if (sBindingPath) {
				oInteractiveChartListBinding.sPath = sBindingPath;
			}
		}
		// resume binding for only those visual filters that do not have a in parameter attached.
		// Bindings of visual filters with inParameters will be resumed later after considering in parameters.
		if (oInteractiveChartListBinding && oInteractiveChartListBinding.isSuspended() && !bShowOverlay) {
			oInteractiveChartListBinding.resume();
		}
	}

	attachDataRecivedHandler(oInteractiveChartListBinding: any) {
		if (oInteractiveChartListBinding) {
			oInteractiveChartListBinding.attachEvent("dataReceived", this.onInternalDataReceived, this);
			this._oChartBinding = oInteractiveChartListBinding;
		}
	}

	detachDataReceivedHandler(oInteractiveChartListBinding: any) {
		if (oInteractiveChartListBinding) {
			oInteractiveChartListBinding.detachEvent("dataReceived", this.onInternalDataReceived, this);
			this._oChartBinding = undefined;
		}
	}

	setShowValueHelp(bShowValueHelp: any) {
		if (this.getItems().length > 0) {
			const oVisualFilterControl = (this.getItems()[0] as any).getItems()[0];
			oVisualFilterControl.getContent().some(function (oInnerControl: any) {
				if (oInnerControl.isA("sap.m.Button")) {
					oInnerControl.setVisible(bShowValueHelp);
				}
			});
			this.setProperty("showValueHelp", bShowValueHelp);
		}
	}

	setValueHelpIconSrc(sIconSrc: any) {
		if (this.getItems().length > 0) {
			const oVisualFilterControl = (this.getItems()[0] as any).getItems()[0];
			oVisualFilterControl.getContent().some(function (oInnerControl: any) {
				if (oInnerControl.isA("sap.m.Button")) {
					oInnerControl.setIcon(sIconSrc);
				}
			});
			this.setProperty("valueHelpIconSrc", sIconSrc);
		}
	}

	onInternalDataReceived(oEvent: any) {
		const sId = this.getId();
		const oView = CommonUtils.getTargetView(this);
		const oInteractiveChart = (this.getItems()[1] as any).getItems()[0];
		const sInternalContextPath = this.data("infoPath");
		const oInternalModelContext = oInteractiveChart.getBindingContext("internal");
		const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
		const vUOM = oInteractiveChart.data("uom");
		VisualFilterUtils.updateChartScaleFactorTitle(oInteractiveChart, oView, sId, sInternalContextPath);
		if (oEvent.getParameter("error")) {
			const s18nMessageTitle = oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE");
			const s18nMessage = oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_DATA_TEXT");
			VisualFilterUtils.applyErrorMessageAndTitle(s18nMessageTitle, s18nMessage, sInternalContextPath, oView);
		} else if (oEvent.getParameter("data")) {
			const oData = oEvent.getSource().getCurrentContexts();
			if (oData && oData.length === 0) {
				VisualFilterUtils.setNoDataMessage(sInternalContextPath, oResourceBundle, oView);
			} else {
				oInternalModelContext.setProperty(sInternalContextPath, {});
			}
			VisualFilterUtils.setMultiUOMMessage(oData, oInteractiveChart, sInternalContextPath, oResourceBundle, oView);
		}
		if (vUOM && ((vUOM["ISOCurrency"] && vUOM["ISOCurrency"].$Path) || (vUOM["Unit"] && vUOM["Unit"].$Path))) {
			const oContexts = oEvent.getSource().getContexts();
			const oContextData = oContexts && oContexts[0].getObject();
			VisualFilterUtils.applyUOMToTitle(oInteractiveChart, oContextData, oView, sInternalContextPath);
		}
	}
}
export default VisualFilter;
