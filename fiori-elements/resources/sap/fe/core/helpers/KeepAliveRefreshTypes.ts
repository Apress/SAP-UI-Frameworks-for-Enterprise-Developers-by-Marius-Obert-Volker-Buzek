/**
 * Enumeration for supported refresh strategy type
 */
export enum RefreshStrategyType {
	Self = "self",
	IncludingDependents = "includingDependents"
}
/**
 * Configuration of a RefreshStrategy
 */
export type SORefreshStrategy = {
	[entitySetNameOrContextPath: string]: RefreshStrategyType;
};
/**
 * Configuration of a RefreshStrategies
 */
export type RefreshStrategies = {
	intents?: {
		[soAction: string]: SORefreshStrategy; // 'soAction' format is "<SemanticObject>-<Action>"
	};
	defaultBehavior?: SORefreshStrategy;
	_feDefault?: SORefreshStrategy;
};

/**
 * Configuration for hash with semanticObject and action
 */
export type SOAction = {
	semanticObject?: string;
	action?: string;
};

/**
 * Path used to store information
 */
export const PATH_TO_STORE: string = "/refreshStrategyOnAppRestore";
