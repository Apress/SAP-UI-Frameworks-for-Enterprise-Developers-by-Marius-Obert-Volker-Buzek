/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/TypeGuards"], function (TypeGuards) {
  "use strict";

  var _exports = {};
  var isEntitySet = TypeGuards.isEntitySet;
  /**
   * Reads all SortRestrictions of the main entity and the (first level) navigation restrictions.
   * This does not work for more than one level of navigation.
   *
   * @param entitySet Entity set to be analyzed
   * @returns Array containing the property names of all non-sortable properties
   */
  const getNonSortablePropertiesRestrictions = function (entitySet) {
    var _entitySet$annotation6, _entitySet$annotation7, _entitySet$annotation8;
    let nonSortableProperties = [];
    // Check annotations for main entity
    if (isEntitySet(entitySet)) {
      var _entitySet$annotation, _entitySet$annotation2;
      if (((_entitySet$annotation = entitySet.annotations.Capabilities) === null || _entitySet$annotation === void 0 ? void 0 : (_entitySet$annotation2 = _entitySet$annotation.SortRestrictions) === null || _entitySet$annotation2 === void 0 ? void 0 : _entitySet$annotation2.Sortable) === false) {
        // add all properties of the entity to the nonSortableProperties
        nonSortableProperties.push(...entitySet.entityType.entityProperties.map(property => property.name));
      } else {
        var _entitySet$annotation3, _entitySet$annotation4, _entitySet$annotation5;
        nonSortableProperties = ((_entitySet$annotation3 = entitySet.annotations.Capabilities) === null || _entitySet$annotation3 === void 0 ? void 0 : (_entitySet$annotation4 = _entitySet$annotation3.SortRestrictions) === null || _entitySet$annotation4 === void 0 ? void 0 : (_entitySet$annotation5 = _entitySet$annotation4.NonSortableProperties) === null || _entitySet$annotation5 === void 0 ? void 0 : _entitySet$annotation5.map(property => property.value)) || [];
      }
    } else {
      return [];
    }
    // Check for every navigationRestriction if it has sortRestrictions
    (_entitySet$annotation6 = entitySet.annotations.Capabilities) === null || _entitySet$annotation6 === void 0 ? void 0 : (_entitySet$annotation7 = _entitySet$annotation6.NavigationRestrictions) === null || _entitySet$annotation7 === void 0 ? void 0 : (_entitySet$annotation8 = _entitySet$annotation7.RestrictedProperties) === null || _entitySet$annotation8 === void 0 ? void 0 : _entitySet$annotation8.forEach(navigationRestriction => {
      var _navigationRestrictio;
      if ((navigationRestriction === null || navigationRestriction === void 0 ? void 0 : (_navigationRestrictio = navigationRestriction.SortRestrictions) === null || _navigationRestrictio === void 0 ? void 0 : _navigationRestrictio.Sortable) === false) {
        var _navigationRestrictio2;
        // find correct navigation property
        const navigationProperty = entitySet.entityType.navigationProperties.by_name(navigationRestriction === null || navigationRestriction === void 0 ? void 0 : (_navigationRestrictio2 = navigationRestriction.NavigationProperty) === null || _navigationRestrictio2 === void 0 ? void 0 : _navigationRestrictio2.value);
        if (navigationProperty) {
          // add all properties of the navigation property to the nonSortableProperties
          nonSortableProperties.push(...navigationProperty.targetType.entityProperties.map(property => `${navigationProperty.name}/${property.name}`));
        }
      } else {
        var _navigationRestrictio3, _navigationRestrictio4;
        // leave the property path unchanged (it is relative to the annotation target!)
        const nonSortableNavigationProperties = navigationRestriction === null || navigationRestriction === void 0 ? void 0 : (_navigationRestrictio3 = navigationRestriction.SortRestrictions) === null || _navigationRestrictio3 === void 0 ? void 0 : (_navigationRestrictio4 = _navigationRestrictio3.NonSortableProperties) === null || _navigationRestrictio4 === void 0 ? void 0 : _navigationRestrictio4.map(property => property.value);
        if (nonSortableNavigationProperties) {
          nonSortableProperties.push(...nonSortableNavigationProperties);
        }
      }
    });
    return nonSortableProperties;
  };
  _exports.getNonSortablePropertiesRestrictions = getNonSortablePropertiesRestrictions;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXROb25Tb3J0YWJsZVByb3BlcnRpZXNSZXN0cmljdGlvbnMiLCJlbnRpdHlTZXQiLCJub25Tb3J0YWJsZVByb3BlcnRpZXMiLCJpc0VudGl0eVNldCIsImFubm90YXRpb25zIiwiQ2FwYWJpbGl0aWVzIiwiU29ydFJlc3RyaWN0aW9ucyIsIlNvcnRhYmxlIiwicHVzaCIsImVudGl0eVR5cGUiLCJlbnRpdHlQcm9wZXJ0aWVzIiwibWFwIiwicHJvcGVydHkiLCJuYW1lIiwiTm9uU29ydGFibGVQcm9wZXJ0aWVzIiwidmFsdWUiLCJOYXZpZ2F0aW9uUmVzdHJpY3Rpb25zIiwiUmVzdHJpY3RlZFByb3BlcnRpZXMiLCJmb3JFYWNoIiwibmF2aWdhdGlvblJlc3RyaWN0aW9uIiwibmF2aWdhdGlvblByb3BlcnR5IiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJieV9uYW1lIiwiTmF2aWdhdGlvblByb3BlcnR5IiwidGFyZ2V0VHlwZSIsIm5vblNvcnRhYmxlTmF2aWdhdGlvblByb3BlcnRpZXMiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkVudGl0eVNldEhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEVudGl0eVNldCwgU2luZ2xldG9uIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgeyBpc0VudGl0eVNldCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcblxuLyoqXG4gKiBSZWFkcyBhbGwgU29ydFJlc3RyaWN0aW9ucyBvZiB0aGUgbWFpbiBlbnRpdHkgYW5kIHRoZSAoZmlyc3QgbGV2ZWwpIG5hdmlnYXRpb24gcmVzdHJpY3Rpb25zLlxuICogVGhpcyBkb2VzIG5vdCB3b3JrIGZvciBtb3JlIHRoYW4gb25lIGxldmVsIG9mIG5hdmlnYXRpb24uXG4gKlxuICogQHBhcmFtIGVudGl0eVNldCBFbnRpdHkgc2V0IHRvIGJlIGFuYWx5emVkXG4gKiBAcmV0dXJucyBBcnJheSBjb250YWluaW5nIHRoZSBwcm9wZXJ0eSBuYW1lcyBvZiBhbGwgbm9uLXNvcnRhYmxlIHByb3BlcnRpZXNcbiAqL1xuZXhwb3J0IGNvbnN0IGdldE5vblNvcnRhYmxlUHJvcGVydGllc1Jlc3RyaWN0aW9ucyA9IGZ1bmN0aW9uIChlbnRpdHlTZXQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZCk6IHN0cmluZ1tdIHtcblx0bGV0IG5vblNvcnRhYmxlUHJvcGVydGllcyA9IFtdO1xuXHQvLyBDaGVjayBhbm5vdGF0aW9ucyBmb3IgbWFpbiBlbnRpdHlcblx0aWYgKGlzRW50aXR5U2V0KGVudGl0eVNldCkpIHtcblx0XHRpZiAoZW50aXR5U2V0LmFubm90YXRpb25zLkNhcGFiaWxpdGllcz8uU29ydFJlc3RyaWN0aW9ucz8uU29ydGFibGUgPT09IGZhbHNlKSB7XG5cdFx0XHQvLyBhZGQgYWxsIHByb3BlcnRpZXMgb2YgdGhlIGVudGl0eSB0byB0aGUgbm9uU29ydGFibGVQcm9wZXJ0aWVzXG5cdFx0XHRub25Tb3J0YWJsZVByb3BlcnRpZXMucHVzaCguLi5lbnRpdHlTZXQuZW50aXR5VHlwZS5lbnRpdHlQcm9wZXJ0aWVzLm1hcCgocHJvcGVydHkpID0+IHByb3BlcnR5Lm5hbWUpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bm9uU29ydGFibGVQcm9wZXJ0aWVzID1cblx0XHRcdFx0ZW50aXR5U2V0LmFubm90YXRpb25zLkNhcGFiaWxpdGllcz8uU29ydFJlc3RyaWN0aW9ucz8uTm9uU29ydGFibGVQcm9wZXJ0aWVzPy5tYXAoKHByb3BlcnR5KSA9PiBwcm9wZXJ0eS52YWx1ZSkgfHwgW107XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBbXTtcblx0fVxuXHQvLyBDaGVjayBmb3IgZXZlcnkgbmF2aWdhdGlvblJlc3RyaWN0aW9uIGlmIGl0IGhhcyBzb3J0UmVzdHJpY3Rpb25zXG5cdGVudGl0eVNldC5hbm5vdGF0aW9ucy5DYXBhYmlsaXRpZXM/Lk5hdmlnYXRpb25SZXN0cmljdGlvbnM/LlJlc3RyaWN0ZWRQcm9wZXJ0aWVzPy5mb3JFYWNoKChuYXZpZ2F0aW9uUmVzdHJpY3Rpb24pID0+IHtcblx0XHRpZiAobmF2aWdhdGlvblJlc3RyaWN0aW9uPy5Tb3J0UmVzdHJpY3Rpb25zPy5Tb3J0YWJsZSA9PT0gZmFsc2UpIHtcblx0XHRcdC8vIGZpbmQgY29ycmVjdCBuYXZpZ2F0aW9uIHByb3BlcnR5XG5cdFx0XHRjb25zdCBuYXZpZ2F0aW9uUHJvcGVydHkgPSBlbnRpdHlTZXQuZW50aXR5VHlwZS5uYXZpZ2F0aW9uUHJvcGVydGllcy5ieV9uYW1lKG5hdmlnYXRpb25SZXN0cmljdGlvbj8uTmF2aWdhdGlvblByb3BlcnR5Py52YWx1ZSk7XG5cdFx0XHRpZiAobmF2aWdhdGlvblByb3BlcnR5KSB7XG5cdFx0XHRcdC8vIGFkZCBhbGwgcHJvcGVydGllcyBvZiB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0eSB0byB0aGUgbm9uU29ydGFibGVQcm9wZXJ0aWVzXG5cdFx0XHRcdG5vblNvcnRhYmxlUHJvcGVydGllcy5wdXNoKFxuXHRcdFx0XHRcdC4uLm5hdmlnYXRpb25Qcm9wZXJ0eS50YXJnZXRUeXBlLmVudGl0eVByb3BlcnRpZXMubWFwKChwcm9wZXJ0eSkgPT4gYCR7bmF2aWdhdGlvblByb3BlcnR5Lm5hbWV9LyR7cHJvcGVydHkubmFtZX1gKVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBsZWF2ZSB0aGUgcHJvcGVydHkgcGF0aCB1bmNoYW5nZWQgKGl0IGlzIHJlbGF0aXZlIHRvIHRoZSBhbm5vdGF0aW9uIHRhcmdldCEpXG5cdFx0XHRjb25zdCBub25Tb3J0YWJsZU5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gbmF2aWdhdGlvblJlc3RyaWN0aW9uPy5Tb3J0UmVzdHJpY3Rpb25zPy5Ob25Tb3J0YWJsZVByb3BlcnRpZXM/Lm1hcChcblx0XHRcdFx0KHByb3BlcnR5KSA9PiBwcm9wZXJ0eS52YWx1ZVxuXHRcdFx0KTtcblx0XHRcdGlmIChub25Tb3J0YWJsZU5hdmlnYXRpb25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdG5vblNvcnRhYmxlUHJvcGVydGllcy5wdXNoKC4uLm5vblNvcnRhYmxlTmF2aWdhdGlvblByb3BlcnRpZXMpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cdHJldHVybiBub25Tb3J0YWJsZVByb3BlcnRpZXM7XG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7RUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLE1BQU1BLG9DQUFvQyxHQUFHLFVBQVVDLFNBQTRDLEVBQVk7SUFBQTtJQUNySCxJQUFJQyxxQkFBcUIsR0FBRyxFQUFFO0lBQzlCO0lBQ0EsSUFBSUMsV0FBVyxDQUFDRixTQUFTLENBQUMsRUFBRTtNQUFBO01BQzNCLElBQUksMEJBQUFBLFNBQVMsQ0FBQ0csV0FBVyxDQUFDQyxZQUFZLG9GQUFsQyxzQkFBb0NDLGdCQUFnQiwyREFBcEQsdUJBQXNEQyxRQUFRLE1BQUssS0FBSyxFQUFFO1FBQzdFO1FBQ0FMLHFCQUFxQixDQUFDTSxJQUFJLENBQUMsR0FBR1AsU0FBUyxDQUFDUSxVQUFVLENBQUNDLGdCQUFnQixDQUFDQyxHQUFHLENBQUVDLFFBQVEsSUFBS0EsUUFBUSxDQUFDQyxJQUFJLENBQUMsQ0FBQztNQUN0RyxDQUFDLE1BQU07UUFBQTtRQUNOWCxxQkFBcUIsR0FDcEIsMkJBQUFELFNBQVMsQ0FBQ0csV0FBVyxDQUFDQyxZQUFZLHFGQUFsQyx1QkFBb0NDLGdCQUFnQixxRkFBcEQsdUJBQXNEUSxxQkFBcUIsMkRBQTNFLHVCQUE2RUgsR0FBRyxDQUFFQyxRQUFRLElBQUtBLFFBQVEsQ0FBQ0csS0FBSyxDQUFDLEtBQUksRUFBRTtNQUN0SDtJQUNELENBQUMsTUFBTTtNQUNOLE9BQU8sRUFBRTtJQUNWO0lBQ0E7SUFDQSwwQkFBQWQsU0FBUyxDQUFDRyxXQUFXLENBQUNDLFlBQVkscUZBQWxDLHVCQUFvQ1csc0JBQXNCLHFGQUExRCx1QkFBNERDLG9CQUFvQiwyREFBaEYsdUJBQWtGQyxPQUFPLENBQUVDLHFCQUFxQixJQUFLO01BQUE7TUFDcEgsSUFBSSxDQUFBQSxxQkFBcUIsYUFBckJBLHFCQUFxQixnREFBckJBLHFCQUFxQixDQUFFYixnQkFBZ0IsMERBQXZDLHNCQUF5Q0MsUUFBUSxNQUFLLEtBQUssRUFBRTtRQUFBO1FBQ2hFO1FBQ0EsTUFBTWEsa0JBQWtCLEdBQUduQixTQUFTLENBQUNRLFVBQVUsQ0FBQ1ksb0JBQW9CLENBQUNDLE9BQU8sQ0FBQ0gscUJBQXFCLGFBQXJCQSxxQkFBcUIsaURBQXJCQSxxQkFBcUIsQ0FBRUksa0JBQWtCLDJEQUF6Qyx1QkFBMkNSLEtBQUssQ0FBQztRQUM5SCxJQUFJSyxrQkFBa0IsRUFBRTtVQUN2QjtVQUNBbEIscUJBQXFCLENBQUNNLElBQUksQ0FDekIsR0FBR1ksa0JBQWtCLENBQUNJLFVBQVUsQ0FBQ2QsZ0JBQWdCLENBQUNDLEdBQUcsQ0FBRUMsUUFBUSxJQUFNLEdBQUVRLGtCQUFrQixDQUFDUCxJQUFLLElBQUdELFFBQVEsQ0FBQ0MsSUFBSyxFQUFDLENBQUMsQ0FDbEg7UUFDRjtNQUNELENBQUMsTUFBTTtRQUFBO1FBQ047UUFDQSxNQUFNWSwrQkFBK0IsR0FBR04scUJBQXFCLGFBQXJCQSxxQkFBcUIsaURBQXJCQSxxQkFBcUIsQ0FBRWIsZ0JBQWdCLHFGQUF2Qyx1QkFBeUNRLHFCQUFxQiwyREFBOUQsdUJBQWdFSCxHQUFHLENBQ3pHQyxRQUFRLElBQUtBLFFBQVEsQ0FBQ0csS0FBSyxDQUM1QjtRQUNELElBQUlVLCtCQUErQixFQUFFO1VBQ3BDdkIscUJBQXFCLENBQUNNLElBQUksQ0FBQyxHQUFHaUIsK0JBQStCLENBQUM7UUFDL0Q7TUFDRDtJQUNELENBQUMsQ0FBQztJQUNGLE9BQU92QixxQkFBcUI7RUFDN0IsQ0FBQztFQUFDO0VBQUE7QUFBQSJ9