/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor"], function (BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var _exports = {};
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let MultipleModeBlock = (_dec = defineBuildingBlock({
    name: "MultipleMode",
    namespace: "sap.fe.templates.ListReport.view.fragments",
    isOpen: true
  }), _dec2 = blockAttribute({
    type: "object"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(MultipleModeBlock, _BuildingBlockBase);
    function MultipleModeBlock() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlockBase.call(this, ...args) || this;
      _initializerDefineProperty(_this, "converterContext", _descriptor, _assertThisInitialized(_this));
      return _this;
    }
    _exports = MultipleModeBlock;
    var _proto = MultipleModeBlock.prototype;
    _proto.getInnerControlsAPI = function getInnerControlsAPI() {
      var _this$converterContex;
      return ((_this$converterContex = this.converterContext) === null || _this$converterContex === void 0 ? void 0 : _this$converterContex.views.reduce((innerControls, view) => {
        const innerControlId = view.tableControlId || view.chartControlId;
        if (innerControlId) {
          innerControls.push(`${innerControlId}::${view.tableControlId ? "Table" : "Chart"}`);
        }
        return innerControls;
      }, []).join(",")) || "";
    };
    _proto.getTemplate = function getTemplate() {
      var _multiViewsControl, _multiViewsControl2, _multiViewsControl3;
      return xml`
			<fe:MultipleModeControl
				xmlns="sap.m"
				xmlns:fe="sap.fe.templates.ListReport.controls"
				xmlns:core="sap.ui.core"
				xmlns:macro="sap.fe.macros"
				innerControls="${this.getInnerControlsAPI()}"
				filterControl="${this.converterContext.filterBarId}"
				showCounts="${(_multiViewsControl = this.converterContext.multiViewsControl) === null || _multiViewsControl === void 0 ? void 0 : _multiViewsControl.showTabCounts}"
				freezeContent="${!!this.converterContext.filterBarId}"
				id="${(_multiViewsControl2 = this.converterContext.multiViewsControl) === null || _multiViewsControl2 === void 0 ? void 0 : _multiViewsControl2.id}::Control"
			>
				<IconTabBar
				core:require="{
					MULTICONTROL: 'sap/fe/templates/ListReport/controls/MultipleModeControl'
				}"
					expandable="false"
					headerMode="Inline"
					id="${(_multiViewsControl3 = this.converterContext.multiViewsControl) === null || _multiViewsControl3 === void 0 ? void 0 : _multiViewsControl3.id}"
					stretchContentHeight="true"
					select="MULTICONTROL.handleTabChange($event)"
				>
					<items>
					${this.converterContext.views.map((view, viewIdx) => {
        return `<template:with path="converterContext>views/${viewIdx}/" var="view"
										template:require="{
											ID: 'sap/fe/core/helpers/StableIdHelper'
										}"
										xmlns:core="sap.ui.core"
										xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1">
								<template:with path="view>presentation" var="presentationContext">
								<IconTabFilter
									text="${view.title}"
									key="{= ID.generate([\${view>tableControlId} || \${view>customTabId} || \${view>chartControlId}])}"
									visible="{view>visible}"
								>
									<content>
										<template:if test="{= \${view>type} === 'Custom'}">
											<template:then>
												<core:Fragment fragmentName="sap.fe.templates.ListReport.view.fragments.CustomView" type="XML" />
											</template:then>
											<template:else>
												<MessageStrip
													text="{= '{= (\${tabsInternal>/' + (\${view>tableControlId} || \${view>chartControlId}) + '/notApplicable/title} ) }' }"
													type="Information"
													showIcon="true"
													showCloseButton="true"
													class="sapUiTinyMargin"
													visible="{= '{= (\${tabsInternal>/' + (\${view>tableControlId} || \${view>chartControlId}) + '/notApplicable/fields} || []).length>0 }' }"
												>
												</MessageStrip>
												<core:Fragment fragmentName="sap.fe.templates.ListReport.view.fragments.CollectionVisualization" type="XML" />
											</template:else>
										</template:if>
									</content>
								</IconTabFilter>
							</template:with></template:with>`;
      }).join("")}
					</items>
				</IconTabBar>
			</fe:MultipleModeControl>`;
    };
    return MultipleModeBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "converterContext", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = MultipleModeBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aXBsZU1vZGVCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiaXNPcGVuIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwiZ2V0SW5uZXJDb250cm9sc0FQSSIsImNvbnZlcnRlckNvbnRleHQiLCJ2aWV3cyIsInJlZHVjZSIsImlubmVyQ29udHJvbHMiLCJ2aWV3IiwiaW5uZXJDb250cm9sSWQiLCJ0YWJsZUNvbnRyb2xJZCIsImNoYXJ0Q29udHJvbElkIiwicHVzaCIsImpvaW4iLCJnZXRUZW1wbGF0ZSIsInhtbCIsImZpbHRlckJhcklkIiwibXVsdGlWaWV3c0NvbnRyb2wiLCJzaG93VGFiQ291bnRzIiwiaWQiLCJtYXAiLCJ2aWV3SWR4IiwidGl0bGUiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiTXVsdGlwbGVNb2RlLmJsb2NrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCdWlsZGluZ0Jsb2NrQmFzZSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja0Jhc2VcIjtcbmltcG9ydCB7IGJsb2NrQXR0cmlidXRlLCBkZWZpbmVCdWlsZGluZ0Jsb2NrIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tTdXBwb3J0XCI7XG5pbXBvcnQgeyB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgdHlwZSB7XG5cdExpc3RSZXBvcnREZWZpbml0aW9uLFxuXHRTaW5nbGVDaGFydFZpZXdEZWZpbml0aW9uLFxuXHRTaW5nbGVUYWJsZVZpZXdEZWZpbml0aW9uXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL3RlbXBsYXRlcy9MaXN0UmVwb3J0Q29udmVydGVyXCI7XG5cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHsgbmFtZTogXCJNdWx0aXBsZU1vZGVcIiwgbmFtZXNwYWNlOiBcInNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydC52aWV3LmZyYWdtZW50c1wiLCBpc09wZW46IHRydWUgfSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE11bHRpcGxlTW9kZUJsb2NrIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcIm9iamVjdFwiIH0pXG5cdGNvbnZlcnRlckNvbnRleHQ/OiBMaXN0UmVwb3J0RGVmaW5pdGlvbjtcblxuXHRnZXRJbm5lckNvbnRyb2xzQVBJKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHR0aGlzLmNvbnZlcnRlckNvbnRleHQ/LnZpZXdzXG5cdFx0XHRcdC5yZWR1Y2UoKGlubmVyQ29udHJvbHM6IHN0cmluZ1tdLCB2aWV3KSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgaW5uZXJDb250cm9sSWQgPVxuXHRcdFx0XHRcdFx0KHZpZXcgYXMgU2luZ2xlVGFibGVWaWV3RGVmaW5pdGlvbikudGFibGVDb250cm9sSWQgfHwgKHZpZXcgYXMgU2luZ2xlQ2hhcnRWaWV3RGVmaW5pdGlvbikuY2hhcnRDb250cm9sSWQ7XG5cdFx0XHRcdFx0aWYgKGlubmVyQ29udHJvbElkKSB7XG5cdFx0XHRcdFx0XHRpbm5lckNvbnRyb2xzLnB1c2goYCR7aW5uZXJDb250cm9sSWR9Ojokeyh2aWV3IGFzIFNpbmdsZVRhYmxlVmlld0RlZmluaXRpb24pLnRhYmxlQ29udHJvbElkID8gXCJUYWJsZVwiIDogXCJDaGFydFwifWApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gaW5uZXJDb250cm9scztcblx0XHRcdFx0fSwgW10pXG5cdFx0XHRcdC5qb2luKFwiLFwiKSB8fCBcIlwiXG5cdFx0KTtcblx0fVxuXG5cdGdldFRlbXBsYXRlKCkge1xuXHRcdHJldHVybiB4bWxgXG5cdFx0XHQ8ZmU6TXVsdGlwbGVNb2RlQ29udHJvbFxuXHRcdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdFx0eG1sbnM6ZmU9XCJzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnQuY29udHJvbHNcIlxuXHRcdFx0XHR4bWxuczpjb3JlPVwic2FwLnVpLmNvcmVcIlxuXHRcdFx0XHR4bWxuczptYWNybz1cInNhcC5mZS5tYWNyb3NcIlxuXHRcdFx0XHRpbm5lckNvbnRyb2xzPVwiJHt0aGlzLmdldElubmVyQ29udHJvbHNBUEkoKX1cIlxuXHRcdFx0XHRmaWx0ZXJDb250cm9sPVwiJHt0aGlzLmNvbnZlcnRlckNvbnRleHQhLmZpbHRlckJhcklkfVwiXG5cdFx0XHRcdHNob3dDb3VudHM9XCIke3RoaXMuY29udmVydGVyQ29udGV4dCEubXVsdGlWaWV3c0NvbnRyb2w/LnNob3dUYWJDb3VudHN9XCJcblx0XHRcdFx0ZnJlZXplQ29udGVudD1cIiR7ISF0aGlzLmNvbnZlcnRlckNvbnRleHQhLmZpbHRlckJhcklkfVwiXG5cdFx0XHRcdGlkPVwiJHt0aGlzLmNvbnZlcnRlckNvbnRleHQhLm11bHRpVmlld3NDb250cm9sPy5pZH06OkNvbnRyb2xcIlxuXHRcdFx0PlxuXHRcdFx0XHQ8SWNvblRhYkJhclxuXHRcdFx0XHRjb3JlOnJlcXVpcmU9XCJ7XG5cdFx0XHRcdFx0TVVMVElDT05UUk9MOiAnc2FwL2ZlL3RlbXBsYXRlcy9MaXN0UmVwb3J0L2NvbnRyb2xzL011bHRpcGxlTW9kZUNvbnRyb2wnXG5cdFx0XHRcdH1cIlxuXHRcdFx0XHRcdGV4cGFuZGFibGU9XCJmYWxzZVwiXG5cdFx0XHRcdFx0aGVhZGVyTW9kZT1cIklubGluZVwiXG5cdFx0XHRcdFx0aWQ9XCIke3RoaXMuY29udmVydGVyQ29udGV4dCEubXVsdGlWaWV3c0NvbnRyb2w/LmlkfVwiXG5cdFx0XHRcdFx0c3RyZXRjaENvbnRlbnRIZWlnaHQ9XCJ0cnVlXCJcblx0XHRcdFx0XHRzZWxlY3Q9XCJNVUxUSUNPTlRST0wuaGFuZGxlVGFiQ2hhbmdlKCRldmVudClcIlxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0PGl0ZW1zPlxuXHRcdFx0XHRcdCR7dGhpcy5jb252ZXJ0ZXJDb250ZXh0IS52aWV3cy5tYXAoKHZpZXcsIHZpZXdJZHgpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiBgPHRlbXBsYXRlOndpdGggcGF0aD1cImNvbnZlcnRlckNvbnRleHQ+dmlld3MvJHt2aWV3SWR4fS9cIiB2YXI9XCJ2aWV3XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGVtcGxhdGU6cmVxdWlyZT1cIntcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRJRDogJ3NhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXInXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHR4bWxuczpjb3JlPVwic2FwLnVpLmNvcmVcIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHR4bWxuczp0ZW1wbGF0ZT1cImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS50ZW1wbGF0ZS8xXCI+XG5cdFx0XHRcdFx0XHRcdFx0PHRlbXBsYXRlOndpdGggcGF0aD1cInZpZXc+cHJlc2VudGF0aW9uXCIgdmFyPVwicHJlc2VudGF0aW9uQ29udGV4dFwiPlxuXHRcdFx0XHRcdFx0XHRcdDxJY29uVGFiRmlsdGVyXG5cdFx0XHRcdFx0XHRcdFx0XHR0ZXh0PVwiJHt2aWV3LnRpdGxlfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRrZXk9XCJ7PSBJRC5nZW5lcmF0ZShbXFwke3ZpZXc+dGFibGVDb250cm9sSWR9IHx8IFxcJHt2aWV3PmN1c3RvbVRhYklkfSB8fCBcXCR7dmlldz5jaGFydENvbnRyb2xJZH1dKX1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0dmlzaWJsZT1cInt2aWV3PnZpc2libGV9XCJcblx0XHRcdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8Y29udGVudD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PHRlbXBsYXRlOmlmIHRlc3Q9XCJ7PSBcXCR7dmlldz50eXBlfSA9PT0gJ0N1c3RvbSd9XCI+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PHRlbXBsYXRlOnRoZW4+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8Y29yZTpGcmFnbWVudCBmcmFnbWVudE5hbWU9XCJzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnQudmlldy5mcmFnbWVudHMuQ3VzdG9tVmlld1wiIHR5cGU9XCJYTUxcIiAvPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvdGVtcGxhdGU6dGhlbj5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8dGVtcGxhdGU6ZWxzZT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxNZXNzYWdlU3RyaXBcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dGV4dD1cIns9ICd7PSAoXFwke3RhYnNJbnRlcm5hbD4vJyArIChcXCR7dmlldz50YWJsZUNvbnRyb2xJZH0gfHwgXFwke3ZpZXc+Y2hhcnRDb250cm9sSWR9KSArICcvbm90QXBwbGljYWJsZS90aXRsZX0gKSB9JyB9XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dHlwZT1cIkluZm9ybWF0aW9uXCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c2hvd0ljb249XCJ0cnVlXCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c2hvd0Nsb3NlQnV0dG9uPVwidHJ1ZVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNsYXNzPVwic2FwVWlUaW55TWFyZ2luXCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dmlzaWJsZT1cIns9ICd7PSAoXFwke3RhYnNJbnRlcm5hbD4vJyArIChcXCR7dmlldz50YWJsZUNvbnRyb2xJZH0gfHwgXFwke3ZpZXc+Y2hhcnRDb250cm9sSWR9KSArICcvbm90QXBwbGljYWJsZS9maWVsZHN9IHx8IFtdKS5sZW5ndGg+MCB9JyB9XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvTWVzc2FnZVN0cmlwPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PGNvcmU6RnJhZ21lbnQgZnJhZ21lbnROYW1lPVwic2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0LnZpZXcuZnJhZ21lbnRzLkNvbGxlY3Rpb25WaXN1YWxpemF0aW9uXCIgdHlwZT1cIlhNTFwiIC8+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC90ZW1wbGF0ZTplbHNlPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8L3RlbXBsYXRlOmlmPlxuXHRcdFx0XHRcdFx0XHRcdFx0PC9jb250ZW50PlxuXHRcdFx0XHRcdFx0XHRcdDwvSWNvblRhYkZpbHRlcj5cblx0XHRcdFx0XHRcdFx0PC90ZW1wbGF0ZTp3aXRoPjwvdGVtcGxhdGU6d2l0aD5gO1xuXHRcdFx0XHRcdH0pLmpvaW4oXCJcIil9XG5cdFx0XHRcdFx0PC9pdGVtcz5cblx0XHRcdFx0PC9JY29uVGFiQmFyPlxuXHRcdFx0PC9mZTpNdWx0aXBsZU1vZGVDb250cm9sPmA7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7O01BVXFCQSxpQkFBaUIsV0FEckNDLG1CQUFtQixDQUFDO0lBQUVDLElBQUksRUFBRSxjQUFjO0lBQUVDLFNBQVMsRUFBRSw0Q0FBNEM7SUFBRUMsTUFBTSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBRW5IQyxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUEsT0FHbkNDLG1CQUFtQixHQUFuQiwrQkFBc0I7TUFBQTtNQUNyQixPQUNDLDhCQUFJLENBQUNDLGdCQUFnQiwwREFBckIsc0JBQXVCQyxLQUFLLENBQzFCQyxNQUFNLENBQUMsQ0FBQ0MsYUFBdUIsRUFBRUMsSUFBSSxLQUFLO1FBQzFDLE1BQU1DLGNBQWMsR0FDbEJELElBQUksQ0FBK0JFLGNBQWMsSUFBS0YsSUFBSSxDQUErQkcsY0FBYztRQUN6RyxJQUFJRixjQUFjLEVBQUU7VUFDbkJGLGFBQWEsQ0FBQ0ssSUFBSSxDQUFFLEdBQUVILGNBQWUsS0FBS0QsSUFBSSxDQUErQkUsY0FBYyxHQUFHLE9BQU8sR0FBRyxPQUFRLEVBQUMsQ0FBQztRQUNuSDtRQUNBLE9BQU9ILGFBQWE7TUFDckIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUNMTSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUksRUFBRTtJQUVuQixDQUFDO0lBQUEsT0FFREMsV0FBVyxHQUFYLHVCQUFjO01BQUE7TUFDYixPQUFPQyxHQUFJO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixJQUFJLENBQUNaLG1CQUFtQixFQUFHO0FBQ2hELHFCQUFxQixJQUFJLENBQUNDLGdCQUFnQixDQUFFWSxXQUFZO0FBQ3hELGtCQUFnQixzQkFBRSxJQUFJLENBQUNaLGdCQUFnQixDQUFFYSxpQkFBaUIsdURBQXhDLG1CQUEwQ0MsYUFBYztBQUMxRSxxQkFBcUIsQ0FBQyxDQUFDLElBQUksQ0FBQ2QsZ0JBQWdCLENBQUVZLFdBQVk7QUFDMUQsVUFBUSx1QkFBRSxJQUFJLENBQUNaLGdCQUFnQixDQUFFYSxpQkFBaUIsd0RBQXhDLG9CQUEwQ0UsRUFBRztBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVMsdUJBQUUsSUFBSSxDQUFDZixnQkFBZ0IsQ0FBRWEsaUJBQWlCLHdEQUF4QyxvQkFBMENFLEVBQUc7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQUksQ0FBQ2YsZ0JBQWdCLENBQUVDLEtBQUssQ0FBQ2UsR0FBRyxDQUFDLENBQUNaLElBQUksRUFBRWEsT0FBTyxLQUFLO1FBQ3JELE9BQVEsK0NBQThDQSxPQUFRO0FBQ3BFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCYixJQUFJLENBQUNjLEtBQU07QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QztNQUNuQyxDQUFDLENBQUMsQ0FBQ1QsSUFBSSxDQUFDLEVBQUUsQ0FBRTtBQUNqQjtBQUNBO0FBQ0EsNkJBQTZCO0lBQzVCLENBQUM7SUFBQTtFQUFBLEVBakY2Q1UsaUJBQWlCO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9