import type { ConfigurableRecord } from "sap/fe/core/converters/helpers/ConfigurableObject";
import type {
	BaseManifestSettings,
	CombinedViewPathConfiguration,
	ContentDensitiesType,
	CustomViewTemplateConfiguration,
	FilterManifestConfiguration,
	FormManifestConfiguration,
	KPIConfiguration,
	ListReportManifestSettings,
	ManifestAction,
	ManifestHeaderFacet,
	ManifestSection,
	MultipleViewsConfiguration,
	NavigationSettingsConfiguration,
	ObjectPageManifestSettings,
	SingleViewPathConfiguration,
	TableManifestConfiguration,
	TemplateType,
	ViewConfiguration,
	ViewPathConfiguration
} from "sap/fe/core/converters/ManifestSettings";
import { VariantManagementType } from "sap/fe/core/converters/ManifestSettings";
import Device, { system } from "sap/ui/Device";

function ensureAnnotationPath<T extends { [key: string]: any }>(obj: T | undefined, property: keyof T) {
	const propertyValue = obj?.[property];
	if (Array.isArray(propertyValue)) {
		propertyValue.forEach((entry: any) => ensureAnnotationPath(entry, "annotationPath"));
	} else if (propertyValue && !propertyValue.includes("@")) {
		obj[property] = ("@" + propertyValue) as any;
	}
}

/**
 *
 */
class ManifestWrapper {
	/**
	 * Creates a wrapper object to ensure the data returned from the manifest is consistent and everything is merged correctly.
	 *
	 * @param oManifestSettings The manifest settings for the current page
	 * @param mergeFn A function that will be used to perform the merge
	 * @returns The manifest wrapper object
	 */
	constructor(private oManifestSettings: BaseManifestSettings, private mergeFn: Function) {
		// Ensure that properties which are meant to contain an *annotation* path contain a '@'
		ensureAnnotationPath(this.oManifestSettings, "defaultTemplateAnnotationPath");

		(this.oManifestSettings as ListReportManifestSettings).views?.paths.forEach((path) => {
			ensureAnnotationPath(path as SingleViewPathConfiguration, "annotationPath");
			ensureAnnotationPath(path as CombinedViewPathConfiguration, "primary");
			ensureAnnotationPath(path as CombinedViewPathConfiguration, "secondary");
		});

		if (this.oManifestSettings.controlConfiguration) {
			for (const controlConfiguration of Object.values(this.oManifestSettings.controlConfiguration)) {
				const quickVariantSelection = (controlConfiguration as TableManifestConfiguration).tableSettings?.quickVariantSelection;
				ensureAnnotationPath(quickVariantSelection, "paths");
			}
		}
	}

	/**
	 * Returns the current template type.
	 *
	 * @returns The type of the current template
	 */
	getTemplateType(): TemplateType {
		return this.oManifestSettings.converterType;
	}

	/**
	 * Checks whether the current template should display the filter bar.
	 *
	 * @returns `true` if the filter bar should be hidden
	 */
	isFilterBarHidden(): boolean {
		return !!(this.oManifestSettings as ListReportManifestSettings)?.hideFilterBar;
	}

	useHiddenFilterBar(): boolean {
		return !!(this.oManifestSettings as ListReportManifestSettings)?.useHiddenFilterBar;
	}

	/**
	 * Checks whether the current environment is a desktop or not.
	 *
	 * @returns `true` if we are on a desktop
	 */
	isDesktop(): boolean {
		return !!this.oManifestSettings.isDesktop;
	}

	/**
	 * Checks whether the current environment is a mobile phone or not.
	 *
	 * @returns `true` if we are on a mobile phone
	 */
	isPhone(): boolean {
		return !!this.oManifestSettings.isPhone;
	}

	/**
	 * Retrieves the form containers (field groups or identification) defined in the manifest.
	 *
	 * @param facetTarget The target annotation path for this form
	 * @returns A set of form containers defined in the manifest indexed by an iterable key
	 */
	getFormContainer(facetTarget: string): FormManifestConfiguration {
		return this.oManifestSettings.controlConfiguration?.[facetTarget] as FormManifestConfiguration;
	}

	/**
	 * Retrieves the header facets defined in the manifest.
	 *
	 * @returns A set of header facets defined in the manifest indexed by an iterable key
	 */
	getHeaderFacets(): ConfigurableRecord<ManifestHeaderFacet> {
		return this.mergeFn(
			{},
			this.oManifestSettings.controlConfiguration?.["@com.sap.vocabularies.UI.v1.HeaderFacets"]?.facets,
			(this.oManifestSettings as ObjectPageManifestSettings).content?.header?.facets
		);
	}

	/**
	 * Retrieves the header actions defined in the manifest.
	 *
	 * @returns A set of actions defined in the manifest indexed by an iterable key
	 */
	getHeaderActions(): ConfigurableRecord<ManifestAction> {
		return this.oManifestSettings.content?.header?.actions || {};
	}

	/**
	 * Retrieves the footer actions defined in the manifest.
	 *
	 * @returns A set of actions defined in the manifest indexed by an iterable key
	 */
	getFooterActions(): ConfigurableRecord<ManifestAction> {
		return this.oManifestSettings.content?.footer?.actions || {};
	}

	/**
	 * Retrieves the variant management as defined in the manifest.
	 *
	 * @returns A type of variant management
	 */
	getVariantManagement(): VariantManagementType {
		return this.oManifestSettings.variantManagement || VariantManagementType.None;
	}

	/**
	 * Retrieves the annotation Path for the SPV in the manifest.
	 *
	 * @returns The annotation path for the default SPV or undefined.
	 */
	getDefaultTemplateAnnotationPath(): string | undefined {
		return this.oManifestSettings.defaultTemplateAnnotationPath;
	}

	/**
	 * Retrieves the control configuration as defined in the manifest for a specific annotation path.
	 *
	 * @param sAnnotationPath The relative annotation path
	 * @private
	 * @returns The control configuration
	 */
	getControlConfiguration(sAnnotationPath: string): any {
		return this.oManifestSettings?.controlConfiguration?.[sAnnotationPath] || {};
	}

	/**
	 * Retrieves the configured settings for a given navigation target.
	 *
	 * @param navigationOrCollectionName The name of the navigation to check
	 * @returns The navigation settings configuration
	 */
	getNavigationConfiguration(navigationOrCollectionName: string): NavigationSettingsConfiguration {
		return this.oManifestSettings?.navigation?.[navigationOrCollectionName] || {};
	}

	/**
	 * Retrieves the view level.
	 *
	 * @returns The current view level
	 */
	getViewLevel(): number {
		return this.oManifestSettings?.viewLevel || -1;
	}

	/**
	 * Retrieves the contentDensities setting of the application.
	 *
	 * @returns The current content density
	 */
	getContentDensities(): ContentDensitiesType {
		return (
			this.oManifestSettings?.contentDensities || {
				cozy: false,
				compact: false
			}
		);
	}

	/**
	 * Checks whether we are in FCL mode or not.
	 *
	 * @returns `true` if we are in FCL
	 */
	isFclEnabled(): boolean {
		return !!this.oManifestSettings?.fclEnabled;
	}

	/**
	 * Checks whether the current settings (application / shell) allows us to use condensed layout.
	 *
	 * @returns `true` if we can use the condensed layout, false otherwise
	 */
	isCondensedLayoutCompliant(): boolean {
		const manifestContentDensity = this.oManifestSettings?.contentDensities || {
			cozy: false,
			compact: false
		};
		const shellContentDensity = this.oManifestSettings?.shellContentDensity || "compact";
		let isCondensedLayoutCompliant = true;
		const isSmallDevice = !system.desktop || Device.resize.width <= 320;
		if (
			(manifestContentDensity?.cozy === true && manifestContentDensity?.compact !== true) ||
			shellContentDensity === "cozy" ||
			isSmallDevice
		) {
			isCondensedLayoutCompliant = false;
		}
		return isCondensedLayoutCompliant;
	}

	/**
	 * Checks whether the current settings (application / shell) uses compact mode as content density.
	 *
	 * @returns `true` if compact mode is set as content density, false otherwise
	 */
	isCompactType(): boolean {
		const manifestContentDensity = this.getContentDensities();
		const shellContentDensity = this.oManifestSettings?.shellContentDensity || "compact";
		return manifestContentDensity.compact !== false || shellContentDensity === "compact" ? true : false;
	}

	//region OP Specific

	/**
	 * Retrieves the section layout defined in the manifest.
	 *
	 * @returns The type of section layout of the object page
	 */
	getSectionLayout(): string {
		return (this.oManifestSettings as ObjectPageManifestSettings).sectionLayout;
	}

	/**
	 * Retrieves the sections defined in the manifest.
	 *
	 * @returns A set of manifest sections indexed by an iterable key
	 */
	getSections(): ConfigurableRecord<ManifestSection> {
		return this.mergeFn(
			{},
			this.oManifestSettings.controlConfiguration?.["@com.sap.vocabularies.UI.v1.Facets"]?.sections,
			(this.oManifestSettings as ObjectPageManifestSettings).content?.body?.sections
		);
	}

	/**
	 * Returns true of the header of the application is editable and should appear in the facets.
	 *
	 * @returns `true` if the header if editable
	 */
	isHeaderEditable(): boolean {
		return this.getShowObjectPageHeader() && (this.oManifestSettings as ObjectPageManifestSettings).editableHeaderContent;
	}

	/**
	 * Returns true if we should show the object page header.
	 *
	 * @returns `true` if the header should be displayed
	 */
	getShowAnchorBar(): boolean {
		return (this.oManifestSettings as ObjectPageManifestSettings).content?.header?.anchorBarVisible !== undefined
			? !!(this.oManifestSettings as ObjectPageManifestSettings).content?.header?.anchorBarVisible
			: true;
	}

	/**
	 * Defines whether or not the section will be displayed in different tabs.
	 *
	 * @returns `true` if the icon tab bar should be used instead of scrolling
	 */
	useIconTabBar(): boolean {
		return this.getShowAnchorBar() && (this.oManifestSettings as ObjectPageManifestSettings).sectionLayout === "Tabs";
	}

	/**
	 * Returns true if the object page header is to be shown.
	 *
	 * @returns `true` if the object page header is to be displayed
	 */
	getShowObjectPageHeader(): boolean {
		return (this.oManifestSettings as ObjectPageManifestSettings).content?.header?.visible !== undefined
			? !!(this.oManifestSettings as ObjectPageManifestSettings).content?.header?.visible
			: true;
	}

	/**
	 * Returns whether the lazy loader should be enabled for this page or not.
	 *
	 * @returns `true` if the lazy loader should be enabled
	 */
	getEnableLazyLoading(): boolean {
		return this.oManifestSettings.enableLazyLoading ?? false;
	}

	//endregion OP Specific

	//region LR Specific

	/**
	 * Retrieves the multiple view configuration from the manifest.
	 *
	 * @returns The views that represent the manifest object
	 */
	getViewConfiguration(): MultipleViewsConfiguration | undefined {
		return (this.oManifestSettings as ListReportManifestSettings).views;
	}

	/**
	 * Retrieves the stickyMultiTabHeader configuration from the manifest.
	 *
	 * @returns Returns True if stickyMultiTabHeader is enabled or undefined
	 */
	getStickyMultiTabHeaderConfiguration(): boolean {
		const bStickyMultiTabHeader = (this.oManifestSettings as ListReportManifestSettings).stickyMultiTabHeader;
		return bStickyMultiTabHeader !== undefined ? bStickyMultiTabHeader : true;
	}

	/**
	 * Retrieves the KPI configuration from the manifest.
	 *
	 * @returns Returns a map between KPI names and their respective configuration
	 */
	getKPIConfiguration(): { [kpiName: string]: KPIConfiguration } {
		return (this.oManifestSettings as ListReportManifestSettings).keyPerformanceIndicators || {};
	}

	/**
	 * Retrieves the filter configuration from the manifest.
	 *
	 * @returns The filter configuration from the manifest
	 */
	getFilterConfiguration(): FilterManifestConfiguration {
		return this.getControlConfiguration("@com.sap.vocabularies.UI.v1.SelectionFields");
	}

	/**
	 * Returns true if there are multiple entity sets to be displayed.
	 *
	 * @returns `true` if there are multiple entity sets
	 */
	hasMultipleEntitySets(): boolean {
		const viewConfig = this.getViewConfiguration() || { paths: [] };
		const manifestEntitySet = this.oManifestSettings.entitySet;
		return (
			viewConfig.paths.find((path: ViewConfiguration) => {
				if ((path as CustomViewTemplateConfiguration)?.template) {
					return undefined;
				} else if (this.hasMultipleVisualizations(path as CombinedViewPathConfiguration)) {
					const { primary, secondary } = path as CombinedViewPathConfiguration;
					return (
						primary.some((primaryPath) => primaryPath.entitySet && primaryPath.entitySet !== manifestEntitySet) ||
						secondary.some((secondaryPath) => secondaryPath.entitySet && secondaryPath.entitySet !== manifestEntitySet)
					);
				} else {
					path = path as SingleViewPathConfiguration;
					return path.entitySet && path.entitySet !== manifestEntitySet;
				}
			}) !== undefined
		);
	}

	/**
	 * Returns the context path for the template if it is specified in the manifest.
	 *
	 * @returns The context path for the template
	 */
	getContextPath(): string | undefined {
		return this.oManifestSettings?.contextPath;
	}

	/**
	 * Returns true if there are multiple visualizations.
	 *
	 * @param path The path from the view
	 * @returns `true` if there are multiple visualizations
	 */
	hasMultipleVisualizations(path?: ViewPathConfiguration): boolean {
		if (!path) {
			const viewConfig = this.getViewConfiguration() || { paths: [] };
			return viewConfig.paths.some((viewPath) => {
				return (
					(viewPath as CombinedViewPathConfiguration).primary?.length > 0 &&
					(viewPath as CombinedViewPathConfiguration).secondary?.length > 0
				);
			});
		}
		return (path as CombinedViewPathConfiguration).primary?.length > 0 && (path as CombinedViewPathConfiguration).secondary?.length > 0;
	}

	/**
	 * Retrieves the entity set defined in the manifest.
	 *
	 * @returns The entity set defined in the manifest
	 */
	getEntitySet(): string {
		return this.oManifestSettings.entitySet;
	}

	//end region LR Specific
}

export default ManifestWrapper;
