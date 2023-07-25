import Service from "sap/ui/core/service/Service";
import ServiceFactory from "sap/ui/core/service/ServiceFactory";
import type { ServiceContext } from "types/metamodel_types";

type AsyncComponentSettings = {};

class AsyncComponentService extends Service<AsyncComponentSettings> {
	resolveFn: any;

	rejectFn: any;

	initPromise!: Promise<any>;
	// !: means that we know it will be assigned before usage

	init() {
		this.initPromise = new Promise((resolve, reject) => {
			this.resolveFn = resolve;
			this.rejectFn = reject;
		});
		const oContext = this.getContext();
		const oComponent = oContext.scopeObject as any;
		const oServices = oComponent._getManifestEntry("/sap.ui5/services", true);
		Promise.all(
			Object.keys(oServices)
				.filter(
					(sServiceKey) =>
						oServices[sServiceKey].startup === "waitFor" &&
						oServices[sServiceKey].factoryName !== "sap.fe.core.services.AsyncComponentService"
				)
				.map((sServiceKey) => {
					return oComponent.getService(sServiceKey).then((oServiceInstance: Service<any>) => {
						const sMethodName = `get${sServiceKey[0].toUpperCase()}${sServiceKey.substr(1)}`;
						if (!oComponent.hasOwnProperty(sMethodName)) {
							oComponent[sMethodName] = function () {
								return oServiceInstance;
							};
						}
					});
				})
		)
			.then(() => {
				return oComponent.pRootControlLoaded || Promise.resolve();
			})
			.then(() => {
				// notifiy the component
				if (oComponent.onServicesStarted) {
					oComponent.onServicesStarted();
				}
				this.resolveFn(this);
			})
			.catch(this.rejectFn);
	}
}

class AsyncComponentServiceFactory extends ServiceFactory<AsyncComponentSettings> {
	createInstance(oServiceContext: ServiceContext<AsyncComponentSettings>) {
		const asyncComponentService = new AsyncComponentService(oServiceContext);
		return asyncComponentService.initPromise;
	}
}

export default AsyncComponentServiceFactory;
