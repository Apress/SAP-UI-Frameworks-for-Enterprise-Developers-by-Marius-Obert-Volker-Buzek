import Log from "sap/base/Log";
import type AppComponent from "sap/fe/core/AppComponent";
import { ManifestContent } from "sap/fe/core/AppComponent";
import DataQueryWatcher from "sap/fe/core/controllerextensions/pageReady/DataQueryWatcher";
import type PageController from "sap/fe/core/PageController";
import TemplatedViewServiceFactory from "sap/fe/core/services/TemplatedViewServiceFactory";
import type Event from "sap/ui/base/Event";
import EventProvider from "sap/ui/base/EventProvider";
import type ManagedObject from "sap/ui/base/ManagedObject";
import Component from "sap/ui/core/Component";
import Core from "sap/ui/core/Core";
import ControllerExtension from "sap/ui/core/mvc/ControllerExtension";
import OverrideExecution from "sap/ui/core/mvc/OverrideExecution";
import type View from "sap/ui/core/mvc/View";
import type Context from "sap/ui/model/odata/v4/Context";
import CommonUtils from "../CommonUtils";
import { defineUI5Class, extensible, finalExtension, methodOverride, privateExtension, publicExtension } from "../helpers/ClassSupport";

@defineUI5Class("sap.fe.core.controllerextensions.PageReady")
class PageReadyControllerExtension extends ControllerExtension {
	protected base!: PageController;

	private _oEventProvider!: EventProvider;

	private view!: View;

	private appComponent!: AppComponent;

	private pageComponent!: Component;

	private _oContainer!: any;

	private _bAfterBindingAlreadyApplied!: boolean;

	private _fnContainerDelegate: any;

	private _nbWaits!: number;

	private _bIsPageReady!: boolean;

	private _bWaitingForRefresh!: boolean;

	private bShown!: boolean;

	private bHasContext!: boolean;

	private bTablesChartsLoaded?: boolean;

	private pageReadyTimer: number | undefined;

	private queryWatcher!: DataQueryWatcher;

	private onAfterBindingPromise!: Promise<void>;

	private pageReadyTimeoutDefault = 7000;

	private pageReadyTimeoutTimer?: number;

	private pageReadyTimeout?: number;

	@methodOverride()
	public onInit() {
		this._nbWaits = 0;
		this._oEventProvider = this._oEventProvider ? this._oEventProvider : new EventProvider();
		this.view = this.getView();

		this.appComponent = CommonUtils.getAppComponent(this.view);
		this.pageComponent = Component.getOwnerComponentFor(this.view) as Component;
		const manifestContent: ManifestContent = this.appComponent.getManifest();
		this.pageReadyTimeout = manifestContent["sap.ui5"]?.pageReadyTimeout ?? this.pageReadyTimeoutDefault;

		if (this.pageComponent?.attachContainerDefined) {
			this.pageComponent.attachContainerDefined((oEvent: Event) => this.registerContainer(oEvent.getParameter("container")));
		} else {
			this.registerContainer(this.view as ManagedObject);
		}

		const rootControlController = (this.appComponent.getRootControl() as View).getController() as any;
		const placeholder = rootControlController?.getPlaceholder?.();
		if (placeholder?.isPlaceholderDebugEnabled()) {
			this.attachEvent(
				"pageReady",
				null,
				() => {
					placeholder.getPlaceholderDebugStats().iPageReadyEventTimestamp = Date.now();
				},
				this
			);
			this.attachEvent(
				"heroesBatchReceived",
				null,
				() => {
					placeholder.getPlaceholderDebugStats().iHeroesBatchReceivedEventTimestamp = Date.now();
				},
				this
			);
		}

		this.queryWatcher = new DataQueryWatcher(this._oEventProvider, this.checkPageReadyDebounced.bind(this));
	}

	@methodOverride()
	public onExit() {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		delete this._oAppComponent;
		if (this._oContainer) {
			this._oContainer.removeEventDelegate(this._fnContainerDelegate);
		}
	}

	@publicExtension()
	@finalExtension()
	public waitFor(oPromise: any) {
		this._nbWaits++;
		oPromise
			.finally(() => {
				setTimeout(() => {
					this._nbWaits--;
				}, 0);
			})
			.catch(null);
	}

	@methodOverride("_routing")
	onRouteMatched() {
		this._bIsPageReady = false;
	}

	@methodOverride("_routing")
	async onRouteMatchedFinished() {
		await this.onAfterBindingPromise;
		this.checkPageReadyDebounced();
	}

	public registerAggregatedControls(mainBindingContext?: Context): Promise<void>[] {
		if (mainBindingContext) {
			const mainObjectBinding = mainBindingContext.getBinding();
			this.queryWatcher.registerBinding(mainObjectBinding);
		}

		const aPromises: Promise<void>[] = [];
		const aControls = this.getView().findAggregatedObjects(true);

		aControls.forEach((oElement: any) => {
			const oObjectBinding = oElement.getObjectBinding();
			if (oObjectBinding) {
				// Register on all object binding (mostly used on object pages)
				this.queryWatcher.registerBinding(oObjectBinding);
			} else {
				const aBindingKeys = Object.keys(oElement.mBindingInfos);
				aBindingKeys.forEach((sPropertyName) => {
					const oListBinding = oElement.mBindingInfos[sPropertyName].binding;

					if (oListBinding && oListBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
						this.queryWatcher.registerBinding(oListBinding);
					}
				});
			}
			// This is dirty but MDCTables and MDCCharts have a weird loading lifecycle
			if (oElement.isA("sap.ui.mdc.Table") || oElement.isA("sap.ui.mdc.Chart")) {
				this.bTablesChartsLoaded = false;
				aPromises.push(this.queryWatcher.registerTableOrChart(oElement));
			} else if (oElement.isA("sap.fe.core.controls.FilterBar")) {
				this.queryWatcher.registerFilterBar(oElement);
			}
		});

		return aPromises;
	}

	@methodOverride("_routing")
	onAfterBinding(oBindingContext?: Context) {
		// In case the page is rebind we need to clear the timer (eg: in FCL, the user can select 2 items successively in the list report)
		if (this.pageReadyTimeoutTimer) {
			clearTimeout(this.pageReadyTimeoutTimer);
		}
		this.pageReadyTimeoutTimer = setTimeout(() => {
			Log.error(
				`The PageReady Event was not fired within the ${this.pageReadyTimeout} ms timeout . It has been forced. Please contact your application developer for further analysis`
			);
			this._oEventProvider.fireEvent("pageReady");
		}, this.pageReadyTimeout);

		if (this._bAfterBindingAlreadyApplied) {
			return;
		}

		this._bAfterBindingAlreadyApplied = true;
		if (this.isContextExpected() && oBindingContext === undefined) {
			// Force to mention we are expecting data
			this.bHasContext = false;
			return;
		} else {
			this.bHasContext = true;
		}

		this.attachEventOnce(
			"pageReady",
			null,
			() => {
				clearTimeout(this.pageReadyTimeoutTimer);
				this.pageReadyTimeoutTimer = undefined;
				this._bAfterBindingAlreadyApplied = false;
				this.queryWatcher.reset();
			},
			null
		);

		this.onAfterBindingPromise = new Promise<void>(async (resolve) => {
			const aTableChartInitializedPromises = this.registerAggregatedControls(oBindingContext);

			if (aTableChartInitializedPromises.length > 0) {
				await Promise.all(aTableChartInitializedPromises);
				this.bTablesChartsLoaded = true;
				this.checkPageReadyDebounced();
				resolve();
			} else {
				this.checkPageReadyDebounced();
				resolve();
			}
		});
	}

	@publicExtension()
	@finalExtension()
	public isPageReady() {
		return this._bIsPageReady;
	}

	@publicExtension()
	@finalExtension()
	public waitPageReady(): Promise<void> {
		return new Promise((resolve) => {
			if (this.isPageReady()) {
				resolve();
			} else {
				this.attachEventOnce(
					"pageReady",
					null,
					() => {
						resolve();
					},
					this
				);
			}
		});
	}

	@publicExtension()
	@finalExtension()
	public attachEventOnce(sEventId: string, oData: any, fnFunction?: Function, oListener?: any) {
		// eslint-disable-next-line prefer-rest-params
		return this._oEventProvider.attachEventOnce(sEventId, oData, fnFunction as Function, oListener);
	}

	@publicExtension()
	@finalExtension()
	public attachEvent(sEventId: string, oData: any, fnFunction: Function, oListener: any) {
		// eslint-disable-next-line prefer-rest-params
		return this._oEventProvider.attachEvent(sEventId, oData, fnFunction, oListener);
	}

	@publicExtension()
	@finalExtension()
	public detachEvent(sEventId: string, fnFunction: Function) {
		// eslint-disable-next-line prefer-rest-params
		return this._oEventProvider.detachEvent(sEventId, fnFunction);
	}

	private registerContainer(oContainer: ManagedObject) {
		this._oContainer = oContainer;
		this._fnContainerDelegate = {
			onBeforeShow: () => {
				this.bShown = false;
				this._bIsPageReady = false;
			},
			onBeforeHide: () => {
				this.bShown = false;
				this._bIsPageReady = false;
			},
			onAfterShow: () => {
				this.bShown = true;
				this.onAfterBindingPromise?.then(() => {
					this._checkPageReady(true);
				});
			}
		};
		this._oContainer.addEventDelegate(this._fnContainerDelegate, this);
	}

	@privateExtension()
	@extensible(OverrideExecution.Instead)
	public isContextExpected() {
		return false;
	}

	@publicExtension()
	public checkPageReadyDebounced() {
		if (this.pageReadyTimer) {
			clearTimeout(this.pageReadyTimer);
		}
		this.pageReadyTimer = setTimeout(() => {
			this._checkPageReady();
		}, 200) as unknown as number;
	}

	public _checkPageReady(bFromNav: boolean = false) {
		const fnUIUpdated = () => {
			// Wait until the UI is no longer dirty
			if (!Core.getUIDirty()) {
				Core.detachEvent("UIUpdated", fnUIUpdated);
				this._bWaitingForRefresh = false;
				this.checkPageReadyDebounced();
			}
		};

		// In case UIUpdate does not get called, check if UI is not dirty and then call _checkPageReady
		const checkUIUpdated = () => {
			if (Core.getUIDirty()) {
				setTimeout(checkUIUpdated, 500);
			} else if (this._bWaitingForRefresh) {
				this._bWaitingForRefresh = false;
				Core.detachEvent("UIUpdated", fnUIUpdated);
				this.checkPageReadyDebounced();
			}
		};

		if (
			this.bShown &&
			this.queryWatcher.isDataReceived() !== false &&
			this.bTablesChartsLoaded !== false &&
			(!this.isContextExpected() || this.bHasContext) // Either no context is expected or there is one
		) {
			if (this.queryWatcher.isDataReceived() === true && !bFromNav && !this._bWaitingForRefresh && Core.getUIDirty()) {
				// If we requested data we get notified as soon as the data arrived, so before the next rendering tick
				this.queryWatcher.resetDataReceived();
				this._bWaitingForRefresh = true;
				Core.attachEvent("UIUpdated", fnUIUpdated);
				setTimeout(checkUIUpdated, 500);
			} else if (
				(!this._bWaitingForRefresh && Core.getUIDirty()) ||
				this._nbWaits !== 0 ||
				TemplatedViewServiceFactory.getNumberOfViewsInCreationState() > 0 ||
				this.queryWatcher.isSearchPending()
			) {
				this._bWaitingForRefresh = true;
				Core.attachEvent("UIUpdated", fnUIUpdated);
				setTimeout(checkUIUpdated, 500);
			} else if (!this._bWaitingForRefresh) {
				// In the case we're not waiting for any data (navigating back to a page we already have loaded)
				// just wait for a frame to fire the event.
				this._bIsPageReady = true;
				this._oEventProvider.fireEvent("pageReady");
			}
		}
	}
}

export default PageReadyControllerExtension;
