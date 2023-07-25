import * as AnnotationIssue from "./support/AnnotationIssue.support";
import * as CollectionFacetMissingID from "./support/CollectionFacetMissingID.support";
import * as CollectionFacetUnsupportedLevel from "./support/CollectionFacetUnsupportedLevel.support";
import * as InvalidAnnotationColumnKey from "./support/InvalidAnnotationColumnKey.support";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
(sap.ui.support as never).SystemPresets.FeV4 = {
	id: "FioriElementsV4",
	title: "Fiori Elements V4",
	description: "Fiori Elements V4 rules",
	selections: [{ ruleId: "annotationIssue", libName: "sap.fe.core" }]
};
/**
 * Adds support rules of the sap.fe.core library to the support infrastructure.
 */
export default {
	name: "sap.fe.core",
	niceName: "SAP.FE V4 - Core library",
	ruleset: [
		AnnotationIssue.getRules(),
		CollectionFacetMissingID.getRules(),
		CollectionFacetUnsupportedLevel.getRules(),
		InvalidAnnotationColumnKey.getRules()
	]
};
