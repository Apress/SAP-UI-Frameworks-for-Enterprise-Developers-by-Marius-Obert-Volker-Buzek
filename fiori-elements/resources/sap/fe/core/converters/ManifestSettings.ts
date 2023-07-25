import type { FormElementType } from "sap/fe/core/converters/controls/Common/Form";
import type { FlexSettings, HeaderFacetType } from "sap/fe/core/converters/controls/ObjectPage/HeaderFacet";
import type { CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import type { GridTableRowCountMode, TableType } from "./controls/Common/Table";
import type { ConfigurableRecord, Position, Positionable } from "./helpers/ConfigurableObject";

// ENUMS

export enum TemplateType {
	ListReport = "ListReport",
	ObjectPage = "ObjectPage",
	AnalyticalListPage = "AnalyticalListPage"
}

export enum ActionType {
	DataFieldForAction = "ForAction",
	DataFieldForIntentBasedNavigation = "ForNavigation",
	Default = "Default",
	Primary = "Primary",
	Secondary = "Secondary",
	SwitchToActiveObject = "SwitchToActiveObject",
	SwitchToDraftObject = "SwitchToDraftObject",
	DraftActions = "DraftActions",
	CollaborationAvatars = "CollaborationAvatars",
	DefaultApply = "DefaultApply",
	Menu = "Menu",
	ShowFormDetails = "ShowFormDetails",
	Copy = "Copy"
}

export enum SelectionMode {
	Auto = "Auto",
	None = "None",
	Multi = "Multi",
	Single = "Single"
}

export enum VariantManagementType {
	Page = "Page",
	Control = "Control",
	None = "None"
}

export enum CreationMode {
	NewPage = "NewPage",
	Inline = "Inline",
	CreationRow = "CreationRow",
	InlineCreationRows = "InlineCreationRows",
	External = "External"
}

export enum VisualizationType {
	Table = "Table",
	Chart = "Chart"
}

// Table
export type AvailabilityType = "Default" | "Adaptation" | "Hidden";
export enum Importance {
	High = "High",
	Medium = "Medium",
	Low = "Low",
	None = "None"
}

export enum HorizontalAlign {
	End = "End",
	Begin = "Begin",
	Center = "Center"
}

// TYPES

export type ContentDensitiesType = {
	compact?: boolean;
	cozy?: boolean;
};

export type ManifestSideContent = {
	template: string;
	equalSplit?: boolean;
};

/**
 * Configuration of a KPI in the manifest
 */
export type KPIConfiguration = {
	model?: string;
	entitySet: string;
	qualifier: string;
	detailNavigation?: string;
};

export type ControlConfiguration = {
	[annotationPath: string]: ControlManifestConfiguration;
} & {
	"@com.sap.vocabularies.UI.v1.LineItem"?: TableManifestConfiguration;
	"@com.sap.vocabularies.UI.v1.Facets"?: FacetsControlConfiguration;
	"@com.sap.vocabularies.UI.v1.HeaderFacets"?: HeaderFacetsControlConfiguration;
	"@com.sap.vocabularies.UI.v1.SelectionFields"?: FilterManifestConfiguration;
};

/**
 * @typedef BaseManifestSettings
 */
export type BaseManifestSettings = {
	content?: {
		header?: {
			facets?: ConfigurableRecord<ManifestHeaderFacet>;
			actions?: ConfigurableRecord<ManifestAction>;
		};
		footer?: {
			actions?: ConfigurableRecord<ManifestAction>;
		};
	};
	controlConfiguration?: ControlConfiguration;
	converterType: TemplateType;
	entitySet: string;
	navigation?: {
		[navigationPath: string]: NavigationSettingsConfiguration;
	};
	viewLevel?: number;
	fclEnabled?: boolean;
	contextPath?: string;
	variantManagement?: VariantManagementType;
	defaultTemplateAnnotationPath?: string;
	contentDensities?: ContentDensitiesType;
	shellContentDensity?: string;
	isDesktop?: boolean;
	isPhone?: boolean;
	enableLazyLoading?: boolean;
};

export type NavigationTargetConfiguration = {
	outbound?: string;
	outboundDetail?: {
		semanticObject: string;
		action: string;
		parameters?: any;
	};
	route?: string;
};

/**
 * @typedef NavigationSettingsConfiguration
 */
export type NavigationSettingsConfiguration = {
	create?: NavigationTargetConfiguration;
	detail?: NavigationTargetConfiguration;
	display?: {
		outbound?: string;
		target?: string; // for compatibility
		route?: string;
	};
};

type HeaderFacetsControlConfiguration = {
	facets: ConfigurableRecord<ManifestHeaderFacet>;
};

type FacetsControlConfiguration = {
	sections: ConfigurableRecord<ManifestSection>;
};

type ManifestFormElement = Positionable & {
	type: FormElementType;
	template: string;
	label?: string;
	formatOptions?: FormatOptionsType;
};

export type FormManifestConfiguration = {
	fields: ConfigurableRecord<ManifestFormElement>;
};

export type ControlManifestConfiguration =
	| TableManifestConfiguration
	| ChartManifestConfiguration
	| FacetsControlConfiguration
	| HeaderFacetsControlConfiguration
	| FormManifestConfiguration
	| FilterManifestConfiguration;

/** Object Page */

export type ObjectPageManifestSettings = BaseManifestSettings & {
	content?: {
		header?: {
			visible?: boolean;
			anchorBarVisible?: boolean;
			facets?: ConfigurableRecord<ManifestHeaderFacet>;
		};
		body?: {
			sections?: ConfigurableRecord<ManifestSection>;
		};
	};
	editableHeaderContent: boolean;
	sectionLayout: "Tabs" | "Page";
};

/**
 * @typedef ManifestHeaderFacet
 */
export type ManifestHeaderFacet = {
	type?: HeaderFacetType;
	name?: string;
	template?: string;
	position?: Position;
	visible?: CompiledBindingToolkitExpression;
	title?: string;
	subTitle?: string;
	stashed?: boolean;
	flexSettings?: FlexSettings;
	requestGroupId?: string;
	templateEdit?: string;
};

/**
 * @typedef ManifestSection
 */
export type ManifestSection = {
	title?: string;
	id?: string;
	name?: string;
	visible?: CompiledBindingToolkitExpression;
	position?: Position;
	template?: string;
	subSections?: Record<string, ManifestSubSection>;
	actions?: Record<string, ManifestAction>;
};

export type ManifestSubSection = {
	id?: string;
	name?: string;
	template?: string;
	title?: string;
	position?: Position;
	visible?: CompiledBindingToolkitExpression;
	actions?: Record<string, ManifestAction>;
	sideContent?: ManifestSideContent;
	enableLazyLoading?: boolean;
	embeddedComponent?: ManifestReuseComponentSettings;
};

export type ManifestReuseComponentSettings = {
	name: string;
	settings?: any;
};

/** List Report */

export type ListReportManifestSettings = BaseManifestSettings & {
	stickyMultiTabHeader?: boolean;
	initialLoad?: boolean;
	views?: MultipleViewsConfiguration;
	keyPerformanceIndicators?: {
		[kpiName: string]: KPIConfiguration;
	};
	hideFilterBar?: boolean;
	useHiddenFilterBar?: boolean;
};

export type ViewPathConfiguration = SingleViewPathConfiguration | CombinedViewPathConfiguration;

export type ViewConfiguration = ViewPathConfiguration | CustomViewTemplateConfiguration;

export type CustomViewTemplateConfiguration = {
	key?: string;
	label: string;
	template: string;
	visible?: string;
};

export type SingleViewPathConfiguration = {
	keepPreviousPersonalization?: boolean;
	key?: string;
	entitySet?: string;
	annotationPath: string;
	contextPath?: string;
	visible?: string;
};

export type CombinedViewPathConfiguration = {
	primary: SingleViewPathConfiguration[];
	secondary: SingleViewPathConfiguration[];
	defaultPath?: "both" | "primary" | "secondary";
	key?: string;
	visible?: string;
	annotationPath?: string;
};

/**
 * @typedef MultipleViewsConfiguration
 */
export type MultipleViewsConfiguration = {
	paths: ViewConfiguration[];
	showCounts?: boolean;
};

/** Filter Configuration */

/** @typedef FilterManifestConfiguration */
export type FilterManifestConfiguration = {
	filterFields?: Record<string, FilterFieldManifestConfiguration>;
	navigationProperties?: string[];
	useSemanticDateRange?: boolean;
	showClearButton?: boolean;
	initialLayout?: string;
	layout?: string;
};

export type FilterFieldManifestConfiguration = Positionable & {
	type?: string;
	label?: string;
	template?: string;
	availability?: AvailabilityType;
	settings?: FilterSettings;
	visualFilter?: visualFilterConfiguration;
	required?: boolean;
	slotName?: string;
};

export type visualFilterConfiguration = {
	valueList?: string;
};

export type OperatorConfiguration = {
	path: string;
	equals?: string;
	contains?: string;
	exclude: boolean;
};

export type DefaultOperator = {
	operator: string;
};

export type FilterSettings = {
	operatorConfiguration?: OperatorConfiguration[];
	defaultValues?: DefaultOperator[];
};

/** Chart Configuration */

export type ChartPersonalizationManifestSettings =
	| boolean
	| {
			sort: boolean;
			type: boolean;
			item: boolean;
			filter: boolean;
	  };

export type ChartManifestConfiguration = {
	chartSettings: {
		personalization: ChartPersonalizationManifestSettings;
	};
};

export type ActionAfterExecutionConfiguration = {
	navigateToInstance?: boolean;
	enableAutoScroll?: boolean;
};

/** Table Configuration */

/**
 * @typedef ManifestAction
 */
export type ManifestAction = {
	defaultAction?: string;
	menu?: string[];
	visible?: string;
	enabled?: string;
	position?: Position;
	press?: string;
	text?: string;
	__noWrap?: boolean;
	enableOnSelect?: string;
	defaultValuesFunction?: string;
	requiresSelection?: boolean;
	afterExecution?: ActionAfterExecutionConfiguration;
	inline?: boolean;
	determining?: boolean;
	facetName?: string;
	command?: string | undefined;
};

export type BaseCustomDefinedTableColumn = Positionable & {
	width?: string;
	importance?: Importance;
	horizontalAlign?: HorizontalAlign;
	availability?: AvailabilityType;
};

// Can be either Custom Column from Manifest or Slot Column from Building Block
export type CustomDefinedTableColumn = BaseCustomDefinedTableColumn & {
	type?: string;
	header: string;
	template: string;
	properties?: string[];
};

// For overwriting Annotation Column properties
export type CustomDefinedTableColumnForOverride = BaseCustomDefinedTableColumn & {
	afterExecution?: ActionAfterExecutionConfiguration;
	settings?: TableColumnSettings;
	formatOptions?: FormatOptionsType;
	showDataFieldsLabel?: boolean;
};

export type TableColumnSettings = {
	microChartSize?: string;
	showMicroChartLabel?: boolean;
};

/**
 * Collection of format options for multiline text fields on a form or in a table
 */
export type FormatOptionsType = {
	hasDraftIndicator?: boolean;
	semantickeys?: string[];
	textLinesEdit?: number;
	textMaxCharactersDisplay?: number;
	textExpandBehaviorDisplay?: string;
	textMaxLength?: number;

	showErrorObjectStatus?: string;
	fieldGroupDraftIndicatorPropertyPath?: string;
};

export type TableManifestConfiguration = {
	tableSettings?: TableManifestSettingsConfiguration;
	actions?: Record<string, ManifestAction>;
	columns?: Record<string, CustomDefinedTableColumn | CustomDefinedTableColumnForOverride>;
};

export type TablePersonalizationConfiguration =
	| boolean
	| {
			sort: boolean;
			column: boolean;
			filter: boolean;
			group: boolean;
			aggregate: boolean;
	  };

export type TableManifestSettingsConfiguration = {
	creationMode?: {
		disableAddRowButtonForEmptyData?: boolean;
		customValidationFunction?: string;
		createAtEnd?: boolean;
		name?: CreationMode;
		inlineCreationRowCount?: number;
		inlineCreationRowsHiddenInEditMode?: boolean;
	};
	enableExport?: boolean;
	quickVariantSelection?: {
		paths: [
			{
				annotationPath: string;
			}
		];
		hideTableTitle?: boolean;
		showCounts?: boolean;
	};
	personalization?: TablePersonalizationConfiguration;
	/**
	 * Defines how many items in a table can be selected. You have the following options:
	 * => by defining 'None' you can fully disable the list selection
	 * => by defining 'Single' you allow only one item to be selected
	 * => by defining 'Multi' you allow several items to be selected
	 * => by using 'Auto' you leave the default definition 'None', except if there is an action that requires a selection (such as deleting, or IBN)
	 */
	selectionMode?: SelectionMode;
	type?: TableType;
	rowCountMode?: GridTableRowCountMode;
	rowCount?: number;
	condensedTableLayout?: boolean;
	selectAll?: boolean;
	selectionLimit?: number;
	enablePaste?: boolean;
	enableFullScreen?: boolean;
	enableMassEdit?: boolean;
	hierarchyQualifier?: string;
};
