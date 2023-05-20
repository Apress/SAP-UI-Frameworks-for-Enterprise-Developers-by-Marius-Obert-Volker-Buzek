import {
	defineUI5Class,
	extensible,
	finalExtension,
	methodOverride,
	privateExtension,
	publicExtension
} from "sap/fe/core/helpers/ClassSupport";
import type PageController from "sap/fe/core/PageController";
import ControllerExtension from "sap/ui/core/mvc/ControllerExtension";
import OverrideExecution from "sap/ui/core/mvc/OverrideExecution";
import type View from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";

/**
 * Controller extension providing hooks for the navigation using paginators
 *
 * @hideconstructor
 * @public
 * @since 1.94.0
 */
@defineUI5Class("sap.fe.core.controllerextensions.Paginator")
class Paginator extends ControllerExtension {
	private _oView!: View;

	protected base!: PageController;

	private _oListBinding: any;

	private _oCurrentContext?: Context;

	private _iCurrentIndex: number = -1;

	@methodOverride()
	onInit() {
		this._oView = this.base.getView();
		this._oView.setModel(
			new JSONModel({
				navUpEnabled: false,
				navDownEnabled: false
			}),
			"paginator"
		);
	}

	/**
	 * Initiates the paginator control.
	 *
	 * @function
	 * @param oBinding ODataListBinding object
	 * @param oContext Current context where the navigation is initiated
	 * @alias sap.fe.core.controllerextensions.Paginator#initialize
	 * @public
	 * @since 1.94.0
	 */
	@publicExtension()
	@finalExtension()
	initialize(oBinding: ODataListBinding | any, oContext?: Context) {
		if (oBinding && oBinding.getAllCurrentContexts) {
			this._oListBinding = oBinding;
		}
		if (oContext) {
			this._oCurrentContext = oContext;
		}
		this._updateCurrentIndexAndButtonEnablement();
	}

	_updateCurrentIndexAndButtonEnablement() {
		if (this._oCurrentContext && this._oListBinding) {
			const sPath = this._oCurrentContext.getPath();
			// Storing the currentIndex in global variable
			this._iCurrentIndex = this._oListBinding.getAllCurrentContexts().findIndex(function (oContext: any) {
				return oContext && oContext.getPath() === sPath;
			});
			const oCurrentIndexContext = this._oListBinding.getAllCurrentContexts()[this._iCurrentIndex];
			if (
				(!this._iCurrentIndex && this._iCurrentIndex !== 0) ||
				!oCurrentIndexContext ||
				this._oCurrentContext.getPath() !== oCurrentIndexContext.getPath()
			) {
				this._updateCurrentIndex();
			}
		}
		this._handleButtonEnablement();
	}

	_handleButtonEnablement() {
		//Enabling and Disabling the Buttons on change of the control context
		const mButtonEnablementModel = this.base.getView().getModel("paginator") as JSONModel;
		if (this._oListBinding && this._oListBinding.getAllCurrentContexts().length > 1 && this._iCurrentIndex > -1) {
			if (this._iCurrentIndex === this._oListBinding.getAllCurrentContexts().length - 1) {
				mButtonEnablementModel.setProperty("/navDownEnabled", false);
			} else if (this._oListBinding.getAllCurrentContexts()[this._iCurrentIndex + 1].isInactive()) {
				//check the next context is not an inactive context
				mButtonEnablementModel.setProperty("/navDownEnabled", false);
			} else {
				mButtonEnablementModel.setProperty("/navDownEnabled", true);
			}
			if (this._iCurrentIndex === 0) {
				mButtonEnablementModel.setProperty("/navUpEnabled", false);
			} else if (this._oListBinding.getAllCurrentContexts()[this._iCurrentIndex - 1].isInactive()) {
				mButtonEnablementModel.setProperty("/navUpEnabled", false);
			} else {
				mButtonEnablementModel.setProperty("/navUpEnabled", true);
			}
		} else {
			// Don't show the paginator buttons
			// 1. When no listbinding is available
			// 2. Only '1' or '0' context exists in the listBinding
			// 3. The current index is -ve, i.e the currentIndex is invalid.
			mButtonEnablementModel.setProperty("/navUpEnabled", false);
			mButtonEnablementModel.setProperty("/navDownEnabled", false);
		}
	}

	_updateCurrentIndex() {
		if (this._oCurrentContext && this._oListBinding) {
			const sPath = this._oCurrentContext.getPath();
			// Storing the currentIndex in global variable
			this._iCurrentIndex = this._oListBinding.getAllCurrentContexts().findIndex(function (oContext: any) {
				return oContext && oContext.getPath() === sPath;
			});
		}
	}

	@publicExtension()
	@finalExtension()
	async updateCurrentContext(iDeltaIndex: any) {
		if (!this._oListBinding) {
			return;
		}
		const oModel = this._oCurrentContext?.getModel ? this._oCurrentContext?.getModel() : undefined;
		//Submitting any pending changes that might be there before navigating to next context.
		await oModel?.submitBatch("$auto");
		const aCurrentContexts = this._oListBinding.getAllCurrentContexts();
		const iNewIndex = this._iCurrentIndex + iDeltaIndex;
		const oNewContext = aCurrentContexts[iNewIndex];

		if (oNewContext) {
			const bPreventIdxUpdate = this.onBeforeContextUpdate(this._oListBinding, this._iCurrentIndex, iDeltaIndex);
			if (!bPreventIdxUpdate) {
				this._iCurrentIndex = iNewIndex;
				this._oCurrentContext = oNewContext;
			}
			this.onContextUpdate(oNewContext);
		}
		this._handleButtonEnablement();
	}

	/**
	 * Called before context update.
	 *
	 * @function
	 * @param _oListBinding ODataListBinding object
	 * @param _iCurrentIndex Current index of context in listBinding from where the navigation is initiated
	 * @param _iIndexUpdate The delta index for update
	 * @returns `true` to prevent the update of current context.
	 * @alias sap.fe.core.controllerextensions.Paginator#onBeforeContextUpdate
	 * @private
	 */
	@privateExtension()
	@extensible(OverrideExecution.After)
	onBeforeContextUpdate(_oListBinding: ODataListBinding, _iCurrentIndex: number, _iIndexUpdate: number) {
		return false;
	}

	/**
	 * Returns the updated context after the paginator operation.
	 *
	 * @function
	 * @param oContext Final context returned after the paginator action
	 * @alias sap.fe.core.controllerextensions.Paginator#onContextUpdate
	 * @public
	 * @since 1.94.0
	 */
	@privateExtension()
	@extensible(OverrideExecution.After)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onContextUpdate(oContext: Context) {
		//To be overridden by the application
	}
}
export default Paginator;
