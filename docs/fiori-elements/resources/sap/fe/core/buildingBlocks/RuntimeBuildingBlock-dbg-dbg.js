/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/buildingBlocks/RuntimeBuildingBlockFragment", "sap/fe/core/helpers/TypeGuards"], function (BuildingBlockBase, BuildingBlockTemplateProcessor, RuntimeBuildingBlockFragment, TypeGuards) {
  "use strict";

  var _exports = {};
  var isContext = TypeGuards.isContext;
  var storeRuntimeBlock = RuntimeBuildingBlockFragment.storeRuntimeBlock;
  var xml = BuildingBlockTemplateProcessor.xml;
  var registerBuildingBlock = BuildingBlockTemplateProcessor.registerBuildingBlock;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * Base class for runtime building blocks
   */
  let RuntimeBuildingBlock = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(RuntimeBuildingBlock, _BuildingBlockBase);
    function RuntimeBuildingBlock() {
      return _BuildingBlockBase.apply(this, arguments) || this;
    }
    _exports = RuntimeBuildingBlock;
    RuntimeBuildingBlock.register = function register() {
      registerBuildingBlock(this);
      storeRuntimeBlock(this);
    };
    var _proto = RuntimeBuildingBlock.prototype;
    _proto.getTemplate = function getTemplate(oNode) {
      const metadata = this.constructor.metadata;
      const className = `${metadata.namespace ?? metadata.publicNamespace}.${metadata.name}`;
      const extraProps = [];
      // Function are defined as string but need to be resolved by UI5, as such we store them in an `event` property and will redispatch them later
      const functionHolderDefinition = [];
      const propertiesAssignedToFunction = [];
      const functionStringInOrder = [];
      for (const propertiesKey in metadata.properties) {
        let propertyValue = this[propertiesKey];
        if (propertyValue !== undefined && propertyValue !== null) {
          if (isContext(propertyValue)) {
            propertyValue = propertyValue.getPath();
          }
          if (metadata.properties[propertiesKey].type === "function") {
            functionHolderDefinition.push(propertyValue);
            functionStringInOrder.push(propertyValue);
            propertiesAssignedToFunction.push(propertiesKey);
          } else {
            extraProps.push(xml`feBB:${propertiesKey}="${propertyValue}"`);
          }
        }
      }
      if (functionHolderDefinition.length > 0) {
        extraProps.push(xml`functionHolder="${functionHolderDefinition.join(";")}"`);
        extraProps.push(xml`feBB:functionStringInOrder="${functionStringInOrder.join(",")}"`);
        extraProps.push(xml`feBB:propertiesAssignedToFunction="${propertiesAssignedToFunction.join(",")}"`);
      }
      // core:require need to be defined on the node itself to be picked up due to the templating step
      const coreRequire = (oNode === null || oNode === void 0 ? void 0 : oNode.getAttribute("core:require")) || undefined;
      if (coreRequire) {
        extraProps.push(xml`core:require="${coreRequire}"`);
      }
      return xml`<feBB:RuntimeBuildingBlockFragment
					xmlns:core="sap.ui.core"
					xmlns:feBB="sap.fe.core.buildingBlocks"
					fragmentName="${className}"

					id="{this>id}"
					type="FE_COMPONENTS"
					${extraProps}
				>
				</feBB:RuntimeBuildingBlockFragment>`;
    };
    return RuntimeBuildingBlock;
  }(BuildingBlockBase);
  RuntimeBuildingBlock.isRuntime = true;
  _exports = RuntimeBuildingBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSdW50aW1lQnVpbGRpbmdCbG9jayIsInJlZ2lzdGVyIiwicmVnaXN0ZXJCdWlsZGluZ0Jsb2NrIiwic3RvcmVSdW50aW1lQmxvY2siLCJnZXRUZW1wbGF0ZSIsIm9Ob2RlIiwibWV0YWRhdGEiLCJjb25zdHJ1Y3RvciIsImNsYXNzTmFtZSIsIm5hbWVzcGFjZSIsInB1YmxpY05hbWVzcGFjZSIsIm5hbWUiLCJleHRyYVByb3BzIiwiZnVuY3Rpb25Ib2xkZXJEZWZpbml0aW9uIiwicHJvcGVydGllc0Fzc2lnbmVkVG9GdW5jdGlvbiIsImZ1bmN0aW9uU3RyaW5nSW5PcmRlciIsInByb3BlcnRpZXNLZXkiLCJwcm9wZXJ0aWVzIiwicHJvcGVydHlWYWx1ZSIsInVuZGVmaW5lZCIsImlzQ29udGV4dCIsImdldFBhdGgiLCJ0eXBlIiwicHVzaCIsInhtbCIsImxlbmd0aCIsImpvaW4iLCJjb3JlUmVxdWlyZSIsImdldEF0dHJpYnV0ZSIsIkJ1aWxkaW5nQmxvY2tCYXNlIiwiaXNSdW50aW1lIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJSdW50aW1lQnVpbGRpbmdCbG9jay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IEJ1aWxkaW5nQmxvY2tCYXNlIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrQmFzZVwiO1xuaW1wb3J0IHR5cGUgeyBYTUxQcm9jZXNzb3JUeXBlVmFsdWUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgeyByZWdpc3RlckJ1aWxkaW5nQmxvY2ssIHhtbCB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCB7IHN0b3JlUnVudGltZUJsb2NrIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL1J1bnRpbWVCdWlsZGluZ0Jsb2NrRnJhZ21lbnRcIjtcbmltcG9ydCB7IGlzQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCB0eXBlIFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgcnVudGltZSBidWlsZGluZyBibG9ja3NcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUnVudGltZUJ1aWxkaW5nQmxvY2sgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgaXNSdW50aW1lID0gdHJ1ZTtcblxuXHRnZXRDb250ZW50Pyhjb250YWluaW5nVmlldzogVmlldywgYXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQpOiBDb250cm9sIHwgdW5kZWZpbmVkO1xuXG5cdHN0YXRpYyByZWdpc3RlcigpIHtcblx0XHRyZWdpc3RlckJ1aWxkaW5nQmxvY2sodGhpcyk7XG5cdFx0c3RvcmVSdW50aW1lQmxvY2sodGhpcyk7XG5cdH1cblxuXHRwdWJsaWMgZ2V0VGVtcGxhdGUob05vZGU/OiBFbGVtZW50KTogc3RyaW5nIHwgUHJvbWlzZTxzdHJpbmcgfCB1bmRlZmluZWQ+IHwgdW5kZWZpbmVkIHtcblx0XHRjb25zdCBtZXRhZGF0YSA9ICh0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBCdWlsZGluZ0Jsb2NrQmFzZSkubWV0YWRhdGE7XG5cblx0XHRjb25zdCBjbGFzc05hbWUgPSBgJHttZXRhZGF0YS5uYW1lc3BhY2UgPz8gbWV0YWRhdGEucHVibGljTmFtZXNwYWNlfS4ke21ldGFkYXRhLm5hbWV9YDtcblx0XHRjb25zdCBleHRyYVByb3BzID0gW107XG5cdFx0Ly8gRnVuY3Rpb24gYXJlIGRlZmluZWQgYXMgc3RyaW5nIGJ1dCBuZWVkIHRvIGJlIHJlc29sdmVkIGJ5IFVJNSwgYXMgc3VjaCB3ZSBzdG9yZSB0aGVtIGluIGFuIGBldmVudGAgcHJvcGVydHkgYW5kIHdpbGwgcmVkaXNwYXRjaCB0aGVtIGxhdGVyXG5cdFx0Y29uc3QgZnVuY3Rpb25Ib2xkZXJEZWZpbml0aW9uID0gW107XG5cdFx0Y29uc3QgcHJvcGVydGllc0Fzc2lnbmVkVG9GdW5jdGlvbiA9IFtdO1xuXHRcdGNvbnN0IGZ1bmN0aW9uU3RyaW5nSW5PcmRlciA9IFtdO1xuXHRcdGZvciAoY29uc3QgcHJvcGVydGllc0tleSBpbiBtZXRhZGF0YS5wcm9wZXJ0aWVzKSB7XG5cdFx0XHRsZXQgcHJvcGVydHlWYWx1ZSA9IHRoaXNbcHJvcGVydGllc0tleSBhcyBrZXlvZiB0aGlzXSBhcyB1bmtub3duIGFzIFhNTFByb2Nlc3NvclR5cGVWYWx1ZTtcblx0XHRcdGlmIChwcm9wZXJ0eVZhbHVlICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydHlWYWx1ZSAhPT0gbnVsbCkge1xuXHRcdFx0XHRpZiAoaXNDb250ZXh0KHByb3BlcnR5VmFsdWUpKSB7XG5cdFx0XHRcdFx0cHJvcGVydHlWYWx1ZSA9IHByb3BlcnR5VmFsdWUuZ2V0UGF0aCgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChtZXRhZGF0YS5wcm9wZXJ0aWVzW3Byb3BlcnRpZXNLZXldLnR5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdGZ1bmN0aW9uSG9sZGVyRGVmaW5pdGlvbi5wdXNoKHByb3BlcnR5VmFsdWUpO1xuXHRcdFx0XHRcdGZ1bmN0aW9uU3RyaW5nSW5PcmRlci5wdXNoKHByb3BlcnR5VmFsdWUpO1xuXHRcdFx0XHRcdHByb3BlcnRpZXNBc3NpZ25lZFRvRnVuY3Rpb24ucHVzaChwcm9wZXJ0aWVzS2V5KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRleHRyYVByb3BzLnB1c2goeG1sYGZlQkI6JHtwcm9wZXJ0aWVzS2V5fT1cIiR7cHJvcGVydHlWYWx1ZX1cImApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChmdW5jdGlvbkhvbGRlckRlZmluaXRpb24ubGVuZ3RoID4gMCkge1xuXHRcdFx0ZXh0cmFQcm9wcy5wdXNoKHhtbGBmdW5jdGlvbkhvbGRlcj1cIiR7ZnVuY3Rpb25Ib2xkZXJEZWZpbml0aW9uLmpvaW4oXCI7XCIpfVwiYCk7XG5cdFx0XHRleHRyYVByb3BzLnB1c2goeG1sYGZlQkI6ZnVuY3Rpb25TdHJpbmdJbk9yZGVyPVwiJHtmdW5jdGlvblN0cmluZ0luT3JkZXIuam9pbihcIixcIil9XCJgKTtcblx0XHRcdGV4dHJhUHJvcHMucHVzaCh4bWxgZmVCQjpwcm9wZXJ0aWVzQXNzaWduZWRUb0Z1bmN0aW9uPVwiJHtwcm9wZXJ0aWVzQXNzaWduZWRUb0Z1bmN0aW9uLmpvaW4oXCIsXCIpfVwiYCk7XG5cdFx0fVxuXHRcdC8vIGNvcmU6cmVxdWlyZSBuZWVkIHRvIGJlIGRlZmluZWQgb24gdGhlIG5vZGUgaXRzZWxmIHRvIGJlIHBpY2tlZCB1cCBkdWUgdG8gdGhlIHRlbXBsYXRpbmcgc3RlcFxuXHRcdGNvbnN0IGNvcmVSZXF1aXJlID0gb05vZGU/LmdldEF0dHJpYnV0ZShcImNvcmU6cmVxdWlyZVwiKSB8fCB1bmRlZmluZWQ7XG5cdFx0aWYgKGNvcmVSZXF1aXJlKSB7XG5cdFx0XHRleHRyYVByb3BzLnB1c2goeG1sYGNvcmU6cmVxdWlyZT1cIiR7Y29yZVJlcXVpcmV9XCJgKTtcblx0XHR9XG5cdFx0cmV0dXJuIHhtbGA8ZmVCQjpSdW50aW1lQnVpbGRpbmdCbG9ja0ZyYWdtZW50XG5cdFx0XHRcdFx0eG1sbnM6Y29yZT1cInNhcC51aS5jb3JlXCJcblx0XHRcdFx0XHR4bWxuczpmZUJCPVwic2FwLmZlLmNvcmUuYnVpbGRpbmdCbG9ja3NcIlxuXHRcdFx0XHRcdGZyYWdtZW50TmFtZT1cIiR7Y2xhc3NOYW1lfVwiXG5cblx0XHRcdFx0XHRpZD1cInt0aGlzPmlkfVwiXG5cdFx0XHRcdFx0dHlwZT1cIkZFX0NPTVBPTkVOVFNcIlxuXHRcdFx0XHRcdCR7ZXh0cmFQcm9wc31cblx0XHRcdFx0PlxuXHRcdFx0XHQ8L2ZlQkI6UnVudGltZUJ1aWxkaW5nQmxvY2tGcmFnbWVudD5gO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7O0VBU0E7QUFDQTtBQUNBO0VBRkEsSUFHcUJBLG9CQUFvQjtJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFBQSxxQkFLakNDLFFBQVEsR0FBZixvQkFBa0I7TUFDakJDLHFCQUFxQixDQUFDLElBQUksQ0FBQztNQUMzQkMsaUJBQWlCLENBQUMsSUFBSSxDQUFDO0lBQ3hCLENBQUM7SUFBQTtJQUFBLE9BRU1DLFdBQVcsR0FBbEIscUJBQW1CQyxLQUFlLEVBQW9EO01BQ3JGLE1BQU1DLFFBQVEsR0FBSSxJQUFJLENBQUNDLFdBQVcsQ0FBOEJELFFBQVE7TUFFeEUsTUFBTUUsU0FBUyxHQUFJLEdBQUVGLFFBQVEsQ0FBQ0csU0FBUyxJQUFJSCxRQUFRLENBQUNJLGVBQWdCLElBQUdKLFFBQVEsQ0FBQ0ssSUFBSyxFQUFDO01BQ3RGLE1BQU1DLFVBQVUsR0FBRyxFQUFFO01BQ3JCO01BQ0EsTUFBTUMsd0JBQXdCLEdBQUcsRUFBRTtNQUNuQyxNQUFNQyw0QkFBNEIsR0FBRyxFQUFFO01BQ3ZDLE1BQU1DLHFCQUFxQixHQUFHLEVBQUU7TUFDaEMsS0FBSyxNQUFNQyxhQUFhLElBQUlWLFFBQVEsQ0FBQ1csVUFBVSxFQUFFO1FBQ2hELElBQUlDLGFBQWEsR0FBRyxJQUFJLENBQUNGLGFBQWEsQ0FBbUQ7UUFDekYsSUFBSUUsYUFBYSxLQUFLQyxTQUFTLElBQUlELGFBQWEsS0FBSyxJQUFJLEVBQUU7VUFDMUQsSUFBSUUsU0FBUyxDQUFDRixhQUFhLENBQUMsRUFBRTtZQUM3QkEsYUFBYSxHQUFHQSxhQUFhLENBQUNHLE9BQU8sRUFBRTtVQUN4QztVQUNBLElBQUlmLFFBQVEsQ0FBQ1csVUFBVSxDQUFDRCxhQUFhLENBQUMsQ0FBQ00sSUFBSSxLQUFLLFVBQVUsRUFBRTtZQUMzRFQsd0JBQXdCLENBQUNVLElBQUksQ0FBQ0wsYUFBYSxDQUFDO1lBQzVDSCxxQkFBcUIsQ0FBQ1EsSUFBSSxDQUFDTCxhQUFhLENBQUM7WUFDekNKLDRCQUE0QixDQUFDUyxJQUFJLENBQUNQLGFBQWEsQ0FBQztVQUNqRCxDQUFDLE1BQU07WUFDTkosVUFBVSxDQUFDVyxJQUFJLENBQUNDLEdBQUksUUFBT1IsYUFBYyxLQUFJRSxhQUFjLEdBQUUsQ0FBQztVQUMvRDtRQUNEO01BQ0Q7TUFDQSxJQUFJTCx3QkFBd0IsQ0FBQ1ksTUFBTSxHQUFHLENBQUMsRUFBRTtRQUN4Q2IsVUFBVSxDQUFDVyxJQUFJLENBQUNDLEdBQUksbUJBQWtCWCx3QkFBd0IsQ0FBQ2EsSUFBSSxDQUFDLEdBQUcsQ0FBRSxHQUFFLENBQUM7UUFDNUVkLFVBQVUsQ0FBQ1csSUFBSSxDQUFDQyxHQUFJLCtCQUE4QlQscUJBQXFCLENBQUNXLElBQUksQ0FBQyxHQUFHLENBQUUsR0FBRSxDQUFDO1FBQ3JGZCxVQUFVLENBQUNXLElBQUksQ0FBQ0MsR0FBSSxzQ0FBcUNWLDRCQUE0QixDQUFDWSxJQUFJLENBQUMsR0FBRyxDQUFFLEdBQUUsQ0FBQztNQUNwRztNQUNBO01BQ0EsTUFBTUMsV0FBVyxHQUFHLENBQUF0QixLQUFLLGFBQUxBLEtBQUssdUJBQUxBLEtBQUssQ0FBRXVCLFlBQVksQ0FBQyxjQUFjLENBQUMsS0FBSVQsU0FBUztNQUNwRSxJQUFJUSxXQUFXLEVBQUU7UUFDaEJmLFVBQVUsQ0FBQ1csSUFBSSxDQUFDQyxHQUFJLGlCQUFnQkcsV0FBWSxHQUFFLENBQUM7TUFDcEQ7TUFDQSxPQUFPSCxHQUFJO0FBQ2I7QUFDQTtBQUNBLHFCQUFxQmhCLFNBQVU7QUFDL0I7QUFDQTtBQUNBO0FBQ0EsT0FBT0ksVUFBVztBQUNsQjtBQUNBLHlDQUF5QztJQUN4QyxDQUFDO0lBQUE7RUFBQSxFQXREZ0RpQixpQkFBaUI7RUFBOUM3QixvQkFBb0IsQ0FDakI4QixTQUFTLEdBQUcsSUFBSTtFQUFBO0VBQUE7QUFBQSJ9