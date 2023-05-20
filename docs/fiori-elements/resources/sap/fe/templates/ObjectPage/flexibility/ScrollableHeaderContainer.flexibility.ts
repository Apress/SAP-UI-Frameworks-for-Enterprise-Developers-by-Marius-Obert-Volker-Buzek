import type Control from "sap/ui/core/Control";
import type Change from "sap/ui/fl/Change";
import MoveControls from "sap/ui/fl/changeHandler/MoveControls";

const ScrollableHeaderContainerFlexibility = {
	moveControls: {
		changeHandler: {
			applyChange: function (change: Change, control: Control, propertyBag: object) {
				return MoveControls.applyChange(change, control, {
					...propertyBag,
					sourceAggregation: "content",
					targetAggregation: "content"
				});
			},
			// all 3 changeHandlers have to be implemented
			// if variant managemant should be relevant for the object page header in future,
			// it might be necessary to override also the revertChange handler
			revertChange: MoveControls.revertChange,
			completeChangeContent: MoveControls.completeChangeContent
		}
	}
};
export default ScrollableHeaderContainerFlexibility;
