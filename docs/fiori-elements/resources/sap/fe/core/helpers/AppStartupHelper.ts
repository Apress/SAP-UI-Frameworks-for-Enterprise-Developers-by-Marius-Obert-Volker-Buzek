import type Router from "sap/ui/core/routing/Router";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import ModelHelper from "./ModelHelper";

type ValuedKey = {
	name: string;
	value: string;
};

type PageInfo = {
	pattern: string;
	contextPath: string;
	draftMode: Boolean;
	technicalKeys: ValuedKey[] | undefined;
	semanticKeys: ValuedKey[] | undefined;
	target: string;
	pageLevel: number;
};

const AppStartupHelper = {
	/**
	 * Retrieves a set of key values from startup parameters.
	 *
	 * @param aKeyNames The array of key names
	 * @param oStartupParameters The startup parameters
	 * @returns An array of pairs \{name, value\} if all key values could be found in the startup parameters, undefined otherwise
	 */
	_getKeysFromStartupParams: function (aKeyNames: string[], oStartupParameters: any): ValuedKey[] | undefined {
		let bAllFound = true;
		const aKeys = aKeyNames.map((name) => {
			if (oStartupParameters[name] && oStartupParameters[name].length === 1) {
				return { name, value: oStartupParameters[name][0] as string };
			} else {
				// A unique key value couldn't be found in the startup parameters
				bAllFound = false;
				return { name, value: "" };
			}
		});

		return bAllFound ? aKeys : undefined;
	},

	/**
	 * Creates a filter from a list of key values.
	 *
	 * @param aKeys Array of semantic keys or technical keys (with values)
	 * @param bDraftMode True if the entity supports draft mode
	 * @param oMetaModel The metamodel
	 * @returns The filter
	 */
	_createFilterFromKeys: function (aKeys: ValuedKey[], bDraftMode: Boolean, oMetaModel: ODataMetaModel): Filter {
		const bFilterCaseSensitive = ModelHelper.isFilteringCaseSensitive(oMetaModel);

		let bFilterOnActiveEntity = false;
		const aFilters = aKeys.map((key) => {
			if (key.name === "IsActiveEntity") {
				bFilterOnActiveEntity = true;
			}
			return new Filter({
				path: key.name,
				operator: FilterOperator.EQ,
				value1: key.value,
				caseSensitive: bFilterCaseSensitive
			});
		});
		if (bDraftMode && !bFilterOnActiveEntity) {
			const oDraftFilter = new Filter({
				filters: [new Filter("IsActiveEntity", "EQ", false), new Filter("SiblingEntity/IsActiveEntity", "EQ", null)],
				and: false
			});
			aFilters.push(oDraftFilter);
		}

		return new Filter(aFilters, true);
	},

	/**
	 * Loads all contexts for a list of page infos.
	 *
	 * @param aStartupPages The list of page infos
	 * @param oModel The model used to load the contexts
	 * @returns A Promise for all contexts
	 */
	_requestObjectsFromParameters: function (aStartupPages: PageInfo[], oModel: ODataModel): Promise<Context[][]> {
		// Load the respective objects for all object pages found in aExternallyNavigablePages
		const aContextPromises = aStartupPages.map((pageInfo) => {
			const aKeys = pageInfo.semanticKeys || pageInfo.technicalKeys || [];
			const oFilter = this._createFilterFromKeys(aKeys, pageInfo.draftMode, oModel.getMetaModel());

			// only request a minimum of fields to boost backend performance since this is only used to check if an object exists
			const oListBind = oModel.bindList(pageInfo.contextPath, undefined, undefined, oFilter, {
				$select: aKeys
					.map((key) => {
						return key.name;
					})
					.join(",")
			} as any);
			return oListBind.requestContexts(0, 2);
		});

		return Promise.all(aContextPromises);
	},

	/**
	 * Creates a PageInfo from a route if it's reachable from the startup parameters.
	 *
	 * @param oRoute The route
	 * @param oManifestRouting The app manifest routing section
	 * @param oStartupParameters The startup parameters
	 * @param oMetaModel The app metamodel
	 * @returns A page info if the page is reachable, undefined otherwise
	 */
	_getReachablePageInfoFromRoute: function (
		oRoute: any,
		oManifestRouting: any,
		oStartupParameters: any,
		oMetaModel: ODataMetaModel
	): PageInfo | undefined {
		// Remove trailing ':?query:' and '/'
		let sPattern: string = oRoute.pattern.replace(":?query:", "");
		sPattern = sPattern.replace(/\/$/, "");

		if (!sPattern || !sPattern.endsWith(")")) {
			// Ignore level-0 routes (ListReport) or routes corresponding to a 1-1 relation (no keys in the URL in this case)
			return undefined;
		}

		sPattern = sPattern.replace(/\(\{[^}]*\}\)/g, "(#)"); // Replace keys with #

		// Get the rightmost target for this route
		const sTargetName: string = Array.isArray(oRoute.target) ? oRoute.target[oRoute.target.length - 1] : oRoute.target;
		const oTarget = oManifestRouting.targets[sTargetName];

		const aPatternSegments = sPattern.split("/");
		const pageLevel = aPatternSegments.length - 1;

		if (pageLevel !== 0 && oTarget?.options?.settings?.allowDeepLinking !== true) {
			// The first level of object page allows deep linking by default.
			// Otherwise, the target must allow deep linking explicitely in the manifest
			return undefined;
		}

		const sContextPath: string =
			oTarget.options.settings.contextPath || (oTarget.options.settings.entitySet && `/${oTarget.options.settings.entitySet}`);
		const oEntityType = sContextPath && oMetaModel.getObject(`/$EntityContainer${sContextPath}/`);

		if (!oEntityType) {
			return undefined;
		}

		// Get the semantic key values for the entity
		const aSemanticKeyNames: any = oMetaModel.getObject(`/$EntityContainer${sContextPath}/@com.sap.vocabularies.Common.v1.SemanticKey`);

		const aSemantickKeys = aSemanticKeyNames
			? this._getKeysFromStartupParams(
					aSemanticKeyNames.map((semKey: any) => {
						return semKey.$PropertyPath as string;
					}),
					oStartupParameters
			  )
			: undefined;

		// Get the technical keys only if we couldn't find the semantic key values, and on first level OP
		const aTechnicalKeys =
			!aSemantickKeys && pageLevel === 0 ? this._getKeysFromStartupParams(oEntityType["$Key"], oStartupParameters) : undefined;

		if (aSemantickKeys === undefined && aTechnicalKeys === undefined) {
			// We couldn't find the semantic/technical keys in the startup parameters
			return undefined;
		}

		// The startup parameters contain values for all semantic keys (or technical keys) --> we can store the page info in the corresponding level
		const draftMode =
			oMetaModel.getObject(`/$EntityContainer${sContextPath}@com.sap.vocabularies.Common.v1.DraftRoot`) ||
			oMetaModel.getObject(`/$EntityContainer${sContextPath}@com.sap.vocabularies.Common.v1.DraftNode`)
				? true
				: false;

		return {
			pattern: sPattern,
			contextPath: sContextPath,
			draftMode,
			technicalKeys: aTechnicalKeys,
			semanticKeys: aSemantickKeys,
			target: sTargetName,
			pageLevel
		};
	},

	/**
	 * Returns the list of all pages that allow deeplink and that can be reached using the startup parameters.
	 *
	 * @param oManifestRouting The routing information from the app manifest
	 * @param oStartupParameters The startup parameters
	 * @param oMetaModel The metamodel
	 * @returns The reachable pages
	 */
	_getReachablePages: function (oManifestRouting: any, oStartupParameters: any, oMetaModel: ODataMetaModel): PageInfo[][] {
		const aRoutes: any[] = oManifestRouting.routes;
		const mPagesByLevel: Record<number, PageInfo[]> = {};

		aRoutes.forEach((oRoute) => {
			const oPageInfo = this._getReachablePageInfoFromRoute(oRoute, oManifestRouting, oStartupParameters, oMetaModel);

			if (oPageInfo) {
				if (!mPagesByLevel[oPageInfo.pageLevel]) {
					mPagesByLevel[oPageInfo.pageLevel] = [];
				}
				mPagesByLevel[oPageInfo.pageLevel].push(oPageInfo);
			}
		});

		// A page is reachable only if all its parents are also reachable
		// So if we couldn't find any pages for a given level, all pages with a higher level won't be reachable anyway
		const aReachablePages: PageInfo[][] = [];
		let level = 0;
		while (mPagesByLevel[level]) {
			aReachablePages.push(mPagesByLevel[level]);
			level++;
		}

		return aReachablePages;
	},

	/**
	 * Get the list of startup pages.
	 *
	 * @param oManifestRouting The routing information from the app manifest
	 * @param oStartupParameters The startup parameters
	 * @param oMetaModel The metamodel
	 * @returns An array of startup page infos
	 */
	_getStartupPagesFromStartupParams: function (oManifestRouting: any, oStartupParameters: any, oMetaModel: ODataMetaModel): PageInfo[] {
		// Find all pages that can be reached with the startup parameters
		const aReachablePages = this._getReachablePages(oManifestRouting, oStartupParameters, oMetaModel);

		if (aReachablePages.length === 0) {
			return [];
		}

		// Find the longest sequence of pages that can be reached (recursively)
		let result: PageInfo[] = [];
		const current: PageInfo[] = [];

		function findRecursive(level: number) {
			const aCurrentLevelPages = aReachablePages[level];
			const lastPage = current.length ? current[current.length - 1] : undefined;

			if (aCurrentLevelPages) {
				aCurrentLevelPages.forEach(function (nextPage) {
					if (!lastPage || nextPage.pattern.indexOf(lastPage.pattern) === 0) {
						// We only consider pages that can be reached from the page at the previous level,
						// --> their pattern must be the pattern of the previous page with another segment appended
						current.push(nextPage);
						findRecursive(level + 1);
						current.pop();
					}
				});
			}
			if (current.length > result.length) {
				result = current.slice(); // We have found a sequence longer than our previous best --> store it as the new longest
			}
		}

		findRecursive(0);

		return result;
	},

	/**
	 * Creates the startup object from the list of pages and contexts.
	 *
	 * @param aStartupPages The pages
	 * @param aContexts The contexts
	 * @returns An object containing either a hash or a context to navigate to, or an empty object if no deep link was found
	 */
	_getDeepLinkObject: function (aStartupPages: PageInfo[], aContexts: Context[]): { hash?: string; context?: Context } {
		if (aContexts.length === 1) {
			return { context: aContexts[0] };
		} else if (aContexts.length > 1) {
			// Navigation to a deeper level --> use the pattern of the deepest object page
			// and replace the parameters by the ID from the contexts
			let hash = aStartupPages[aStartupPages.length - 1].pattern;
			aContexts.forEach(function (oContext) {
				hash = hash.replace("(#)", `(${oContext.getPath().split("(")[1]}`);
			});

			return { hash };
		} else {
			return {};
		}
	},

	/**
	 * Calculates startup parameters for a deeplink case, from startup parameters and routing infoirmation.
	 *
	 * @param oManifestRouting The routing information from the app manifest
	 * @param oStartupParameters The startup parameters
	 * @param oModel The OData model
	 * @returns An object containing either a hash or a context to navigate to, or an empty object if no deep link was found
	 */
	getDeepLinkStartupHash: function (
		oManifestRouting: any,
		oStartupParameters: any,
		oModel: ODataModel
	): Promise<{ hash?: string; context?: Context }> {
		let aStartupPages: PageInfo[];

		return oModel
			.getMetaModel()
			.requestObject("/$EntityContainer/")
			.then(() => {
				// Check if semantic keys are present in url parameters for every object page at each level
				aStartupPages = this._getStartupPagesFromStartupParams(oManifestRouting, oStartupParameters, oModel.getMetaModel());

				return this._requestObjectsFromParameters(aStartupPages, oModel);
			})
			.then((aValues: Context[][]) => {
				if (aValues.length) {
					// Make sure we only get 1 context per promise, and flatten the array
					const aContexts: Context[] = [];
					aValues.forEach(function (aFoundContexts) {
						if (aFoundContexts.length === 1) {
							aContexts.push(aFoundContexts[0]);
						}
					});

					return aContexts.length === aValues.length ? this._getDeepLinkObject(aStartupPages, aContexts) : {};
				} else {
					return {};
				}
			});
	},

	/**
	 * Calculates the new hash based on the startup parameters.
	 *
	 * @param oStartupParameters The startup parameter values (map parameter name -> array of values)
	 * @param sContextPath The context path for the startup of the app (generally the path to the main entity set)
	 * @param oRouter The router instance
	 * @param oMetaModel The meta model
	 * @returns A promise containing the hash to navigate to, or an empty string if there's no need to navigate
	 */
	getCreateStartupHash: function (
		oStartupParameters: any,
		sContextPath: string,
		oRouter: Router,
		oMetaModel: ODataMetaModel
	): Promise<String> {
		return oMetaModel.requestObject(`${sContextPath}@`).then((oEntitySetAnnotations: any) => {
			let sMetaPath = "";
			let bCreatable = true;

			if (
				oEntitySetAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"] &&
				oEntitySetAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"]["NewAction"]
			) {
				sMetaPath = `${sContextPath}@com.sap.vocabularies.Common.v1.DraftRoot/NewAction@Org.OData.Core.V1.OperationAvailable`;
			} else if (
				oEntitySetAnnotations["@com.sap.vocabularies.Session.v1.StickySessionSupported"] &&
				oEntitySetAnnotations["@com.sap.vocabularies.Session.v1.StickySessionSupported"]["NewAction"]
			) {
				sMetaPath = `${sContextPath}@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction@Org.OData.Core.V1.OperationAvailable`;
			}

			if (sMetaPath) {
				const bNewActionOperationAvailable = oMetaModel.getObject(sMetaPath);
				if (bNewActionOperationAvailable === false) {
					bCreatable = false;
				}
			} else {
				const oInsertRestrictions = oEntitySetAnnotations["@Org.OData.Capabilities.V1.InsertRestrictions"];
				if (oInsertRestrictions && oInsertRestrictions.Insertable === false) {
					bCreatable = false;
				}
			}
			if (bCreatable) {
				return this.getDefaultCreateHash(oStartupParameters, sContextPath, oRouter);
			} else {
				return "";
			}
		});
	},

	/**
	 * Calculates the hash to create a new object.
	 *
	 * @param oStartupParameters The startup parameter values (map parameter name -> array of values)
	 * @param sContextPath The context path of the entity set to be used for the creation
	 * @param oRouter The router instance
	 * @returns The hash
	 */
	getDefaultCreateHash: function (oStartupParameters: any, sContextPath: string, oRouter: Router): string {
		let sDefaultCreateHash =
			oStartupParameters && oStartupParameters.preferredMode ? (oStartupParameters.preferredMode[0] as string) : "create";
		let sHash = "";

		sDefaultCreateHash =
			sDefaultCreateHash.indexOf(":") !== -1 && sDefaultCreateHash.length > sDefaultCreateHash.indexOf(":") + 1
				? sDefaultCreateHash.substr(0, sDefaultCreateHash.indexOf(":"))
				: "create";
		sHash = `${sContextPath.substring(1)}(...)?i-action=${sDefaultCreateHash}`;
		if (oRouter.getRouteInfoByHash(sHash)) {
			return sHash;
		} else {
			throw new Error(`No route match for creating a new ${sContextPath.substring(1)}`);
		}
	}
};

export default AppStartupHelper;
