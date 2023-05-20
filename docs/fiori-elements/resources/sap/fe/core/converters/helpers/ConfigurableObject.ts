import Log from "sap/base/Log";

export type Position = {
	anchor?: string;
	placement: Placement;
};

export enum Placement {
	After = "After",
	Before = "Before",
	End = "End"
}
export type ConfigurableObjectKey = string;
export type ConfigurableObject = Positionable & {
	key: ConfigurableObjectKey;
};

type MakeNestedArrayCustom<T> = {
	[K in keyof T]: T[K] extends Array<infer U extends ConfigurableObject> ? Record<string, CustomElement<U>> : T[K];
};

export type CustomElement<T extends ConfigurableObject> = MakeNestedArrayCustom<T> & {
	position: Position;
	menu?: any[] | undefined;
};

export type Positionable = {
	position?: Position;
};

export type ConfigurableRecord<T> = Record<ConfigurableObjectKey, T>;

/**
 * Recursive method that order the keys based on a position information.
 *
 * @param positioningItems
 * @param anchor
 * @param sorted
 * @param visited
 * @returns The order of the current item
 */
const orderPositioningItemRecursively = (
	positioningItems: Record<string, Required<Position>>,
	anchor: string,
	sorted: string[],
	visited: Record<string, Required<Position>>
): number => {
	let insertIndex = sorted.indexOf(anchor);
	if (insertIndex !== -1) {
		return insertIndex;
	}
	const anchorItem: Required<Position> = positioningItems[anchor];
	if (anchorItem === undefined) {
		const anchorText: Array<string> = anchor.split("::"),
			manifestItem: string = Object.keys(visited)[0];

		Log.warning(
			`Position anchor '${anchorText[anchorText.length - 1]}' not found for item '${manifestItem}'. Please check manifest settings.`
		);
		return sorted.length;
		// throw new Error(`position anchor not found: ${anchor}`);
	}

	visited[anchor] = anchorItem;
	if (anchorItem && !(anchorItem.anchor in visited)) {
		insertIndex = orderPositioningItemRecursively(positioningItems, anchorItem.anchor, sorted, visited);
		if (anchorItem.placement !== Placement.Before) {
			++insertIndex;
		}
	} else {
		insertIndex = sorted.length;
	}

	sorted.splice(insertIndex, 0, anchor);
	return insertIndex;
};

export enum OverrideType {
	merge = "merge",
	overwrite = "overwrite",
	ignore = "ignore"
}
type ArrayOverrideType<ArrayType> = OverrideKeys<ArrayType>;

type ElementType<T> = T extends any[] ? T[number] : T;
type OverrideKeys<T> = {
	[P in keyof T]?: OverrideType | ArrayOverrideType<ElementType<T[P]>>;
};

function isArrayConfig<T>(config: OverrideType | ArrayOverrideType<T> | undefined): config is ArrayOverrideType<T> {
	return typeof config === "object";
}

function applyOverride<T extends ConfigurableObject>(
	overwritableKeys: OverrideKeys<T>,
	sourceItem: T | null,
	customElement: CustomElement<T>
): T {
	const outItem: T = sourceItem || (customElement as T);
	for (const overwritableKey in overwritableKeys) {
		if (Object.hasOwnProperty.call(overwritableKeys, overwritableKey)) {
			const overrideConfig = overwritableKeys[overwritableKey];
			if (sourceItem !== null) {
				switch (overrideConfig) {
					case "overwrite":
						if (customElement.hasOwnProperty(overwritableKey) && customElement[overwritableKey] !== undefined) {
							sourceItem[overwritableKey] = customElement[overwritableKey] as any;
						}
						break;
					case "merge":
					default:
						const subItem = sourceItem[overwritableKey] || ([] as any[]);
						let subConfig = {};
						if (isArrayConfig(overrideConfig)) {
							subConfig = overrideConfig;
						}
						if (Array.isArray(subItem)) {
							sourceItem[overwritableKey] = insertCustomElements(
								subItem,
								(customElement && (customElement[overwritableKey] as Record<string, CustomElement<any>>)) || {},
								subConfig
							) as any;
						}
						break;
				}
			} else {
				switch (overrideConfig) {
					case "overwrite":
						if (customElement.hasOwnProperty(overwritableKey) && customElement[overwritableKey] !== undefined) {
							outItem[overwritableKey] = customElement[overwritableKey] as any;
						}
						break;
					case "merge":
					default:
						let subConfig = {};
						if (isArrayConfig(overrideConfig)) {
							subConfig = overrideConfig;
						}
						outItem[overwritableKey] = insertCustomElements(
							[] as any[],
							(customElement && (customElement[overwritableKey] as Record<string, CustomElement<any>>)) || {},
							subConfig
						) as any;
						break;
				}
			}
		}
	}
	return outItem;
}

/**
 * Insert a set of custom elements in the right position in an original collection.
 *
 * Parameters for overwritableKeys and their implications:
 * "overwrite": The whole object gets overwritten - if the customElements include a default, this will overrule the whole rootElements configuration.
 * "merge": This is similar to calling insertCustomElements itself. You must include the
 * full CustomElement syntax within the customElements, including anchors, for example.
 * "ignore": There are no additions and no combinations. Only the rootElements object is used.
 *
 * Note - Proceed as follows in case you have defined customElements and do not want to overwrite their values with defaults:
 * Hand the rootElements into the creation function of the customElement.
 * Depending on the existence of both rootElement-configuration and customElement-configuration,
 * you must set the customElements property, for which the "overwrite"-property is set, explicitly to undefined.
 *
 * @template T
 * @param rootElements A list of "ConfigurableObject" which means object that have a unique "key"
 * @param customElements An object containing extra object to add, they are indexed by a key and have a "position" object
 * @param overwritableKeys The list of keys from the original object that can be overwritten in case a custom element has the same "key"
 * @returns An ordered array of elements including the custom ones
 */
export function insertCustomElements<T extends ConfigurableObject>(
	rootElements: T[],
	customElements: Record<string, CustomElement<T>>,
	overwritableKeys: OverrideKeys<T> = {}
): T[] {
	const firstAnchor = rootElements.length ? rootElements[0].key : null;
	const rootElementsWithoutLast = rootElements.filter((rootElement) => {
		return rootElement.position?.placement !== Placement.End;
	});
	const lastAnchor = rootElements.length ? rootElements[rootElementsWithoutLast.length - 1].key : null;
	let endElement: T | undefined;
	const positioningItems: Record<string, Required<Position>> = {};
	const itemsPerKey: Record<string, T> = {};
	rootElements.forEach((rootElement) => {
		if (rootElement.position?.placement === Placement.End && !endElement) {
			endElement = rootElement;
		} else {
			positioningItems[rootElement.key] = {
				anchor: rootElement.position?.anchor || rootElement.key,
				placement: rootElement.position?.placement || Placement.After
			};
		}
		itemsPerKey[rootElement.key] = rootElement;
	});
	Object.keys(customElements).forEach((customElementKey) => {
		const customElement = customElements[customElementKey];
		const anchor = customElement.position.anchor;
		// If no placement defined we are After
		if (!customElement.position.placement) {
			customElement.position.placement = Placement.After;
		}
		// If no anchor we're either After the last anchor or Before the first
		if (!anchor) {
			const potentialAnchor = customElement.position.placement === Placement.After ? lastAnchor : firstAnchor;
			customElement.position.anchor = potentialAnchor ? potentialAnchor : customElementKey;
		}

		// Adding bound/unbound actions to menu
		customElement.menu = customElement?.menu?.map((menu) => {
			return itemsPerKey[menu.key] ?? menu;
		});

		const adjustedCustomElementKey = customElement.key as keyof Record<string, T>;
		if (itemsPerKey[adjustedCustomElementKey]) {
			itemsPerKey[adjustedCustomElementKey] = applyOverride(overwritableKeys, itemsPerKey[adjustedCustomElementKey], customElement);

			//Position is overwritten for filter fields if there is a change in manifest
			if (anchor && customElement.position && overwritableKeys.position && overwritableKeys.position === "overwrite") {
				positioningItems[adjustedCustomElementKey] = itemsPerKey[adjustedCustomElementKey].position as Required<Position>;
			}
			/**
			 * anchor check is added to make sure change in properties in the manifest does not affect the position of the field.
			 * Otherwise, when no position is mentioned in manifest for an altered field, the position is changed as
			 * per the potential anchor
			 */
		} else {
			itemsPerKey[adjustedCustomElementKey] = applyOverride(overwritableKeys, null, customElement);
			positioningItems[adjustedCustomElementKey] = customElement.position as Required<Position>;
		}
	});
	const sortedKeys: string[] = [];

	Object.keys(positioningItems).forEach((positionItemKey) => {
		orderPositioningItemRecursively(positioningItems, positionItemKey, sortedKeys, {});
	});

	const outElements = sortedKeys.map((key) => itemsPerKey[key]);
	if (endElement) {
		outElements.push(endElement);
	}
	return outElements;
}
