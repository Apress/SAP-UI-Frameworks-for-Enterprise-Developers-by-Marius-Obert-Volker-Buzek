export enum IssueSeverity {
	High,
	Low,
	Medium
}

export const IssueCategoryType = {
	Facets: {
		MissingID: "MissingID",
		UnSupportedLevel: "UnsupportedLevel"
	},
	AnnotationColumns: {
		InvalidKey: "InvalidKey"
	},
	Annotations: {
		IgnoredAnnotation: "IgnoredAnnotation"
	}
};

export enum IssueCategory {
	Annotation = "Annotation",
	Template = "Template",
	Manifest = "Manifest",
	Facets = "Facets"
}
export const IssueType = {
	MISSING_CHART: "We couldn't find a chart annotation for the current entitySet, you should consider adding one.",
	MISSING_LINEITEM: "We couldn't find a line item annotation for the current entitySet, you should consider adding one.",
	MISSING_SELECTIONFIELD: "We couldn't find the defined selection field.",
	MALFORMED_DATAFIELD_FOR_IBN: {
		REQUIRESCONTEXT: "DataFieldForIntentBasedNavigation cannot use RequiresContext in the form or header.",
		INLINE: "DataFieldForIntentBasedNavigation cannot use Inline in the form or header.",
		DETERMINING: "DataFieldForIntentBasedNavigation cannot use Determining in the form or header."
	},
	MALFORMED_VISUALFILTERS: {
		VALUELIST: "We couldn't find the ValueList path provided in the manifest",
		PRESENTATIONVARIANT: "PresentationVariant is missing for the VisualFilters",
		CHART: "Chart is missing from the PV configured for the VisualFilters",
		VALUELISTCONFIG: "ValueList has not been configured inside the Visual Filter Settings",
		FilterRestrictions: "For VisualFilters, range expressions are not allowed"
	},
	FULLSCREENMODE_NOT_ON_LISTREPORT: "enableFullScreenMode is not supported on list report pages.",
	KPI_ISSUES: {
		KPI_NOT_FOUND: "Couldn't find KPI or SPV with qualifier ",
		KPI_DETAIL_NOT_FOUND: "Can't find proper datapoint or chart definition for KPI ",
		NO_ANALYTICS: "The following entitySet used in a KPI definition doesn't support $apply queries:",
		MAIN_PROPERTY_NOT_AGGREGATABLE: "Main property used in KPI cannot be aggregated "
	}
};
