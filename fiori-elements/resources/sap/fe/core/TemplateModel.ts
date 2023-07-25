import { defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import BaseObject from "sap/ui/base/Object";
import type Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

// We are overriding internal from the JSONModel so this makes sense
type InternalJSONModel = JSONModel & {
	_getObject(sPath: string, oContext?: Context): object;
};
@defineUI5Class("sap.fe.core.TemplateModel")
class TemplateModel extends BaseObject {
	public oMetaModel: ODataMetaModel;

	public oConfigModel: JSONModel;

	public bConfigLoaded: boolean;

	public fnCreateMetaBindingContext: Function;

	public fnCreateConfigBindingContext: Function;

	public fnSetData: Function;

	constructor(pageConfig: Function | object, oMetaModel: ODataMetaModel) {
		super();
		this.oMetaModel = oMetaModel;
		this.oConfigModel = new JSONModel();
		// don't limit aggregation bindings
		this.oConfigModel.setSizeLimit(Number.MAX_VALUE);
		this.bConfigLoaded = false;
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;

		if (typeof pageConfig === "function") {
			const fnGetObject = (this.oConfigModel as InternalJSONModel)._getObject.bind(this.oConfigModel);
			(this.oConfigModel as InternalJSONModel)._getObject = function (sPath: string, oContext: Context) {
				if (!that.bConfigLoaded) {
					this.setData(pageConfig());
				}
				return fnGetObject(sPath, oContext);
			};
		} else {
			this.oConfigModel.setData(pageConfig);
		}

		this.fnCreateMetaBindingContext = this.oMetaModel.createBindingContext.bind(this.oMetaModel);
		this.fnCreateConfigBindingContext = this.oConfigModel.createBindingContext.bind(this.oConfigModel);
		this.fnSetData = this.oConfigModel.setData.bind(this.oConfigModel);

		this.oConfigModel.createBindingContext = this.createBindingContext.bind(this);
		this.oConfigModel.setData = this.setData.bind(this);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return this.oConfigModel;
	}

	/**
	 * Overwrite the standard setData to keep track whether the external configuration has been loaded or not.
	 *
	 * @param dataToSet The data to set to the json model containing the configuration
	 */
	setData(dataToSet: object) {
		this.fnSetData(dataToSet);
		this.bConfigLoaded = true;
	}

	createBindingContext(sPath: string, oContext?: Context, mParameters?: { noResolve?: boolean }, fnCallBack?: Function): Context {
		let oBindingContext;
		const bNoResolve = mParameters && mParameters.noResolve;

		oBindingContext = this.fnCreateConfigBindingContext(sPath, oContext, mParameters, fnCallBack);
		const sResolvedPath = !bNoResolve && oBindingContext?.getObject();
		if (sResolvedPath && typeof sResolvedPath === "string") {
			oBindingContext = this.fnCreateMetaBindingContext(sResolvedPath, oContext, mParameters, fnCallBack);
		}

		return oBindingContext;
	}

	destroy() {
		this.oConfigModel.destroy();
		JSONModel.prototype.destroy.apply(this);
	}
}

export default TemplateModel;
