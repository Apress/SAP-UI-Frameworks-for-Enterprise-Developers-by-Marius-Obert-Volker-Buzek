import type { EntitySet, EntityType, NavigationProperty, Singleton } from "@sap-ux/vocabularies-types";
import Log from "sap/base/Log";
import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import { convertMetaModelContext } from "sap/fe/core/converters/MetaModelConverter";
import type { BindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { and, equal, fn, greaterThan, ifElse, pathInModel, ref } from "sap/fe/core/helpers/BindingToolkit";
import { showPopover } from "sap/fe/macros/situations/SituationsPopover";
import type Context from "sap/ui/model/Context";

@defineBuildingBlock({ name: "SituationsIndicator", namespace: "sap.fe.macros.internal.situations" })
export default class SituationsIndicatorBlock extends BuildingBlockBase {
	@blockAttribute({ type: "sap.ui.model.Context", required: true })
	entitySet!: Context;

	@blockAttribute({ type: "string", required: false })
	propertyPath?: string;

	static getSituationsNavigationProperty(
		context: EntitySet | Singleton | EntityType | NavigationProperty
	): NavigationProperty | undefined {
		let navigationProperties: NavigationProperty[];
		switch (context._type) {
			case "NavigationProperty":
				navigationProperties = context.targetType.navigationProperties;
				break;
			case "EntityType":
				navigationProperties = context.navigationProperties;
				break;
			default:
				navigationProperties = context.entityType.navigationProperties;
		}

		const situationsNavProps = navigationProperties.filter(
			(navigationProperty) =>
				!navigationProperty.isCollection &&
				navigationProperty.targetType.annotations.Common?.SAPObjectNodeType?.Name === "BusinessSituation"
		);

		const situationsNavProp: NavigationProperty | undefined = situationsNavProps.length >= 1 ? situationsNavProps[0] : undefined;

		// only one navigation property may lead to an entity tagged as "BusinessSituation"
		if (situationsNavProps.length > 1) {
			const navPropNames = situationsNavProps.map((prop) => `'${prop.name}'`).join(", ");

			let name: string;
			switch (context._type) {
				case "NavigationProperty":
					name = context.targetType.name;
					break;
				case "EntityType":
					name = context.name;
					break;
				default:
					name = context.entityType.name;
			}

			Log.error(`Entity type '${name}' has multiple paths to SAP Situations (${navPropNames}). Using '${situationsNavProp?.name}'.
Hint: Make sure there is at most one navigation property whose target entity type is annotated with
<Annotation Term="com.sap.vocabularies.Common.v1.SAPObjectNodeType">
  <Record>
    <PropertyValue Property="Name" String="BusinessSituation" />
  </Record>
</Annotation>.`);
		}

		return situationsNavProp;
	}

	getTemplate() {
		const context = convertMetaModelContext(this.entitySet);
		const situationsNavProp = SituationsIndicatorBlock.getSituationsNavigationProperty(context);
		if (!situationsNavProp) {
			// No path to SAP Situations. That is, the entity type is not situation-enabled. Ignore this fragment.
			return undefined;
		}

		const numberOfSituations = pathInModel(`${situationsNavProp.name}/SitnNumberOfInstances`);

		// Indicator visibility
		let visible: BindingToolkitExpression<boolean>;
		if (!this.propertyPath) {
			// no propertyPath --> visibility depends on the number of situations only
			visible = greaterThan(numberOfSituations, 0);
		} else {
			// propertyPath --> visibility depends on the number of situations and on the semantic key used for showing indicators
			visible = and(
				greaterThan(numberOfSituations, 0),
				equal(pathInModel("semanticKeyHasDraftIndicator", "internal"), this.propertyPath)
			);
		}

		// Button text: the number of situations if there are multiple, the empty string otherwise
		const text = ifElse(greaterThan(numberOfSituations, 1), numberOfSituations, "");

		// Button tooltip: "There is one situation" / "There are <n> situations"
		const tooltip = ifElse(
			equal(numberOfSituations, 1),
			this.getTranslatedText("situationsTooltipSingular"),
			fn("formatMessage", [this.getTranslatedText("situationsTooltipPlural"), numberOfSituations])
		);

		// 'press' handler
		const onPress = fn(showPopover, [ref("$controller"), ref("$event"), situationsNavProp.name]);

		return xml`
			<m:Button core:require="{rt: 'sap/fe/macros/situations/SituationsPopover', formatMessage: 'sap/base/strings/formatMessage'}"
				type="Attention"
				icon="sap-icon://alert"
				text="${text}"
				tooltip="${tooltip}"
				visible="${visible}"
				press="${onPress}"
			/>`;
	}
}
